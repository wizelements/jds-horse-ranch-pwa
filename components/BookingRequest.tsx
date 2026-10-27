"use client";

import { useState, type FormEvent } from "react";

type Result = { success?: boolean; inquiryId?: string; error?: string };

const field = "mt-1 block w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-ranch-dark focus:border-ranch-brown focus:outline-none focus:ring-2 focus:ring-amber-200";
const label = "block text-sm font-semibold text-ranch-dark";

export default function BookingRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError("");
    const form = event.currentTarget;
    const raw = new FormData(form);
    const payload = {
      customerName: String(raw.get("customerName") || ""),
      phone: String(raw.get("phone") || ""),
      email: String(raw.get("email") || ""),
      serviceRequested: String(raw.get("serviceRequested") || ""),
      riderCount: Number(raw.get("riderCount")),
      riderDetails: String(raw.get("riderDetails") || ""),
      requestedDatetimeText: String(raw.get("requestedDatetimeText") || ""),
      alternateDatetimeText: String(raw.get("alternateDatetimeText") || ""),
      experience: String(raw.get("experience") || ""),
      qualificationNotes: String(raw.get("qualificationNotes") || ""),
      marketingConsent: false,
      preferredChannel: "web",
    };
    setLoading(true);
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as Result;
      if (!response.ok || !result.inquiryId) {
        throw new Error(result.error || "Your request could not be submitted. Please call the ranch.");
      }
      setReference(result.inquiryId);
      form.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not submit your request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="request-ride" className="section scroll-mt-6 bg-stone-50">
      <div className="mx-auto max-w-5xl">
        <header className="mb-9 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-ranch-brown">By appointment</p>
          <h2 className="mt-3 text-4xl font-bold text-ranch-dark">Request your ride</h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-700">
            Tell us about your riders and the experience you have in mind.
            JD reviews every request personally. A request is not a reservation,
            and no payment is due until JD approves your visit.
          </p>
        </header>

        {reference ? (
          <div role="status" aria-live="polite" className="rounded-2xl border border-green-200 bg-white p-8 text-center shadow-sm">
            <h3 className="text-2xl font-bold text-ranch-dark">Your request was received</h3>
            <p className="mt-3 text-gray-700">JD will review it and contact you using the details you provided. Your date and time are not yet confirmed.</p>
            <p className="mt-4 break-all rounded-lg bg-stone-100 p-3 text-sm text-gray-700">
              Request reference: <strong>{reference}</strong>
            </p>
            <button type="button" className="mt-6 rounded-xl bg-ranch-dark px-6 py-3 font-semibold text-white" onClick={() => setReference(null)}>
              Submit another request
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <label className={label}>Your name <span aria-hidden="true">*</span>
                <input required maxLength={120} name="customerName" autoComplete="name" className={field} />
              </label>
              <label className={label}>Phone number <span aria-hidden="true">*</span>
                <input required name="phone" type="tel" autoComplete="tel" className={field} placeholder="(404) 555-0123" />
              </label>
              <label className={label}>Email (optional)
                <input name="email" type="email" maxLength={250} autoComplete="email" className={field} />
              </label>
              <label className={label}>Experience <span aria-hidden="true">*</span>
                <select required name="serviceRequested" defaultValue="" className={field}>
                  <option value="" disabled>Choose an experience</option>
                  <option value="Riding lesson">Riding lesson</option>
                  <option value="Guided trail ride">Guided trail ride</option>
                  <option value="Special event">Special event</option>
                </select>
              </label>
              <label className={label}>Number of riders <span aria-hidden="true">*</span>
                <input required name="riderCount" type="number" min={1} max={12} defaultValue={1} className={field} />
              </label>
              <label className={label}>Preferred date and time <span aria-hidden="true">*</span>
                <input required name="requestedDatetimeText" maxLength={300} className={field} placeholder="Saturday, Nov 7 around 11 AM" />
              </label>
              <label className={label}>Alternate date / time (optional)
                <input name="alternateDatetimeText" maxLength={300} className={field} placeholder="Another day or time that works" />
              </label>
              <label className={label}>Riding experience <span aria-hidden="true">*</span>
                <select name="experience" required defaultValue="" className={field}>
                  <option value="" disabled>Choose your experience level</option>
                  <option value="First-time rider">First-time rider</option>
                  <option value="Some experience">Some experience</option>
                  <option value="Experienced rider">Experienced rider</option>
                  <option value="Mixed group">Mixed group</option>
                </select>
              </label>
            </div>
            <label className={label}>Rider details <span aria-hidden="true">*</span>
              <span className="mt-1 block font-normal text-gray-600">For each rider, include age, height, and weight. JD uses this information to review horse and rider fit.</span>
              <textarea required name="riderDetails" rows={4} maxLength={2000} className={field} placeholder="Rider 1: age, height, weight\nRider 2: age, height, weight" />
            </label>
            <label className={label}>Anything else JD should know? (optional)
              <textarea name="qualificationNotes" rows={3} maxLength={1200} className={field} placeholder="Accessibility needs, questions, occasion, or other important details" />
            </label>
            <p className="text-sm text-gray-600">
              These details are used to review and contact you about your appointment request. The website does not collect payment information here.
            </p>
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-ranch-dark px-6 py-4 text-lg font-bold text-white transition hover:opacity-90 disabled:opacity-50">
              {loading ? "Sending request…" : "Submit ride request"}
            </button>
            <p className="text-center text-sm text-gray-500">Prefer to speak with someone? Call <a className="font-semibold underline" href="tel:+14049812361">(404) 981-2361</a>.</p>
          </form>
        )}
      </div>
    </section>
  );
}
