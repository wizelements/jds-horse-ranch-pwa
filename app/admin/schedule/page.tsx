import Link from "next/link";
import { getTurso } from "@/lib/turso";
import { ranchLocalToIso, ranchTime } from "@/lib/ranch";
import { bookingLabels } from "@/lib/bookingDisplay";

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const { month: requested } = await searchParams;
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  const current = `${parts.find(p => p.type === "year")!.value}-${parts.find(p => p.type === "month")!.value}`;
  const month = requested && /^20\d\d-(0[1-9]|1[0-2])$/.test(requested) ? requested : current;
  const [year, number] = month.split("-").map(Number);
  const following = new Date(Date.UTC(year, number, 1)), previous = new Date(Date.UTC(year, number - 2, 1));
  const first = ranchLocalToIso(`${month}-01T00:00`), next = ranchLocalToIso(`${following.toISOString().slice(0,7)}-01T00:00`);
  let rides: Record<string, unknown>[] = [], blocks: Record<string, unknown>[] = [], error = false;
  try {
    const result = await getTurso().batch([
      { sql: "SELECT id,customer_name,service_requested,rider_count,approved_start_at,approved_end_at,status FROM booking_inquiries WHERE approved_start_at >= ? AND approved_start_at < ? AND (status='BOOKED' OR (status='AWAITING_PAYMENT' AND (hold_expires_at IS NULL OR hold_expires_at > ?))) ORDER BY approved_start_at", args: [first, next, new Date().toISOString()] },
      { sql: "SELECT * FROM calendar_blocks WHERE ends_at > ? AND starts_at < ? ORDER BY starts_at", args: [first, next] },
    ], "read"); rides = result[0].rows as Record<string, unknown>[]; blocks = result[1].rows as Record<string, unknown>[];
  } catch { error = true; }
  const key = (value: unknown) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(String(value)));
  const days = new Date(Date.UTC(year, number, 0)).getUTCDate(), offset = new Date(Date.UTC(year, number - 1, 1)).getUTCDay();
  const heading = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, number - 1, 1)));
  return <div className="space-y-6"><header className="flex flex-wrap justify-between gap-4"><div><h1 className="text-3xl font-bold">Ride schedule</h1><p className="mt-2 text-stone-600">Confirmed rides, active payment holds, and blocked times. All times are Eastern.</p></div><Link href="/admin/settings" className="self-start rounded-lg border bg-white px-4 py-3 font-semibold">Manage calendars</Link></header>
    <nav aria-label="Schedule month" className="flex items-center justify-between gap-3"><Link className="rounded-lg border bg-white px-3 py-3 text-sm" href={`/admin/schedule?month=${previous.toISOString().slice(0,7)}`}>← Previous</Link><h2 className="text-xl font-bold">{heading}</h2><Link className="rounded-lg border bg-white px-3 py-3 text-sm" href={`/admin/schedule?month=${following.toISOString().slice(0,7)}`}>Next →</Link></nav>
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-950">Schedule information could not be loaded. Availability is unknown.</p> : <>
      <div className="overflow-hidden rounded-xl border bg-white"><div className="grid grid-cols-7 bg-stone-100 text-center text-xs font-semibold">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => <div key={day} className="py-3">{day}</div>)}</div><div className="grid grid-cols-7">{Array.from({ length: offset }, (_,i) => <div key={`empty-${i}`} className="border-b border-r bg-stone-50" />)}{Array.from({ length: days }, (_,i) => {
        const date = `${month}-${String(i + 1).padStart(2,"0")}`, count = rides.filter(ride => key(ride.approved_start_at) === date).length;
        const busy = blocks.some(block => key(block.starts_at) <= date && key(block.ends_at) >= date);
        return <a key={date} href="#schedule-agenda" aria-label={`${date}, ${count} appointments${busy ? ", blocked time" : ""}`} className="min-h-[72px] border-b border-r p-2 text-sm hover:bg-emerald-50 sm:min-h-[95px]"><span className="font-semibold">{i + 1}</span>{count > 0 && <span className="mt-2 block rounded bg-emerald-100 px-1 py-1 text-center text-xs text-emerald-950">{count}<span className="hidden sm:inline"> ride{count === 1 ? "" : "s"}</span></span>}{busy && <span className="mt-1 block h-1.5 w-5 rounded bg-amber-600" aria-hidden="true" />}</a>;
      })}</div></div>
      <section id="schedule-agenda" className="space-y-4"><h2 className="text-xl font-bold">Appointments this month</h2>{rides.map(ride => <article key={String(ride.id)} className="rounded-xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><h3 className="font-bold">{ranchTime(String(ride.approved_start_at))}</h3><span className="text-sm font-semibold">{bookingLabels[String(ride.status)]}</span></div><p className="mt-2 text-sm">{String(ride.customer_name || "Unnamed caller")} · {String(ride.service_requested || "Ride")} · {Number(ride.rider_count || 0)} riders</p><Link className="mt-3 inline-block font-semibold underline" href={`/admin/inquiries/${ride.id}`}>Open reservation →</Link></article>)}{!rides.length && <p className="rounded-xl border bg-white p-6 text-stone-600">No approved appointments for this month.</p>}</section>
      {blocks.length > 0 && <section className="rounded-xl border bg-amber-50 p-5"><h2 className="font-bold">Blocked time</h2><ul className="mt-3 divide-y divide-amber-200">{blocks.map(block => <li key={String(block.id)} className="py-3 text-sm">{String(block.label)} · {ranchTime(String(block.starts_at))} – {ranchTime(String(block.ends_at))}</li>)}</ul></section>}
      <p className="text-sm leading-6 text-stone-600">Connected Google calendars are checked when an appointment is approved or changed. Their individual events stay in Google. Review commitments on unconnected calendars before approving a ride.</p>
    </>}
  </div>;
}
