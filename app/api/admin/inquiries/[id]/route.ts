import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getInquiry, recordWhatsAppMessage, updateInquiry } from "@/lib/whatsappStore";
import { sendWhatsAppText } from "@/lib/whatsapp";

export const runtime = "nodejs";

async function sendAndRecord(inquiryId: string, phone: string, body: string) {
  await sendWhatsAppText(phone, body);
  await recordWhatsAppMessage({
    inquiryId,
    direction: "outbound",
    phone,
    body,
  });
}

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inquiry = await getInquiry(context.params.id);
  const { action } = await req.json();

  if (action === "jd_approved") {
    const paymentUrl = process.env.JD_PAYMENT_URL;
    if (!paymentUrl) {
      return NextResponse.json(
        { error: "JD_PAYMENT_URL is not configured" },
        { status: 409 }
      );
    }

    await updateInquiry(inquiry.id, { status: "AWAITING_PAYMENT" });
    await sendAndRecord(
      inquiry.id,
      inquiry.customer_phone,
      `JD approved your request after speaking with you. Complete payment here to continue: ${paymentUrl}`
    );
    return NextResponse.json({ success: true, status: "AWAITING_PAYMENT" });
  }

  if (action === "decline") {
    await updateInquiry(inquiry.id, { status: "DECLINED" });
    await sendAndRecord(
      inquiry.id,
      inquiry.customer_phone,
      "JD reviewed the request and cannot confirm that requested time. Reply BOOK to start a new request with a different date/time."
    );
    return NextResponse.json({ success: true, status: "DECLINED" });
  }

  if (action === "mark_paid") {
    await updateInquiry(inquiry.id, { status: "PAID" });
    await sendAndRecord(
      inquiry.id,
      inquiry.customer_phone,
      "Payment has been marked received. JD's team is finalizing your booking confirmation."
    );
    return NextResponse.json({ success: true, status: "PAID" });
  }

  if (action === "mark_booked") {
    await updateInquiry(inquiry.id, { status: "BOOKED" });
    await sendAndRecord(
      inquiry.id,
      inquiry.customer_phone,
      "Your JD's Horse Ranch booking is confirmed. Please keep this chat for any updates."
    );
    return NextResponse.json({ success: true, status: "BOOKED" });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
