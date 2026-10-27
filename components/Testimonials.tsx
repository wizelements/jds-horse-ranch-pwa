const voices = [
  {quote:"JD is a great instructor. He makes sure everyone feels confident and safe going out on the trail. Their views are beautiful.",attribution:"Rebecca L."},
  {quote:"Had a great time! Everyone was so welcoming, we were taught how to properly hold the reigns and place our feet before going on the trail.",attribution:"Akeela M."},
  {quote:"The horses were so gentle, and the tour breath taking. A very great program for everyone.",attribution:"Sylvester S."},
];
export default function Testimonials() {
  return <section className="section-space bg-[#eae2d4]">
    <div className="wrap-content">
      <header className="mb-14 text-center">
        <p className="overline mb-5 text-[#8c7553]">From our guests</p>
        <h2 className="font-editorial text-[clamp(2.9rem,5.5vw,5.5rem)] leading-[1.08] tracking-[-.055em] text-[#183329]">The memories <em>ride home with you.</em></h2>
      </header>
      <div className="grid gap-5 md:grid-cols-3">
        {voices.map(v=><figure key={v.attribution} className="flex flex-col border-t border-[#a98f66] bg-[#faf7ef] px-7 pb-8 pt-7">
          <span className="font-editorial text-6xl leading-none text-[#a98f66]" aria-hidden="true">“</span>
          <blockquote className="mt-2 flex-1 font-editorial text-[20px] leading-[1.55] text-[#283d30]">{v.quote}</blockquote>
          <figcaption className="mt-8 border-t border-[#e2d8c7] pt-5 text-[11px] font-bold uppercase tracking-[.18em] text-[#826c4c]">{v.attribution}</figcaption>
        </figure>)}
      </div>
      <p className="mt-7 text-center text-xs text-[#687469]">Excerpts from guest comments published by JD&apos;s Horse Ranch.</p>
    </div>
  </section>;
}
