import "server-only";
import { createClient, type Client, type InValue, type Row } from "@libsql/client";
import { randomUUID } from "crypto";
import type {
  Contact,
  GalleryPhoto,
  Service,
  SiteSettings,
  Testimonial,
} from "@/lib/types";

let client: Client | null = null;

export function getTurso() {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("Turso requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN");
  }

  client = createClient({ url, authToken });
  return client;
}

function toRecord(row: Row) {
  return { ...row } as Record<string, unknown>;
}

function toBool(value: unknown) {
  return value === true || value === 1 || value === "1";
}

function contactFromRow(row: Row): Contact {
  const r = toRecord(row);
  return {
    id: String(r.id),
    type: r.type as Contact["type"],
    source: r.source == null ? undefined : String(r.source),
    user_agent: r.user_agent == null ? undefined : String(r.user_agent),
    ip_address: r.ip_address == null ? undefined : String(r.ip_address),
    created_at: String(r.created_at),
  };
}

function serviceFromRow(row: Row): Service {
  const r = toRecord(row);
  return {
    id: String(r.id),
    name: String(r.name),
    description: r.description == null ? undefined : String(r.description),
    price_min: r.price_min == null ? undefined : Number(r.price_min),
    price_max: r.price_max == null ? undefined : Number(r.price_max),
    duration_minutes:
      r.duration_minutes == null ? undefined : Number(r.duration_minutes),
    age_requirement:
      r.age_requirement == null ? undefined : String(r.age_requirement),
    display_order: Number(r.display_order || 0),
    active: toBool(r.active),
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  };
}

function testimonialFromRow(row: Row): Testimonial {
  const r = toRecord(row);
  return {
    id: String(r.id),
    customer_name: String(r.customer_name),
    text: String(r.text),
    rating: r.rating == null ? undefined : Number(r.rating),
    image_url: r.image_url == null ? undefined : String(r.image_url),
    display_order: Number(r.display_order || 0),
    active: toBool(r.active),
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  };
}

function galleryPhotoFromRow(row: Row): GalleryPhoto {
  const r = toRecord(row);
  return {
    id: String(r.id),
    title: r.title == null ? undefined : String(r.title),
    description: r.description == null ? undefined : String(r.description),
    image_url: String(r.image_url),
    display_order: Number(r.display_order || 0),
    active: toBool(r.active),
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  };
}

function settingFromRow(row: Row): SiteSettings {
  const r = toRecord(row);
  return {
    id: String(r.id),
    key: String(r.key),
    value: r.value == null ? undefined : String(r.value),
    updated_at: String(r.updated_at),
  };
}

function normalizeValue(value: unknown): InValue {
  if (value === undefined) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint"
  ) {
    return value;
  }
  return String(value);
}

async function updateById(
  table: string,
  id: string,
  updates: Record<string, unknown>,
  allowed: readonly string[]
) {
  const pairs = Object.entries(updates).filter(
    ([key, value]) => allowed.includes(key) && value !== undefined
  );
  if (!pairs.length) return;

  const setClause = pairs.map(([key]) => `${key} = ?`).join(", ");
  const args = pairs.map(([, value]) => normalizeValue(value));
  args.push(new Date().toISOString(), id);

  await getTurso().execute({
    sql: `UPDATE ${table} SET ${setClause}, updated_at = ? WHERE id = ?`,
    args,
  });
}

