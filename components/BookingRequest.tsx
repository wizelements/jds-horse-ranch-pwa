"use client";

import { useState, type FormEvent } from "react";

type Result = { inquiryId?: string; error?: string };
const field = "lux-field";
const label = "lux-label";

export default function BookingRequest() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const raw = new FormData(form);
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          preferredChannel: "web"
        }),
      });
      const result = (await response.json()) as Result;
      if (!response.ok || !result.inquiryId) {
        throw new Error(result.error || "We couldn't submit your request. Please call the ranch.");
      }
      setReference(result.inquiryId);
      form.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't submit your request. Please call the ranch.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="request-ride" className="section-space scroll-mt-4 bg-[#e9e1d2]">
      <div className="wrap-wide">
        <div className="mb-12 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="overline mb-6 text-[#856b4a]">Begin your story</p>
            <h2 className="font-editorial text-[clamp(3.2rem,6vw,6.3rem)] leading-[1.04] tracking-[-.055em] text-[#183329]">
              Your next adventure <em>starts here.</em>
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-8 text-[#58645b]">
            Let us know who&apos;s riding, what you&apos;re interested in, and when you&apos;d like to visit. We&apos;ll take it from there.
          </p>
        </div>

        <div className="grid overflow-hidden border border-[#d6cbba] bg-[#f9f7f1] shadow-[0_25px_90px_-55px_rgba(15,35,26,.4)] lg:grid-cols-[.7fr_1.3fr]">
          <aside className="relative overflow-hidden bg-[#19382d] px-7 py-12 text-white sm:px-10 lg:px-12 lg:py-16">
            <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-12 h-72 w-72 rounded-full border border-white/10"/>
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-20 h-56 w-56 rounded-full border border-white/10"/>
            <p className="overline text-[#d4b995]">The reservation process</p>
            <h3 className="mt-7 max-w-sm font-editorial text-[clamp(2.8rem,4vw,4.2rem)] leading-[1.08] tracking-[-.04em]">
              Thoughtfully planned. <em>Personally reviewed.</em>
            </h3>
            <p className="mt-6 max-w-sm text-[15px] leading-8 text-[#d7e2d7]">
              Every request goes directly into JD&apos;s reservation queue. No automatic availability promises, no payment before approval.
            </p>
            <ol className="mt-12 space-y-9 border-t border-white/20 pt-10">
              <li className="flex gap-5"><span className="font-editorial text-2xl text-[#d4b995]">01</span><span><strong className="block text-[13px] uppercase tracking-[.12em]">Tell us about your ride</strong><span className="mt-2 block text-sm leading-6 text-[#c9d7cb]">Share your guests, riding experience, and ideal date.</span></span></li>
              <li className="flex gap-5"><span className="font-editorial text-2xl text-[#d4b995]">02</span><span><strong className="block text-[13px] uppercase tracking-[.12em]">JD reviews your request</strong><span className="mt-2 block text-sm leading-6 text-[#c9d7cb]">JD confirms rider fit, timing, and the total price.</span></span></li>
              <li className="flex gap-5"><span className="font-editorial text-2xl text-[#d4b995]">03</span><span><strong className="block text-[13px] uppercase tracking-[.12em]">Complete your reservation</strong><span className="mt-2 block text-sm leading-6 text-[#c9d7cb]">If approved, JD shares a secure Square payment link. Payment verification confirms your booking.</span></span></li>
            </ol>
            <div className="mt-14 border-t border-white/20 pt-7 text-sm text-[#d7e2d7]">
              Prefer to talk? <a href="tel:+14049812361" className="font-semibold text-white underline underline-offset-4">(404) 981-2361</a>
            </div>
          </aside>

          <div className="px-5 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            {reference ? (
              <div role="status" aria-live="polite" className="flex h-full flex-col items-start justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#a8b89b] text-3xl text-[#1b5134]">✓</div>
                <p className="overline mt-7 text-[#8e7650]">Request received</p>
                <h3 className="mt-4 font-editorial text-[clamp(2.8rem,5vw,4.2rem)] leading-[1.08] text-[#183329]">We look forward to <em>seeing you.</em></h3>
                <p className="mt-6 max-w-md text-[16px] leading-8 text-[#58635a]">JD will review your request and contact you using the details you provided. Your preferred date is not yet confirmed.</p>
                <div className="mt-7 w-full break-all border border-[#d7d1c7] bg-white px-5 py-4 text-sm text-[#59635c]">
                  Your request reference: <strong className="text-[#183329]">{reference}</strong>
                </div>
                <button type="button" onClick={()=>setReference(null)} className="cta-dark mt-9">Make another request <span aria-hidden="true">↗</span></button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-9">
                <div>
                  <div className="flex items-center justify-between gap-4 border-b border-[#ded7cc] pb-5">
                    <h3 className="font-editorial text-3xl tracking-[-.035em] text-[#1b362b]">Your ride request</h3>
                    <span className="text-xs font-medium text-[#69756b]">* Required</span>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-[#687067]">This form begins a request, not a confirmed appointment.</p>
                </div>
                <fieldset>
                  <legend className="overline mb-5 text-[#967a54]">01 / About you</legend>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className={label}>Full name *
                      <input className={field} name="customerName" autoComplete="name" maxLength={120} required placeholder="Your name" />
                    </label>
                    <label className={label}>Phone number *
                      <input className={field} name="phone" type="tel" autoComplete="tel" required placeholder="(404) 555-0123" />
                    </label>
                    <label className={label+" sm:col-span-2"}>Email (optional)
                      <input className={field} name="email" type="email" autoComplete="email" maxLength={250} placeholder="you@example.com" />
                    </label>
                  </div>
                </fieldset>
                <fieldset className="border-t border-[#e1d9cd] pt-8">
                  <legend className="overline text-[#967a54]">02 / The experience</legend>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <label className={label}>Experience *
                      <select className={field} required name="serviceRequested" defaultValue="">
                        <option value="" disabled>Select an experience</option>
                        <option value="Riding lesson">Riding lesson</option>
                        <option value="Guided trail ride">Guided trail ride</option>
                        <option value="Special event">Special event</option>
                      </select>
                    </label>
                    <label className={label}>Number of riders *
                      <input className={field} required type="number" name="riderCount" min={1} max={12} defaultValue={1} />
                    </label>
                    <label className={label}>Preferred date &amp; time *
                      <input className={field} name="requestedDatetimeText" required maxLength={300} placeholder="Saturday, Nov 7 around 11 AM" />
                    </label>
                    <label className={label}>Alternate date (optional)
                      <input className={field} name="alternateDatetimeText" maxLength={300} placeholder="Another date or time" />
                    </label>
                    <label className={label+" sm:col-span-2"}>Riding experience *
                      <select className={field} required name="experience" defaultValue="">
                        <option value="" disabled>Select your level</option>
                        <option value="First-time rider">First-time rider</option>
                        <option value="Some experience">Some experience</option>
                        <option value="Experienced rider">Experienced rider</option>
                        <option value="Mixed group">Mixed group</option>
                      </select>
                    </label>
                  </div>
                </fieldset>
                <fieldset className="border-t border-[#e1d9cd] pt-8">
                  <legend className="overline text-[#967a54]">03 / Rider details</legend>
                  <div className="mt-5 space-y-5">
                    <label className={label}>Age, height, and weight for each rider *
                      <span className="mt-2 block text-[12px] font-normal leading-6 text-[#69766b]">JD uses this information to review rider and horse suitability.</span>
                      <textarea className={field} name="riderDetails" rows={4} maxLength={2000} required placeholder={"Rider 1: age, height, weight\nRider 2: age, height, weight"} />
                    </label>
                    <label className={label}>Anything else we should know? (optional)
                      <textarea className={field} name="qualificationNotes" rows={3} maxLength={1200} placeholder="Occasion, questions, or helpful details" />
                    </label>
                  </div>
                </fieldset>
                <div className="border-t border-[#e1d9cd] pt-7">
                  <p className="mb-6 text-xs leading-6 text-[#637164]">We use these details to review your request and contact you. No payment details are collected here. You will not be charged at this stage.</p>
                  {error && <p role="alert" className="mb-5 border border-[#be8882] bg-[#fbefed] px-5 py-4 text-sm text-[#862b26]">{error}</p>}
                  <button className="cta-dark w-full" type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Send ride request"} <span aria-hidden="true">↗</span></button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
