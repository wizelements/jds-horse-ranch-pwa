import { cookies } from "next/headers";
import crypto from "crypto";
import { promisify } from "util";
import { getTurso } from "@/lib/turso";

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH_V2 || "";
const ADMIN_PASSWORD_SALT = process.env.ADMIN_PASSWORD_SALT_V2 || "";
const SESSION_TOKEN_SECRET = process.env.SESSION_TOKEN_SECRET_V2 || "";
const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 24 * 60 * 60;
const scrypt = promisify(crypto.scrypt);

export function adminConfigured() {
  return /^[a-f0-9]{128}$/i.test(ADMIN_PASSWORD_HASH) && ADMIN_PASSWORD_SALT.length >= 16 && SESSION_TOKEN_SECRET.length >= 32;
}

export async function consumeLoginAttempt(address: string) {
  const now = Date.now();
  const bucket = crypto.createHmac("sha256", SESSION_TOKEN_SECRET).update(address).digest("hex");
  const rows = await getTurso().batch([bucket, "all-admin-attempts"].map(key => ({
    sql: `INSERT INTO login_attempts (bucket, attempts, window_started_at) VALUES (?, 1, ?)
      ON CONFLICT(bucket) DO UPDATE SET
      attempts = CASE WHEN window_started_at < ? THEN 1 ELSE attempts + 1 END,
      window_started_at = CASE WHEN window_started_at < ? THEN ? ELSE window_started_at END
      RETURNING attempts`,
    args: [key, now, now - 900000, now - 900000, now],
  })), "write");
  return Number(rows[0].rows[0].attempts) <= 8 && Number(rows[1].rows[0].attempts) <= 80;
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function hashPassword(password: string): string {
  if (!ADMIN_PASSWORD_SALT) {
    throw new Error("ADMIN_PASSWORD_SALT_V2 is not configured");
  }
  return crypto.scryptSync(password, ADMIN_PASSWORD_SALT, 64).toString("hex");
}

function signSession(payload: string) {
  return crypto.createHmac("sha256", SESSION_TOKEN_SECRET).update(payload).digest("base64url");
}

function createSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({
      v: 2,
      admin: true,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
      nonce: crypto.randomBytes(16).toString("hex"),
    })
  ).toString("base64url");
  return `${payload}.${signSession(payload)}`;
}

function verifySessionToken(token: string) {
  if (!adminConfigured() || token.length > 1024 || token.split(".").length !== 2) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signSession(payload), signature)) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return (
      decoded?.v === 2 &&
      decoded?.admin === true &&
      typeof decoded.exp === "number" && Number.isFinite(decoded.exp) &&
      decoded.exp > Math.floor(Date.now() / 1000) &&
      decoded.exp <= Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
    );
  } catch {
    return false;
  }
}

export async function loginAdmin(password: string): Promise<boolean> {
  if (!adminConfigured()) {
    console.warn("V2 admin credentials/session secret are not fully configured. Admin access disabled.");
    return false;
  }

  const hash = (await scrypt(password, ADMIN_PASSWORD_SALT, 64) as Buffer).toString("hex");
  if (!safeEqual(hash, ADMIN_PASSWORD_HASH)) return false;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
  return true;
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : false;
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
