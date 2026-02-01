"use client";

interface HeroProps {
  onCall: () => void;
  isLoading: boolean;
}

export default function Hero({ onCall, isLoading }: HeroProps) {
  return (
    <section className="relative w-full h-screen bg-gradient-to-br from-ranch-brown to-ranch-dark flex flex-col justify-center items-center text-center text-white px-4">
      <div className="max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">JD&apos;s Horse Ranch</h1>
        <p className="text-xl md:text-2xl mb-6 text-gray-200">
          Atlanta Horseback Riding
        </p>
        <p className="text-lg mb-8 text-gray-300">
          Come take a break from your busy city living and slow down to enjoy the country life.
        </p>

        <div className="bg-yellow-600 bg-opacity-90 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">We Have Moved</h2>
          <p className="text-lg mb-4">7555 Jones Rd. Fairburn, GA</p>
          <p className="text-sm mb-6">BY APPOINTMENT ONLY • NO WALK-INS</p>

          <button
            onClick={onCall}
            disabled={isLoading}
            className="call-btn w-full text-xl"
          >
            {isLoading ? "Connecting..." : "Call Now: (404) 981-2361"}
          </button>
        </div>
      </div>
    </section>
  );
}
