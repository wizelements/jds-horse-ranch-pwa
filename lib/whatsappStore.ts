import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type InquiryStatus =
  | "COLLECTING_INFORMATION"
  | "PENDING_JD"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "BOOKED"
  | "DECLINED"
  | "CANCELLED"
  | "EXPIRED";

export interface WhatsAppInquiry {
  id: string;
  channel: "whatsapp";
  customer_phone: string;
  customer_name: string | null;
  rider_count: number | null;
  rider_details: string | null;
  requested_datetime_text: string | null;
  experience: string | null;
  email: string | null;
  status: InquiryStatus;
  intake_step: string;
  hold_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

let client: SupabaseClient | null = null;

function db() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "WhatsApp intake requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    );
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
    .eq("channel", "whatsapp")
    .eq("customer_phone", phone)
    .in("status", [
      "COLLECTING_INFORMATION",
      "PENDING_JD",
      "AWAITING_PAYMENT",
      "PAID",
    ])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data || null) as WhatsAppInquiry | null;
}

export async function createInquiry(phone: string, profileName?: string) {
  const { data, error } = await db()
    .from("booking_inquiries")
    .insert({
      channel: "whatsapp",
      customer_phone: phone,
      customer_name: profileName || null,
      status: "COLLECTING_INFORMATION",
      intake_step: profileName ? "rider_count" : "name",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as WhatsAppInquiry;
}

export async function updateInquiry(
  id: string,
  patch: Partial<WhatsAppInquiry>
) {
  const { data, error } = await db()
    .from("booking_inquiries")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as WhatsAppInquiry;
}

export async function getInquiry(id: string) {
  const { data, error } = await db()
    .from("booking_inquiries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as WhatsAppInquiry;
}

export async function listWhatsAppInquiries(limit = 100) {
  const { data, error } = await db()
    .from("booking_inquiries")
    .select("*")
    .eq("channel", "whatsapp")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as WhatsAppInquiry[];
}

export async function recordWhatsAppMessage(input: {
  waMessageId?: string;
  inquiryId?: string;
  direction: "inbound" | "outbound";
  phone: string;
  body?: string;
  rawPayload?: unknown;
}) {
  const { error } = await db().from("whatsapp_messages").insert({
    wa_message_id: input.waMessageId || null,
    inquiry_id: input.inquiryId || null,
    direction: input.direction,
    phone: input.phone,
    body: input.body || null,
    raw_payload: input.rawPayload || null,
  });

  if (!error) return true;
  if (error.code === "23505") return false;
  throw error;
}
