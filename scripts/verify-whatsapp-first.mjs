import { readFile } from "node:fs/promises";

const publicBookingFiles = [
  "components/Hero.tsx",
  "components/Services.tsx",
  "components/BookingRequest.tsx",
  "components/Contact.tsx",
  "components/FAQ.tsx",
  "app/page.tsx",
];

const forbidden = [
  { pattern: /\bCall Now\b/i, label: "Call Now CTA" },
  { pattern: /\bCall JD\b/i, label: "Call JD CTA" },
  { pattern: /href=["'`]tel:/i, label: "click-to-call booking link" },
];

for (const path of publicBookingFiles) {
  const source = await readFile(path, "utf8");
  for (const rule of forbidden) {
    if (rule.pattern.test(source)) {
      throw new Error(
        `WhatsApp-first contract violation in ${path}: found ${rule.label}`
      );
    }
  }
}

const bookingEngine = await readFile("lib/bookingEngine.ts", "utf8");
for (const required of [
  '"human"',
  '"change"',
  '"status"',
  '"stop"',
  "automation_paused",
  "reschedule_requested_at",
]) {
  if (!bookingEngine.includes(required)) {
    throw new Error(`Missing WhatsApp booking control: ${required}`);
  }
}

const envExample = await readFile(".env.example", "utf8");
for (const required of [
  "WHATSAPP_GRAPH_VERSION=",
  "WHATSAPP_UPDATE_TEMPLATE_NAME=",
  "WHATSAPP_PAYMENT_TEMPLATE_NAME=",
  "WHATSAPP_CONFIRMATION_TEMPLATE_NAME=",
  "WHATSAPP_REMINDER_TEMPLATE_NAME=",
]) {
  if (!envExample.includes(required)) {
    throw new Error(`Missing WhatsApp environment contract: ${required}`);
  }
}

console.log("WhatsApp-first contract verification PASS");
