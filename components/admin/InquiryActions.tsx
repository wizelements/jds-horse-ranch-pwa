"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingInquiry } from "@/lib/bookingStore";
import { dollarsToCents, ranchLocalToIso } from "@/lib/ranch";

const input = "mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-base text-stone-950";
const button = "rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50";

export default function InquiryActions({ inquiry, latePayments = [] }: { inquiry: BookingInquiry; latePayments?: { id: string; amount: number }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");
  const [date, setDate] = useState(""), [amount, setAmount] = useState(""), [duration, setDuration] = useState(60);
  const [reviewed, setReviewed] = useState(false), [note, setNote] = useState("");
  const [rescheduling, setRescheduling] = useState(false), [refunding, setRefunding] = useState(false);
  const [refundKey, setRefundKey] = useState(() => crypto.randomUUID());
  const [notes, setNotes] = useState(inquiry.qualification_notes || "");
  const [latePaymentId, setLatePaymentId] = useState(latePayments[0]?.id || "");
  const { id, status } = inquiry;
  const recovering = status === "EXPIRED" && latePayments.length > 0;

  async function run(action: string, body: Record<string, unknown> = {}) {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/inquiries/${id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...body }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The change could not be saved.");
      setNotice(result.warning || "Saved.");
      if (action === "refund") { setRefundKey(crypto.randomUUID()); setRefunding(false); }
      if (action === "reschedule") setRescheduling(false);
      router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The change could not be saved."); }
    finally { setBusy(false); }
  }
  function approve(reschedule = false) {
    try {
      const start = ranchLocalToIso(date);
      if (!reviewed) throw new Error("Review other calendars and commitments before approving this time.");
      void run(recovering ? "recover_late_payment" : reschedule ? "reschedule" : "jd_approved", { approvedStartAt: start, durationMinutes: duration, ...(recovering ? { paymentId: latePaymentId } : reschedule ? {} : { amountCents: dollarsToCents(amount) }), note, externalCalendarReviewed: reviewed });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Check the appointment details."); }
  }

  const slotForm = <div className="space-y-4 rounded-xl border border-stone-200 bg-stone-50 p-5">
    <h3 className="text-lg font-bold">{recovering ? "Recover a late payment after speaking with the customer" : rescheduling ? "Reschedule after your phone conversation" : "Approve an appointment"}</h3>
    {recovering && <label className="block text-sm font-semibold">Payment to verify<select className={input} value={latePaymentId} onChange={e => setLatePaymentId(e.target.value)}>{latePayments.map(payment => <option key={payment.id} value={payment.id}>${(payment.amount / 100).toFixed(2)} · {payment.id}</option>)}</select></label>}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold">Date and time · Eastern<input className={input} type="datetime-local" value={date} onChange={e => setDate(e.target.value)} /></label>
      <label className="text-sm font-semibold">Duration (minutes)<input className={input} type="number" min={15} max={480} step={15} value={duration} onChange={e => setDuration(Number(e.target.value))} /></label>
      {status === "PENDING_JD" && <label className="text-sm font-semibold">Approved total ($)<input className={input} inputMode="decimal" placeholder="85.00" value={amount} onChange={e => setAmount(e.target.value)} /></label>}
      <label className="text-sm font-semibold">Appointment note<input className={input} maxLength={1200} value={note} onChange={e => setNote(e.target.value)} /></label>
    </div>
    <label className="flex items-start gap-3 text-sm leading-6"><input className="mt-1 h-5 w-5 shrink-0" type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />I reviewed other calendars and commitments. Connected calendars and ranch conflicts will also be checked automatically.</label>
    <p className="text-xs leading-6 text-stone-600">One group at a time, with a 15-minute gap between ranch appointments. Payment holds last up to 24 hours and end by the appointment start time. External calendar changes can still occur after this check.</p>
    <button type="button" disabled={busy} onClick={() => approve(rescheduling)} className="rounded-lg bg-emerald-900 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : recovering ? "Verify payment and recover appointment" : rescheduling ? "Save new appointment time" : "Approve and create Square checkout"}</button>
  </div>;

  return <section aria-label="Reservation controls" className="space-y-5">
    {(status === "PENDING_JD" || recovering) && slotForm}
    {status === "AWAITING_PAYMENT" && <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
      <p className="font-semibold">Awaiting a verified payment</p><p className="mt-2 text-sm">A checkout link or customer return page does not confirm this reservation.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {!inquiry.square_payment_url && <button disabled={busy} type="button" onClick={() => void run("retry_payment_link")} className={button}>Retry payment link</button>}
        {inquiry.square_payment_url && <a className={button} href={inquiry.square_payment_url} target="_blank" rel="noopener noreferrer">Open Square checkout</a>}
        {inquiry.square_order_id && <button disabled={busy} type="button" onClick={() => void run("sync_payment")} className={button}>Check Square payment</button>}
      </div>
    </div>}
    {["BOOKED", "AWAITING_PAYMENT"].includes(status) && <div className="space-y-4">
      <div className="flex flex-wrap gap-3"><a href={`/api/admin/inquiries/${id}/calendar`} className={button}>Download appointment calendar</a><button type="button" disabled={busy} className={button} onClick={() => { setRescheduling(!rescheduling); setError(""); }}>Change appointment time</button></div>
      {rescheduling && slotForm}
    </div>}
    {inquiry.square_payment_id && <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} className={button} onClick={() => void run("sync_payment")}>Refresh payment and refunds</button><button type="button" disabled={busy} className={button} onClick={() => setRefunding(!refunding)}>Review a refund</button></div>
      {refunding && <div className="space-y-4"><p className="text-sm">Deposits are normally non-refundable. Issue an exception only when JD has approved it. Square must verify the refund before its status changes here.</p>
        <label className="block text-sm font-semibold">Refund amount ($)<input className={input} inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} /></label>
        <label className="block text-sm font-semibold">Reason<input className={input} value={note} onChange={e => setNote(e.target.value)} maxLength={192} /></label>
        <button type="button" disabled={busy} className="rounded-lg bg-red-800 px-4 py-3 font-semibold text-white disabled:opacity-50" onClick={() => {
          try { const amountCents = dollarsToCents(amount, 1); if (!note.trim()) throw new Error("Enter a refund reason."); if (window.confirm(`Issue a $${(amountCents / 100).toFixed(2)} refund through Square?`)) void run("refund", { amountCents, reason: note, requestKey: refundKey }); }
          catch (cause) { setError(cause instanceof Error ? cause.message : "Check the refund."); }
        }}>Issue refund through Square</button>
      </div>}
    </div>}
    <div className="rounded-xl border border-stone-200 bg-white p-5"><label className="block text-sm font-semibold">JD&apos;s private notes<textarea className={input} rows={4} maxLength={4000} value={notes} onChange={e => setNotes(e.target.value)} /></label><button type="button" disabled={busy} className={button + " mt-3"} onClick={() => void run("update_notes", { notes })}>Save notes</button></div>
    <div className="flex flex-wrap gap-3">
      {status === "PENDING_JD" && <button type="button" disabled={busy} className={button} onClick={() => { if (window.confirm("Decline this request? Contact the customer directly afterward.")) void run("decline", { reason: note }); }}>Decline request</button>}
      {status === "BOOKED" && <button type="button" disabled={busy || !inquiry.approved_start_at || Date.parse(inquiry.approved_start_at) > Date.now()} className={button} onClick={() => void run("complete")}>Mark ride complete</button>}
      {status === "BOOKED" && !inquiry.confirmation_sent_at && <button type="button" disabled={busy} className={button} onClick={() => void run("record_customer_confirmation")}>Record customer confirmed by phone</button>}
      {["PENDING_JD", "AWAITING_PAYMENT", "BOOKED", "COLLECTING_INFORMATION"].includes(status) && <button type="button" disabled={busy} className={button + " text-red-800"} onClick={() => { if (window.confirm("Cancel this appointment and close its checkout link? No refund will be issued automatically.")) void run("cancel", { reason: note }); }}>Cancel appointment</button>}
    </div>
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">{notice}</p>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">{error}</p>}
    <p className="text-sm text-stone-600">Call customers to share links, confirm payments, or discuss changes. These controls do not send customer messages.</p>
  </section>;
}
