/**
 * Temporary, read-only provider diagnostic. Only invoked on the synthetic
 * qa-smoke path after a normal Turso operation already failed.
 *
 * No raw error body, URL, hostname, token, JWT payload or SQL is logged.
 * Only HTTPS Turso Cloud hosts are eligible for a diagnostic request.
 */
import { normalizeTursoCredential } from "@/lib/tursoConfig";

function classify(text: string): string {
  const v = text.toLowerCase();
  if (/no such table|table.*not found|no such column/.test(v)) return "schema_missing";
  if (/namespace.*(not found|unknown|does not exist)|unknown namespace|database.*(not found|does not exist)/.test(v)) return "database_not_found";
  if (/invalid.*(auth|token)|token.*(invalid|expired)|jwt.*(invalid|expired)|signature.*(invalid|expired)/.test(v)) return "token_invalid";
  if (/unauthorized|unauthorised|forbidden|permission denied|authentication failed/.test(v)) return "authentication_rejected";
  if (/unsupported.*(protocol|version)|unknown.*(protocol|version)|protocol.*not supported/.test(v)) return "protocol_unsupported";
  if (/malformed|invalid request|bad request|invalid json|parsing error/.test(v)) return "request_rejected";
  if (/rate limit|too many requests|throttl/.test(v)) return "throttled";
  return "unknown";
}

export async function diagnoseSyntheticTursoFailure() {
  const url = normalizeTursoCredential(process.env.TURSO_DATABASE_URL);
  const authToken = normalizeTursoCredential(process.env.TURSO_AUTH_TOKEN);
  const tokenLooksJwt = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/.test(authToken);
  const tokenBearerPrefix = /^Bearer\s+/i.test(authToken);
  const tokenHasLineBreak = /[\r\n]/.test(authToken);
  let tokenExpired: boolean | null = null;
  if (tokenLooksJwt) {
    try {
      const payload = JSON.parse(Buffer.from(authToken.split(".")[1], "base64url").toString("utf8")) as { exp?: unknown };
      if (typeof payload.exp === "number") tokenExpired = payload.exp < Math.floor(Date.now() / 1000);
    } catch { /* never log parsed JWT content */ }
  }

  const shape = { tokenLooksJwt, tokenBearerPrefix, tokenHasLineBreak, tokenExpired };
  let parsed: URL;
  try { parsed = new URL(url); } catch { return { outcome: "invalid_url", ...shape }; }
  const urlHasUnexpectedPath = parsed.pathname !== "" && parsed.pathname !== "/";
  const urlHasSearchOrHash = !!parsed.search || !!parsed.hash;
  const urlHasEmbeddedCredentials = !!parsed.username || !!parsed.password;
  const endpointIsExpected = /^(?:[a-z0-9-]+)\.turso\.io$/i.test(parsed.hostname) &&
    !parsed.port && !urlHasUnexpectedPath && !urlHasSearchOrHash && !urlHasEmbeddedCredentials &&
    (parsed.protocol === "libsql:" || parsed.protocol === "https:");
  const meta = { ...shape, endpointIsExpected, urlHasUnexpectedPath, urlHasSearchOrHash, urlHasEmbeddedCredentials };
  if (!endpointIsExpected) return { outcome: "unexpected_endpoint", ...meta };
  if (!authToken) return { outcome: "missing_token", ...meta };

  // Hrana v3 documented request: SELECT 1 and an independent metadata read.
  // No mutations, no customer rows and no permissions bypass.
  try {
    const response = await fetch(`https://${parsed.hostname}/v3/pipeline`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        baton: null,
        requests: [
          { type: "execute", stmt: { sql: "SELECT 1 AS probe" } },
          { type: "execute", stmt: { sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'contacts'" } },
          { type: "close" },
        ],
      }),
      signal: AbortSignal.timeout(4500),
      redirect: "error",
      cache: "no-store",
    });
    const raw = (await response.text()).slice(0, 4096);
    let data: { results?: Array<{ type?: string; error?: { message?: string; code?: string }; response?: { result?: { rows?: unknown[] } } }> } = {};
    try { data = JSON.parse(raw); } catch { /* unknown provider response */ }
    const sqlProbe = data.results?.[0], schemaProbe = data.results?.[1];
    const contactsTablePresent = schemaProbe?.type === "ok" ? (schemaProbe?.response?.result?.rows?.length ?? 0) > 0 : null;
    const providerError = sqlProbe?.error?.message ?? schemaProbe?.error?.message ?? raw;
    return {
      outcome: response.ok ? "http_ok" : "http_rejected",
      upstreamHttpStatus: response.status,
      upstreamErrorCategory: response.ok && sqlProbe?.type === "ok" ? "none" : classify(providerError),
      simpleSqlSucceeded: sqlProbe?.type === "ok",
      schemaSqlSucceeded: schemaProbe?.type === "ok",
      contactsTablePresent,
      ...meta,
    };
  } catch (cause) {
    const error = cause instanceof Error ? cause.name : "unknown";
    return { outcome: error === "TimeoutError" ? "timeout" : "network_failure", ...meta };
  }
}
