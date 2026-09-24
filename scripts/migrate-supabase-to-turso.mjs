import { createClient as createTurso } from "@libsql/client";
import { createClient as createSupabase } from "@supabase/supabase-js";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const supabaseUrl = process.env.LEGACY_SUPABASE_URL;
const supabaseKey = process.env.LEGACY_SUPABASE_SERVICE_ROLE_KEY;

if (!tursoUrl || !tursoToken || !supabaseUrl || !supabaseKey) {
  throw new Error(
    "Set TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, LEGACY_SUPABASE_URL, and LEGACY_SUPABASE_SERVICE_ROLE_KEY"
  );
}

const turso = createTurso({ url: tursoUrl, authToken: tursoToken });
const supabase = createSupabase(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const tables = {
  contacts: ["id","type","source","user_agent","ip_address","created_at"],
  services: ["id","name","description","price_min","price_max","duration_minutes","age_requirement","display_order","active","created_at","updated_at"],
  testimonials: ["id","customer_name","text","rating","image_url","display_order","active","created_at","updated_at"],
  gallery_photos: ["id","title","description","image_url","display_order","active","created_at","updated_at"],
  settings: ["id","key","value","updated_at"],
  booking_inquiries: ["id","channel","preferred_channel","customer_phone","customer_name","email","service_requested","rider_count","rider_details","requested_datetime_text","alternate_datetime_text","experience","qualification_notes","marketing_consent","status","intake_step","hold_expires_at","approved_start_at","approval_note","approved_amount_cents","square_payment_link_id","square_order_id","square_payment_url","paid_at","booked_at","completed_at","confirmation_sent_at","reminder_sent_at","followup_sent_at","created_at","updated_at"],
  communication_messages: ["id","provider_message_id","inquiry_id","channel","direction","phone","body","raw_payload","created_at"],
  booking_events: ["id","inquiry_id","event_type","actor","metadata","created_at"],
};

function convert(value) {
  if (value === undefined) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value && typeof value === "object") return JSON.stringify(value);
  return value;
}

for (const [table, columns] of Object.entries(tables)) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.warn(`Skipping ${table}: ${error.message}`);
    continue;
  }

  if (table === "services" && (data || []).length > 0) {
    await turso.execute(
      "DELETE FROM services WHERE id IN ('service-riding-lessons','service-trail-rides','service-special-events')"
    );
  }

  let copied = 0;
  for (const row of data || []) {
    const present = columns.filter((column) => Object.prototype.hasOwnProperty.call(row, column));
    if (!present.includes("id")) continue;

    const placeholders = present.map(() => "?").join(", ");
    const conflictTarget = table === "settings" ? "key" : "id";
    const conflictUpdates = present
      .filter((column) => column !== conflictTarget)
      .map((column) => `${column} = excluded.${column}`)
      .join(", ");

    await turso.execute({
      sql: `INSERT INTO ${table} (${present.join(", ")})
        VALUES (${placeholders})
        ON CONFLICT(${conflictTarget}) DO UPDATE SET ${conflictUpdates}`,
      args: present.map((column) => convert(row[column])),
    });
    copied += 1;
  }

  console.log(`${table}: copied ${copied}`);
}

console.log("Supabase → Turso data migration complete.");
turso.close();
