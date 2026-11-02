import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { getTurso, updateSetting } from "@/lib/turso";
import { createCalendarFeed, googleCalendarConfigured, listGoogleCalendars, parseBusyCalendar, saveBusyBlocks } from "@/lib/calendars";
import { RanchError } from "@/lib/errors";

export async function GET() {
  if (!(await verifyAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const [connections, blocks] = await Promise.all([
      getTurso().execute("SELECT id,label,calendar_ids,updated_at FROM calendar_connections"),
      getTurso().execute({ sql: "SELECT id,label,starts_at,ends_at,source FROM calendar_blocks WHERE ends_at >= ? ORDER BY starts_at LIMIT 500", args: [new Date().toISOString()] }),
    ]);
    let calendars: { id: string; label: string; primary: boolean }[] = [], warning = "";
    try { calendars = await listGoogleCalendars(); } catch { warning = "Google calendars could not be loaded. Reconnect to restore availability checks."; }
    return NextResponse.json({ googleConfigured: googleCalendarConfigured(), connections: connections.rows.map(c => ({ id: c.id, label: c.label, selectedIds: JSON.parse(String(c.calendar_ids)), updatedAt: c.updated_at })), calendars, blocks: blocks.rows, warning });
  } catch { return NextResponse.json({ error: "Calendar settings are unavailable." }, { status: 503 }); }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json(), action = String(body.action || "");
    if (action === "disconnect_google") {
      await getTurso().execute("DELETE FROM calendar_connections WHERE id='google'");
      return NextResponse.json({ success: true, message: "Google access removed from the ranch workspace. You can also revoke the app in your Google account permissions." });
    }
    if (action === "select_calendars") {
      const ids = Array.isArray(body.ids) ? body.ids.map(String) : [];
      const available = new Set((await listGoogleCalendars()).map((c: { id: string }) => c.id));
      if (!ids.length || ids.length > 50 || ids.some((id: string) => !available.has(id))) throw new RanchError("Choose between 1 and 50 calendars from the connected account.");
      await getTurso().execute({ sql: "UPDATE calendar_connections SET calendar_ids=?,updated_at=? WHERE id='google'", args: [JSON.stringify([...new Set(ids)]), new Date().toISOString()] });
      return NextResponse.json({ success: true });
    }
    if (action === "create_feed") {
      const token = await createCalendarFeed();
      return NextResponse.json({ success: true, feedUrl: `${new URL(req.url).origin}/api/calendar/feed?key=${token}` });
    }
    if (action === "revoke_feed") { await updateSetting("calendar_feed_hash", ""); return NextResponse.json({ success: true }); }
    if (action === "add_block") {
      const start = new Date(String(body.start)), end = new Date(String(body.end)), label = String(body.label || "Unavailable").trim().slice(0, 120);
      if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start || end.getTime() < Date.now() || end.getTime() - start.getTime() > 366 * 86400000) throw new RanchError("Choose a valid future busy interval shorter than a year.");
      await getTurso().execute({ sql: "INSERT INTO calendar_blocks (id,label,starts_at,ends_at,source,created_at) VALUES (?,?,?,?,'manual',?)", args: [randomUUID(), label, start.toISOString(), end.toISOString(), new Date().toISOString()] });
      return NextResponse.json({ success: true });
    }
    if (action === "remove_block") {
      await getTurso().execute({ sql: "DELETE FROM calendar_blocks WHERE id=?", args: [String(body.id || "")] });
      return NextResponse.json({ success: true });
    }
    if (action === "import_calendar") {
      const blocks = parseBusyCalendar(String(body.calendar || ""));
      await saveBusyBlocks(blocks, String(body.label || "Imported calendar").trim().slice(0, 120));
      return NextResponse.json({ success: true, message: `${blocks.length} upcoming busy intervals imported. This is a snapshot; import new times when the external calendar changes.` });
    }
    throw new RanchError("Unsupported calendar action.");
  } catch (error) {
    if (error instanceof RanchError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Calendar action could not be completed." }, { status: 503 });
  }
}
