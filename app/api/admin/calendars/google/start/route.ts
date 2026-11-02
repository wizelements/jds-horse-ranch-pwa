import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { encryptCalendarSecret, GOOGLE_SCOPES, googleCalendarConfigured } from "@/lib/calendars";

export async function GET(req: NextRequest) {
  if (!(await verifyAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!googleCalendarConfigured()) return NextResponse.json({ error: "Google Calendar application settings are not configured." }, { status: 503 });
  if (new URL(process.env.GOOGLE_CALENDAR_REDIRECT_URI!).origin !== req.nextUrl.origin) return NextResponse.json({ error: "The Google Calendar callback must match this deployment." }, { status: 503 });
  const state = randomBytes(32).toString("base64url"), verifier = randomBytes(32).toString("base64url");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID!, redirect_uri: process.env.GOOGLE_CALENDAR_REDIRECT_URI!,
    response_type: "code", scope: GOOGLE_SCOPES, access_type: "offline", prompt: "consent", state,
    code_challenge: createHash("sha256").update(verifier).digest("base64url"), code_challenge_method: "S256" }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set("jd_calendar_oauth", encryptCalendarSecret({ state, verifier, expires: Date.now() + 600000 }), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/api/admin/calendars/google",
  });
  return response;
}
