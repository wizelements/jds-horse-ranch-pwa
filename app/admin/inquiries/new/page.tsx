"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const field = "mt-2 block w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200";
const label = "block text-sm font-semibold text-stone-900";

export default function RecordPhoneCallPage() {
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [alreadyOpen, setAlreadyOpen] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setError("");
    setAlreadyOpen(false);
    setSaving(true);
    try {
      const response = await fetch("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: data.get("customerName"),
          phone: data.get("phone"),
          serviceRequested: data.get("serviceRequested"),
          riderCount: Number(data.get("riderCount")),
          riderDetails: data.get("riderDetails"),
          requestedDatetimeText: data.get("requestedDatetimeText"),
          experience: data.get("experience"),
          qualificationNotes: data.get("qualificationNotes"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.existingId) setAlreadyOpen(true);
        throw new Error(result.error || "Could not save the call.");
      }
      setSavedId(result.inquiryId);
      form.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the call.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="mx-auto max-w-3xl space-y-7">
    <header>
      <p className="text-sm font-bold uppercase tracking-widest text-emerald-800">JD&apos;s private ranch workspace</p>
      <h1 className="mt-2 text-3xl font-bold text-stone-900">Record a phone conversation</h1>
      <p className="mt-3 text-stone-700">Guests call JD directly. This private owner-only entry lets JD keep track of what was discussed; customers never fill out a booking form.</p>
    </header>
    {savedId ? (
      <div role="status" className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-emerald-900">Conversation saved</h2>
        <p className="mt-3 text-stone-700">The record is ready for JD&apos;s review. No appointment was automatically confirmed and no message was sent.</p>
        <p className="mt-4 break-all text-sm text-stone-600">Reference: {savedId}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/admin/inquiries" className="rounded-lg bg-emerald-900 px-5 py-3 text-sm font-bold text-white">Open reservation queue</Link>
          <button type="button" onClick={() => setSavedId(null)} className="rounded-lg border border-stone-300 px-5 py-3 text-sm font-bold">Record another call</button>
        </div>
      </div>
    ) : (
      <form onSubmit={save} className="space-y-7 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className={label}>Caller name *
            <input className={field} name="customerName" autoComplete="name" maxLength={120} required />
          </label>
          <label className={label}>Phone number *
            <input className={field} name="phone" type="tel" autoComplete="tel" placeholder="(404) 555-0123" required />
          </label>
          <label className={label}>Experience discussed *
            <select className={field} name="serviceRequested" required defaultValue="">
              <option value="" disabled>Choose experience</option>
              <option value="Riding lesson">Riding lesson</option>
              <option value="Guided trail ride">Guided trail ride</option>
              <option value="Special event">Special event</option>
              <option value="General inquiry">General inquiry</option>
            </select>
          </label>
          <label className={label}>Number of riders *
            <input className={field} name="riderCount" type="number" min={1} max={12} defaultValue={1} required />
          </label>
          <label className={label+" sm:col-span-2"}>Date or time discussed (optional)
            <input className={field} name="requestedDatetimeText" maxLength={300} placeholder="Saturday around 11 AM, or still deciding" />
          </label>
          <label className={label+" sm:col-span-2"}>Rider details (optional)
            <textarea className={field} name="riderDetails" rows={3} maxLength={2000} placeholder="Rider ages, experience, size, special considerations" />
          </label>
          <label className={label+" sm:col-span-2"}>Riding experience (optional)
            <input className={field} name="experience" maxLength={800} placeholder="Beginners, experienced, mixed group" />
          </label>
          <label className={label+" sm:col-span-2"}>What was discussed? (optional)
            <textarea className={field} name="qualificationNotes" rows={4} maxLength={1200} placeholder="JD's notes, customer requests, details to follow up on" />
          </label>
        </div>
        {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}
          {alreadyOpen && <Link href="/admin/inquiries" className="ml-2 font-bold underline">Review existing request</Link>}
        </div>}
        <button type="submit" disabled={saving} className="w-full rounded-xl bg-emerald-900 px-5 py-4 font-bold text-white disabled:opacity-50">
          {saving ? "Saving…" : "Save phone conversation"}
        </button>
        <p className="text-xs text-stone-600">Private record only. No phone call, payment, customer message, or confirmed reservation is generated by this action.</p>
      </form>
    )}
  </div>;
}
