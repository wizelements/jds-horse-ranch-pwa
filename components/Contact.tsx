export default function Contact() {
  return (
    <section id="plan-visit" className="section bg-ranch-dark text-white">
      <h2 className="mb-4 text-center text-4xl font-bold">Plan your visit</h2>
      <p className="mx-auto mb-12 max-w-2xl text-center text-gray-300">
        JD&apos;s Horse Ranch welcomes guests by appointment. Send a request online or contact the ranch directly with questions.
      </p>
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3">
        <div className="text-center">
          <h3 className="mb-4 text-xl font-bold">Ride reservations</h3>
          <a href="#request-ride" className="inline-block rounded-xl bg-amber-100 px-5 py-3 font-bold text-ranch-dark hover:bg-white">Request a ride</a>
          <p className="mt-3 text-sm text-gray-300">JD personally reviews each request before payment or confirmation.</p>
        </div>
        <div className="text-center">
          <h3 className="mb-4 text-xl font-bold">Find the ranch</h3>
          <p className="text-gray-300">7555 Jones Rd<br />Fairburn, GA 30213</p>
          <a href="https://www.google.com/maps/search/?api=1&query=7555+Jones+Rd+Fairburn+GA+30213" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-amber-200 underline">Directions</a>
        </div>
        <div className="text-center">
          <h3 className="mb-4 text-xl font-bold">Call or email</h3>
          <p><a className="text-amber-200 underline" href="tel:+14049812361">(404) 981-2361</a></p>
          <p className="mt-2"><a className="break-all text-amber-200 underline" href="mailto:jdshorseranch@gmail.com">jdshorseranch@gmail.com</a></p>
          <p className="mt-4 text-sm text-gray-300">Follow us on <a className="underline" target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/Jdshorseranch/">Facebook</a> or <a className="underline" target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/jdshorseranch/">Instagram</a>.</p>
        </div>
      </div>
      <p className="mt-12 text-center text-sm text-gray-400">© 2026 JD&apos;s Horse Ranch. All rights reserved.</p>
    </section>
  );
}
