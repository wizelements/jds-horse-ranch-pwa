import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import type { BookingInquiry } from "@/lib/bookingStore";
import { RanchError } from "@/lib/errors";

export type SquarePayment = {
  id: string; order_id: string; status: string; location_id: string;
  amount_money?: { amount: number; currency: string };
  total_money?: { amount: number; currency: string };
  refunded_money?: { amount: number; currency: string };
  refund_ids?: string[];
};
export type SquareRefund = { id: string; payment_id: string; status: string; amount_money: { amount: number; currency: string } };
export type PaymentLink = { id: string; order_id: string; url: string };

export function squareConfiguration() {
  const environment = process.env.SQUARE_ENVIRONMENT || "sandbox";
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!accessToken || !locationId || !["sandbox", "production"].includes(environment)) {
    throw new RanchError("Square is not configured. The request is saved; payment cannot be created yet.", 503);
  }
  if (environment === "production" && process.env.SQUARE_PRODUCTION_ENABLED !== "true") {
    throw new RanchError("Live payments are disabled until the payment acceptance checks are completed.", 503);
  }
  let baseUrl = environment === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
  // This fixture is impossible to enable on a Vercel deployment.
  if (!process.env.VERCEL && process.env.RANCH_TEST_FIXTURES === "true" && environment === "sandbox") {
    const fixture = new URL(process.env.SQUARE_TEST_API_URL || "http://127.0.0.1:43189");
    if (fixture.hostname !== "127.0.0.1" || fixture.protocol !== "http:") throw new RanchError("Invalid local fixture.", 503);
    baseUrl = fixture.origin;
  }
  return { baseUrl, accessToken, locationId, environment };
}

async function squareRequest<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const config = squareConfiguration();
  let response: Response;
  try {
    response = await fetch(config.baseUrl + path, {
      method, headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Square-Version": process.env.SQUARE_API_VERSION || "2026-09-16",
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store", signal: AbortSignal.timeout(10000),
    });
  } catch { throw new RanchError("Square did not respond. Retry this action to safely reuse its existing payment reference.", 503); }
  if (!response.ok) throw new RanchError(`Square could not complete this action (${response.status}). Check the Square account before trying again.`, 502);
  return response.json();
}

export async function createSquarePaymentLink(inquiry: BookingInquiry, amountCents: number): Promise<PaymentLink> {
  const config = squareConfiguration();
  if (!inquiry.approval_key) throw new RanchError("The appointment must be held before creating checkout.", 409);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://jdshorseranch.com").replace(/\/$/, "");
  const data = await squareRequest<{ payment_link: PaymentLink }>("/v2/online-checkout/payment-links", "POST", {
    idempotency_key: inquiry.approval_key,
    description: `JD's Horse Ranch reservation ${inquiry.id}`,
    quick_pay: { name: `JD's Horse Ranch — ${inquiry.service_requested || "Riding appointment"}`, price_money: { amount: amountCents, currency: "USD" }, location_id: config.locationId },
    checkout_options: { redirect_url: `${site}/booking/payment-complete`, allow_tipping: false },
    payment_note: `JD reservation ${inquiry.id}`,
  });
  const link = data.payment_link;
  if (!link?.id || !link.order_id || !link.url || (!link.url.startsWith("https://") && process.env.RANCH_TEST_FIXTURES !== "true")) throw new RanchError("Square returned an incomplete checkout reference. Retry before sharing a payment link.", 502);
  return link;
}

export async function deleteSquarePaymentLink(id: string) {
  await squareRequest(`/v2/online-checkout/payment-links/${encodeURIComponent(id)}`, "DELETE");
}
export async function retrieveSquarePayment(id: string) {
  const result = await squareRequest<{ payment: SquarePayment }>(`/v2/payments/${encodeURIComponent(id)}`);
  if (!result.payment?.id) throw new RanchError("Square payment reference is unavailable.", 502);
  return result.payment;
}
export async function retrieveOrderPayments(orderId: string) {
  const result = await squareRequest<{ order?: { tenders?: { payment_id?: string }[] } }>(`/v2/orders/${encodeURIComponent(orderId)}`);
  return (result.order?.tenders || []).map(t => t.payment_id).filter((id): id is string => Boolean(id));
}
export async function createSquareRefund(paymentId: string, amount: number, key: string, reason: string) {
  const result = await squareRequest<{ refund: SquareRefund }>("/v2/refunds", "POST", {
    idempotency_key: key, payment_id: paymentId, amount_money: { amount, currency: "USD" }, reason,
  });
  if (!result.refund?.id) throw new RanchError("Square refund reference is unavailable.", 502);
  return result.refund;
}
export async function retrieveSquareRefund(id: string) {
  const result = await squareRequest<{ refund: SquareRefund }>(`/v2/refunds/${encodeURIComponent(id)}`);
  if (!result.refund?.id) throw new RanchError("Square refund reference is unavailable.", 502);
  return result.refund;
}

export function verifySquareSignature(rawBody: string, signature: string | null) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const url = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;
  if (!signature || !key || !url) return false;
  const expected = createHmac("sha256", key).update(url + rawBody, "utf8").digest("base64");
  const left = Buffer.from(expected), right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}
