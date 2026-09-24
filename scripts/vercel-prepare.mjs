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

if (!tursoConfigured) {
  throw new Error(
    "Turso is required: configure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN."
  );
}

if (!whatsappConfigured) {
  throw new Error(
    "WhatsApp is required: configure WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET, WHATSAPP_ACCESS_TOKEN, and WHATSAPP_PHONE_NUMBER_ID."
  );
}

const sql = await readFile(new URL("../turso/schema.sql", import.meta.url), "utf8");
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

try {
  await db.execute("SELECT 1");
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

  if (!requiredTables.every((name) => names.has(name))) {
    throw new Error("Required reservation tables are missing after Turso migration.");
  }

  console.log("Integration prepare: TURSO_REACHABLE=true");
  console.log("Integration prepare: TURSO_SCHEMA_READY=true");
  console.log("Integration prepare: WHATSAPP_CONFIGURED=true");
} finally {
  db.close();
}
