import { BookingInquiry, recordMessage } from "@/lib/bookingStore";
import { sendSmsText } from "@/lib/sms";
import { sendWhatsAppTemplate, sendWhatsAppText } from "@/lib/whatsapp";

async function recordOutbound(
  inquiry: BookingInquiry,
  channel: "whatsapp" | "sms",
  body: string,
  result: any
) {
  const providerMessageId =
    channel === "whatsapp" ? result?.messages?.[0]?.id || null : result?.sid || null;
  await recordMessage({
    providerMessageId,
    inquiryId: inquiry.id,
    channel,
    direction: "outbound",
    phone: inquiry.customer_phone,
    body,
    rawPayload: result,
  });
}

export async function sendCustomerMessage(inquiry: BookingInquiry, body: string) {
  const channel =
    inquiry.preferred_channel === "whatsapp" || inquiry.preferred_channel === "sms"
      ? inquiry.preferred_channel
      : inquiry.channel;

  if (channel === "whatsapp") {
    const result = await sendWhatsAppText(inquiry.customer_phone, body);
    await recordOutbound(inquiry, "whatsapp", body, result);
    return;
  }

  if (channel === "sms") {
    const result = await sendSmsText(inquiry.customer_phone, body);
    await recordOutbound(inquiry, "sms", body, result);
    return;
  }

  throw new Error("No outbound messaging channel is configured for this inquiry");
}

export async function sendOperationalMessage(
  inquiry: BookingInquiry,
  input: {
    body: string;
    whatsappTemplateEnv: string;
    whatsappParameters?: string[];
  }
) {
  const channel =
    inquiry.preferred_channel === "whatsapp" || inquiry.preferred_channel === "sms"
      ? inquiry.preferred_channel
      : inquiry.channel;

  if (channel === "sms") {
    const result = await sendSmsText(inquiry.customer_phone, input.body);
    await recordOutbound(inquiry, "sms", input.body, result);
    return;
  }

  if (channel === "whatsapp") {
    const templateName = process.env[input.whatsappTemplateEnv];
    if (!templateName) {
      throw new Error(
        `WhatsApp operational message requires approved template env ${input.whatsappTemplateEnv}`
      );
    }
    const result = await sendWhatsAppTemplate(
      inquiry.customer_phone,
      templateName,
      input.whatsappParameters || []
    );
    await recordOutbound(inquiry, "whatsapp", input.body, result);
    return;
  }

  throw new Error("No outbound messaging channel is configured for this inquiry");
}
