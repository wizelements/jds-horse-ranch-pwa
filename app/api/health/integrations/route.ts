import { NextResponse } from "next/server";
import { getTurso } from "@/lib/turso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const present = (key: string) => Boolean(process.env[key]?.trim());

export async function GET() {
  const integrations = {
    turso: {
      configured: present("TURSO_DATABASE_URL") && present("TURSO_AUTH_TOKEN"),
      reachable: false,
      schemaReady: false,
    },
    admin: {
      configured: present("ADMIN_PASSWORD_HASH_V2") && present("ADMIN_PASSWORD_SALT_V2") &&
        present("SESSION_TOKEN_SECRET_V2"),
    },
    square: {
      configured: present("SQUARE_ACCESS_TOKEN") && present("SQUARE_LOCATION_ID") &&
        present("SQUARE_WEBHOOK_SIGNATURE_KEY") && present("SQUARE_WEBHOOK_NOTIFICATION_URL"),
    },
  };
  if (integrations.turso.configured) {
    try {
      const db = getTurso();
      await db.execute("SELECT 1");
      integrations.turso.reachable = true;
      const requiredTables = ["booking_inquiries", "communication_messages", "booking_events"];
      const result = await db.execute({
        sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (?, ?, ?)",
        args: requiredTables,
      });
      const names = new Set(result.rows.map(row => String(row.name)));
      integrations.turso.schemaReady = requiredTables.every(name => names.has(name));
    } catch {
      // Secret connection details must never be exposed.
    }
  }
  const ready = integrations.turso.reachable && integrations.turso.schemaReady &&
    integrations.admin.configured && integrations.square.configured;
  return NextResponse.json(
    { service: "jd-ranch-booking", ready, integrations },
    { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
