import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const SESSION_TOKEN_SECRET = process.env.SESSION_TOKEN_SECRET || "dev-secret-change-in-prod";

/**
 * Hash a password for storage/comparison
 * In production, use bcrypt. For MVP, using simple SHA256.
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * Verify admin password and create session
 */
export async function loginAdmin(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD_HASH) {
    console.warn("ADMIN_PASSWORD_HASH not configured. Admin access disabled.");
    return false;
  }

  const hash = hashPassword(password);
  if (hash === ADMIN_PASSWORD_HASH) {
    // Create session token
    const token = crypto.randomBytes(32).toString("hex");
    const sessionData = JSON.stringify({
      admin: true,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    // Store token data somewhere (in prod: use secure session store)
    // For MVP: store in memory (will clear on deployment)
    (global as any).adminSessions = (global as any).adminSessions || {};
    (global as any).adminSessions[token] = sessionData;

    return true;
  }

  return false;
}

/**
 * Verify admin session is valid
 */
export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) return false;

  const sessions = (global as any).adminSessions || {};
  const sessionData = sessions[token];

  if (!sessionData) return false;

  try {
    const data = JSON.parse(sessionData);
    if (data.expiresAt < Date.now()) {
      delete sessions[token];
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Logout admin session
 */
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (token) {
    const sessions = (global as any).adminSessions || {};
    delete sessions[token];
  }

  cookieStore.delete("admin_session");
}
