import { createHmac, timingSafeEqual } from "crypto";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function sendSmsText(to: string, body: string) {
  const accountSid = required("TWILIO_ACCOUNT_SID");
  const authToken = required("TWILIO_AUTH_TOKEN");
  const from = required("TWILIO_SMS_FROM");
  const form = new URLSearchParams({ To: to, From: from, Body: body });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
      cache: "no-store",
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`SMS send failed (${response.status}): ${JSON.stringify(payload)}`);
  }
  return payload as { sid?: string };
}

export function verifyTwilioFormSignature(
  signatureHeader: string | null,
  exactUrl: string,
  params: Record<string, string>
) {
  if (!signatureHeader) return false;
  const authToken = required("TWILIO_AUTH_TOKEN");
  const signed = Object.keys(params)
    .sort()
    .reduce((value, key) => value + key + params[key], exactUrl);
  const expected = createHmac("sha1", authToken).update(signed, "utf8").digest("base64");
  const left = Buffer.from(expected);
  const right = Buffer.from(signatureHeader);
  return left.length === right.length && timingSafeEqual(left, right);
}
