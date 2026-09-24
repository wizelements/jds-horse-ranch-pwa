import { NextRequest, NextResponse } from "next/server";
import { processBookingMessage } from "@/lib/bookingEngine";
import { getActiveInquiry, recordMessage } from "@/lib/bookingStore";
import { verifyMetaSignature } from "@/lib/whatsapp";

export const runtime = "nodejs";

function clean(value: unknown) {
  return String(value || "").trim();
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

          await processBookingMessage({
            channel: "whatsapp",
            phone,
            profileName,
            text: body,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
