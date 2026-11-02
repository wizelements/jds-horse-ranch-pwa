import { createHash, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSetting, getTurso } from "@/lib/turso";
import { calendarDocument, calendarEvent } from "@/lib/calendars";

export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("key") || "";
    if (!/^[a-zA-Z0-9_-]{43}$/.test(token)) return new NextResponse("Unauthorized", { status: 401 });
    const stored = await getSetting("calendar_feed_hash");
    const received = createHash("sha256").update(token).digest("hex");
    if (!stored || stored.length !== received.length || !timingSafeEqual(Buffer.from(stored), Buffer.from(received))) return new NextResponse("Unauthorized", { status: 401 });
    const rows = await getTurso().execute({ sql: `SELECT id,approved_start_at,approved_end_at,status FROM booking_inquiries
      WHERE approved_start_at >= ? AND (status='BOOKED' OR (status='AWAITING_PAYMENT' AND hold_expires_at > ?)) ORDER BY approved_start_at`,
      args: [new Date(Date.now() - 30 * 86400000).toISOString(), new Date().toISOString()] });
    const events = rows.rows.map(r => calendarEvent({ id: String(r.id), start: String(r.approved_start_at), end: r.approved_end_at ? String(r.approved_end_at) : new Date(Date.parse(String(r.approved_start_at)) + 3600000).toISOString(), status: String(r.status) }));
    return new NextResponse(calendarDocument(events), { headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
  } catch { return new NextResponse("Calendar feed unavailable", { status: 503 }); }
}
