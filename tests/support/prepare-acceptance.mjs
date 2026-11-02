import { randomBytes, scryptSync } from "node:crypto";
import { writeFile, mkdtemp, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const envFile = new URL("../../.env.development.local", import.meta.url);
try { await access(envFile); throw new Error("Refusing to replace an existing local environment. Remove only the previous acceptance environment before preparing another."); }
catch (error) { if (error.code !== "ENOENT") throw error; }
const directory = await mkdtemp(join(tmpdir(), "jds-acceptance-"));
const salt = randomBytes(32).toString("hex"), password = "ranch-acceptance-only";
const environment = {
  TURSO_DATABASE_URL: `file:${join(directory,"ranch.db")}`, RANCH_ALLOW_LOCAL_DB: "true", RANCH_TEST_FIXTURES: "true",
  ADMIN_PASSWORD_SALT_V2: salt, ADMIN_PASSWORD_HASH_V2: scryptSync(password, salt, 64).toString("hex"), SESSION_TOKEN_SECRET_V2: randomBytes(32).toString("hex"),
  SQUARE_ENVIRONMENT: "sandbox", SQUARE_ACCESS_TOKEN: "local-square-fixture", SQUARE_LOCATION_ID: "fixture-ranch-location",
  SQUARE_TEST_API_URL: "http://127.0.0.1:43189", SQUARE_WEBHOOK_SIGNATURE_KEY: randomBytes(32).toString("hex"),
  SQUARE_WEBHOOK_NOTIFICATION_URL: "https://acceptance.invalid/api/square/webhook", NEXT_PUBLIC_SITE_URL: "https://jdshorseranch.com",
  CALENDAR_ENCRYPTION_KEY: randomBytes(32).toString("base64"), CRON_SECRET: randomBytes(32).toString("hex"),
};
await writeFile(envFile, Object.entries(environment).map(([key,value]) => `${key}=${JSON.stringify(value)}`).join("\n") + "\n", { mode: 0o600, flag: "wx" });
const migration = spawnSync(process.execPath, ["scripts/turso-migrate.mjs"], { cwd: new URL("../..", import.meta.url), env: { ...process.env, ...environment }, encoding: "utf8" });
if (migration.status) { process.stderr.write(migration.stderr); process.exit(migration.status); }
process.stdout.write("Isolated acceptance environment prepared and migrated. Credentials were not printed.\n");
