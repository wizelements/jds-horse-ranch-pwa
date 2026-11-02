import "server-only";
import { createSign, randomUUID } from "crypto";
import { getTurso } from "@/lib/turso";

export function firebasePublicConfig() {
  return { apiKey: process.env.FIREBASE_API_KEY || "", appId: process.env.FIREBASE_APP_ID || "", projectId: process.env.FIREBASE_PROJECT_ID || "", messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "" };
}
export function notificationsConfigured() {
  return Object.values(firebasePublicConfig()).every(Boolean) && Boolean(process.env.FIREBASE_VAPID_KEY && process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}
async function accessToken() {
  const now = Math.floor(Date.now() / 1000);
  const part = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = `${part({ alg: "RS256", typ: "JWT" })}.${part({ iss: process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/firebase.messaging", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign((process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"), "base64url");
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }), cache: "no-store", signal: AbortSignal.timeout(6000) });
  if (!response.ok) throw new Error("Firebase authentication unavailable");
  const data = await response.json();
  if (!data.access_token) throw new Error("Firebase token unavailable");
  return String(data.access_token);
}
export async function enqueueOwnerNotification(kind: string) {
  await getTurso().execute({ sql: "INSERT INTO notification_outbox (id,kind,created_at) VALUES (?,?,?)", args: [randomUUID(), kind, new Date().toISOString()] });
}
export async function dispatchOwnerNotifications() {
  if (!notificationsConfigured()) return { configured: false, sent: 0 };
  const devices = await getTurso().execute("SELECT id,token FROM notification_devices");
  if (!devices.rows.length) return { configured: true, sent: 0 };
  const queue = await getTurso().execute("SELECT id,kind FROM notification_outbox WHERE delivered_at IS NULL AND attempts < 5 ORDER BY created_at LIMIT 10");
  if (!queue.rows.length) return { configured: true, sent: 0 };
  let sent = 0;
  try {
    const bearer = await accessToken(), project = encodeURIComponent(process.env.FIREBASE_PROJECT_ID!);
    for (const item of queue.rows) {
      // Atomically claim a bounded attempt so concurrent webhook/cron runs cannot
      // endlessly send the same notification. FCM delivery itself is best effort.
      const claimed = await getTurso().execute({ sql: "UPDATE notification_outbox SET attempts=attempts+1, claimed_at=? WHERE id=? AND delivered_at IS NULL AND (claimed_at IS NULL OR claimed_at < ?)", args: [new Date().toISOString(), String(item.id), new Date(Date.now() - 120000).toISOString()] });
      if (!claimed.rowsAffected) continue;
      let delivered = 0;
      for (const device of devices.rows) {
        const response = await fetch(`https://fcm.googleapis.com/v1/projects/${project}/messages:send`, {
          method: "POST", headers: { Authorization: `Bearer ${bearer}`, "Content-Type": "application/json" },
          body: JSON.stringify({ message: { token: String(device.token), data: { kind: String(item.kind), title: "JD's Ranch Manager", body: "A ranch update is ready. Open your private workspace for details." }, webpush: { headers: { TTL: "900" } } } }),
          cache: "no-store", signal: AbortSignal.timeout(6000),
        });
        if (response.ok) delivered++;
        else if (response.status === 404) await getTurso().execute({ sql: "DELETE FROM notification_devices WHERE id=?", args: [String(device.id)] });
      }
      if (delivered) { await getTurso().execute({ sql: "UPDATE notification_outbox SET delivered_at=? WHERE id=?", args: [new Date().toISOString(), String(item.id)] }); sent++; }
    }
  } catch { /* Pending updates remain available for bounded maintenance retries. */ }
  return { configured: true, sent };
}
