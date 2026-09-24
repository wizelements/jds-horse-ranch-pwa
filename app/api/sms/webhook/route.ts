import { NextRequest, NextResponse } from "next/server";
import { processBookingMessage } from "@/lib/bookingEngine";
import { getActiveInquiry, recordMessage } from "@/lib/bookingStore";
import { verifyTwilioFormSignature } from "@/lib/sms";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === "string") params[key] = value;
  });

  const exactUrl = process.env.TWILIO_SMS_WEBHOOK_URL || req.url;
  if (!verifyTwilioFormSignature(req.headers.get("x-twilio-signature"), exactUrl, params)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const phone = (params.From || "").trim();
  const body = (params.Body || "").trim();
  if (phone && body) {
    const active = await getActiveInquiry(phone);
    const fresh = await recordMessage({
      providerMessageId: params.MessageSid || null,
      inquiryId: active?.id || null,
      channel: "sms",
      direction: "inbound",
      phone,
      body,
      rawPayload: params,
    });
    if (fresh) {
      await processBookingMessage({ channel: "sms", phone, text: body });
    }
  }

  return new NextResponse("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response></Response>", {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
