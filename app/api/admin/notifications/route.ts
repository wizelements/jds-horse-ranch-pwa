import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getTurso } from "@/lib/turso";
import { dispatchOwnerNotifications, enqueueOwnerNotification, firebasePublicConfig, notificationsConfigured } from "@/lib/notifications";

export async function GET() {
  if (!(await verifyAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const devices = await getTurso().execute("SELECT id,label,created_at FROM notification_devices");
    return NextResponse.json({ configured: notificationsConfigured(), config: firebasePublicConfig(), vapidKey: process.env.FIREBASE_VAPID_KEY || "", devices: devices.rows });
  } catch { return NextResponse.json({ error: "Notification settings unavailable." }, { status: 503 }); }
}
export async function POST(req: NextRequest) {
  if (!(await verifyAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (body.action === "remove_device") {
      await getTurso().execute({ sql: "DELETE FROM notification_devices WHERE id=?", args: [String(body.id || "")] });
      return NextResponse.json({ success: true });
    }
    if (!notificationsConfigured()) return NextResponse.json({ error: "Firebase notifications are not configured yet." }, { status: 503 });
    if (body.action === "register_device") {
      const token = String(body.token || "");
      if (token.length < 30 || token.length > 4096) return NextResponse.json({ error: "Invalid device registration." }, { status: 400 });
      await getTurso().execute({ sql: "INSERT INTO notification_devices (id,token,label,created_at) VALUES (?,?,?,?) ON CONFLICT(token) DO UPDATE SET label=excluded.label", args: [randomUUID(), token, String(body.label || "Owner device").slice(0, 80), new Date().toISOString()] });
      return NextResponse.json({ success: true });
    }
    if (body.action === "test") {
      await enqueueOwnerNotification("owner_test");
      const result = await dispatchOwnerNotifications();
      return NextResponse.json({ success: true, sent: result.sent, message: result.sent ? "Test submitted to Firebase. Verify that this device receives it." : "No notification was delivered. Check device registration and Firebase settings." });
    }
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch { return NextResponse.json({ error: "Notification action unavailable." }, { status: 503 }); }
}
