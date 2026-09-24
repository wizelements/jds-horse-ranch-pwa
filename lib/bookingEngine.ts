import {
  BookingChannel,
  BookingInquiry,
  createConversationInquiry,
  getActiveInquiry,
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

export function statusMessage(inquiry: BookingInquiry) {
  switch (inquiry.status) {
    case "COLLECTING_INFORMATION":
      return "Your booking request is still being collected. Reply to the last question to continue.";
    case "PENDING_JD":
      return "Your request is pending JD's personal review. Your requested spot is held for up to 24 hours. Please call JD at (404) 981-2361 within that window. No payment is due until JD approves.";
    case "AWAITING_PAYMENT":
      return "JD approved the request and your booking-specific Square payment is pending.";
    case "BOOKED":
      return "Your payment was verified and your booking is confirmed.";
    case "COMPLETED":
      return "This booking is complete. Thank you for riding with JD's Horse Ranch.";
    default:
      return `This request is ${inquiry.status.toLowerCase().replaceAll("_", " ")}.`;
  }
}

async function reply(inquiry: BookingInquiry, body: string) {
  await sendCustomerMessage(inquiry, body);
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

  if (lower === "help") {
    if (!inquiry) {
      inquiry = await createConversationInquiry({
        channel: input.channel,
        phone: input.phone,
        profileName: input.profileName,
      });
    }
    await reply(
      inquiry,
      "JD's Horse Ranch reservation assistant. Send BOOK to start, STATUS for your request, or CANCEL to cancel. JD personally approves every booking before payment."
    );
    return inquiry;
  }

  if (lower === "status") {
    const latest = inquiry || (await getLatestInquiry(input.phone));
    if (!latest) {
      inquiry = await createConversationInquiry({
        channel: input.channel,
        phone: input.phone,
        profileName: input.profileName,
      });
      await reply(inquiry, "No prior active request was found. I started a new request. What service are you interested in: riding lesson, trail ride, or special event?");
      return inquiry;
    }
    await reply(latest, statusMessage(latest));
    return latest;
  }

  if (lower === "cancel" && inquiry) {
    inquiry = await updateInquiry(inquiry.id, {
      status: "CANCELLED",
      intake_step: "complete",
    });
    await recordBookingEvent({ inquiryId: inquiry.id, eventType: "cancelled_by_customer", actor: input.channel });
    await reply(inquiry, "Your active request has been cancelled.");
    return inquiry;
  }

  if (!inquiry) {
    inquiry = await createConversationInquiry({
      channel: input.channel,
      phone: input.phone,
      profileName: input.profileName,
    });
    await recordBookingEvent({ inquiryId: inquiry.id, eventType: "inquiry_started", actor: input.channel });
    await reply(
      inquiry,
      inquiry.intake_step === "name"
        ? "Welcome to JD's Horse Ranch. What is your full name?"
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
      await reply(inquiry, "What service are you interested in: riding lesson, trail ride, or special event?");
      return inquiry;

    case "service":
      inquiry = await updateInquiry(inquiry.id, {
        service_requested: text.slice(0, 120),
        intake_step: "rider_count",
      });
      await reply(inquiry, "How many riders are in your group? Send a number from 1 to 12.");
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
      await reply(inquiry, "What alternate date/time could work? Reply SKIP if you do not have one.");
      return inquiry;

    case "alternate_datetime":
      inquiry = await updateInquiry(inquiry.id, {
        alternate_datetime_text: lower === "skip" ? null : text.slice(0, 300),
        intake_step: "experience",
      });
      await reply(inquiry, "Briefly describe the riders' experience: first time, beginner, intermediate, experienced, or mixed.");
      return inquiry;

    case "experience":
      inquiry = await updateInquiry(inquiry.id, {
        experience: text.slice(0, 800),
        intake_step: "qualification",
      });
      await reply(inquiry, "Anything JD should know to prepare for the appointment or discuss with you? Reply SKIP if not.");
      return inquiry;

    case "qualification":
      inquiry = await updateInquiry(inquiry.id, {
        qualification_notes: lower === "skip" ? null : text.slice(0, 1200),
        intake_step: "email",
      });
      await reply(inquiry, "Optional: send an email address for this request, or reply SKIP.");
      return inquiry;

    case "email": {
      const email = lower === "skip" ? null : text.toLowerCase();
      if (email && !isEmail(email)) {
        await reply(inquiry, "That email format doesn't look valid. Send a valid email or reply SKIP.");
        return inquiry;
      }
      inquiry = await updateInquiry(inquiry.id, {
        email,
        intake_step: "marketing_consent",
      });
      await reply(inquiry, "Would you like occasional promotions from JD's Horse Ranch? Reply YES or NO. This does not affect booking messages.");
      return inquiry;
    }

    case "marketing_consent": {
      if (!["yes", "no"].includes(lower)) {
        await reply(inquiry, "Please reply YES or NO.");
        return inquiry;
      }
      const holdExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      inquiry = await updateInquiry(inquiry.id, {
        marketing_consent: lower === "yes",
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
        "Your request is ready for JD. The requested spot is held for up to 24 hours. Please call JD at (404) 981-2361 within that window. JD may confirm, decline, or adjust the time. Payment is sent only after JD approves."
      );
      return inquiry;
    }

    default:
      await reply(inquiry, "Send STATUS to check your request or HELP for options.");
      return inquiry;
  }
}
