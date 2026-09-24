import { createHmac, timingSafeEqual } from "crypto";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function verifyMetaSignature(rawBody: string, signatureHeader: string | null) {
  if (!signatureHeader?.startsWith("sha256=")) return false;

  const appSecret = required("WHATSAPP_APP_SECRET");
  const expected = createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");
  const received = signatureHeader.slice("sha256=".length);

  const expectedBuffer = Buffer.from(expected, "hex");
  const receivedBuffer = Buffer.from(received, "hex");

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export async function sendWhatsAppText(to: string, body: string) {
  const phoneNumberId = required("WHATSAPP_PHONE_NUMBER_ID");
  const accessToken = required("WHATSAPP_ACCESS_TOKEN");
  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || "v26.0";

  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body, preview_url: false },
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`WhatsApp send failed (${response.status}): ${details}`);
  }

  return response.json();
}
