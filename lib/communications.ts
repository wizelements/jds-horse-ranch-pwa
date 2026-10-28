import type { BookingInquiry } from "@/lib/bookingStore";

// JD requests telephone-only conversations. Disable all automated SMS/WhatsApp
// outbound delivery while retaining historical communication records in Turso.
export async function sendCustomerMessage(_inquiry: BookingInquiry, _body: string): Promise<never> {
  throw new Error("Customer messages are disabled. Call the customer directly.");
}

export async function sendOperationalMessage(_inquiry: BookingInquiry, _input: { body: string }): Promise<boolean> {
  return false;
}
