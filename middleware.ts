import { NextRequest, NextResponse } from "next/server";
import { validEdgeSession } from "@/lib/edgeSession";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  // Secure marketing-only production release. Never expose booking, payment,
  // customer data, authentication or administrative APIs without certification.
  const publicOnly = process.env.VERCEL_ENV === "production" && process.env.RANCH_PUBLIC_ONLY_MODE === "true";
  if (publicOnly && /^\/(admin|api|ranch-login|booking)(\/|$)/.test(path)) {
    return NextResponse.json(
      { error: "Private ranch operations are not available on this public website. Call JD at (404) 981-2361 to arrange a ride." },
      { status: 503, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } }
    );
  }
  if (/^\/admin(?:\/|$)/.test(path) && !(await validEdgeSession(request.cookies.get("admin_session")?.value))) {
    const response = NextResponse.redirect(new URL("/ranch-login", request.url));
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
  if (path.startsWith("/api/admin") && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const site = new URL(request.url).origin;
    if ((origin && origin !== site) || request.headers.get("sec-fetch-site") === "cross-site") {
      return NextResponse.json({ error: "This action must be made from the ranch workspace." }, { status: 403 });
    }
    if (request.method !== "DELETE" && !request.headers.get("content-type")?.startsWith(
      path.endsWith("/gallery/upload") ? "multipart/form-data" : "application/json"
    )) return NextResponse.json({ error: "Unsupported request format." }, { status: 415 });
    const size = Number(request.headers.get("content-length") || 0);
    if (size > (path.endsWith("/gallery/upload") ? 8500000 : path.endsWith("/calendars") ? 1100000 : 32768)) {
      return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    }
  }
  const response = NextResponse.next();
  if (/^\/(admin|api|ranch-login|booking)(\/|$)/.test(path)) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|photos|icon-|favicon).*)"] };
