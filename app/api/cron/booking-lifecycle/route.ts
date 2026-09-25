import { NextRequest, NextResponse } from "next/server";
import {
  expireStaleHolds,
  listFollowupCandidates,
  listPendingConfirmations,
  listReminderCandidates,
  recordBookingEvent,
  updateInquiry,
} from "@/lib/bookingStore";
import { sendOperationalMessage } from "@/lib/communications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && req.headers.get("authorization") === `Bearer ${secret}`);
}

function easternTime(iso: string | null) {
  if (!iso) return "the approved time";
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = {
    expired: 0,
    confirmations: 0,
    reminders: 0,
    followups: 0,
    deliveryFailures: 0,
  };

  const expired = await expireStaleHolds();
  result.expired = expired.length;

  for (const inquiry of expired) {
    try {
      await sendOperationalMessage(inquiry, {
        body: "Your 24-hour JD's Horse Ranch request hold expired before approval. Reply BOOK to start a new request.",
        whatsappTemplateEnv: "WHATSAPP_EXPIRED_TEMPLATE_NAME",
      });
      await recordBookingEvent({
        inquiryId: inquiry.id,
        eventType: "hold_expired_notice_sent",
        actor: "lifecycle_cron",
      });
    } catch (error) {
      result.deliveryFailures += 1;
      await recordBookingEvent({
        inquiryId: inquiry.id,
        eventType: "hold_expired_notice_failed",
        actor: "lifecycle_cron",
        metadata: { error: String(error) },
      });
    }
  }

  const pendingConfirmations = await listPendingConfirmations();
  for (const inquiry of pendingConfirmations) {
    const when = easternTime(inquiry.approved_start_at);
    try {
      await sendOperationalMessage(inquiry, {
        body: `Payment verified. Your JD's Horse Ranch booking is confirmed for ${when}.`,
        whatsappTemplateEnv: "WHATSAPP_CONFIRMATION_TEMPLATE_NAME",
        whatsappParameters: [when],
      });
      await updateInquiry(inquiry.id, { confirmation_sent_at: new Date().toISOString() });
      await recordBookingEvent({
        inquiryId: inquiry.id,
        eventType: "confirmation_retry_sent",
        actor: "lifecycle_cron",
      });
      result.confirmations += 1;
    } catch (error) {
      result.deliveryFailures += 1;
      await recordBookingEvent({
        inquiryId: inquiry.id,
        eventType: "confirmation_retry_failed",
        actor: "lifecycle_cron",
        metadata: { error: String(error) },
      });
    }
  }

  const now = Date.now();
  const reminders = await listReminderCandidates(
    new Date(now + 23 * 60 * 60 * 1000).toISOString(),
    new Date(now + 25 * 60 * 60 * 1000).toISOString()
  );

  for (const inquiry of reminders) {
    const when = easternTime(inquiry.approved_start_at);
    try {
      await sendOperationalMessage(inquiry, {
        body: `Reminder: your JD's Horse Ranch booking is scheduled for ${when}. Please follow the arrival instructions JD provided.`,
        whatsappTemplateEnv: "WHATSAPP_REMINDER_TEMPLATE_NAME",
        whatsappParameters: [when],
      });
      await updateInquiry(inquiry.id, { reminder_sent_at: new Date().toISOString() });
      await recordBookingEvent({
        inquiryId: inquiry.id,
        eventType: "booking_reminder_sent",
        actor: "lifecycle_cron",
      });
      result.reminders += 1;
    } catch (error) {
      result.deliveryFailures += 1;
      await recordBookingEvent({
        inquiryId: inquiry.id,
        eventType: "booking_reminder_failed",
        actor: "lifecycle_cron",
        metadata: { error: String(error) },
      });
    }
  }

  const followups = await listFollowupCandidates(
    new Date(now - 2 * 60 * 60 * 1000).toISOString()
  );

  for (const inquiry of followups) {
    const reviewUrl = process.env.JD_REVIEW_URL || "";
    const body = reviewUrl
      ? `Thank you for riding with JD's Horse Ranch. We'd appreciate your feedback: ${reviewUrl}`
      : "Thank you for riding with JD's Horse Ranch. We appreciate you and hope to ride with you again.";
    try {
      await sendOperationalMessage(inquiry, {
        body,
        whatsappTemplateEnv: "WHATSAPP_FOLLOWUP_TEMPLATE_NAME",
        whatsappParameters: reviewUrl ? [reviewUrl] : [],
      });
      await updateInquiry(inquiry.id, { followup_sent_at: new Date().toISOString() });
      await recordBookingEvent({
        inquiryId: inquiry.id,
        eventType: "post_ride_followup_sent",
        actor: "lifecycle_cron",
      });
      result.followups += 1;
    } catch (error) {
      result.deliveryFailures += 1;
      await recordBookingEvent({
        inquiryId: inquiry.id,
        eventType: "post_ride_followup_failed",
        actor: "lifecycle_cron",
        metadata: { error: String(error) },
      });
    }
  }

  return NextResponse.json({ success: true, ...result });
}
