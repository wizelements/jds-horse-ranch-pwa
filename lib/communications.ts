import { BookingInquiry, recordMessage } from "@/lib/bookingStore";
import { sendSmsText } from "@/lib/sms";

// Historical WhatsApp records are preserved in Turso, but no new WhatsApp calls
// are made. Online requests are handled by JD using the phone/email on file.
export async function sendCustomerMessage(inquiry: BookingInquiry, body: string) {
  if (inquiry.preferred_channel !== "sms") {
    throw new Error("Direct messaging is not enabled for this request. Contact the customer manually.");
  }
  const result = await sendSmsText(inquiry.customer_phone, body);
  await recordMessage({
    providerMessageId: result?.sid || null,
    inquiryId: inquiry.id,
    channel: "sms",
    direction: "outbound",
    phone: inquiry.customer_phone,
    body,
    rawPayload: result,
  });
}

// Returns false when JD must contact the customer personally.
// A false result must never be recorded as a message delivered.
export async function sendOperationalMessage(
  inquiry: BookingInquiry,
  input: { body: string }
): Promise<boolean> {
  if (inquiry.preferred_channel !== "sms") return false;
  await sendCustomerMessage(inquiry, input.body);
  return true;
}
