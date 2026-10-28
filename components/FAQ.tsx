const questions = [
  {q:"Do I need horseback riding experience?",a:"First-time riders are welcome to inquire. Call JD to discuss your experience, rider needs, and the options available for your group."},
  {q:"Are walk-ins welcome?",a:"No. JD's Horse Ranch operates by appointment only. Call JD to talk through possible days and times before visiting."},
  {q:"What should I wear?",a:"Long pants and sturdy, closed-toe shoes or boots are recommended. JD will share any additional instructions when your appointment is arranged."},
  {q:"How does the reservation process work?",a:"Call JD at (404) 981-2361. Speak directly about the ride you want, your riders, and your preferred date. JD reviews availability and explains how to finalize the reservation. Nothing is confirmed until JD approves the arrangements and any required payment is verified."},
  {q:"Can I request a private ride or special event?",a:"Yes. Call JD to discuss guided rides for one, two, or three riders, or your plans for a special occasion. He will discuss the options with you personally."},
  {q:"What is the rescheduling policy?",a:"Deposits are non-refundable. Please call JD directly to discuss any changes. Rescheduling requires at least 24 hours' notice and is subject to JD's approval and availability."},
];
export default function FAQ() {
  return <section className="section-space bg-[#f8f5ee]">
    <div className="wrap-content grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
      <div>
        <div className="mb-6 flex items-center gap-4"><span className="rule-brass"/><p className="overline text-[#8d7351]">Before you ride</p></div>
        <h2 className="font-editorial text-[clamp(2.9rem,5vw,5.1rem)] leading-[1.08] tracking-[-.055em] text-[#183329]">A few things <em>to know.</em></h2>
        <p className="mt-7 max-w-sm text-[16px] leading-8 text-[#627166]">Good rides begin with thoughtful planning. Here are the details guests ask about most.</p>
        <a href="tel:+14049812361" className="mt-9 inline-flex border-b border-[#183329] pb-2 text-xs font-bold uppercase tracking-[.17em] text-[#183329]">Questions? Call the ranch ↗</a>
      </div>
      <div className="divide-y divide-[#d8d4ca] border-y border-[#d8d4ca]">
        {questions.map(({q,a},i)=><details key={q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center gap-5 text-left [&::-webkit-details-marker]:hidden">
            <span className="font-editorial text-[17px] text-[#9a835f]">0{i+1}</span>
            <span className="flex-1 text-[15px] font-semibold leading-6 text-[#1a352b] sm:text-[17px]">{q}</span>
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center border border-[#b4b9ab] text-lg text-[#183329] transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="pl-10 pr-8 pt-4 text-sm leading-7 text-[#5c685d]">{a}</p>
        </details>)}
      </div>
    </div>
  </section>;
}
