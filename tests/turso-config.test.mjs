import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTursoCredential, tursoCredentialFlags, tursoCloudConfigurationIssue } from "../lib/tursoConfig.ts";

test("Turso credentials preserve valid JWTs and URLs exactly", () => {
  const jwt = "eyJhbGciOiJIUzI1NiJ9.payload.signature";
  const url = "libsql://jds-example.turso.io";
  assert.equal(normalizeTursoCredential(jwt), jwt);
  assert.equal(normalizeTursoCredential(url), url);
  assert.equal(normalizeTursoCredential(""), "");
  assert.equal(normalizeTursoCredential(undefined), "");
});

test("Turso credentials unwrap only one matching outer quote pair", () => {
  const token = "eyJhbGciOiJIUzI1NiJ9.payload.signature";
  assert.equal(normalizeTursoCredential("  \"" + token + "\"  "), token);
  assert.equal(normalizeTursoCredential("  '" + token + "'  "), token);
  assert.equal(normalizeTursoCredential(" 'libsql://jds-example.turso.io'  "), "libsql://jds-example.turso.io");
  assert.equal(normalizeTursoCredential("\"abc'\""), "abc'");
  assert.equal(normalizeTursoCredential("\"abc'"), "\"abc'");
  assert.equal(normalizeTursoCredential(" \"abc\"junk"), "\"abc\"junk");
});

test("Turso format diagnostic reports only booleans, never secrets or hosts", () => {
  const token = "very-sensitive-value.not-a-real-token";
  const flags = tursoCredentialFlags({
    TURSO_DATABASE_URL: " 'libsql://jds-example.turso.io' ",
    TURSO_AUTH_TOKEN: ' "' + token + '" ',
  });
  assert.deepEqual(flags, { urlOuterQuotes: true, tokenOuterQuotes: true, urlSchemeSupported: true });
  assert.equal(JSON.stringify(flags).includes(token), false);
  assert.equal(JSON.stringify(flags).includes("jds-example"), false);
  assert.deepEqual(tursoCredentialFlags({
    TURSO_DATABASE_URL: "https://jds-example.turso.io",
    TURSO_AUTH_TOKEN: token,
  }), { urlOuterQuotes: false, tokenOuterQuotes: false, urlSchemeSupported: true });
});

test("JDS Cloud URL must be Turso libSQL endpoint with database-scoped JWT", () => {
  const token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqZHMifQ.signature";
  const valid = "libsql://jds-horse-ranch-example.turso.io";
  assert.equal(tursoCloudConfigurationIssue(valid, token), null);
  assert.equal(tursoCloudConfigurationIssue("https://jds-horse-ranch-example.turso.io", token), null);
  assert.equal(tursoCloudConfigurationIssue(valid, "not-a-jwt"), "database_token_not_jwt");
  assert.equal(tursoCloudConfigurationIssue("https://api.turso.tech/v1/databases", token), "database_host_not_turso");
  assert.equal(tursoCloudConfigurationIssue("libsql://jds-horse-ranch-example.turso.io/extra", token), "database_url_has_unexpected_parts");
  assert.equal(tursoCloudConfigurationIssue("libsql://jds-horse-ranch-example.turso.io?auth=x", token), "database_url_has_unexpected_parts");
  assert.equal(tursoCloudConfigurationIssue("file:/some-local-db", token), "database_url_invalid");
  assert.equal(tursoCloudConfigurationIssue("", token), "database_url_missing");
  assert.equal(tursoCloudConfigurationIssue(valid, ""), "database_token_missing");
});
