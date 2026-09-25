import { NextResponse } from "next/server";
import { getTurso } from "@/lib/turso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const present = (name: string) => Boolean(process.env[name]?.trim());

export async function GET() {
  const integrations = {
    turso: {
      configured: present("TURSO_DATABASE_URL") && present("TURSO_AUTH_TOKEN"),
      reachable: false,
      schemaReady: false,
    },
    whatsapp: {
      configured:
        present("WHATSAPP_VERIFY_TOKEN") &&
        present("WHATSAPP_APP_SECRET") &&
        present("WHATSAPP_ACCESS_TOKEN") &&
        present("WHATSAPP_PHONE_NUMBER_ID"),
    },
    square: {
      configured:
        present("SQUARE_ACCESS_TOKEN") &&
        present("SQUARE_LOCATION_ID") &&
        present("SQUARE_WEBHOOK_SIGNATURE_KEY"),
    },
  };

  if (integrations.turso.configured) {
    try {
      const db = getTurso();
      await db.execute("SELECT 1");
      integrations.turso.reachable = true;

      const requiredTables = [
        "booking_inquiries",
        "communication_messages",
        "booking_events",
      ];
      const result = await db.execute({
        sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (?, ?, ?)",
        args: requiredTables,
      });
      const names = new Set(result.rows.map((row) => String(row.name)));
      integrations.turso.schemaReady = requiredTables.every((name) => names.has(name));
    } catch {
      // Do not expose connection details or secrets.
    }
  }

  const ready =
    integrations.turso.reachable &&
    integrations.turso.schemaReady &&
    integrations.whatsapp.configured;

  return NextResponse.json(
    {
      service: "jd-reservation-assistant",
      ready,
      integrations,
    },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
