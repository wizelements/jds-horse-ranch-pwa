const heroPhoto="https://jds-horse-ranch-v1751084549.websitepro-cdn.com/wp-content/uploads/2020/09/image0.jpeg";
export default function Hero() {
  return <section className="relative isolate flex min-h-[86vh] flex-col overflow-hidden bg-[#17372b] text-white">
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center opacity-45" style={{backgroundImage:`url("${heroPhoto}")`}} />
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#102a23]/95 via-[#102a23]/70 to-[#102a23]/20" />
    <nav aria-label="Main navigation" className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
      <a href="/" className="text-lg font-bold tracking-wide sm:text-xl">JD&apos;S HORSE RANCH</a>
      <div className="flex flex-wrap items-center gap-4 text-sm font-medium sm:gap-7">
        <a href="#experiences" className="hover:underline">Experiences</a>
        <a href="#about-ranch" className="hover:underline">Our Ranch</a>
        <a href="#plan-visit" className="hover:underline">Plan Your Visit</a>
      </div>
    </nav>
    <div className="mx-auto flex w-full max-w-7xl flex-1 items-center px-5 py-16 sm:px-8">
      <div className="max-w-2xl">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.19em] text-amber-100">Fairburn, Georgia · By appointment</p>
        <h1 className="text-5xl font-bold leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">Step away from the city. Ride into the country.</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-100 sm:text-xl">
          Discover riding lessons, guided trail rides, and time well spent with horses at JD&apos;s Horse Ranch.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <a href="#request-ride"
            className="inline-flex items-center justify-center rounded-xl bg-[#f4e6c7] px-6 py-4 text-base font-bold text-[#17372b] transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-white/50">Request a Ride</a>
          <a href="#experiences" className="inline-flex items-center justify-center rounded-xl border border-white/70 bg-white/10 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/50">Explore Experiences</a>
        </div>
        <p className="mt-6 text-sm text-stone-100">Every request is personally reviewed by JD. Your reservation is confirmed after approval and verified payment.</p>
      </div>
    </div>
  </section>;
}
