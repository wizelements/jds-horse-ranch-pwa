import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "crypto";
import { getTurso } from "@/lib/turso";
import { RanchError } from "@/lib/errors";
import { ranchLocalToIso } from "@/lib/ranch";

export function googleCalendarConfigured() {
  return Boolean(process.env.GOOGLE_CALENDAR_CLIENT_ID && process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
    process.env.GOOGLE_CALENDAR_REDIRECT_URI && encryptionKey(false));
}
function encryptionKey(required = true) {
  const key = Buffer.from(process.env.CALENDAR_ENCRYPTION_KEY || "", "base64");
  if (key.length !== 32) {
    if (required) throw new RanchError("Calendar encryption is not configured.", 503);
    return null;
  }
  return key;
}
export function encryptCalendarSecret(value: unknown) {
  const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", encryptionKey()!, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}
export function decryptCalendarSecret<T>(value: string): T {
  const data = Buffer.from(value, "base64url");
  const cipher = createDecipheriv("aes-256-gcm", encryptionKey()!, data.subarray(0, 12));
  cipher.setAuthTag(data.subarray(12, 28));
  return JSON.parse(Buffer.concat([cipher.update(data.subarray(28)), cipher.final()]).toString("utf8"));
}
export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events.freebusy",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
].join(" ");

async function googleToken(body: URLSearchParams) {
  let response: Response;
  try { response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body, cache: "no-store", signal: AbortSignal.timeout(7000) }); }
  catch { throw new RanchError("Google Calendar did not respond. Availability has not been verified.", 503); }
  if (!response.ok) throw new RanchError("Reconnect Google Calendar before approving an appointment.", 503);
  return response.json() as Promise<{ access_token: string; refresh_token?: string; scope?: string }>;
}
export async function connectGoogleCalendar(code: string, verifier: string) {
  if (!googleCalendarConfigured()) throw new RanchError("Google Calendar is not configured.", 503);
  const tokens = await googleToken(new URLSearchParams({
    code, code_verifier: verifier, client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET!,
    redirect_uri: process.env.GOOGLE_CALENDAR_REDIRECT_URI!, grant_type: "authorization_code",
  }));
  if (!tokens.refresh_token) throw new RanchError("Google did not grant ongoing access. Reconnect and approve calendar access.", 400);
  const granted = new Set((tokens.scope || "").split(" "));
  if (GOOGLE_SCOPES.split(" ").some(scope => !granted.has(scope))) throw new RanchError("Google Calendar access was incomplete. Both requested permissions are needed.", 400);
  await getTurso().execute({ sql: `INSERT INTO calendar_connections (id,provider,label,credentials,calendar_ids,updated_at)
    VALUES ('google','google','Google Calendar',?,'["primary"]',?)
    ON CONFLICT(id) DO UPDATE SET credentials=excluded.credentials, calendar_ids=excluded.calendar_ids, updated_at=excluded.updated_at`,
    args: [encryptCalendarSecret({ refreshToken: tokens.refresh_token }), new Date().toISOString()] });
}
async function accessToken(credentials: string) {
  const { refreshToken } = decryptCalendarSecret<{ refreshToken: string }>(credentials);
  const tokens = await googleToken(new URLSearchParams({
    client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID!, client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET!,
    refresh_token: refreshToken, grant_type: "refresh_token",
  }));
  if (!tokens.access_token) throw new RanchError("Reconnect Google Calendar.", 503);
  return tokens.access_token;
}
export async function listGoogleCalendars() {
  const row = await getTurso().execute("SELECT credentials FROM calendar_connections WHERE id = 'google'");
  if (!row.rows.length) return [];
  const token = await accessToken(String(row.rows[0].credentials));
  const response = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=250", {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new RanchError("Google calendars could not be loaded. Reconnect the account.", 503);
  const result = await response.json();
  if (result.nextPageToken) throw new RanchError("This Google account has more than 250 calendars. Use a dedicated ranch calendar account.", 400);
  return (result.items || []).map((item: { id: string; summary?: string; primary?: boolean }) => ({ id: item.id, label: item.summary || item.id, primary: Boolean(item.primary) }));
}

export async function checkExternalAvailability(start: string, end: string, manuallyReviewed: boolean) {
  const connections = await getTurso().execute("SELECT * FROM calendar_connections WHERE provider = 'google'");
  if (!connections.rows.length) {
    if (!manuallyReviewed) throw new RanchError("Check your other calendars, then confirm that you reviewed availability.", 409);
    return "manually_reviewed";
  }
  const connection = connections.rows[0];
  const ids: string[] = JSON.parse(String(connection.calendar_ids));
  if (!ids.length) throw new RanchError("Select at least one connected calendar before approving a ride.", 409);
  const token = await accessToken(String(connection.credentials));
  let response: Response;
  try { response = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin: start, timeMax: end, timeZone: "America/New_York", items: ids.map(id => ({ id })) }),
    cache: "no-store", signal: AbortSignal.timeout(7000),
  }); } catch { throw new RanchError("Google availability could not be checked. Try again before approving.", 503); }
  if (!response.ok) throw new RanchError("Google availability could not be checked. Reconnect the calendar.", 503);
  const result = await response.json();
  for (const id of ids) {
    const calendar = result.calendars?.[id];
    if (!calendar || calendar.errors?.length || !Array.isArray(calendar.busy)) throw new RanchError("A connected calendar did not return availability. Check its sharing permissions.", 503);
    if (calendar.busy.length) throw new RanchError("A connected calendar is busy during this appointment. Choose another time.", 409);
  }
  return "google_verified";
}

