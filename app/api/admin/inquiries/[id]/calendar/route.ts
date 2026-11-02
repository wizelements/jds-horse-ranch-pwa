import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getInquiry } from "@/lib/bookingStore";
import { calendarDocument, calendarEvent } from "@/lib/calendars";

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await context.params, inquiry = await getInquiry(id);
    if (!inquiry.approved_start_at || !["BOOKED", "AWAITING_PAYMENT"].includes(inquiry.status)) return NextResponse.json({ error: "This request has no current approved time." }, { status: 409 });
    const text = calendarDocument([calendarEvent({ id, start: inquiry.approved_start_at, end: inquiry.approved_end_at || new Date(Date.parse(inquiry.approved_start_at) + 3600000).toISOString(), status: inquiry.status })]);
    return new NextResponse(text, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": "attachment; filename=ranch-appointment.ics", "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "Appointment unavailable" }, { status: 503 }); }
}
