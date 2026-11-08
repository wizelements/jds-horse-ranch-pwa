/**
 * Turso credentials are opaque secrets. Some provider dashboards copy a value
 * surrounded by shell-style quotes; those quotes are not part of a JWT or URL.
 * Strip at most ONE matching pair, and trim incidental outer whitespace.
 * Never print, hash or embed these values in client-side code or logs.
 */
export function normalizeTursoCredential(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (value.length >= 2) {
    const quote = value[0];
    if ((quote === "'" || quote === '"') && value[value.length - 1] === quote) {
      return value.slice(1, -1).trim();
    }
  }
  return value;
}

/** Safe diagnostic flags: deliberately exclude lengths, hostnames and secrets. */
export function tursoCredentialFlags(env: {
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
}) {
  const rawUrl = (env.TURSO_DATABASE_URL ?? "").trim();
  const rawToken = (env.TURSO_AUTH_TOKEN ?? "").trim();
  const wrapped = (value: string) => value.length >= 2 &&
    (value[0] === "'" || value[0] === '"') &&
    value[value.length - 1] === value[0];
  const cleanUrl = normalizeTursoCredential(rawUrl);
  return {
    urlOuterQuotes: wrapped(rawUrl),
    tokenOuterQuotes: wrapped(rawToken),
    urlSchemeSupported: /^(libsql|https|http|wss|ws|file):/i.test(cleanUrl),
  };
}

/**
 * Fail before network I/O if JDS's production database settings are not from a
 * Turso Cloud libSQL database. This does NOT verify token signature or
 * database existence; a successful SELECT 1 is still required for readiness.
 */
export type TursoConfigurationIssue =
  | "database_url_missing"
  | "database_url_invalid"
  | "database_host_not_turso"
  | "database_url_has_unexpected_parts"
  | "database_token_missing"
  | "database_token_not_jwt";

export function tursoCloudConfigurationIssue(
  rawUrl: string | undefined,
  rawToken: string | undefined,
): TursoConfigurationIssue | null {
  const url = normalizeTursoCredential(rawUrl);
  const token = normalizeTursoCredential(rawToken);
  if (!url) return "database_url_missing";

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "database_url_invalid";
  }

  if (!(parsed.protocol === "libsql:" || parsed.protocol === "https:")) {
    return "database_url_invalid";
  }
  if (!/^[a-z0-9.-]+\\.turso\\.io$/i.test(parsed.hostname)
      || parsed.hostname === "turso.io" || parsed.hostname.startsWith("api.")) {
    return "database_host_not_turso";
  }
  if (parsed.username || parsed.password || parsed.port ||
      (parsed.pathname && parsed.pathname !== "/") || parsed.search || parsed.hash) {
    return "database_url_has_unexpected_parts";
  }
  if (!token) return "database_token_missing";
  if (!/^eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+$/.test(token)) {
    return "database_token_not_jwt";
  }
  return null;
}
