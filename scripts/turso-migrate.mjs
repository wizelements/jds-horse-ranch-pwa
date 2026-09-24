import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before running db:migrate");
}

const sql = await readFile(new URL("../turso/schema.sql", import.meta.url), "utf8");
const db = createClient({ url, authToken });

await db.executeMultiple(sql);

const tables = await db.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
);
console.log("Turso migration complete:", tables.rows.map((row) => row.name).join(", "));
db.close();
