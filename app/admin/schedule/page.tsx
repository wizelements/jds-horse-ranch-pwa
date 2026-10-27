import Link from "next/link";
import { listInquiries, type BookingInquiry } from "@/lib/bookingStore";

const zone = "America/New_York";

function dayKey(date: string) {
  const parts = new Intl.DateTimeFormat("en-US", {timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit"}).formatToParts(new Date(date));
  const part = (name: string) => parts.find(p => p.type === name)?.value ?? "";
  return [part("year"),part("month"),part("day")].join("-");
}
function display(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {timeZone: zone, ...options}).format(new Date(value));
}
export default async function SchedulePage() {
  let records: BookingInquiry[] = [];
  let error = false;
  try {
    records = (await listInquiries(1000)).filter(r => r.approved_start_at && ["BOOKED","AWAITING_PAYMENT"].includes(r.status))
      .sort((a,b) => new Date(a.approved_start_at!).getTime()-new Date(b.approved_start_at!).getTime());
  } catch(e) { console.error("Schedule could not load",e); error = true; }
  const days = new Map<string,BookingInquiry[]>();
  for (const r of records) {
    const day=dayKey(r.approved_start_at!);
    days.set(day,[...(days.get(day)||[]),r]);
  }
  return <div className="space-y-6">
    <header>
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-800">Ranch Management</p>
      <h1 className="mt-2 text-3xl font-bold text-ranch-dark">Ride Schedule</h1>
      <p className="mt-2 text-stone-700">View the ride times JD has approved. Only paid rides are confirmed.</p>
    </header>
    <div role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      External calendars are not connected yet. Before approving a ride, check your other calendars. This view shows the most recent 1,000 reservation records and cannot be used to prove a time is free.
    </div>
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-900">Schedule information could not be loaded. No changes were made.</p>
    : days.size===0 ? <div className="rounded-xl border bg-white p-6">There are no approved times in the records currently shown.</div>
    : [...days].map(([day,items]) => <section key={day} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <h2 className="bg-stone-100 px-5 py-4 text-lg font-bold text-ranch-dark">{display(items[0].approved_start_at!,{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</h2>
      <ul className="divide-y divide-stone-200">
        {items.map(item => <li key={item.id} className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-stone-950">{display(item.approved_start_at!,{hour:"numeric",minute:"2-digit"})} · {item.service_requested||"Ranch experience"}</p>
            <p className="text-sm text-stone-700">{item.customer_name||"Customer not named"} · {item.rider_count??"—"} rider(s)</p>
          </div>
          <span className={item.status==="BOOKED"?"rounded-full bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-900":"rounded-full bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900"}>
            {item.status==="BOOKED"?"Confirmed":"Awaiting payment"}
          </span>
        </li>)}
      </ul>
    </section>)}
    <Link href="/admin/inquiries" className="inline-block rounded-lg bg-ranch-dark px-5 py-3 font-semibold text-white">Review reservation requests</Link>
  </div>;
}
