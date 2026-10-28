const image = "https://jdshorseranch.com/wp-content/uploads/2020/09/image0.jpeg";
export default function Hero() {
  return <section className="relative isolate flex min-h-[740px] flex-col overflow-hidden bg-[#10231e] text-white lg:min-h-[830px]">
    <div aria-hidden="true" className="absolute inset-0 -z-20 bg-cover bg-center" style={{backgroundImage:`url("${image}")`}} />
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#10231e]/95 via-[#10231e]/75 to-[#10231e]/25" />
    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[#bda27b]" />
    <header className="wrap-wide z-10 flex items-center justify-between gap-4 border-b border-white/20 py-6 lg:py-8">
      <a href="/" aria-label="JD's Horse Ranch home" className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center border border-[#c3a579] font-editorial text-[22px] text-[#f6e5c7]">JD</span>
        <span className="flex flex-col gap-1"><span className="text-[13px] font-semibold uppercase tracking-[.18em]">Horse Ranch</span><span className="text-[9px] uppercase tracking-[.26em] text-[#dbc6a4]">Fairburn · Georgia</span></span>
      </a>
      <nav aria-label="Primary navigation" className="hidden gap-8 text-[11px] font-semibold uppercase tracking-[.16em] text-stone-100 md:flex">
        <a href="#about-ranch" className="hover:text-[#efd5a7]">Our Ranch</a>
        <a href="#experiences" className="hover:text-[#efd5a7]">Experiences</a>
        <a href="#gallery" className="hover:text-[#efd5a7]">Gallery</a>
        <a href="#plan-visit" className="hover:text-[#efd5a7]">Visit</a>
      </nav>
      <a href="tel:+14049812361" className="hidden border border-white/60 px-5 py-3 text-[11px] font-bold uppercase tracking-[.16em] hover:bg-white hover:text-[#183329] sm:inline-flex">Call to Book</a>
      <a href="tel:+14049812361" className="border border-white/60 px-3 py-2 text-[10px] font-bold uppercase tracking-widest sm:hidden">Call JD</a>
    </header>
    <div className="wrap-wide z-10 flex flex-1 items-center py-24 sm:py-32">
      <div className="max-w-[830px]">
        <div className="mb-8 flex items-center gap-4"><span className="rule-brass" /><p className="overline text-[#ebd3ab]">An invitation to slow down</p></div>
        <h1 className="font-editorial text-[clamp(3.55rem,8vw,8.3rem)] leading-[.98] tracking-[-.055em]">Come for the ride.<br /><em className="font-normal text-[#e6cfa9]">Stay for the feeling.</em></h1>
        <p className="mt-9 max-w-[560px] text-base leading-8 text-[#f4f1ec]/90 sm:text-lg">Just outside Atlanta, discover a more beautiful pace of life. Guided trail rides, riding lessons, and moments worth remembering in the Georgia countryside.</p>
        <div className="mt-11 flex flex-wrap items-center gap-6">
          <a href="#request-ride" className="cta-light">Call JD to Ride <span aria-hidden="true">↗</span></a>
          <a href="#experiences" className="border-b border-white/70 pb-1 text-xs font-bold uppercase tracking-[.15em] hover:text-[#e6cfa9]">Explore Experiences</a>
        </div>
      </div>
    </div>
    <div className="wrap-wide z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/20 py-6 text-[10px] font-semibold uppercase tracking-[.18em] text-stone-200">
      <span>7555 Jones Road · Fairburn, GA</span><span>Speak directly with JD · (404) 981-2361</span><a href="#about-ranch" className="hidden md:inline-flex">Discover the ranch ↓</a>
    </div>
  </section>;
}
