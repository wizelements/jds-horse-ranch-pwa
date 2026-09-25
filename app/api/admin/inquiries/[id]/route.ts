import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import {
  getInquiry,
  recordBookingEvent,
  updateInquiry,
} from "@/lib/bookingStore";
import {
  sendCustomerMessage,
  sendOperationalMessage,
} from "@/lib/communications";
import { createSquarePaymentLink } from "@/lib/square";

export const runtime = "nodejs";

function easternTime(value: Date | string) {
  return new Date(value).toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const inquiry = await getInquiry(id);
  const body = await req.json();
  const action = String(body.action || "");

  if (action === "jd_approved") {
    if (inquiry.status !== "PENDING_JD") {
      return NextResponse.json(
        { error: "Only pending requests can be approved." },
        { status: 409 }
      );
    }

    const amountCents = Number(body.amountCents);
    const approvedStartAt = new Date(String(body.approvedStartAt || ""));
    const note = String(body.note || "").trim().slice(0, 1200);

    if (!Number.isInteger(amountCents) || amountCents < 100) {
      return NextResponse.json(
        { error: "Enter an approved amount of at least $1.00." },
        { status: 400 }
      );
    }
    if (
      Number.isNaN(approvedStartAt.getTime()) ||
      approvedStartAt.getTime() <= Date.now()
    ) {
      return NextResponse.json(
        { error: "Enter a valid future approved ride date/time." },
        { status: 400 }
      );
    }

    const paymentLink = await createSquarePaymentLink(inquiry, amountCents);
    const approved = await updateInquiry(inquiry.id, {
      status: "AWAITING_PAYMENT",
      approved_start_at: approvedStartAt.toISOString(),
      approval_note: note || null,
      approved_amount_cents: amountCents,
      square_payment_link_id: paymentLink.id,
      square_order_id: paymentLink.order_id,
      square_payment_url: paymentLink.url,
      reschedule_requested_at: null,
      reschedule_request_text: null,
    });

    await recordBookingEvent({
      inquiryId: approved.id,
      eventType: "jd_approved_payment_created",
      actor: "jd_admin",
      metadata: {
        approved_start_at: approved.approved_start_at,
        amount_cents: amountCents,
        square_order_id: paymentLink.order_id,
      },
    });

    const when = easternTime(approvedStartAt);

    try {
      await sendOperationalMessage(approved, {
        body: `JD approved your riding request for ${when}. Complete your booking-specific Square payment here: ${paymentLink.url}. Your booking becomes confirmed only after Square reports the payment as completed.`,
        whatsappTemplateEnv: "WHATSAPP_PAYMENT_TEMPLATE_NAME",
        whatsappParameters: [when, paymentLink.url],
      });
      await recordBookingEvent({
        inquiryId: approved.id,
        eventType: "payment_link_delivered",
        actor: "system",
      });
      return NextResponse.json({
        success: true,
        status: approved.status,
        paymentUrl: paymentLink.url,
        delivery: "sent",
      });
    } catch (error) {
      console.error("Payment-link delivery failed:", error);
      await recordBookingEvent({
        inquiryId: approved.id,
        eventType: "payment_link_delivery_failed",
        actor: "system",
        metadata: { error: String(error) },
      });
      return NextResponse.json(
        {
          success: true,
          status: approved.status,
          paymentUrl: paymentLink.url,
          delivery: "failed",
          warning:
            "Square payment was created, but automated delivery needs attention.",
        },
        { status: 202 }
      );
    }
  }

  if (action === "approve_change") {
    if (
      !["AWAITING_PAYMENT", "BOOKED"].includes(inquiry.status) ||
      !inquiry.reschedule_request_text
    ) {
      return NextResponse.json(
        { error: "There is no eligible change request to approve." },
        { status: 409 }
      );
    }

    const approvedStartAt = new Date(String(body.approvedStartAt || ""));
    const note = String(body.note || "").trim().slice(0, 1200);
    if (
      Number.isNaN(approvedStartAt.getTime()) ||
      approvedStartAt.getTime() <= Date.now()
    ) {
      return NextResponse.json(
        { error: "Enter a valid future date/time." },
        { status: 400 }
      );
    }

    const changed = await updateInquiry(inquiry.id, {
      approved_start_at: approvedStartAt.toISOString(),
      approval_note: note || inquiry.approval_note,
      reschedule_requested_at: null,
      reschedule_request_text: null,
    });
    const when = easternTime(approvedStartAt);
    const updateText = `JD approved your requested booking change. Your updated appointment time is ${when}.`;

    await recordBookingEvent({
      inquiryId: changed.id,
      eventType: "change_request_approved",
      actor: "jd_admin",
      metadata: { approved_start_at: changed.approved_start_at, note },
    });

    await sendOperationalMessage(changed, {
      body: updateText,
      whatsappTemplateEnv: "WHATSAPP_UPDATE_TEMPLATE_NAME",
      whatsappParameters: [updateText],
    });

    return NextResponse.json({ success: true, status: changed.status });
  }

  if (action === "decline_change") {
    if (!inquiry.reschedule_request_text) {
      return NextResponse.json(
        { error: "There is no change request to decline." },
        { status: 409 }
      );
    }

    const note = String(body.note || "").trim().slice(0, 1200);
    const unchanged = await updateInquiry(inquiry.id, {
      reschedule_requested_at: null,
      reschedule_request_text: null,
    });
    const updateText = note
      ? `JD reviewed your requested change and cannot approve it. Your existing booking remains unchanged. Note: ${note}`
      : "JD reviewed your requested change and cannot approve it. Your existing booking remains unchanged.";

    await recordBookingEvent({
      inquiryId: unchanged.id,
      eventType: "change_request_declined",
      actor: "jd_admin",
      metadata: note ? { note } : {},
    });

    await sendOperationalMessage(unchanged, {
      body: updateText,
      whatsappTemplateEnv: "WHATSAPP_UPDATE_TEMPLATE_NAME",
      whatsappParameters: [updateText],
    });

    return NextResponse.json({ success: true, status: unchanged.status });
  }

  if (action === "send_message") {
    const message = String(body.message || "").trim().slice(0, 2000);
    if (!message) {
      return NextResponse.json(
        { error: "Enter a message to send." },
        { status: 400 }
      );
    }

    const windowEnds = inquiry.customer_service_window_expires_at
      ? new Date(inquiry.customer_service_window_expires_at).getTime()
      : 0;
    if (!windowEnds || windowEnds <= Date.now()) {
      return NextResponse.json(
        {
          error:
            "The 24-hour WhatsApp service window is closed. A free-form human reply cannot be sent; use an approved operational template.",
        },
        { status: 409 }
      );
    }

    await sendCustomerMessage(inquiry, message);
    await recordBookingEvent({
      inquiryId: inquiry.id,
      eventType: "jd_human_message_sent",
      actor: "jd_admin",
    });
    return NextResponse.json({ success: true });
  }

  if (action === "resume_automation") {
    const resumed = await updateInquiry(inquiry.id, {
      automation_paused: false,
      human_takeover_requested_at: null,
    });
    await recordBookingEvent({
      inquiryId: resumed.id,
      eventType: "automation_resumed_by_admin",
      actor: "jd_admin",
    });
    return NextResponse.json({ success: true, status: resumed.status });
  }

  if (action === "decline") {
    if (!["PENDING_JD", "COLLECTING_INFORMATION"].includes(inquiry.status)) {
      return NextResponse.json(
        { error: "This request can no longer be declined." },
        { status: 409 }
      );
    }
    const reason = String(body.reason || "").trim().slice(0, 800);
    const declined = await updateInquiry(inquiry.id, {
      status: "DECLINED",
      approval_note: reason || null,
    });
    await recordBookingEvent({
      inquiryId: declined.id,
      eventType: "jd_declined",
      actor: "jd_admin",
      metadata: reason ? { reason } : {},
    });
    try {
      const message = reason
        ? `JD reviewed your request and cannot confirm it as submitted. Note: ${reason}. Reply BOOK to start another request or continue messaging here with a question.`
        : "JD reviewed your request and cannot confirm it as submitted. Reply BOOK to start another request or continue messaging here with a question.";
      await sendOperationalMessage(declined, {
        body: message,
        whatsappTemplateEnv: "WHATSAPP_DECLINE_TEMPLATE_NAME",
        whatsappParameters: [
          reason || "Reply here if you would like to request another date or option.",
        ],
      });
    } catch (error) {
      await recordBookingEvent({
        inquiryId: declined.id,
        eventType: "decline_delivery_failed",
        actor: "system",
        metadata: { error: String(error) },
      });
    }
    return NextResponse.json({ success: true, status: declined.status });
  }

  if (action === "cancel") {
    const cancelled = await updateInquiry(inquiry.id, {
      status: "CANCELLED",
    });
    await recordBookingEvent({
      inquiryId: cancelled.id,
      eventType: "cancelled_by_admin",
      actor: "jd_admin",
    });
    return NextResponse.json({ success: true, status: cancelled.status });
  }

  if (action === "complete") {
    if (inquiry.status !== "BOOKED") {
      return NextResponse.json(
        { error: "Only confirmed bookings can be completed." },
        { status: 409 }
      );
    }
    const completed = await updateInquiry(inquiry.id, {
      status: "COMPLETED",
      completed_at: new Date().toISOString(),
    });
    await recordBookingEvent({
      inquiryId: completed.id,
      eventType: "ride_completed",
      actor: "jd_admin",
    });
    return NextResponse.json({ success: true, status: completed.status });
  }

  return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
}
