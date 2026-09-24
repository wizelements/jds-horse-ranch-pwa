"use client";

import { FormEvent, useState } from "react";

type SubmitState =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "success"; inquiryId: string; holdExpiresAt: string | null };

export default function BookingRequest() {
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setState({ kind: "idle" });

    const form = new FormData(event.currentTarget);
    const payload = {
      customerName: form.get("customerName"),
      phone: form.get("phone"),
      email: form.get("email"),
      serviceRequested: form.get("serviceRequested"),
      riderCount: form.get("riderCount"),
      riderDetails: form.get("riderDetails"),
      requestedDatetimeText: form.get("requestedDatetimeText"),
      alternateDatetimeText: form.get("alternateDatetimeText"),
      experience: form.get("experience"),
      qualificationNotes: form.get("qualificationNotes"),
      preferredChannel: form.get("preferredChannel"),
      marketingConsent: form.get("marketingConsent") === "on",
    };

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not submit request.");

      setState({
        kind: "success",
        inquiryId: result.inquiryId,
        holdExpiresAt: result.holdExpiresAt || null,
      });
      event.currentTarget.reset();
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Could not submit request.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (state.kind === "success") {
    return (
      <section id="request-ride" className="section bg-stone-50">
        <div className="mx-auto max-w-3xl rounded-2xl border border-green-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
            Request received
          </p>
          <h2 className="mt-2 text-3xl font-bold text-ranch-dark">
            Your request is waiting for JD&apos;s review
          </h2>
          <p className="mt-4 text-gray-700">
            No payment is due yet. JD personally confirms the final ride time and
            amount before the system creates a Square payment link.
          </p>
          <div className="mt-6 rounded-xl bg-amber-50 p-5 text-amber-950">
            <p className="font-semibold">Next step: call JD within 24 hours.</p>
            <a
              href="tel:+14049812361"
              className="mt-2 inline-block text-xl font-bold underline"
            >
              (404) 981-2361
            </a>
            {state.holdExpiresAt && (
              <p className="mt-2 text-sm">
                Provisional hold ends: {new Date(state.holdExpiresAt).toLocaleString()}
              </p>
            )}
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Request reference: {state.inquiryId}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="request-ride" className="section bg-stone-50">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-ranch-brown">
            Reservation Assistant
          </p>
          <h2 className="mt-2 text-4xl font-bold text-ranch-dark">
            Request a riding appointment
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Send the details once. JD reviews every request personally. Your
            preferred spot is held for up to 24 hours while you call JD, and no
            payment request is created until he approves.
          </p>
        </div>

        <form onSubmit={submit} className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-stone-200">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Full name" name="customerName" required />
            <Field label="Phone" name="phone" type="tel" required />
            <Field label="Email (optional)" name="email" type="email" />
            <label className="block text-sm font-medium text-gray-800">
              Service
              <select
                name="serviceRequested"
                required
                defaultValue=""
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
              >
                <option value="" disabled>Select a service</option>
                <option>Riding Lesson</option>
                <option>Trail Ride</option>
                <option>Special Event</option>
              </select>
            </label>

            <Field
              label="Number of riders"
              name="riderCount"
              type="number"
              min="1"
              max="12"
              required
            />
            <label className="block text-sm font-medium text-gray-800">
              Preferred reply channel
              <select
                name="preferredChannel"
                defaultValue="whatsapp"
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">Text message</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-800 md:col-span-2">
              Rider details
              <textarea
                name="riderDetails"
                required
                rows={3}
                placeholder="For each rider: age, height, and weight. Example: Rider 1 — age 24, 5'6, 150 lb."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-3"
              />
            </label>

            <Field
              label="Preferred date/time (Atlanta time)"
              name="requestedDatetimeText"
              type="datetime-local"
              required
            />
            <Field
              label="Alternate date/time (optional)"
              name="alternateDatetimeText"
              type="datetime-local"
            />

            <label className="block text-sm font-medium text-gray-800">
              Riding experience
              <select
                name="experience"
                required
                defaultValue=""
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-3"
              >
                <option value="" disabled>Select experience</option>
                <option>First time</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Experienced</option>
                <option>Mixed group</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-gray-800">
              Anything JD should discuss with you? (optional)
              <textarea
                name="qualificationNotes"
                rows={2}
                placeholder="Scheduling, preparation, or other details."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-3"
              />
            </label>
          </div>

          <label className="mt-5 flex items-start gap-3 text-sm text-gray-600">
            <input name="marketingConsent" type="checkbox" className="mt-1" />
            <span>
              I would like occasional promotions from JD&apos;s Horse Ranch.
              Operational booking messages do not depend on this choice.
            </span>
          </label>

          {state.kind === "error" && (
            <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-ranch-brown px-5 py-4 text-lg font-bold text-white hover:bg-ranch-dark disabled:opacity-60"
          >
            {submitting ? "Submitting request..." : "Send request to JD"}
          </button>

          <p className="mt-3 text-center text-xs text-gray-500">
            This is a request, not a confirmed booking. JD approves the final
            time and price before payment.
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  min,
  max,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block text-sm font-medium text-gray-800">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        max={max}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-3"
      />
    </label>
  );
}
