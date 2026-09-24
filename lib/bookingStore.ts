import { createClient, SupabaseClient } from "@supabase/supabase-js";

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
  reminder_sent_at: string | null;
  followup_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

let client: SupabaseClient | null = null;

function db() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Booking engine requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }
  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

export async function getActiveInquiry(phone: string) {
  const { data, error } = await db()
    .from("booking_inquiries")
    .select("*")
    .eq("customer_phone", phone)
    .in("status", ["COLLECTING_INFORMATION", "PENDING_JD", "AWAITING_PAYMENT", "BOOKED"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data || null) as BookingInquiry | null;
}

export async function createConversationInquiry(input: {
  channel: Exclude<BookingChannel, "web" | "voice">;
  phone: string;
  profileName?: string;
}) {
  const { data, error } = await db()
    .from("booking_inquiries")
    .insert({
      channel: input.channel,
      preferred_channel: input.channel,
      customer_phone: input.phone,
      customer_name: input.profileName || null,
      status: "COLLECTING_INFORMATION",
      intake_step: input.profileName ? "service" : "name",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as BookingInquiry;
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
  const holdExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await db()
    .from("booking_inquiries")
    .insert({
      channel: "web",
      preferred_channel: input.preferredChannel,
      customer_phone: input.customerPhone,
      customer_name: input.customerName,
      email: input.email || null,
      service_requested: input.serviceRequested,
      rider_count: input.riderCount,
      rider_details: input.riderDetails,
      requested_datetime_text: input.requestedDatetimeText,
      alternate_datetime_text: input.alternateDatetimeText || null,
      experience: input.experience,
      qualification_notes: input.qualificationNotes || null,
      marketing_consent: input.marketingConsent,
      status: "PENDING_JD",
      intake_step: "complete",
      hold_expires_at: holdExpiresAt,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as BookingInquiry;
}

export async function updateInquiry(id: string, patch: Partial<BookingInquiry>) {
  const { data, error } = await db()
    .from("booking_inquiries")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as BookingInquiry;
}

export async function getInquiry(id: string) {
  const { data, error } = await db()
    .from("booking_inquiries")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as BookingInquiry;
}

export async function getInquiryBySquareOrderId(orderId: string) {
  const { data, error } = await db()
    .from("booking_inquiries")
    .select("*")
    .eq("square_order_id", orderId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data || null) as BookingInquiry | null;
}

export async function listInquiries(limit = 100) {
  const { data, error } = await db()
    .from("booking_inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as BookingInquiry[];
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
  const { error } = await db().from("communication_messages").insert({
    provider_message_id: input.providerMessageId || null,
    inquiry_id: input.inquiryId || null,
    channel: input.channel,
    direction: input.direction,
    phone: input.phone,
    body: input.body || null,
    raw_payload: input.rawPayload || null,
  });
  if (!error) return true;
  if (error.code === "23505") return false;
  throw error;
}

export async function recordBookingEvent(input: {
  inquiryId: string;
  eventType: string;
  actor?: string;
  metadata?: unknown;
}) {
  const { error } = await db().from("booking_events").insert({
    inquiry_id: input.inquiryId,
    event_type: input.eventType,
    actor: input.actor || "system",
    metadata: input.metadata || {},
  });
  if (error) throw error;
}

export async function expireStaleHolds() {
  const now = new Date().toISOString();
  const { data, error } = await db()
    .from("booking_inquiries")
    .update({ status: "EXPIRED", updated_at: now })
    .eq("status", "PENDING_JD")
    .lt("hold_expires_at", now)
    .select("*");
  if (error) throw error;
  return (data || []) as BookingInquiry[];
}

export async function listReminderCandidates(fromIso: string, toIso: string) {
  const { data, error } = await db()
    .from("booking_inquiries")
    .select("*")
    .eq("status", "BOOKED")
    .is("reminder_sent_at", null)
    .gte("approved_start_at", fromIso)
    .lte("approved_start_at", toIso);
  if (error) throw error;
  return (data || []) as BookingInquiry[];
}
