import { BookingInquiry, recordMessage } from "@/lib/bookingStore";
import { sendSmsText } from "@/lib/sms";
import { sendWhatsAppText } from "@/lib/whatsapp";

export async function sendCustomerMessage(inquiry: BookingInquiry, body: string) {
  const channel =
    inquiry.preferred_channel === "whatsapp" || inquiry.preferred_channel === "sms"
      ? inquiry.preferred_channel
      : inquiry.channel;

  if (channel === "whatsapp") {
    const result = await sendWhatsAppText(inquiry.customer_phone, body);
    const providerMessageId = result?.messages?.[0]?.id || null;
    await recordMessage({
      providerMessageId,
      inquiryId: inquiry.id,
      channel: "whatsapp",
      direction: "outbound",
      phone: inquiry.customer_phone,
      body,
      rawPayload: result,
    });
    return;
  }

  if (channel === "sms") {
    const result = await sendSmsText(inquiry.customer_phone, body);
    await recordMessage({
      providerMessageId: result.sid || null,
      inquiryId: inquiry.id,
      channel: "sms",
      direction: "outbound",
      phone: inquiry.customer_phone,
      body,
      rawPayload: result,
    });
    return;
  }

  throw new Error("No outbound messaging channel is configured for this inquiry");
}
