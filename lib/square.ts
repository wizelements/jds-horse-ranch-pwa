import { createHmac, timingSafeEqual } from "crypto";
import { BookingInquiry } from "@/lib/bookingStore";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function createSquarePaymentLink(
  inquiry: BookingInquiry,
  amountCents: number
) {
  const accessToken = required("SQUARE_ACCESS_TOKEN");
  const locationId = required("SQUARE_LOCATION_ID");
  const apiVersion = process.env.SQUARE_API_VERSION || "2026-09-16";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://jdshorseranch.com").replace(/\/$/, "");

  const response = await fetch("https://connect.squareup.com/v2/online-checkout/payment-links", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Square-Version": apiVersion,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idempotency_key: `jd-${inquiry.id}-${amountCents}`,
      description: `JD's Horse Ranch booking ${inquiry.id}`,
      quick_pay: {
        name: `JD's Horse Ranch — ${inquiry.service_requested || "Riding appointment"}`,
        price_money: { amount: amountCents, currency: "USD" },
        location_id: locationId,
      },
      checkout_options: {
        redirect_url: `${siteUrl}/booking/payment-complete?inquiry=${inquiry.id}`,
      },
      payment_note: `JD booking inquiry ${inquiry.id}`,
    }),
    cache: "no-store",
  });

  const payload = await response.json();
  if (!response.ok || !payload?.payment_link?.url) {
    throw new Error(`Square payment-link creation failed (${response.status}): ${JSON.stringify(payload)}`);
  }

  return payload.payment_link as {
    id: string;
    order_id: string;
    url: string;
    long_url?: string;
  };
}

export function verifySquareSignature(rawBody: string, signatureHeader: string | null) {
  if (!signatureHeader) return false;
  const signatureKey = required("SQUARE_WEBHOOK_SIGNATURE_KEY");
  const notificationUrl = required("SQUARE_WEBHOOK_NOTIFICATION_URL");
  const expected = createHmac("sha256", signatureKey)
    .update(notificationUrl + rawBody, "utf8")
    .digest("base64");
  const left = Buffer.from(expected);
  const right = Buffer.from(signatureHeader);
  return left.length === right.length && timingSafeEqual(left, right);
}
