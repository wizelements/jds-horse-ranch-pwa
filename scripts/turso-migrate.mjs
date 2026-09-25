import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before running db:migrate");
}

const db = createClient({ url, authToken });
const sql = await readFile(new URL("../turso/schema.sql", import.meta.url), "utf8");

await db.executeMultiple(sql);

async function ensureColumn(table, name, definition) {
  const info = await db.execute(`PRAGMA table_info(${table})`);
  const exists = info.rows.some((row) => String(row.name) === name);
  if (!exists) {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
    console.log(`Added ${table}.${name}`);
  }
}

await ensureColumn("booking_inquiries", "marketing_opt_out_at", "TEXT");
await ensureColumn("booking_inquiries", "automation_paused", "INTEGER NOT NULL DEFAULT 0");
await ensureColumn("booking_inquiries", "human_takeover_requested_at", "TEXT");
await ensureColumn("booking_inquiries", "reschedule_requested_at", "TEXT");
await ensureColumn("booking_inquiries", "reschedule_request_text", "TEXT");
await ensureColumn("booking_inquiries", "last_customer_message_at", "TEXT");
await ensureColumn("booking_inquiries", "customer_service_window_expires_at", "TEXT");

const tables = await db.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
);
console.log(
  "Turso migration complete:",
  tables.rows.map((row) => row.name).join(", ")
);
db.close();
