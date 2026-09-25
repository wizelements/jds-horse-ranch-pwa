import "server-only";
import { randomUUID } from "crypto";
import type { InValue, Row } from "@libsql/client";
import { getTurso } from "@/lib/turso";

export type BookingChannel = "whatsapp" | "sms" | "web" | "voice";
export type InquiryStatus =
  | "COLLECTING_INFORMATION"
  | "PENDING_JD"
  | "AWAITING_PAYMENT"
  | "BOOKED"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELLED"
  | "EXPIRED";

export interface BookingInquiry {
  id: string;
  channel: BookingChannel;
  preferred_channel: BookingChannel;
  customer_phone: string;
  customer_name: string | null;
  email: string | null;
  service_requested: string | null;
  rider_count: number | null;
  rider_details: string | null;
  requested_datetime_text: string | null;
  alternate_datetime_text: string | null;
  experience: string | null;
  qualification_notes: string | null;
  marketing_consent: boolean;
  marketing_opt_out_at: string | null;
  automation_paused: boolean;
  human_takeover_requested_at: string | null;
  reschedule_requested_at: string | null;
  reschedule_request_text: string | null;
  last_customer_message_at: string | null;
  customer_service_window_expires_at: string | null;
  status: InquiryStatus;
  intake_step: string;
  hold_expires_at: string | null;
  approved_start_at: string | null;
  approval_note: string | null;
  approved_amount_cents: number | null;
  square_payment_link_id: string | null;
  square_order_id: string | null;
  square_payment_url: string | null;
  paid_at: string | null;
  booked_at: string | null;
  completed_at: string | null;
  confirmation_sent_at: string | null;
  reminder_sent_at: string | null;
  followup_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

function nullableString(value: unknown) {
  return value == null ? null : String(value);
}

function nullableNumber(value: unknown) {
  return value == null ? null : Number(value);
}

function bookingFromRow(row: Row): BookingInquiry {
  const r = { ...row } as Record<string, unknown>;
  return {
    id: String(r.id),
    channel: r.channel as BookingChannel,
    preferred_channel: r.preferred_channel as BookingChannel,
    customer_phone: String(r.customer_phone),
    customer_name: nullableString(r.customer_name),
    email: nullableString(r.email),
    service_requested: nullableString(r.service_requested),
    rider_count: nullableNumber(r.rider_count),
    rider_details: nullableString(r.rider_details),
    requested_datetime_text: nullableString(r.requested_datetime_text),
    alternate_datetime_text: nullableString(r.alternate_datetime_text),
    experience: nullableString(r.experience),
    qualification_notes: nullableString(r.qualification_notes),
    marketing_consent:
      r.marketing_consent === true ||
      r.marketing_consent === 1 ||
      r.marketing_consent === "1",
    marketing_opt_out_at: nullableString(r.marketing_opt_out_at),
    automation_paused:
      r.automation_paused === true ||
      r.automation_paused === 1 ||
      r.automation_paused === "1",
    human_takeover_requested_at: nullableString(r.human_takeover_requested_at),
    reschedule_requested_at: nullableString(r.reschedule_requested_at),
    reschedule_request_text: nullableString(r.reschedule_request_text),
    last_customer_message_at: nullableString(r.last_customer_message_at),
    customer_service_window_expires_at: nullableString(r.customer_service_window_expires_at),
    status: r.status as InquiryStatus,
    intake_step: String(r.intake_step),
    hold_expires_at: nullableString(r.hold_expires_at),
    approved_start_at: nullableString(r.approved_start_at),
    approval_note: nullableString(r.approval_note),
    approved_amount_cents: nullableNumber(r.approved_amount_cents),
    square_payment_link_id: nullableString(r.square_payment_link_id),
    square_order_id: nullableString(r.square_order_id),
    square_payment_url: nullableString(r.square_payment_url),
    paid_at: nullableString(r.paid_at),
    booked_at: nullableString(r.booked_at),
    completed_at: nullableString(r.completed_at),
    confirmation_sent_at: nullableString(r.confirmation_sent_at),
    reminder_sent_at: nullableString(r.reminder_sent_at),
    followup_sent_at: nullableString(r.followup_sent_at),
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  };
}

function dbValue(value: unknown): InValue {
  if (value === undefined) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint"
  ) {
    return value as InValue;
  }
  return String(value);
}

export async function getActiveInquiry(phone: string) {
  const result = await getTurso().execute({
    sql: `SELECT * FROM booking_inquiries
      WHERE customer_phone = ?
        AND status IN ('COLLECTING_INFORMATION', 'PENDING_JD', 'AWAITING_PAYMENT')
      ORDER BY created_at DESC
      LIMIT 1`,
    args: [phone],
  });
  return result.rows.length ? bookingFromRow(result.rows[0]) : null;
}

