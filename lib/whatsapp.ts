import { createHmac, timingSafeEqual } from "crypto";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function sendWhatsAppPayload(payload: Record<string, unknown>) {
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
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(`WhatsApp send failed (${response.status}): ${JSON.stringify(result)}`);
  }
  return result;
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
  return sendWhatsAppPayload({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { body, preview_url: false },
  });
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  bodyParameters: string[] = []
) {
  const components = bodyParameters.length
    ? [
        {
          type: "body",
          parameters: bodyParameters.map((text) => ({
            type: "text",
            text,
          })),
        },
      ]
    : undefined;

  return sendWhatsAppPayload({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || "en_US",
      },
      ...(components ? { components } : {}),
    },
  });
}
