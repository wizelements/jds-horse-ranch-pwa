import { readFile, rm } from "node:fs/promises";
import { createClient } from "@libsql/client";

const path = ".turso-schema-check.db";
await rm(path, { force: true });
await rm(path + "-shm", { force: true });
await rm(path + "-wal", { force: true });

const db = createClient({ url: `file:${path}` });
const schema = await readFile(new URL("../turso/schema.sql", import.meta.url), "utf8");

await db.executeMultiple(schema);

const requiredTables = [
  "contacts",
  "services",
  "testimonials",
  "gallery_photos",
  "settings",
  "booking_inquiries",
  "communication_messages",
  "booking_events",
];

const result = await db.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
);
const names = new Set(result.rows.map((row) => String(row.name)));
const missing = requiredTables.filter((name) => !names.has(name));

if (missing.length) {
  throw new Error(`Missing Turso tables: ${missing.join(", ")}`);
}

const seed = await db.execute("SELECT COUNT(*) AS count FROM services");
if (Number(seed.rows[0]?.count || 0) < 3) {
  throw new Error("Expected seeded ranch services");
}

db.close();
await rm(path, { force: true });
await rm(path + "-shm", { force: true });
await rm(path + "-wal", { force: true });

console.log("Turso schema verification PASS");