export function calendarEvent(input: { id: string; start: string; end: string; status?: string }) {
  const date = (s: string) => new Date(s).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return ["BEGIN:VEVENT", `UID:${input.id}@jdshorseranch.com`, `DTSTAMP:${date(new Date().toISOString())}`,
    `DTSTART:${date(input.start)}`, `DTEND:${date(input.end)}`,
    `SUMMARY:JD's Horse Ranch${input.status === "AWAITING_PAYMENT" ? " - payment pending" : " - confirmed ride"}`,
    "LOCATION:7555 Jones Road\, Fairburn\, GA 30213", "DESCRIPTION:Open the private ranch workspace for appointment details.",
    `STATUS:${input.status === "AWAITING_PAYMENT" ? "TENTATIVE" : "CONFIRMED"}`, "END:VEVENT"].join("\r\n");
}
export function calendarDocument(events: string[]) {
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//JDs Horse Ranch//Ranch Manager//EN", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR", ""].join("\r\n");
}

// Import files, never fetch user-supplied URLs. Recurrence must be expanded by the
// exporting app; refusing unsupported rules avoids falsely reporting free time.
export function parseBusyCalendar(text: string) {
  if (Buffer.byteLength(text) > 1024 * 1024 || !text.includes("BEGIN:VCALENDAR")) throw new RanchError("Choose a calendar .ics file under 1 MB.");
  const events = [...text.replace(/\r?\n[ \t]/g, "").matchAll(/BEGIN:VEVENT\r?\n([\s\S]*?)END:VEVENT/g)];
  if (events.length > 2000) throw new RanchError("Import at most 2,000 calendar events at a time.");
  const parse = (line: string) => {
    const [params, value] = line.split(":");
    if (/^\d{8}T\d{6}Z$/.test(value)) {
      const date = new Date(`${value.slice(0,4)}-${value.slice(4,6)}-${value.slice(6,8)}T${value.slice(9,11)}:${value.slice(11,13)}:${value.slice(13,15)}Z`);
      if (!Number.isFinite(date.getTime()) || date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "") !== value) throw new RanchError("A calendar event has an invalid date.");
      return date.toISOString();
    }
    const match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2}))?$/.exec(value);
    if (!match || (/TZID=/.test(params) && !/TZID=America\/New_York(?:;|$)/.test(params))) throw new RanchError("Calendar times must be UTC or America/New_York. Connect Google for other time zones.");
    return ranchLocalToIso(`${match[1]}-${match[2]}-${match[3]}T${match[4] || "00"}:${match[5] || "00"}`);
  };
  const blocks: { start: string; end: string }[] = [];
  for (const [, event] of events) {
    if (/^(STATUS:CANCELLED|TRANSP:TRANSPARENT)\r?$/m.test(event)) continue;
    if (/^(RRULE|RDATE|EXDATE|RECURRENCE-ID)[;:]/m.test(event)) throw new RanchError("This file contains recurrence rules. Export expanded events, or connect Google for automatic availability.");
    const start = event.split(/\r?\n/).find(line => /^DTSTART[;:]/.test(line));
    const end = event.split(/\r?\n/).find(line => /^DTEND[;:]/.test(line));
    if (!start || !end) throw new RanchError("Each busy event must have a start and end time.");
    const range = { start: parse(start), end: parse(end) };
    if (range.start >= range.end) throw new RanchError("A calendar event ends before it starts.");
    if (Date.parse(range.end) >= Date.now()) blocks.push(range);
  }
  if (!blocks.length) throw new RanchError("This file has no upcoming busy events.");
  return blocks;
}

export async function createCalendarFeed() {
  const token = randomBytes(32).toString("base64url");
  const { updateSetting } = await import("@/lib/turso");
  await updateSetting("calendar_feed_hash", createHash("sha256").update(token).digest("hex"));
  return token;
}
export async function saveBusyBlocks(blocks: { start: string; end: string }[], label: string) {
  const source = `import:${randomUUID()}`, now = new Date().toISOString();
  await getTurso().batch(blocks.map(b => ({ sql: "INSERT INTO calendar_blocks (id,label,starts_at,ends_at,source,created_at) VALUES (?,?,?,?,?,?)", args: [randomUUID(), label, b.start, b.end, source, now] })), "write");
  return source;
}
