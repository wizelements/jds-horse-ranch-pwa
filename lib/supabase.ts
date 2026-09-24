import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase server access requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return adminClient;
}

export interface Contact {
  id: string;
  type: "call" | "email";
  source?: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price_min?: number;
  price_max?: number;
  duration_minutes?: number;
  age_requirement?: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  text: string;
  rating?: number;
  image_url?: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryPhoto {
  id: string;
  title?: string;
  description?: string;
  image_url: string;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  key: string;
  value?: string;
  updated_at: string;
}

export async function logContact(data: {
  type: "call" | "email";
  source?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  const { error } = await getSupabaseAdmin().from("contacts").insert([{
    type: data.type,
    source: data.source,
    user_agent: data.userAgent,
    ip_address: data.ipAddress,
  }]);
  if (error) throw error;
}

export async function getContacts(limit = 50) {
  const { data, error } = await getSupabaseAdmin()
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as Contact[];
}

export async function getServices() {
  const { data, error } = await getSupabaseAdmin()
    .from("services")
    .select("*")
    .eq("active", true)
    .order("display_order");
  if (error) throw error;
  return (data || []) as Service[];
}

export async function updateService(id: string, updates: Partial<Service>) {
  const { error } = await getSupabaseAdmin()
    .from("services")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function getTestimonials() {
  const { data, error } = await getSupabaseAdmin()
    .from("testimonials")
    .select("*")
    .eq("active", true)
    .order("display_order");
  if (error) throw error;
  return (data || []) as Testimonial[];
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>) {
  const { error } = await getSupabaseAdmin()
    .from("testimonials")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function getGalleryPhotos() {
  const { data, error } = await getSupabaseAdmin()
    .from("gallery_photos")
    .select("*")
    .eq("active", true)
    .order("display_order");
  if (error) throw error;
  return (data || []) as GalleryPhoto[];
}

export async function updateGalleryPhoto(id: string, updates: Partial<GalleryPhoto>) {
  const { error } = await getSupabaseAdmin()
    .from("gallery_photos")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function getSetting(key: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();
  if (error) return null;
  return data?.value;
}

export async function updateSetting(key: string, value: string) {
  const { error } = await getSupabaseAdmin()
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function createGalleryPhoto(data: {
  title?: string;
  description?: string;
  image_url: string;
}) {
  const { data: photo, error } = await getSupabaseAdmin()
    .from("gallery_photos")
    .insert([{ ...data, display_order: 0, active: true }])
    .select()
    .single();
  if (error) throw error;
  return photo as GalleryPhoto;
}
