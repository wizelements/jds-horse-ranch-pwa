"use client";

interface HeroProps {
  onCall: () => void;
  isLoading: boolean;
}

export default function Hero({ onCall, isLoading }: HeroProps) {
  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-ranch-brown to-ranch-dark flex flex-col justify-center items-center text-center text-white px-4 py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-300 mb-4">
          Fairburn, Georgia
        </p>
        <h1 className="text-5xl md:text-6xl font-bold mb-4">JD&apos;s Horse Ranch</h1>
        <p className="text-xl md:text-2xl mb-6 text-gray-200">
          Atlanta Horseback Riding
        </p>
        <p className="text-lg mb-8 text-gray-300">
          Come take a break from busy city living, slow down, and enjoy the country life.
        </p>

        <div className="bg-yellow-600 bg-opacity-90 rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-2">7555 Jones Rd. Fairburn, GA</h2>
          <p className="text-sm mb-6 font-semibold">BY APPOINTMENT ONLY • NO WALK-INS</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="#request-ride"
              className="rounded-lg bg-ranch-dark px-5 py-4 text-lg font-bold text-white hover:opacity-90"
            >
              Request a Ride
            </a>
            <button
              onClick={onCall}
              disabled={isLoading}
              className="call-btn w-full text-lg"
            >
              {isLoading ? "Connecting..." : "Call JD: (404) 981-2361"}
            </button>
          </div>
          <p className="mt-4 text-sm">
            Requests are held up to 24 hours for JD&apos;s personal review. No payment before approval.
          </p>
        </div>
      </div>
    </section>
  );
}
