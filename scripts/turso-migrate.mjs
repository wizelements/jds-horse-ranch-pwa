import { readFile } from "node:fs/promises";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const local = !process.env.VERCEL && process.env.RANCH_ALLOW_LOCAL_DB === "true" && url?.startsWith("file:");
if (!url || (!authToken && !local)) {
  throw new Error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before running db:migrate");
}

const db = createClient({ url, ...(local ? {} : { authToken }) });
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
await ensureColumn("services", "price_detail", "TEXT");
for (const name of ["approved_end_at", "intake_key", "approval_key", "square_payment_id", "operation_token", "operation_expires_at"]) {
  await ensureColumn("booking_inquiries", name, "TEXT");
}
await ensureColumn("booking_inquiries", "refunded_amount_cents", "INTEGER NOT NULL DEFAULT 0");
await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_intake_key ON booking_inquiries(intake_key)");
await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_payment_id ON booking_inquiries(square_payment_id)");

// Seed the public editor once; never restore something the owner later deletes.
const seeded = await db.execute("SELECT 1 FROM settings WHERE key = 'public_content_seeded_v2'");
if (!seeded.rows.length) {
  const { DEFAULT_SERVICES, DEFAULT_PHOTOS, DEFAULT_TESTIMONIALS } = await import("../lib/publicContent.ts");
  for (const service of DEFAULT_SERVICES) {
    // Replace only the exact legacy placeholder prices, preserving real owner edits.
    const old = { "service-riding-lessons": [50, 75], "service-trail-rides": [60, 80], "service-special-events": [100, 500] }[service.id];
    await db.execute({ sql: "UPDATE services SET name=?, description=?, price_min=?, price_max=?, duration_minutes=?, age_requirement=? WHERE id=? AND price_min=? AND price_max=?", args: [service.name, service.description, service.price_min, service.price_max, service.duration_minutes, service.age_requirement, service.id, ...old] });
    await db.execute({ sql: "UPDATE services SET price_detail = ? WHERE id = ? AND price_detail IS NULL", args: [service.price_detail, service.id] });
  }
  const gallery = await db.execute("SELECT COUNT(*) AS n FROM gallery_photos");
  if (Number(gallery.rows[0].n) === 0) for (const p of DEFAULT_PHOTOS) await db.execute({ sql: "INSERT INTO gallery_photos (id,title,description,image_url,display_order,active,created_at,updated_at) VALUES (?,?,?,?,?,1,?,?)", args: [p.id,p.title,p.description,p.image_url,p.display_order,p.created_at,p.updated_at] });
  const reviews = await db.execute("SELECT COUNT(*) AS n FROM testimonials");
  if (Number(reviews.rows[0].n) === 0) for (const t of DEFAULT_TESTIMONIALS) await db.execute({ sql: "INSERT INTO testimonials (id,customer_name,text,display_order,active,created_at,updated_at) VALUES (?,?,?,?,1,?,?)", args: [t.id,t.customer_name,t.text,t.display_order,t.created_at,t.updated_at] });
  await db.execute("INSERT INTO settings (id,key,value,updated_at) VALUES ('public-content-v2','public_content_seeded_v2','true',datetime('now'))");
}

const tables = await db.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
);
console.log(
  "Turso migration complete:",
  tables.rows.map((row) => row.name).join(", ")
);
db.close();
