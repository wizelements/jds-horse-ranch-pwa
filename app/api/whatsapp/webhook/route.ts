import { NextRequest, NextResponse } from "next/server";
import { processBookingMessage } from "@/lib/bookingEngine";
import {
  getActiveInquiry,
  recordMessage,
  recordMessageStatus,
  updateInquiry,
} from "@/lib/bookingStore";
import { verifyMetaSignature } from "@/lib/whatsapp";

export const runtime = "nodejs";

function clean(value: unknown) {
  return String(value || "").trim();
}

function messageBody(message: any) {
  if (message?.type === "text") {
    return clean(message.text?.body);
  }
  if (message?.type === "interactive") {
    return clean(
      message.interactive?.button_reply?.title ||
        message.interactive?.button_reply?.id ||
        message.interactive?.list_reply?.title ||
        message.interactive?.list_reply?.id
    );
  }
  return "";
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (
    mode === "subscribe" &&
    expectedToken &&
    token === expectedToken &&
    challenge
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    if (
      !verifyMetaSignature(
        rawBody,
        req.headers.get("x-hub-signature-256")
      )
    ) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    if (payload?.object !== "whatsapp_business_account") {
      return NextResponse.json({ received: true });
    }

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        const profileName = value.contacts?.[0]?.profile?.name;

        for (const status of value.statuses || []) {
          if (!status?.id || !status?.status) continue;
          const firstError = status.errors?.[0];
          await recordMessageStatus({
            providerMessageId: String(status.id),
            phone: clean(status.recipient_id) || null,
            status: String(status.status),
            errorCode: firstError?.code ? String(firstError.code) : null,
            errorMessage:
              firstError?.title || firstError?.message || firstError?.details
                ? clean(
                    firstError?.title ||
                      firstError?.message ||
                      firstError?.details
                  )
                : null,
            rawPayload: status,
          });
        }

        for (const message of value.messages || []) {
          const body = messageBody(message);
          if (!body) continue;

          const phone = clean(
            message.from || value.contacts?.[0]?.wa_id
          );
          if (!phone) continue;

          const active = await getActiveInquiry(phone);
          const fresh = await recordMessage({
            providerMessageId: message.id,
            inquiryId: active?.id || null,
            channel: "whatsapp",
            direction: "inbound",
            phone,
            body,
            rawPayload: message,
          });
          if (!fresh) continue;

          const inquiry = await processBookingMessage({
            channel: "whatsapp",
            phone,
            profileName,
            text: body,
          });

          const now = new Date();
          await updateInquiry(inquiry.id, {
            last_customer_message_at: now.toISOString(),
            customer_service_window_expires_at: new Date(
              now.getTime() + 24 * 60 * 60 * 1000
            ).toISOString(),
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
