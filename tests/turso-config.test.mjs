import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTursoCredential, tursoCredentialFlags } from "../lib/tursoConfig.ts";

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