export async function getLatestInquiry(phone: string) {
  const result = await getTurso().execute({
    sql: `SELECT * FROM booking_inquiries
      WHERE customer_phone = ?
      ORDER BY created_at DESC
      LIMIT 1`,
    args: [phone],
  });
  return result.rows.length ? bookingFromRow(result.rows[0]) : null;
}

export async function createConversationInquiry(input: {
  channel: Exclude<BookingChannel, "web" | "voice">;
  phone: string;
  profileName?: string;
}) {
  const id = randomUUID();
  const now = new Date().toISOString();

  await getTurso().execute({
    sql: `INSERT INTO booking_inquiries (
      id, channel, preferred_channel, customer_phone, customer_name,
      status, intake_step, marketing_consent, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'COLLECTING_INFORMATION', ?, 0, ?, ?)`,
    args: [
      id,
      input.channel,
      input.channel,
      input.phone,
      input.profileName || null,
      input.profileName ? "service" : "name",
      now,
      now,
    ],
  });

  return (await getInquiry(id));
}

export async function createWebInquiry(input: {
  customerPhone: string;
  customerName: string;
  email?: string | null;
  serviceRequested: string;
  riderCount: number;
  riderDetails: string;
  requestedDatetimeText: string;
  alternateDatetimeText?: string | null;
  experience: string;
  qualificationNotes?: string | null;
  marketingConsent: boolean;
  preferredChannel: "whatsapp" | "sms";
}) {
  const id = randomUUID();
  const now = new Date().toISOString();
  const holdExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await getTurso().execute({
    sql: `INSERT INTO booking_inquiries (
      id, channel, preferred_channel, customer_phone, customer_name, email,
      service_requested, rider_count, rider_details, requested_datetime_text,
      alternate_datetime_text, experience, qualification_notes, marketing_consent,
      status, intake_step, hold_expires_at, created_at, updated_at
    ) VALUES (?, 'web', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING_JD', 'complete', ?, ?, ?)`,
    args: [
      id,
      input.preferredChannel,
      input.customerPhone,
      input.customerName,
      input.email || null,
      input.serviceRequested,
      input.riderCount,
      input.riderDetails,
      input.requestedDatetimeText,
      input.alternateDatetimeText || null,
      input.experience,
      input.qualificationNotes || null,
      input.marketingConsent ? 1 : 0,
      holdExpiresAt,
      now,
      now,
    ],
  });

  return getInquiry(id);
}

const MUTABLE_FIELDS = new Set([
  "customer_name",
  "email",
  "service_requested",
  "rider_count",
  "rider_details",
  "requested_datetime_text",
  "alternate_datetime_text",
  "experience",
  "qualification_notes",
  "marketing_consent",
  "marketing_opt_out_at",
  "automation_paused",
  "human_takeover_requested_at",
  "reschedule_requested_at",
  "reschedule_request_text",
  "last_customer_message_at",
  "customer_service_window_expires_at",
  "status",
  "intake_step",
  "hold_expires_at",
  "approved_start_at",
  "approval_note",
  "approved_amount_cents",
  "square_payment_link_id",
  "square_order_id",
  "square_payment_url",
  "paid_at",
  "booked_at",
  "completed_at",
  "confirmation_sent_at",
  "reminder_sent_at",
  "followup_sent_at",
]);

export async function updateInquiry(
  id: string,
  patch: Partial<BookingInquiry>
) {
  const entries = Object.entries(patch).filter(
    ([key, value]) => MUTABLE_FIELDS.has(key) && value !== undefined
  );
  if (!entries.length) return getInquiry(id);

  const args: InValue[] = entries.map(([, value]) => dbValue(value));
  args.push(new Date().toISOString(), id);

  const result = await getTurso().execute({
    sql: `UPDATE booking_inquiries
      SET ${entries.map(([key]) => `${key} = ?`).join(", ")}, updated_at = ?
      WHERE id = ?
      RETURNING *`,
    args,
  });

  if (!result.rows.length) throw new Error("Booking inquiry not found");
  return bookingFromRow(result.rows[0]);
}

export async function getInquiry(id: string) {
  const result = await getTurso().execute({
    sql: "SELECT * FROM booking_inquiries WHERE id = ? LIMIT 1",
    args: [id],
  });
  if (!result.rows.length) throw new Error("Booking inquiry not found");
  return bookingFromRow(result.rows[0]);
}

