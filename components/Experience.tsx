export default function Experience() {
  return <section id="about-ranch" className="section-space bg-[#f8f5ee]">
    <div className="wrap-content grid items-center gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-24">
      <div>
        <div className="mb-7 flex items-center gap-4"><span className="rule-brass"/><p className="overline text-[#8d7351]">The JD&apos;s experience</p></div>
        <h2 className="font-editorial text-[clamp(3rem,5vw,5.4rem)] leading-[1.08] tracking-[-.055em] text-[#183329]">A little more <em className="text-[#917b58]">room to breathe.</em></h2>
        <p className="mt-8 max-w-md text-[16px] leading-8 text-[#576157]">Trade the rush of the everyday for the rhythm of the trail. Whether this is your first time in the saddle or a familiar place to return, JD&apos;s Horse Ranch offers time to connect with horses and enjoy the country.</p>
        <p className="mt-5 max-w-md text-[16px] leading-8 text-[#576157]">Every riding request is personally reviewed by JD so the experience can be planned with your riders in mind.</p>
        <a href="tel:+14049812361" className="mt-8 inline-flex items-center gap-4 border-b border-[#183329] pb-2 text-xs font-bold uppercase tracking-[.15em]">Talk with JD about riding <span aria-hidden="true">↗</span></a>
      </div>
      <div className="relative">
        <div aria-hidden="true" className="absolute -bottom-5 -left-5 hidden h-[60%] w-2/5 border border-[#cbb991] lg:block" />
        <div className="relative aspect-[5/4] overflow-hidden bg-[#213a2c]">
          <iframe src="https://www.youtube-nocookie.com/embed/V4Smr8pqwoY" title="A look at the JD's Horse Ranch experience" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="absolute inset-0 h-full w-full"/>
        </div>
        <p className="relative mt-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.17em] text-[#81745e]"><span className="rule-brass"/> A look inside the ranch</p>
      </div>
    </div>
  </section>;
}
