import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { expirePaymentHolds } from "@/lib/bookingService";
import { dispatchOwnerNotifications } from "@/lib/notifications";

export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const expected = Buffer.from(`Bearer ${secret || ""}`), received = Buffer.from(req.headers.get("authorization") || "");
  if (!secret || secret.length < 32 || expected.length !== received.length || !timingSafeEqual(expected, received)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try { const expired = await expirePaymentHolds(); const notifications = await dispatchOwnerNotifications(); return NextResponse.json({ expired, notifications }); }
  catch { return NextResponse.json({ error: "Maintenance could not complete" }, { status: 503 }); }
}