export async function getInquiryBySquareOrderId(orderId: string) {
  const result = await getTurso().execute({
    sql: "SELECT * FROM booking_inquiries WHERE square_order_id = ? LIMIT 1",
    args: [orderId],
  });
  return result.rows.length ? bookingFromRow(result.rows[0]) : null;
}

export async function listInquiries(limit = 100) {
  const result = await getTurso().execute({
    sql: "SELECT * FROM booking_inquiries ORDER BY created_at DESC LIMIT ?",
    args: [limit],
  });
  return result.rows.map(bookingFromRow);
}

export async function recordMessage(input: {
  providerMessageId?: string | null;
  inquiryId?: string | null;
  channel: BookingChannel;
  direction: "inbound" | "outbound";
  phone: string;
  body?: string | null;
  rawPayload?: unknown;
}) {
  try {
    await getTurso().execute({
      sql: `INSERT INTO communication_messages (
        id, provider_message_id, inquiry_id, channel, direction, phone, body,
        raw_payload, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        input.providerMessageId || null,
        input.inquiryId || null,
        input.channel,
        input.direction,
        input.phone,
        input.body || null,
        input.rawPayload == null ? null : JSON.stringify(input.rawPayload),
        new Date().toISOString(),
      ],
    });
    return true;
  } catch (error) {
    const candidate = error as { code?: string; message?: string };
    const message = candidate.message || "";
    if (
      candidate.code?.startsWith("SQLITE_CONSTRAINT") ||
      message.includes("UNIQUE constraint failed")
    ) {
      return false;
    }
    throw error;
  }
}

export async function recordBookingEvent(input: {
  inquiryId: string;
  eventType: string;
  actor?: string;
  metadata?: unknown;
}) {
  await getTurso().execute({
    sql: `INSERT INTO booking_events
      (id, inquiry_id, event_type, actor, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      randomUUID(),
      input.inquiryId,
      input.eventType,
      input.actor || "system",
      JSON.stringify(input.metadata || {}),
      new Date().toISOString(),
    ],
  });
}

export async function expireStaleHolds() {
  const now = new Date().toISOString();
  const result = await getTurso().execute({
    sql: `UPDATE booking_inquiries
      SET status = 'EXPIRED', updated_at = ?
      WHERE status = 'PENDING_JD'
        AND hold_expires_at IS NOT NULL
        AND hold_expires_at < ?
      RETURNING *`,
    args: [now, now],
  });
  return result.rows.map(bookingFromRow);
}

export async function listPendingConfirmations(limit = 50) {
  const result = await getTurso().execute({
    sql: `SELECT * FROM booking_inquiries
      WHERE status = 'BOOKED' AND confirmation_sent_at IS NULL
      ORDER BY booked_at ASC
      LIMIT ?`,
    args: [limit],
  });
  return result.rows.map(bookingFromRow);
}

export async function listReminderCandidates(fromIso: string, toIso: string) {
  const result = await getTurso().execute({
    sql: `SELECT * FROM booking_inquiries
      WHERE status = 'BOOKED'
        AND reminder_sent_at IS NULL
        AND approved_start_at >= ?
        AND approved_start_at <= ?`,
    args: [fromIso, toIso],
  });
  return result.rows.map(bookingFromRow);
}

export async function listFollowupCandidates(beforeIso: string, limit = 50) {
  const result = await getTurso().execute({
    sql: `SELECT * FROM booking_inquiries
      WHERE status = 'COMPLETED'
        AND followup_sent_at IS NULL
        AND completed_at IS NOT NULL
        AND completed_at <= ?
      ORDER BY completed_at ASC
      LIMIT ?`,
    args: [beforeIso, limit],
  });
  return result.rows.map(bookingFromRow);
}


export async function recordMessageStatus(input: {
  providerMessageId: string;
  phone?: string | null;
  status: string;
  errorCode?: string | null;
  errorMessage?: string | null;
  rawPayload?: unknown;
}) {
  const message = await getTurso().execute({
    sql: "SELECT inquiry_id FROM communication_messages WHERE provider_message_id = ? LIMIT 1",
    args: [input.providerMessageId],
  });
  const inquiryId = message.rows.length
    ? nullableString((message.rows[0] as Record<string, unknown>).inquiry_id)
    : null;

  await getTurso().execute({
    sql: `INSERT INTO communication_status_events (
      id, provider_message_id, inquiry_id, phone, status, error_code,
      error_message, raw_payload, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      randomUUID(),
      input.providerMessageId,
      inquiryId,
      input.phone || null,
      input.status,
      input.errorCode || null,
      input.errorMessage || null,
      input.rawPayload == null ? null : JSON.stringify(input.rawPayload),
      new Date().toISOString(),
    ],
  });
}
