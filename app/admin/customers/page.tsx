import Link from "next/link";
import { listInquiries, type BookingInquiry } from "@/lib/bookingStore";

type ContactHistory = {phone:string; name:string; email:string; records:BookingInquiry[]};
function shortDate(value:string){return new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",month:"short",day:"numeric",year:"numeric"}).format(new Date(value));}

export default async function CustomersPage() {
  let records:BookingInquiry[]=[];
  let error=false;
  try{ records=await listInquiries(1000); } catch(e) { console.error("Contact history load failed", e); error=true; }
  const grouped = new Map<string,ContactHistory>();
  for (const r of records) {
    // Phone is a contact reference only, NOT proof multiple riders are the same person.
    const phone=r.customer_phone||"";
    const key=phone || r.id;
    const group=grouped.get(key) || {phone,name:r.customer_name||"Name not supplied",email:r.email||"",records:[]};
    group.records.push(r);
    if(group.name==="Name not supplied" && r.customer_name)group.name=r.customer_name;
    if(!group.email && r.email)group.email=r.email;
    grouped.set(key,group);
  }
  const contacts=[...grouped.values()].sort((a,b)=>new Date(b.records[0].created_at).getTime()-new Date(a.records[0].created_at).getTime());
  return <div className="space-y-6">
    <header>
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-800">Ranch Management</p>
      <h1 className="mt-2 text-3xl font-bold text-ranch-dark">Customer History</h1>
      <p className="mt-2 text-stone-700">Find previous requests and visits, and recognize returning contacts.</p>
    </header>
    <div role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      These are contact histories grouped by phone number, not verified individual rider profiles. Families may share a number. Only the most recent 1,000 requests are included; no historical import has been completed.
    </div>
    {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-900">Customer information is temporarily unavailable. No records were changed.</p>
    : contacts.length===0 ? <div className="rounded-xl border bg-white p-6">No customer requests have been recorded yet.</div>
    : <div className="space-y-4">{contacts.map(contact=><section key={contact.phone||contact.records[0].id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-ranch-dark">{contact.name}</h2>
            <p className="text-sm text-stone-700">{contact.phone}{contact.email ? " · "+contact.email : ""}</p>
          </div>
          <p className="text-sm font-semibold text-stone-600">{contact.records.length} request{contact.records.length===1?"":"s"}</p>
        </div>
        <ul className="mt-4 divide-y divide-stone-200">
          {contact.records.slice(0,10).map(r=><li key={r.id} className="flex flex-col justify-between gap-1 py-3 text-sm sm:flex-row">
            <span className="text-stone-900">{shortDate(r.created_at)} · {r.service_requested||"Experience not selected"}</span>
            <span className="font-medium text-stone-700">{r.status==="BOOKED"?"Confirmed":r.status==="COMPLETED"?"Completed":r.status==="PENDING_JD"?"Needs JD review":r.status==="AWAITING_PAYMENT"?"Awaiting payment":r.status==="CANCELLED"?"Cancelled":r.status==="DECLINED"?"Declined":r.status==="EXPIRED"?"Expired":"In progress"}</span>
          </li>)}
        </ul>
      </section>)}</div>}
    <Link href="/admin/inquiries" className="inline-block rounded-lg bg-ranch-dark px-5 py-3 font-semibold text-white">Manage reservations</Link>
  </div>;
}
