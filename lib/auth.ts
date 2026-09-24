import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH_V2 || "";
const ADMIN_PASSWORD_SALT = process.env.ADMIN_PASSWORD_SALT_V2 || "";
const SESSION_TOKEN_SECRET = process.env.SESSION_TOKEN_SECRET_V2 || "";
const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 24 * 60 * 60;

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
  if (!SESSION_TOKEN_SECRET || !token.includes(".")) return false;
  const [payload, signature] = token.split(".", 2);
  if (!payload || !signature || !safeEqual(signSession(payload), signature)) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return (
      decoded?.v === 2 &&
      decoded?.admin === true &&
      Number(decoded.exp) > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export async function loginAdmin(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD_HASH || !ADMIN_PASSWORD_SALT || !SESSION_TOKEN_SECRET) {
    console.warn("V2 admin credentials/session secret are not fully configured. Admin access disabled.");
    return false;
  }

  const hash = hashPassword(password);
  if (!safeEqual(hash, ADMIN_PASSWORD_HASH)) return false;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
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
