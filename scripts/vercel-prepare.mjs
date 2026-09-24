import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";

if (!process.env.VERCEL) {
  console.log("Integration prepare: skipped outside Vercel");
  process.exit(0);
}

const present = (name) => Boolean(process.env[name]?.trim());
const tursoConfigured =
  present("TURSO_DATABASE_URL") && present("TURSO_AUTH_TOKEN");
const whatsappConfigured =
  present("WHATSAPP_VERIFY_TOKEN") &&
  present("WHATSAPP_APP_SECRET") &&
  present("WHATSAPP_ACCESS_TOKEN") &&
  present("WHATSAPP_PHONE_NUMBER_ID");
const squareConfigured =
  present("SQUARE_ACCESS_TOKEN") &&
  present("SQUARE_LOCATION_ID") &&
  present("SQUARE_WEBHOOK_SIGNATURE_KEY");

console.log(`Integration prepare: environment=${process.env.VERCEL_ENV || "unknown"}`);
console.log(`Integration prepare: TURSO_CONFIGURED=${tursoConfigured}`);
console.log(`Integration prepare: WHATSAPP_CONFIGURED=${whatsappConfigured}`);
console.log(`Integration prepare: SQUARE_CONFIGURED=${squareConfigured}`);

if (!tursoConfigured) {
  console.log("Integration prepare: Turso migration skipped");
  process.exit(0);
}

const sql = await readFile(new URL("../turso/schema.sql", import.meta.url), "utf8");
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

try {
  await db.execute("SELECT 1");
  console.log("Integration prepare: TURSO_REACHABLE=true");

  await db.executeMultiple(sql);

  const requiredTables = [
    "booking_inquiries",
    "communication_messages",
    "booking_events",
  ];
  const result = await db.execute({
    sql: "SELECT name FROM sqlite_master WHERE type='table' AND name IN (?, ?, ?)",
    args: requiredTables,
  });
  const names = new Set(result.rows.map((row) => String(row.name)));
  const schemaReady = requiredTables.every((name) => names.has(name));
  console.log(`Integration prepare: TURSO_SCHEMA_READY=${schemaReady}`);

  if (!schemaReady) {
    throw new Error("Required reservation tables are missing after migration");
  }
} finally {
  db.close();
}
