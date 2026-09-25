export default function PaymentCompletePage() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-ranch-brown">
          Square checkout complete
        </p>
        <h1 className="mt-2 text-4xl font-bold text-ranch-dark">
          We&apos;re verifying your payment
        </h1>
        <p className="mt-4 text-gray-700">
          JD&apos;s Horse Ranch confirms a booking only after Square reports the
          payment as completed. You&apos;ll receive the booking confirmation through
          your selected messaging channel.
        </p>
        <div className="mt-7 rounded-xl bg-amber-50 p-5 text-amber-950">
          <p className="font-semibold">Need help?</p>
          <a href="tel:+14049812361" className="mt-2 inline-block text-xl font-bold underline">
            Call JD at (404) 981-2361
          </a>
        </div>
        <a href="/" className="mt-8 inline-block font-semibold text-ranch-brown underline">
          Return to JD&apos;s Horse Ranch
        </a>
      </div>
    </main>
  );
}
