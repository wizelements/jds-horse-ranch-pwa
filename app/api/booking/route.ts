import { NextRequest, NextResponse } from "next/server";
import {
  createWebInquiry,
  getActiveInquiry,
  recordBookingEvent,
} from "@/lib/bookingStore";

export const runtime = "nodejs";

function clean(value: unknown, max = 1000) {
  return String(value || "").trim().slice(0, max);
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (value.startsWith("+") && digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customerName = clean(body.customerName, 120);
    const phone = normalizePhone(clean(body.phone, 40));
    const serviceRequested = clean(body.serviceRequested, 120);
    const riderCount = Number.parseInt(String(body.riderCount), 10);
    const riderDetails = clean(body.riderDetails, 2000);
    const requestedDatetimeText = clean(body.requestedDatetimeText, 300);
    const alternateDatetimeText = clean(body.alternateDatetimeText, 300);
    const experience = clean(body.experience, 800);
    const qualificationNotes = clean(body.qualificationNotes, 1200);
    const email = clean(body.email, 250).toLowerCase();
    const preferredChannel = body.preferredChannel === "sms" ? "sms" : "whatsapp";

    if (!customerName || !phone || !serviceRequested || !riderDetails || !requestedDatetimeText || !experience) {
      return NextResponse.json({ error: "Complete all required booking fields." }, { status: 400 });
    }
    if (!Number.isInteger(riderCount) || riderCount < 1 || riderCount > 12) {
      return NextResponse.json({ error: "Rider count must be between 1 and 12." }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email or leave it blank." }, { status: 400 });
    }

    const active = await getActiveInquiry(phone);
    if (active) {
      return NextResponse.json(
        { error: "An active request already exists for this phone number.", inquiryId: active.id },
        { status: 409 }
      );
    }

    const inquiry = await createWebInquiry({
      customerPhone: phone,
      customerName,
      email: email || null,
      serviceRequested,
      riderCount,
      riderDetails,
      requestedDatetimeText,
      alternateDatetimeText: alternateDatetimeText || null,
      experience,
      qualificationNotes: qualificationNotes || null,
      marketingConsent: body.marketingConsent === true,
      preferredChannel,
    });

    await recordBookingEvent({
      inquiryId: inquiry.id,
      eventType: "submitted_for_jd_review",
      actor: "web",
      metadata: { hold_expires_at: inquiry.hold_expires_at },
    });

    return NextResponse.json(
      {
        success: true,
        inquiryId: inquiry.id,
        status: inquiry.status,
        holdExpiresAt: inquiry.hold_expires_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Web booking intake error:", error);
    return NextResponse.json({ error: "Could not create booking request." }, { status: 500 });
  }
}
