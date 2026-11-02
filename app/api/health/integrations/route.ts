import { NextResponse } from "next/server";
import { getTurso } from "@/lib/turso";
import { adminConfigured } from "@/lib/auth";
import { squareConfiguration } from "@/lib/square";
import { googleCalendarConfigured } from "@/lib/calendars";
import { notificationsConfigured } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const present = (key: string) => Boolean(process.env[key]?.trim());

export async function GET() {
  const local = !process.env.VERCEL && process.env.RANCH_ALLOW_LOCAL_DB === "true" && process.env.TURSO_DATABASE_URL?.startsWith("file:");
  let squareConfigured = false;
  try { squareConfiguration(); squareConfigured = present("SQUARE_WEBHOOK_SIGNATURE_KEY") && present("SQUARE_WEBHOOK_NOTIFICATION_URL"); } catch {}
  const integrations = {
    turso: {
      configured: Boolean(local || (present("TURSO_DATABASE_URL") && present("TURSO_AUTH_TOKEN"))),
      reachable: false,
      schemaReady: false,
    },
    admin: {
      configured: adminConfigured(),
    },
    square: {
      configured: squareConfigured,
      environment: process.env.SQUARE_ENVIRONMENT || "sandbox",
    },
    googleCalendar: { configured: googleCalendarConfigured() },
    firebase: { configured: notificationsConfigured() },
    analytics: { configured: /^G-[A-Z0-9]{5,20}$/.test(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || ""), verified: false },
  };
  if (integrations.turso.configured) {
    try {
      const db = getTurso();
      await db.execute("SELECT 1");
      integrations.turso.reachable = true;
      const requiredTables = ["booking_inquiries", "booking_events", "login_attempts", "calendar_blocks", "calendar_connections", "square_webhook_events", "payment_receipts", "square_refunds", "notification_outbox", "notification_devices"];
      const result = await db.execute({
        sql: `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (${requiredTables.map(() => "?").join(",")})`,
        args: requiredTables,
      });
      const names = new Set(result.rows.map(row => String(row.name)));
      integrations.turso.schemaReady = requiredTables.every(name => names.has(name));
      if (integrations.turso.schemaReady) {
        const columns = await db.execute("PRAGMA table_info(booking_inquiries)");
        const known = new Set(columns.rows.map(row => String(row.name)));
        integrations.turso.schemaReady = ["approved_end_at","intake_key","approval_key","square_payment_id","refunded_amount_cents","operation_token"].every(name => known.has(name));
      }
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
