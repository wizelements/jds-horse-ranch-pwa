"use client";
import { useEffect, useState, type FormEvent } from "react";
import { ranchLocalToIso, ranchTime } from "@/lib/ranch";

type CalendarSettings = {
  googleConfigured: boolean;
  connections: { id: string; label: string; selectedIds: string[] }[];
  calendars: { id: string; label: string }[];
  blocks: { id: string; label: string; starts_at: string; ends_at: string; source: string }[];
  warning: string;
};
const input = "mt-2 block w-full rounded-lg border border-stone-300 px-3 py-3";
const button = "rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50";

export default function CalendarSettings() {
  const [data, setData] = useState<CalendarSettings | null>(null), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false), [selected, setSelected] = useState<string[]>([]), [feed, setFeed] = useState("");
  async function load() {
    try {
      const response = await fetch("/api/admin/calendars"); const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Calendar settings could not be loaded.");
      setData(result); setSelected(result.connections.find((c: { id: string }) => c.id === "google")?.selectedIds || []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Calendar settings could not be loaded."); }
  }
  useEffect(() => { void load(); }, []);
  async function run(body: Record<string, unknown>) {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/calendars", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "The calendar action could not be completed.");
      if (result.feedUrl) setFeed(result.feedUrl);
      setNotice(result.message || "Calendar settings saved."); await load(); return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The calendar action could not be completed."); return false; }
    finally { setBusy(false); }
  }
  async function block(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget, fields = new FormData(form);
    try { if (await run({ action: "add_block", label: fields.get("label"), start: ranchLocalToIso(String(fields.get("start"))), end: ranchLocalToIso(String(fields.get("end"))) })) form.reset(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Choose a valid time."); }
  }
  return <section className="space-y-7 rounded-xl border bg-white p-6">
    <header><h2 className="text-xl font-bold">Calendars and availability</h2><p className="mt-2 text-sm leading-6 text-stone-600">Connect Google to check busy times before approving a ride. Choose every calendar that affects ranch availability. Customer details stay in the private workspace.</p></header>
    {!data ? <button type="button" onClick={() => void load()} className={button}>Reload calendar settings</button> : <>
      <div className="space-y-4 rounded-xl bg-stone-50 p-5">
        <h3 className="font-bold">Google Calendar</h3>
        {!data.googleConfigured ? <p className="text-sm text-amber-900">Google application credentials and an encryption key still need to be configured. Until then, review other calendars manually before approving a ride.</p> : <a href="/api/admin/calendars/google/start" className="inline-block rounded-lg bg-emerald-900 px-4 py-3 text-sm font-semibold text-white">{data.connections.length ? "Reconnect Google Calendar" : "Connect Google Calendar"}</a>}
        {data.connections.length > 0 && <><div className="space-y-3">{data.calendars.map(calendar => <label key={calendar.id} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={selected.includes(calendar.id)} onChange={event => setSelected(current => event.target.checked ? [...current, calendar.id] : current.filter(id => id !== calendar.id))} className="h-5 w-5" />{calendar.label}</label>)}</div><div className="flex flex-wrap gap-3"><button disabled={busy || !data.calendars.length} type="button" onClick={() => void run({ action: "select_calendars", ids: selected })} className={button}>Save selected calendars</button><button disabled={busy} type="button" onClick={() => { if (window.confirm("Disconnect Google Calendar from the ranch workspace?")) void run({ action: "disconnect_google" }); }} className={button}>Disconnect Google</button></div></>}
        {data.warning && <p role="alert" className="text-sm text-amber-900">{data.warning}</p>}
      </div>
      <form onSubmit={block} className="space-y-4 border-t pt-6"><h3 className="font-bold">Block time</h3><p className="text-sm text-stone-600">Use this for time away, maintenance, or commitments on another calendar. All times are Eastern.</p>
        <label className="block text-sm font-semibold">Label<input name="label" maxLength={120} placeholder="Unavailable" className={input} required /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Starts<input type="datetime-local" name="start" className={input} required /></label><label className="text-sm font-semibold">Ends<input type="datetime-local" name="end" className={input} required /></label></div>
        <button disabled={busy} className={button}>Save blocked time</button>
      </form>
      <div className="space-y-3 border-t pt-6"><h3 className="font-bold">Import busy times from another app</h3><p className="text-sm leading-6 text-stone-600">Export a calendar file (.ics) from Calendly, Outlook, Apple Calendar, or another app. This imports a snapshot, so future edits need another import. Files must contain expanded events in UTC or Eastern time; recurrence rules require a Google connection or an expanded export.</p>
        <label className="block rounded-lg border border-dashed border-stone-400 p-4 text-sm font-semibold">Choose a calendar file<input type="file" accept=".ics,text/calendar" disabled={busy} className="mt-3 block w-full" onChange={event => {
          const file = event.target.files?.[0]; if (!file) return;
          if (file.size > 1024 * 1024) { setError("Choose a file under 1 MB."); return; }
          void file.text().then(calendar => run({ action: "import_calendar", calendar, label: file.name.slice(0,120) })).catch(() => setError("The calendar file could not be read.")); event.target.value = "";
        }} /></label>
      </div>
      <div className="space-y-3 border-t pt-6"><h3 className="font-bold">Show ranch appointments in your calendar app</h3><p className="text-sm leading-6 text-stone-600">Create a private subscription link for Google, Apple, or Outlook. It shares appointment times only. New links replace previous ones. Do not select this subscription as a source for Google availability checks; that would count ranch appointments twice.</p>
        <div className="flex flex-wrap gap-3"><button disabled={busy} type="button" className={button} onClick={() => { if (window.confirm("Create a calendar subscription link and replace any previous link?")) void run({ action: "create_feed" }); }}>Create subscription link</button><button disabled={busy} type="button" className={button} onClick={() => { void run({ action: "revoke_feed" }); setFeed(""); }}>Disable subscription</button></div>
        {feed && <label className="block text-sm font-semibold">Copy into your calendar app&apos;s subscription settings<input readOnly value={feed} onFocus={event => event.target.select()} className={input} /></label>}
      </div>
      <details className="border-t pt-6"><summary className="cursor-pointer font-bold">Upcoming blocked times ({data.blocks.length}{data.blocks.length === 500 ? "+" : ""})</summary><ul className="mt-4 divide-y">{data.blocks.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold">{item.label}</p><p className="mt-1 text-sm text-stone-600">{ranchTime(item.starts_at)} – {ranchTime(item.ends_at)}</p></div><button type="button" disabled={busy} className={button} onClick={() => void run({ action: "remove_block", id: item.id })}>Remove</button></li>)}</ul></details>
    </>}
    {notice && <p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-950">{notice}</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-950">{error}</p>}
  </section>;
}
