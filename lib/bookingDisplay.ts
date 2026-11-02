export const bookingLabels: Record<string, string> = {
  COLLECTING_INFORMATION: "In progress", PENDING_JD: "Needs JD review", AWAITING_PAYMENT: "Awaiting payment",
  BOOKED: "Confirmed", COMPLETED: "Ride completed", DECLINED: "Declined", CANCELLED: "Cancelled", EXPIRED: "Expired",
};
export function formatMoney(cents: number | null | undefined) { return cents == null ? "Not set" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100); }
