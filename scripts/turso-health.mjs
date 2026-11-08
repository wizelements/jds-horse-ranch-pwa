/**
 * JDS Turso diagnostic: read-only, secret-safe, and explicitly invoked.
 * Never run automatically during a website build or on public HTTP requests.
 * Use with the authenticated owner environment: npm run db:health
 */
import { createClient } from "@libsql/client";
import { normalizeTursoCredential, tursoCredentialFlags, tursoCloudConfigurationIssue } from "../lib/tursoConfig.ts";

const expected = ["contacts", "services", "booking_inquiries"];
const env = process.env;
const url = normalizeTursoCredential(env.TURSO_DATABASE_URL);
const authToken = normalizeTursoCredential(env.TURSO_AUTH_TOKEN);
const flags = tursoCredentialFlags({
  TURSO_DATABASE_URL: env.TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN: env.TURSO_AUTH_TOKEN,
});
const localFixture = !env.VERCEL && env.RANCH_ALLOW_LOCAL_DB === "true" &&
  env.JDS_TURSO_HEALTH_FIXTURE === "true" && url.startsWith("file:");
const remote = /^(libsql:\/\/|https:\/\/|wss:\/\/)/i.test(url);

function report(input) {
  // Never include raw error messages, database hostname, token, SQL or customer data.
  console.log(JSON.stringify({ tool: "jds-turso-health", readOnly: true, ...input }));
}

if (!url || (!authToken && !localFixture)) {
  report({ status: "FAIL", stage: "configuration", reason: "required_configuration_missing", flags });
  process.exit(1);
}
if (!localFixture) {
  const issue = tursoCloudConfigurationIssue(url, authToken);
  if (issue) {
    report({ status: "FAIL", stage: "configuration", reason: issue, flags });
    process.exit(1);
  }
  if (!remote) {
    report({ status: "FAIL", stage: "configuration", reason: "unsupported_remote_scheme", flags });
    process.exit(1);
  }
}

let client;
let stage = "connection";
try {
  client = createClient({ url, ...(localFixture ? {} : { authToken }) });

  stage = "select_one";
  const probe = await client.execute("SELECT 1 AS probe");
  if (Number(probe.rows[0]?.probe) !== 1) throw new Error("Unexpected SQL health probe result");

  stage = "schema_read";
  const result = await client.execute({
    sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (?, ?, ?)",
    args: expected,
  });
  const names = new Set(result.rows.map(row => String(row.name)));
  const missing = expected.filter(name => !names.has(name));
  if (missing.length) {
    report({ status: "FAIL", stage, reason: "required_schema_missing", missingTables: missing });
    process.exitCode = 2;
  } else {
    report({ status: "PASS", stage: "complete", reason: "database_and_schema_readable", verifiedTables: expected });
  }
} catch (error) {
  const raw = error instanceof Error ? error.message : "";
  const match = raw.match(/\b(?:HTTP\s+status|status(?:\s+code)?)\s*:?\s*([45]\d{2})\b/i);
  const httpStatus = match ? Number(match[1]) : null;
  const kind = /no such table|no such column/i.test(raw) ? "schema_missing"
    : /unauthori[sz]ed|forbidden|invalid.*token|\b401\b|\b403\b/i.test(raw) ? "authentication_rejected"
    : httpStatus === 400 ? "bad_request"
    : httpStatus === 429 ? "provider_throttled"
    : httpStatus !== null && httpStatus >= 500 ? "provider_unavailable"
    : /timeout|network|fetch failed|econn|enotfound/i.test(raw) ? "transport_error"
    : "connection_or_query_failed";
  const code = error && typeof error === "object" && "code" in error
    ? String(error.code).replace(/[^A-Z0-9_-]/gi, "").slice(0, 48) : "none";
  report({ status: "FAIL", stage, reason: kind, httpStatus, code, flags });
  process.exitCode = 1;
} finally {
  try { client?.close(); } catch { /* best-effort local cleanup only */ }
}