export async function logContact(data: {
  type: "call" | "email";
  source?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  await getTurso().execute({
    sql: `INSERT INTO contacts
      (id, type, source, user_agent, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      randomUUID(),
      data.type,
      data.source || null,
      data.userAgent || null,
      data.ipAddress || null,
      new Date().toISOString(),
    ],
  });
}

export async function getContacts(limit = 50) {
  const result = await getTurso().execute({
    sql: "SELECT * FROM contacts ORDER BY created_at DESC LIMIT ?",
    args: [limit],
  });
  return result.rows.map(contactFromRow);
}

export async function getServices() {
  const result = await getTurso().execute(
    "SELECT * FROM services WHERE active = 1 ORDER BY display_order, name"
  );
  return result.rows.map(serviceFromRow);
}

export async function updateService(id: string, updates: Partial<Service>) {
  await updateById("services", id, updates as Record<string, unknown>, [
    "name",
    "description",
    "price_min",
    "price_max",
    "duration_minutes",
    "age_requirement",
    "display_order",
    "active",
  ]);
}

export async function getTestimonials() {
  const result = await getTurso().execute(
    "SELECT * FROM testimonials WHERE active = 1 ORDER BY display_order, created_at DESC"
  );
  return result.rows.map(testimonialFromRow);
}

export async function createTestimonial(input: {
  customer_name: string;
  text: string;
  rating?: number;
}) {
  const id = randomUUID();
  const now = new Date().toISOString();
  await getTurso().execute({
    sql: `INSERT INTO testimonials
      (id, customer_name, text, rating, display_order, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, 1, ?, ?)`,
    args: [id, input.customer_name, input.text, input.rating || 5, now, now],
  });
  const result = await getTurso().execute({
    sql: "SELECT * FROM testimonials WHERE id = ?",
    args: [id],
  });
  return testimonialFromRow(result.rows[0]);
}

export async function updateTestimonial(
  id: string,
  updates: Partial<Testimonial>
) {
  await updateById("testimonials", id, updates as Record<string, unknown>, [
    "customer_name",
    "text",
    "rating",
    "image_url",
    "display_order",
    "active",
  ]);
}

export async function deleteTestimonial(id: string) {
  await getTurso().execute({
    sql: "DELETE FROM testimonials WHERE id = ?",
    args: [id],
  });
}

export async function getGalleryPhotos() {
  const result = await getTurso().execute(
    "SELECT * FROM gallery_photos WHERE active = 1 ORDER BY display_order, created_at DESC"
  );
  return result.rows.map(galleryPhotoFromRow);
}

export async function getGalleryPhoto(id: string) {
  const result = await getTurso().execute({
    sql: "SELECT * FROM gallery_photos WHERE id = ? LIMIT 1",
    args: [id],
  });
  return result.rows.length ? galleryPhotoFromRow(result.rows[0]) : null;
}

export async function createGalleryPhoto(data: {
  title?: string;
  description?: string;
  image_url: string;
}) {
  const id = randomUUID();
  const now = new Date().toISOString();
  await getTurso().execute({
    sql: `INSERT INTO gallery_photos
      (id, title, description, image_url, display_order, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, 1, ?, ?)`,
    args: [
      id,
      data.title || null,
      data.description || null,
      data.image_url,
      now,
      now,
    ],
  });
  const result = await getTurso().execute({
    sql: "SELECT * FROM gallery_photos WHERE id = ?",
    args: [id],
  });
  return galleryPhotoFromRow(result.rows[0]);
}

export async function updateGalleryPhoto(
  id: string,
  updates: Partial<GalleryPhoto>
) {
  await updateById("gallery_photos", id, updates as Record<string, unknown>, [
    "title",
    "description",
    "image_url",
    "display_order",
    "active",
  ]);
}

export async function deleteGalleryPhoto(id: string) {
  await getTurso().execute({
    sql: "DELETE FROM gallery_photos WHERE id = ?",
    args: [id],
  });
}

export async function getSetting(key: string) {
  const result = await getTurso().execute({
    sql: "SELECT * FROM settings WHERE key = ? LIMIT 1",
    args: [key],
  });
  return result.rows.length ? settingFromRow(result.rows[0]).value || null : null;
}

export async function updateSetting(key: string, value: string) {
  const now = new Date().toISOString();
  await getTurso().execute({
    sql: `INSERT INTO settings (id, key, value, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    args: [randomUUID(), key, value, now],
  });
}
