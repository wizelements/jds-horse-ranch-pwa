import {
  BookingChannel,
  BookingInquiry,
  createConversationInquiry,
  getActiveInquiry,
  getLatestInquiry,
  recordBookingEvent,
  updateInquiry,
} from "@/lib/bookingStore";
import { sendCustomerMessage } from "@/lib/communications";

function clean(value: unknown) {
  return String(value || "").trim();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function reply(inquiry: BookingInquiry, body: string) {
  await sendCustomerMessage(inquiry, body);
}

async function newInquiry(input: {
  channel: Extract<BookingChannel, "whatsapp" | "sms">;
  phone: string;
  profileName?: string;
}) {
  const inquiry = await createConversationInquiry(input);
  await recordBookingEvent({
    inquiryId: inquiry.id,
    eventType: "inquiry_started",
    actor: input.channel,
  });
  return inquiry;
}

export function statusMessage(inquiry: BookingInquiry) {
  if (inquiry.automation_paused) {
    return "This conversation is paused for human follow-up from JD. Keep messaging here; your booking record remains active.";
  }

  if (inquiry.reschedule_requested_at && !inquiry.reschedule_request_text) {
    return "A change request is open. Send the new date/time or the change you want JD to review.";
  }

  if (inquiry.reschedule_request_text) {
    return "Your requested change has been sent to JD for review. The current booking remains unchanged until JD approves an update.";
  }

  switch (inquiry.status) {
    case "COLLECTING_INFORMATION":
      return "Your booking request is still being collected. Reply to the last question to continue.";
    case "PENDING_JD":
      return "Your request is with JD for personal review. You do not need to call. JD's decision or any requested adjustment will be sent here in WhatsApp. No payment is due yet.";
    case "AWAITING_PAYMENT":
      return "JD approved the request. Your booking-specific Square payment is awaiting completion. The reservation is not confirmed until Square verifies payment.";
    case "BOOKED":
      return "Your Square payment was verified and your booking is confirmed. Reply CHANGE to request a date/time change or HUMAN if you need JD.";
    case "COMPLETED":
      return "This booking is complete. Thank you for riding with JD's Horse Ranch.";
    default:
      return `This request is ${inquiry.status.toLowerCase().replace(/_/g, " ")}.`;
  }
}

export async function processBookingMessage(input: {
  channel: Extract<BookingChannel, "whatsapp" | "sms">;
  phone: string;
  profileName?: string;
  text: string;
}) {
  const text = clean(input.text);
  const lower = text.toLowerCase();
  let inquiry = await getActiveInquiry(input.phone);
  const latest = inquiry || (await getLatestInquiry(input.phone));

  if (["stop", "unsubscribe", "opt out"].includes(lower)) {
    inquiry =
      latest ||
      (await newInquiry({
        channel: input.channel,
        phone: input.phone,
        profileName: input.profileName,
      }));

    inquiry = await updateInquiry(inquiry.id, {
      marketing_consent: false,
      marketing_opt_out_at: new Date().toISOString(),
    });
    await recordBookingEvent({
      inquiryId: inquiry.id,
      eventType: "marketing_opt_out",
      actor: input.channel,
    });
    await reply(
      inquiry,
      "Promotional WhatsApp messages are now off. This does not cancel an active reservation or prevent necessary booking updates."
    );
    return inquiry;
  }

  if (lower === "help") {
    inquiry =
      latest ||
      (await newInquiry({
        channel: input.channel,
        phone: input.phone,
        profileName: input.profileName,
      }));
    await reply(
      inquiry,
      "JD's Horse Ranch reservation assistant. Send BOOK to start a new request, STATUS to check progress, CHANGE to request an update, HUMAN to ask for JD, or CANCEL to cancel an unpaid active request. JD personally approves every booking before payment."
    );
    return inquiry;
  }

  if (lower === "status") {
    if (!latest) {
      inquiry = await newInquiry({
        channel: input.channel,
        phone: input.phone,
        profileName: input.profileName,
      });
      await reply(
        inquiry,
        inquiry.intake_step === "name"
          ? "No prior request was found, so I started a new one. What is your full name?"
          : `No prior request was found, so I started a new one. Hi ${inquiry.customer_name}. What service are you interested in: riding lesson, trail ride, or special event?`
      );
      return inquiry;
    }
    await reply(latest, statusMessage(latest));
    return latest;
  }

  if (lower === "human" || lower === "jd") {
    inquiry =
      latest ||
      (await newInquiry({
        channel: input.channel,
        phone: input.phone,
        profileName: input.profileName,
      }));
    const now = new Date().toISOString();
    inquiry = await updateInquiry(inquiry.id, {
      automation_paused: true,
      human_takeover_requested_at: now,
    });
    await recordBookingEvent({
      inquiryId: inquiry.id,
      eventType: "human_takeover_requested",
      actor: input.channel,
    });
    await reply(
      inquiry,
      "I flagged this conversation for JD. The automated assistant is paused so you can continue messaging here for human follow-up. Send RESUME if you want to return to the automated assistant."
    );
    return inquiry;
  }

  if (lower === "resume" && latest) {
    inquiry = await updateInquiry(latest.id, {
      automation_paused: false,
      human_takeover_requested_at: null,
    });
    await recordBookingEvent({
      inquiryId: inquiry.id,
      eventType: "automation_resumed_by_customer",
      actor: input.channel,
    });
    await reply(
      inquiry,
      "The reservation assistant is active again. Send STATUS to check your request or continue with the last booking question."
    );
    return inquiry;
  }

  if (latest?.automation_paused) {
    return latest;
  }

  if (lower === "change" && latest) {
    if (!["PENDING_JD", "AWAITING_PAYMENT", "BOOKED"].includes(latest.status)) {
      await reply(
        latest,
        "There is no confirmed or review-stage reservation to change. Send BOOK to start a new request."
      );
      return latest;
    }

    inquiry = await updateInquiry(latest.id, {
      reschedule_requested_at: new Date().toISOString(),
      reschedule_request_text: null,
    });
    await recordBookingEvent({
      inquiryId: inquiry.id,
      eventType: "change_request_started",
      actor: input.channel,
    });
    await reply(
      inquiry,
      "Send the new date/time or describe the change you want JD to review. Your current reservation stays unchanged until JD approves an update."
    );
    return inquiry;
  }

  if (
    latest?.reschedule_requested_at &&
    !latest.reschedule_request_text &&
    ["PENDING_JD", "AWAITING_PAYMENT", "BOOKED"].includes(latest.status)
  ) {
    inquiry = await updateInquiry(latest.id, {
      reschedule_request_text: text.slice(0, 1200),
    });
    await recordBookingEvent({
      inquiryId: inquiry.id,
      eventType: "change_request_submitted",
      actor: input.channel,
      metadata: { request: inquiry.reschedule_request_text },
    });
    await reply(
      inquiry,
      "Your change request has been sent to JD for review. The current booking remains unchanged until JD approves the new details."
    );
    return inquiry;
  }

  if (lower === "cancel" && inquiry) {
    inquiry = await updateInquiry(inquiry.id, {
      status: "CANCELLED",
      intake_step: "complete",
    });
    await recordBookingEvent({
      inquiryId: inquiry.id,
      eventType: "cancelled_by_customer",
      actor: input.channel,
    });
    await reply(inquiry, "Your unpaid active request has been cancelled.");
    return inquiry;
  }

  if (!inquiry) {
    inquiry = await newInquiry({
      channel: input.channel,
      phone: input.phone,
      profileName: input.profileName,
    });
    await reply(
      inquiry,
      inquiry.intake_step === "name"
        ? "Welcome to JD's Horse Ranch. I can help you request an appointment. What is your full name?"
        : `Hi ${inquiry.customer_name}. What service are you interested in: riding lesson, trail ride, or special event?`
    );
    return inquiry;
  }

  if (inquiry.status !== "COLLECTING_INFORMATION") {
    await reply(inquiry, statusMessage(inquiry));
    return inquiry;
  }

  switch (inquiry.intake_step) {
    case "name":
      if (text.length < 2) {
        await reply(inquiry, "Please send the rider/contact full name.");
        return inquiry;
      }
      inquiry = await updateInquiry(inquiry.id, {
        customer_name: text.slice(0, 120),
        intake_step: "service",
      });
      await reply(
        inquiry,
        "What service are you interested in: riding lesson, trail ride, or special event?"
      );
      return inquiry;

    case "service":
      inquiry = await updateInquiry(inquiry.id, {
        service_requested: text.slice(0, 120),
        intake_step: "rider_count",
      });
      await reply(
        inquiry,
        "How many riders are in your group? Send a number from 1 to 12."
      );
      return inquiry;

    case "rider_count": {
      const count = Number.parseInt(text, 10);
      if (!Number.isInteger(count) || count < 1 || count > 12) {
        await reply(inquiry, "Please send a rider count from 1 to 12.");
        return inquiry;
      }
      inquiry = await updateInquiry(inquiry.id, {
        rider_count: count,
        intake_step: "rider_details",
      });
      await reply(
        inquiry,
        "Send each rider's age, height, and weight in one message. Example: Rider 1: age 24, 5'6, 150 lb; Rider 2: age 12, 4'10, 95 lb."
      );
      return inquiry;
    }

    case "rider_details":
      inquiry = await updateInquiry(inquiry.id, {
        rider_details: text.slice(0, 2000),
        intake_step: "requested_datetime",
      });
      await reply(inquiry, "What date and approximate time would you prefer?");
      return inquiry;

    case "requested_datetime":
      inquiry = await updateInquiry(inquiry.id, {
        requested_datetime_text: text.slice(0, 300),
        intake_step: "alternate_datetime",
      });
      await reply(
        inquiry,
        "What alternate date/time could work? Reply SKIP if you do not have one."
      );
      return inquiry;

    case "alternate_datetime":
      inquiry = await updateInquiry(inquiry.id, {
        alternate_datetime_text: lower === "skip" ? null : text.slice(0, 300),
        intake_step: "experience",
      });
      await reply(
        inquiry,
        "Briefly describe the riders' experience: first time, beginner, intermediate, experienced, or mixed."
      );
      return inquiry;

    case "experience":
      inquiry = await updateInquiry(inquiry.id, {
        experience: text.slice(0, 800),
        intake_step: "qualification",
      });
      await reply(
        inquiry,
        "Anything JD should know to prepare for the appointment or discuss with you? Reply SKIP if not."
      );
      return inquiry;

    case "qualification":
      inquiry = await updateInquiry(inquiry.id, {
        qualification_notes: lower === "skip" ? null : text.slice(0, 1200),
        intake_step: "email",
      });
      await reply(
        inquiry,
        "Optional: send an email address for this request, or reply SKIP."
      );
      return inquiry;

    case "email": {
      const email = lower === "skip" ? null : text.toLowerCase();
      if (email && !isEmail(email)) {
        await reply(
          inquiry,
          "That email format doesn't look valid. Send a valid email or reply SKIP."
        );
        return inquiry;
      }
      inquiry = await updateInquiry(inquiry.id, {
        email,
        intake_step: "marketing_consent",
      });
      await reply(
        inquiry,
        "Would you like occasional promotions from JD's Horse Ranch? Reply YES or NO. This is separate from necessary booking updates."
      );
      return inquiry;
    }

    case "marketing_consent": {
      if (!["yes", "no"].includes(lower)) {
        await reply(inquiry, "Please reply YES or NO.");
        return inquiry;
      }
      const holdExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();
      inquiry = await updateInquiry(inquiry.id, {
        marketing_consent: lower === "yes",
        marketing_opt_out_at: lower === "no" ? new Date().toISOString() : null,
        status: "PENDING_JD",
        intake_step: "complete",
        hold_expires_at: holdExpiresAt,
      });
      await recordBookingEvent({
        inquiryId: inquiry.id,
        eventType: "submitted_for_jd_review",
        actor: input.channel,
        metadata: { hold_expires_at: holdExpiresAt },
      });
      await reply(
        inquiry,
        "Your request is ready for JD. You do not need to call. JD will review the riders, requested time, and service, then send the decision or any adjustment here in WhatsApp. No payment is due until JD approves."
      );
      return inquiry;
    }

    default:
      await reply(
        inquiry,
        "Send STATUS to check your request, HELP for options, or HUMAN if you need JD."
      );
      return inquiry;
  }
}
