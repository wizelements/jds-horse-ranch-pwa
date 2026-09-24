import { NextRequest, NextResponse } from "next/server";
import {
  createInquiry,
  getActiveInquiry,
  recordWhatsAppMessage,
  updateInquiry,
  WhatsAppInquiry,
} from "@/lib/whatsappStore";
import { sendWhatsAppText, verifyMetaSignature } from "@/lib/whatsapp";

export const runtime = "nodejs";

function clean(value: unknown) {
  return String(value || "").trim();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function reply(phone: string, inquiryId: string | undefined, body: string) {
  await sendWhatsAppText(phone, body);
  await recordWhatsAppMessage({
    inquiryId,
    direction: "outbound",
    phone,
    body,
  });
}

function statusMessage(inquiry: WhatsAppInquiry) {
  switch (inquiry.status) {
    case "COLLECTING_INFORMATION":
      return "Your booking request is still being collected. Reply to the last question to continue.";
    case "PENDING_JD":
      return "Your request is pending JD's personal review. Your requested spot is held for up to 24 hours. Please call JD at (404) 981-2361 within that window. No payment is due until JD approves.";
    case "AWAITING_PAYMENT":
      return "JD has approved the request and payment is pending. Use the payment link JD's system sent you.";
    case "PAID":
      return "Payment is recorded. JD's team still needs to finalize the booking confirmation.";
    case "BOOKED":
      return "Your booking is confirmed.";
    default:
      return `This request is ${inquiry.status.toLowerCase().replaceAll("_", " ")}.`;
  }
}

async function handleText(
  phone: string,
  profileName: string | undefined,
  text: string
) {
  const lower = text.toLowerCase();
  let inquiry = await getActiveInquiry(phone);

  if (lower === "help") {
    await reply(
      phone,
      inquiry?.id,
      "JD's Horse Ranch booking bot. Send BOOK to start a riding request, STATUS for your current request, or CANCEL to cancel an active request. JD personally approves every booking before payment."
    );
    return;
  }

  if (lower === "status") {
    await reply(
      phone,
      inquiry?.id,
      inquiry
        ? statusMessage(inquiry)
        : "No active request was found. Send BOOK to start one."
    );
    return;
  }

  if (lower === "cancel" && inquiry) {
    inquiry = await updateInquiry(inquiry.id, {
      status: "CANCELLED",
      intake_step: "complete",
    });
    await reply(phone, inquiry.id, "Your active request has been cancelled.");
    return;
  }

  if (!inquiry) {
    inquiry = await createInquiry(phone, profileName);
    await reply(
      phone,
      inquiry.id,
      inquiry.intake_step === "name"
        ? "Welcome to JD's Horse Ranch. I can collect your riding request for JD to review. What is your full name?"
        : `Hi ${inquiry.customer_name}. How many riders are in your group?`
    );
    return;
  }

  if (inquiry.status !== "COLLECTING_INFORMATION") {
    await reply(phone, inquiry.id, statusMessage(inquiry));
    return;
  }

  switch (inquiry.intake_step) {
    case "name": {
      if (text.length < 2) {
        await reply(phone, inquiry.id, "Please send the rider/contact full name.");
        return;
      }
      inquiry = await updateInquiry(inquiry.id, {
        customer_name: text.slice(0, 120),
        intake_step: "rider_count",
      });
      await reply(phone, inquiry.id, "How many riders are in your group?");
      return;
    }

    case "rider_count": {
      const count = Number.parseInt(text, 10);
      if (!Number.isInteger(count) || count < 1 || count > 12) {
        await reply(phone, inquiry.id, "Please send a rider count from 1 to 12.");
        return;
      }
      inquiry = await updateInquiry(inquiry.id, {
        rider_count: count,
        intake_step: "rider_details",
      });
      await reply(
        phone,
        inquiry.id,
        "Send each rider's height and weight in one message. Example: Rider 1: 5'6, 150 lb; Rider 2: 4'10, 95 lb."
      );
      return;
    }

    case "rider_details":
      inquiry = await updateInquiry(inquiry.id, {
        rider_details: text.slice(0, 1500),
        intake_step: "requested_datetime",
      });
      await reply(
        phone,
        inquiry.id,
        "What date and approximate time would you like to ride?"
      );
      return;

    case "requested_datetime":
      inquiry = await updateInquiry(inquiry.id, {
        requested_datetime_text: text.slice(0, 300),
        intake_step: "experience",
      });
      await reply(
        phone,
        inquiry.id,
        "Briefly describe the riders' horse-riding experience (first time, beginner, intermediate, experienced, or mixed)."
      );
      return;

    case "experience":
      inquiry = await updateInquiry(inquiry.id, {
        experience: text.slice(0, 800),
        intake_step: "email",
      });
      await reply(
        phone,
        inquiry.id,
        "Optional: send an email address for the request, or reply SKIP."
      );
      return;

    case "email": {
      const email = lower === "skip" ? null : clean(text).toLowerCase();
      if (email && !isEmail(email)) {
        await reply(phone, inquiry.id, "That email format doesn't look valid. Send a valid email or reply SKIP.");
        return;
      }

      const holdExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      inquiry = await updateInquiry(inquiry.id, {
        email,
        status: "PENDING_JD",
        intake_step: "complete",
        hold_expires_at: holdExpiresAt,
      });

      await reply(
        phone,
        inquiry.id,
        "Thanks — your request is ready for JD to review. Your requested spot is held for up to 24 hours. Please call JD at (404) 981-2361 within 24 hours so he can personally confirm, decline, or adjust the request. Payment information is sent only after JD approves."
      );
      return;
    }

    default:
      await reply(phone, inquiry.id, "Send STATUS to check your request or HELP for options.");
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && expectedToken && token === expectedToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    if (!verifyMetaSignature(rawBody, req.headers.get("x-hub-signature-256"))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    if (payload?.object !== "whatsapp_business_account") {
      return NextResponse.json({ received: true });
    }

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        const profileName = value.contacts?.[0]?.profile?.name;

        for (const message of value.messages || []) {
          if (message.type !== "text") continue;

          const phone = clean(message.from || value.contacts?.[0]?.wa_id);
          const body = clean(message.text?.body);
          if (!phone || !body) continue;

          const fresh = await recordWhatsAppMessage({
            waMessageId: message.id,
            direction: "inbound",
            phone,
            body,
            rawPayload: message,
          });

          if (!fresh) continue;
          await handleText(phone, profileName, body);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
