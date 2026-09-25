"use client";

function whatsappUrl(message: string) {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "14049812361";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export default function Hero() {
  const whatsappHref = whatsappUrl(
    "Hi, I'd like to start a riding request at JD's Horse Ranch."
  );

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-ranch-brown to-ranch-dark px-4 py-16 text-center text-white">
      <div className="max-w-4xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-yellow-300">
          Fairburn, Georgia
        </p>
        <h1 className="mb-4 text-5xl font-bold md:text-7xl">
          JD&apos;s Horse Ranch
        </h1>
        <p className="mb-4 text-2xl text-gray-100 md:text-3xl">
          Start your riding request on WhatsApp
        </p>
        <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-gray-300">
          Tell our reservation assistant who is riding and when you would like
          to come. JD personally reviews every request before a time and price
          are finalized. Payment is requested only after approval.
        </p>

        <div className="mx-auto max-w-2xl rounded-3xl bg-white/10 p-6 shadow-2xl backdrop-blur md:p-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-wider text-yellow-300">
            By appointment only · No walk-ins
          </p>
          <h2 className="mb-5 text-2xl font-bold">
            7555 Jones Rd. Fairburn, GA
          </h2>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-2xl bg-green-600 px-6 py-5 text-xl font-bold text-white transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            Start Booking on WhatsApp
          </a>

          <p className="mt-3 text-sm text-gray-200">
            Your request, JD&apos;s decision, payment link, confirmation, and
            reminders stay in the same WhatsApp conversation.
          </p>

          <div className="mt-6 grid gap-3 text-left text-sm text-gray-100 sm:grid-cols-3">
            <div className="rounded-xl bg-black/20 p-4">
              <strong className="block text-white">1. Send your request</strong>
              Choose a service and provide each rider&apos;s age, height,
              weight, experience, and preferred date.
            </div>
            <div className="rounded-xl bg-black/20 p-4">
              <strong className="block text-white">2. JD reviews it</strong>
              JD personally approves, adjusts, or declines the request. Any
              update comes back to you in WhatsApp.
            </div>
            <div className="rounded-xl bg-black/20 p-4">
              <strong className="block text-white">3. Pay after approval</strong>
              Only after JD approves does the system send your secure,
              booking-specific Square checkout link.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
