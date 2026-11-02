import Link from "next/link";
import { notFound } from "next/navigation";
import { getInquiry } from "@/lib/bookingStore";
import { getTurso } from "@/lib/turso";
import InquiryActions from "@/components/admin/InquiryActions";
import ReservationDetails from "@/components/admin/ReservationDetails";
import { bookingLabels, formatMoney } from "@/lib/bookingDisplay";
import { ranchTime } from "@/lib/ranch";

export default async function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let inquiry;
  try { inquiry = await getInquiry(id); }
  catch (error) {
    if (error instanceof Error && error.message === "Booking inquiry not found") notFound();
    return <p role="alert" className="rounded-xl bg-red-50 p-6 text-red-900">This reservation could not be loaded. No changes were made.</p>;
  }
  const [events, refunds, exceptions] = await getTurso().batch([
    { sql: "SELECT * FROM booking_events WHERE inquiry_id=? ORDER BY created_at DESC LIMIT 100", args: [id] },
    { sql: "SELECT id,amount_cents,status,created_at FROM square_refunds WHERE inquiry_id=? ORDER BY created_at DESC", args: [id] },
    { sql: "SELECT payment_id,amount_cents,currency FROM payment_receipts WHERE order_id=? AND disposition='review_required'", args: [inquiry.square_order_id || ""] },
  ], "read");
  const expired = inquiry.status === "AWAITING_PAYMENT" && inquiry.hold_expires_at && Date.parse(inquiry.hold_expires_at) <= Date.now();
  return <div className="mx-auto max-w-5xl space-y-6">
    <Link href="/admin/inquiries" className="font-semibold underline">← Reservations</Link>
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold">{inquiry.customer_name || "Customer reservation"}</h1><p className="mt-2 text-stone-600">{inquiry.service_requested} · {inquiry.rider_count} riders</p></div><span className="rounded-full bg-emerald-100 px-4 py-2 font-semibold text-emerald-950">{bookingLabels[inquiry.status]}</span></header>
    {expired && <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">The payment hold has expired. A late payment requires JD&apos;s review and cannot automatically confirm a ride.</p>}
    {exceptions.rows.length > 0 && <section role="alert" className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-950"><h2 className="font-bold">Payment needs review</h2><p className="mt-2 text-sm">Square received a payment that could not confirm this booking. Check Square and contact the customer to arrange a valid time or a refund.</p>{exceptions.rows.map(p => <p key={String(p.payment_id)} className="mt-2 break-all text-sm">Reference {String(p.payment_id)} · {String(p.currency)} {Number(p.amount_cents) / 100}</p>)}</section>}
    <section className="grid gap-6 rounded-xl border bg-white p-6 sm:grid-cols-2">
      <div><h2 className="font-bold">Contact</h2><a className="mt-3 inline-block rounded-lg bg-emerald-900 px-4 py-3 font-semibold text-white" href={`tel:${inquiry.customer_phone}`}>Call {inquiry.customer_phone}</a>{inquiry.email && <p className="mt-3 break-all text-sm">{inquiry.email}</p>}</div>
      <div><h2 className="font-bold">Appointment · Eastern time</h2><p className="mt-3">{inquiry.approved_start_at ? ranchTime(inquiry.approved_start_at) : inquiry.requested_datetime_text || "Not yet scheduled"}</p>{inquiry.approved_end_at && <p className="mt-1 text-sm text-stone-600">Ends {ranchTime(inquiry.approved_end_at)}</p>}{inquiry.hold_expires_at && inquiry.status === "AWAITING_PAYMENT" && <p className="mt-2 text-sm text-amber-900">Payment deadline: {ranchTime(inquiry.hold_expires_at)}</p>}</div>
      <div><h2 className="font-bold">Riders</h2><p className="mt-3 whitespace-pre-wrap text-sm">{inquiry.rider_details || "Not discussed"}</p><p className="mt-2 text-sm">Experience: {inquiry.experience || "Not discussed"}</p></div>
      <div><h2 className="font-bold">Payment</h2><p className="mt-3">Approved total: {formatMoney(inquiry.approved_amount_cents)}</p><p className="mt-1 text-sm">{inquiry.paid_at ? `Verified ${ranchTime(inquiry.paid_at)}` : "No verified payment"}</p>{inquiry.refunded_amount_cents > 0 && <p className="mt-1 text-sm">Verified refunds: {formatMoney(inquiry.refunded_amount_cents)}</p>}<p className="mt-3 text-xs text-stone-500">{process.env.SQUARE_ENVIRONMENT === "production" ? "Live Square account" : "Square sandbox · test payments"}</p></div>
    </section>
    <ReservationDetails inquiry={inquiry} />
    <InquiryActions inquiry={inquiry} latePayments={exceptions.rows.map(p => ({id:String(p.payment_id),amount:Number(p.amount_cents)}))} />
    {refunds.rows.length > 0 && <section className="rounded-xl border bg-white p-5"><h2 className="text-lg font-bold">Refund history</h2><ul className="mt-3 divide-y">{refunds.rows.map(r => <li key={String(r.id)} className="py-3 text-sm">{formatMoney(Number(r.amount_cents))} · {String(r.status)} · {ranchTime(String(r.created_at))}</li>)}</ul></section>}
    <details className="rounded-xl border bg-white p-5"><summary className="cursor-pointer font-bold">Reservation activity</summary><ol className="mt-4 divide-y">{events.rows.map(e => <li key={String(e.id)} className="py-3 text-sm"><p className="font-semibold">{String(e.event_type).replace(/_/g, " ")}</p><p className="mt-1 text-stone-600">{ranchTime(String(e.created_at))} · {String(e.actor)}</p></li>)}</ol><p className="mt-4 text-xs text-stone-500">Reference: {id}</p></details>
  </div>;
}
