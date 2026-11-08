import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { createClient } from "@libsql/client";

const root = resolve(new URL("..", import.meta.url).pathname);

function health(env) {
  const child = spawnSync(process.execPath, ["scripts/turso-health.mjs"], {
    cwd: root, env: { ...process.env, ...env },
    encoding: "utf8", timeout: 20000,
  });
  const lines = child.stdout.trim().split("\n");
  const result = JSON.parse(lines.at(-1));
  assert.equal(child.stderr.includes("eyJsecret"), false);
  assert.equal(child.stdout.includes("eyJsecret"), false);
  return { exit: child.status, result };
}

test("read-only Turso health checks do not mistake a missing database for success", () => {
  const { exit, result } = health({ TURSO_DATABASE_URL: "", TURSO_AUTH_TOKEN: "" });
  assert.equal(exit, 1);
  assert.equal(result.readOnly, true);
  assert.equal(result.stage, "configuration");
  assert.equal(result.reason, "required_configuration_missing");
});

test("read-only Turso health accepts valid local fixture with all required tables", async () => {
  const dir = await mkdtemp(join(tmpdir(), "jds-turso-health-"));
  const url = `file:${join(dir, "ranch.db")}`;
  try {
    const db = createClient({ url });
    await db.executeMultiple(`
      CREATE TABLE contacts (id TEXT PRIMARY KEY);
      CREATE TABLE services (id TEXT PRIMARY KEY);
      CREATE TABLE booking_inquiries (id TEXT PRIMARY KEY);
    `);
    db.close();
    const { exit, result } = health({
      TURSO_DATABASE_URL: url, TURSO_AUTH_TOKEN: "",
      RANCH_ALLOW_LOCAL_DB: "true", JDS_TURSO_HEALTH_FIXTURE: "true", VERCEL: "",
    });
    assert.equal(exit, 0);
    assert.equal(result.status, "PASS");
    assert.deepEqual(result.verifiedTables, ["contacts", "services", "booking_inquiries"]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("read-only Turso health identifies a missing schema without mutating it", async () => {
  const dir = await mkdtemp(join(tmpdir(), "jds-turso-health-"));
  const url = `file:${join(dir, "ranch.db")}`;
  try {
    const db = createClient({ url });
    await db.execute("CREATE TABLE services (id TEXT PRIMARY KEY)");
    db.close();
    const { exit, result } = health({
      TURSO_DATABASE_URL: url, TURSO_AUTH_TOKEN: "",
      RANCH_ALLOW_LOCAL_DB: "true", JDS_TURSO_HEALTH_FIXTURE: "true", VERCEL: "",
    });
    assert.equal(exit, 2);
    assert.equal(result.stage, "schema_read");
    assert.deepEqual(result.missingTables, ["contacts", "booking_inquiries"]);
    const check = createClient({ url });
    const tables = await check.execute("SELECT name FROM sqlite_master WHERE type='table'");
    assert.deepEqual(tables.rows.map(row => String(row.name)), ["services"]);
    check.close();
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
