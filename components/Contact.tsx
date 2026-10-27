export default function Contact() {
  return <footer id="plan-visit" className="bg-[#11251f] text-[#f7f3e8]">
    <div className="wrap-wide border-b border-white/20 py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[1.35fr_.65fr] lg:items-end">
        <div><p className="overline mb-7 text-[#c6ae88]">We&apos;ll see you out here</p>
          <h2 className="max-w-3xl font-editorial text-[clamp(3.2rem,7vw,7.7rem)] leading-[.99] tracking-[-.06em]">The country <em className="text-[#dbc4a0]">is calling.</em></h2>
          <p className="mt-7 max-w-lg text-[16px] leading-8 text-[#cdd6cb]">Bring your curiosity, your people, or simply yourself. Tell us when you&apos;d like to ride and JD will take it from there.</p>
        </div>
        <div className="flex flex-col items-start gap-5 lg:items-end">
          <a href="#request-ride" className="cta-light">Request your ride <span aria-hidden="true">↗</span></a>
          <p className="text-xs uppercase tracking-[.18em] text-[#cbd3c7]">Reservations by appointment only</p>
        </div>
      </div>
    </div>
    <div className="wrap-wide grid gap-12 border-b border-white/15 py-14 md:grid-cols-[1.1fr_1fr_1fr]">
      <div>
        <a href="/" className="inline-flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center border border-[#bda27b] font-editorial text-2xl text-[#e7d0a7]">JD</span><span className="text-sm font-semibold uppercase tracking-[.19em]">Horse Ranch</span></a>
        <p className="mt-5 max-w-xs text-sm leading-7 text-[#c6d0c5]">Western riding lessons, guided trail rides, and special moments in Fairburn, Georgia.</p>
      </div>
      <div><h3 className="overline mb-6 text-[#c6ae88]">Find us</h3><address className="not-italic text-[15px] leading-8 text-[#edf0e8]">7555 Jones Road<br/>Fairburn, GA 30213</address>
        <a href="https://www.google.com/maps/search/?api=1&query=7555+Jones+Rd+Fairburn+GA+30213" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex border-b border-[#a7b9a5] pb-1 text-xs font-bold uppercase tracking-[.13em]">Get directions ↗</a>
      </div>
      <div><h3 className="overline mb-6 text-[#c6ae88]">Say hello</h3>
        <a href="tel:+14049812361" className="block font-editorial text-2xl hover:text-[#ddc29e]">(404) 981-2361</a>
        <a href="mailto:jdshorseranch@gmail.com" className="mt-3 block break-all text-sm text-[#e2e6dc] underline underline-offset-4">jdshorseranch@gmail.com</a>
        <div className="mt-7 flex gap-6 text-xs font-semibold uppercase tracking-[.14em]"><a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/Jdshorseranch/" className="hover:text-[#ddc29e]">Facebook</a><a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/jdshorseranch/" className="hover:text-[#ddc29e]">Instagram</a></div>
      </div>
    </div>
    <div className="wrap-wide flex flex-wrap items-center justify-between gap-4 py-7 text-[10px] uppercase tracking-[.17em] text-[#bbc6b9]">
      <span>© 2026 JD&apos;s Horse Ranch. All rights reserved.</span><span>Fairburn, Georgia · By appointment</span>
    </div>
  </footer>;
}
