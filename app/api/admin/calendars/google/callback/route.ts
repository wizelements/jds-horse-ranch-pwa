import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { connectGoogleCalendar, decryptCalendarSecret } from "@/lib/calendars";

export async function GET(req: NextRequest) {
  if (!(await verifyAdminSession())) return NextResponse.redirect(new URL("/ranch-login", req.url));
  let result = "failed";
  try {
    const secret = req.cookies.get("jd_calendar_oauth")?.value;
    if (!secret) throw new Error("Missing OAuth state");
    const stored = decryptCalendarSecret<{ state: string; verifier: string; expires: number }>(secret);
    const expected = Buffer.from(stored.state), received = Buffer.from(req.nextUrl.searchParams.get("state") || "");
    if (stored.expires < Date.now() || expected.length !== received.length || !timingSafeEqual(expected, received)) throw new Error("Invalid OAuth state");
    const code = req.nextUrl.searchParams.get("code");
    if (!code || req.nextUrl.searchParams.has("error")) throw new Error("Google access was not granted");
    await connectGoogleCalendar(code, stored.verifier);
    result = "connected";
  } catch { /* OAuth credentials, codes and provider payloads must never reach logs. */ }
  const response = NextResponse.redirect(new URL(`/admin/settings?calendar=${result}`, req.url));
  response.cookies.set("jd_calendar_oauth", "", { maxAge: 0, path: "/api/admin/calendars/google" });
  return response;
}
