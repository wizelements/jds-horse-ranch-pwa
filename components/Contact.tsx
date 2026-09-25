"use client";

function whatsappUrl(message: string) {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "14049812361";
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export default function Contact() {
  const whatsappHref = whatsappUrl(
    "Hi, I'd like to start a riding request at JD's Horse Ranch."
  );

  return (
    <section className="section bg-ranch-dark text-white">
      <h2 className="mb-4 text-center text-4xl font-bold">Contact & Location</h2>
      <p className="mx-auto mb-12 max-w-2xl text-center text-gray-300">
        Booking is handled through WhatsApp so your request, JD&apos;s review,
        payment, and confirmation stay together in one conversation.
      </p>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="text-center">
          <h3 className="mb-4 text-xl font-bold">Book on WhatsApp</h3>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            Start Booking
          </a>
          <p className="mt-3 text-sm text-gray-300">
            This is the primary way to request an appointment.
          </p>
        </div>

        <div className="text-center">
          <h3 className="mb-4 text-xl font-bold">Address</h3>
          <p className="text-gray-300">
            7555 Jones Rd
            <br />
            Fairburn, GA 30213
          </p>
          <a
            href="https://goo.gl/maps/x1ek6hiBF7yAnojt8"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-yellow-400 hover:underline"
          >
            Open in Maps
          </a>
        </div>

        <div className="text-center">
          <h3 className="mb-4 text-xl font-bold">Contact Information</h3>
          <p className="text-gray-300">(404) 981-2361</p>
          <a
            href="mailto:jdshorseranch@gmail.com"
            className="mt-2 inline-block break-all text-yellow-400 hover:text-yellow-300"
          >
            jdshorseranch@gmail.com
          </a>
          <p className="mt-3 text-sm text-gray-400">
            Phone and email are provided for general contact. Reservation
            requests should begin in WhatsApp.
          </p>
        </div>

        <div className="text-center">
          <h3 className="mb-4 text-xl font-bold">Follow JD&apos;s Ranch</h3>
          <div className="flex flex-col items-center gap-3">
            <a
              href="https://www.facebook.com/Jdshorseranch/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 transition hover:text-white"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com/jdshorseranch/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 transition hover:text-white"
            >
              Instagram
            </a>
            <a
              href="https://www.youtube.com/channel/UCDSI825ADeouC31jTQmlgyQ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 transition hover:text-white"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>

      <p className="mt-12 text-center text-sm text-gray-400">
        © 2026 JD&apos;s Horse Ranch. All rights reserved.
      </p>
    </section>
  );
}
