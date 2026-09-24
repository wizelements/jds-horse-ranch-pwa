"use client";

export default function Hero() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "14049812361";
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hi, I'd like to request a riding appointment at JD's Horse Ranch."
  )}`;

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
          Our WhatsApp reservation assistant collects the basics, sends your
          request to JD for review, and keeps your booking updates in one place.
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
            className="block w-full rounded-2xl bg-green-600 px-6 py-5 text-xl font-bold text-white transition hover:bg-green-700"
          >
            Start on WhatsApp
          </a>

          <div className="mt-6 grid gap-3 text-left text-sm text-gray-100 sm:grid-cols-3">
            <div className="rounded-xl bg-black/20 p-4">
              <strong className="block text-white">1. Tell us about you</strong>
              Name, email, service, date, and rider height/weight.
            </div>
            <div className="rounded-xl bg-black/20 p-4">
              <strong className="block text-white">2. JD reviews it</strong>
              JD confirms the time and price before payment is requested.
            </div>
            <div className="rounded-xl bg-black/20 p-4">
              <strong className="block text-white">3. Confirm + connect</strong>
              After payment confirms the appointment, you&apos;ll get JD&apos;s
              number for a personal rider conversation.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
