import { NextRequest, NextResponse } from "next/server";
import {
  getInquiryBySquareOrderId,
  recordBookingEvent,
  updateInquiry,
} from "@/lib/bookingStore";
import { sendOperationalMessage } from "@/lib/communications";
import { verifySquareSignature } from "@/lib/square";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  if (!verifySquareSignature(rawBody, req.headers.get("x-square-hmacsha256-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  try {
    const event = JSON.parse(rawBody);
    if (!["payment.created", "payment.updated"].includes(event?.type)) {
      return NextResponse.json({ received: true });
    }

    const payment = event?.data?.object?.payment;
    if (!payment?.order_id || payment.status !== "COMPLETED") {
      return NextResponse.json({ received: true });
    }

    const inquiry = await getInquiryBySquareOrderId(payment.order_id);
    if (!inquiry || inquiry.status === "BOOKED" || inquiry.status === "COMPLETED") {
      return NextResponse.json({ received: true });
    }

    const paidAmount = Number(payment?.total_money?.amount || 0);
    if (
      inquiry.status !== "AWAITING_PAYMENT" ||
      !inquiry.approved_amount_cents ||
      paidAmount !== inquiry.approved_amount_cents ||
      payment?.total_money?.currency !== "USD"
    ) {
      await recordBookingEvent({
        inquiryId: inquiry.id,
        eventType: "payment_verification_rejected",
        actor: "square",
        metadata: {
          payment_id: payment.id,
          order_id: payment.order_id,
          amount: paidAmount,
          currency: payment?.total_money?.currency,
          expected_amount: inquiry.approved_amount_cents,
        },
      });
      return NextResponse.json({ received: true });
    }

    const now = new Date().toISOString();
    let booked = await updateInquiry(inquiry.id, {
      status: "BOOKED",
      paid_at: now,
      booked_at: now,
    });
    await recordBookingEvent({
      inquiryId: booked.id,
      eventType: "payment_verified_booking_confirmed",
      actor: "square",
      metadata: { payment_id: payment.id, order_id: payment.order_id, amount: paidAmount },
    });

    try {
      const when = booked.approved_start_at
        ? new Date(booked.approved_start_at).toLocaleString("en-US", {
            timeZone: "America/New_York",
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "the approved time";
      await sendOperationalMessage(booked, {
        body: `Payment verified. Your JD's Horse Ranch booking is confirmed for ${when}. Keep this message and follow any instructions JD gave you directly.`,
        whatsappTemplateEnv: "WHATSAPP_CONFIRMATION_TEMPLATE_NAME",
        whatsappParameters: [when],
      });
      booked = await updateInquiry(booked.id, { confirmation_sent_at: new Date().toISOString() });
    } catch (error) {
      console.error("Booking confirmation delivery failed:", error);
      await recordBookingEvent({
        inquiryId: booked.id,
        eventType: "confirmation_delivery_failed",
        actor: "system",
        metadata: { error: String(error) },
      });
    }

    return NextResponse.json({ received: true, bookingId: booked.id });
  } catch (error) {
    console.error("Square webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
