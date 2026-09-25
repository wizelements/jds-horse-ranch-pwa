"use client";

export default function BookingRequest() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "14049812361";
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hi, I'd like to start a riding request at JD's Horse Ranch."
  )}`;

  return (
    <section id="request-ride" className="section bg-stone-50">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-ranch-brown">
            Simple reservation flow
          </p>
          <h2 className="mt-2 text-4xl font-bold text-ranch-dark">
            No long form. Start in WhatsApp.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            WhatsApp is the main reservation desk. The assistant gathers only
            the information JD needs to review your request and keeps the
            conversation together from inquiry through confirmation and
            reminders.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-ranch-dark">
              What the assistant asks for
            </h3>
            <ul className="mt-4 space-y-3 text-gray-700">
              <li>• Your name</li>
              <li>• Riding service and preferred date/time</li>
              <li>• Number of riders</li>
              <li>• Age, height, and weight for each rider</li>
              <li>• Riding experience and preparation notes</li>
              <li>• Optional email and separate marketing preference</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-ranch-dark">
              What happens next
            </h3>
            <ol className="mt-4 space-y-3 text-gray-700">
              <li>1. JD reviews the request.</li>
              <li>2. JD approves, adjusts, or declines it.</li>
              <li>3. If approved, the bot sends your secure Square payment link.</li>
              <li>4. Square independently verifies payment.</li>
              <li>5. Confirmation and reminders are sent in the same WhatsApp conversation.</li>
            </ol>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-2xl bg-green-600 px-8 py-4 text-lg font-bold text-white transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200"
          >
            Start Booking on WhatsApp
          </a>
          <p className="mt-3 text-sm text-gray-500">
            No payment is requested until JD approves your reservation.
          </p>
        </div>
      </div>
    </section>
  );
}
