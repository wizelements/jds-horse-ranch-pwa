import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { createWebInquiry, getActiveInquiry, recordBookingEvent } from "@/lib/bookingStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}
function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return "+1" + digits;
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
  if (value.startsWith("+") && digits.length >= 10 && digits.length <= 15) return "+" + digits;
  return null;
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  try {
    const data = await req.json();
    const customerName = clean(data.customerName, 120);
    const phone = normalizePhone(clean(data.phone, 40));
    const serviceRequested = clean(data.serviceRequested, 120);
    const riderCount = Number(data.riderCount);
    const riderDetails = clean(data.riderDetails, 2000) || "Not yet discussed";
    const requestedDatetimeText = clean(data.requestedDatetimeText, 300) || "To be arranged by phone";
    const experience = clean(data.experience, 800) || "Not yet discussed";
    const qualificationNotes = clean(data.qualificationNotes, 1200);

    if (!customerName || !phone || !serviceRequested ||
        !Number.isInteger(riderCount) || riderCount < 1 || riderCount > 12) {
      return NextResponse.json({ error: "Enter the caller's name, valid phone number, experience type and rider count." }, { status: 400 });
    }
    const active = await getActiveInquiry(phone);
    if (active) return NextResponse.json({
      error: "An open reservation already exists for this phone number. Review it instead of making a duplicate.",
      existingId: active.id,
    }, { status: 409 });

    const inquiry = await createWebInquiry({
      channel: "voice",
      preferredChannel: "voice",
      customerPhone: phone,
      customerName,
      serviceRequested,
      riderCount,
      riderDetails,
      requestedDatetimeText,
      experience,
      qualificationNotes: qualificationNotes || null,
      marketingConsent: false,
    });
    await recordBookingEvent({
      inquiryId: inquiry.id,
      eventType: "phone_conversation_recorded",
      actor: "jd_admin",
      metadata: { captured_in: "private_owner_workspace" },
    });
    return NextResponse.json({ success: true, inquiryId: inquiry.id }, { status: 201 });
  } catch (error) {
    console.error("Owner call recording failed:", error);
    return NextResponse.json({ error: "Unable to save phone conversation. Check database access." }, { status: 500 });
  }
}
