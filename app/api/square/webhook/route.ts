import { NextRequest, NextResponse } from "next/server";
import { verifySquareSignature, retrieveSquareRefund } from "@/lib/square";
import { applyVerifiedRefund, verifyPayment } from "@/lib/bookingService";
import { getTurso } from "@/lib/turso";
import { RanchError } from "@/lib/errors";
import { after } from "next/server";
import { dispatchOwnerNotifications } from "@/lib/notifications";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > 1000000) return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  if (!verifySquareSignature(raw, req.headers.get("x-square-hmacsha256-signature"))) return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  try {
    const event = JSON.parse(raw), type = String(event?.type || "");
    if (!["payment.created", "payment.updated", "refund.created", "refund.updated"].includes(type)) return NextResponse.json({ received: true });
    const id = String(event.event_id || "");
    const objectId = type.startsWith("payment.") ? event?.data?.object?.payment?.id : event?.data?.object?.refund?.id;
    if (!id || id.length > 200 || !objectId || String(objectId).length > 200) return NextResponse.json({ error: "Missing event reference" }, { status: 400 });
    const existing = await getTurso().execute({ sql: "SELECT processed FROM square_webhook_events WHERE id=?", args: [id] });
    if (Number(existing.rows[0]?.processed) === 1) return NextResponse.json({ received: true });
    await getTurso().execute({ sql: "INSERT INTO square_webhook_events (id,type,object_id,received_at) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING", args: [id, type, String(objectId), new Date().toISOString()] });
    // Use Square's current record. A signed but delayed event must not roll a newer
    // payment/refund state backward, and return-page visits never prove payment.
    if (type.startsWith("payment.")) await verifyPayment(String(objectId));
    else await applyVerifiedRefund(await retrieveSquareRefund(String(objectId)));
    await getTurso().execute({ sql: "UPDATE square_webhook_events SET processed=1 WHERE id=?", args: [id] });
    after(() => dispatchOwnerNotifications().then(() => undefined).catch(() => undefined));
    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    console.error("Square webhook could not be verified; provider retry required");
    return NextResponse.json({ error: "Verification unavailable; retry required" }, { status: error instanceof RanchError && error.status === 403 ? 403 : 503 });
  }
}
