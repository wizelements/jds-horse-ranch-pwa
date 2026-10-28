import Image from "next/image";

const photo = "https://jdshorseranch.com/wp-content/uploads/2020/09/image4.jpeg";

export default function CallToBook() {
  return (
    <section id="call-jd" className="section-space scroll-mt-8 bg-[#e9e1d2]" aria-labelledby="call-heading">
      <div className="wrap-wide">
        <div className="grid overflow-hidden bg-[#17342a] text-white shadow-[0_26px_80px_-45px_rgba(15,35,26,.35)] lg:grid-cols-[1fr_.8fr]">
          <div className="flex flex-col justify-center px-7 py-16 sm:px-12 lg:px-16 lg:py-24">
            <div className="mb-8 flex items-center gap-4">
              <span className="rule-brass" aria-hidden="true" />
              <p className="overline text-[#e5c79c]">Reservations start with a conversation</p>
            </div>
            <h2 id="call-heading" className="max-w-[670px] font-editorial text-[clamp(3.3rem,6vw,6.7rem)] leading-[1.03] tracking-[-.055em]">
              Every great ride <em className="text-[#e4cba5]">starts with hello.</em>
            </h2>
            <p className="mt-8 max-w-lg text-[16px] leading-8 text-[#e5ebe1]">
              No forms. No messages back and forth. Just call JD and talk about
              the experience you have in mind. He&apos;ll discuss riding options,
              availability, and what&apos;s right for your group.
            </p>
            <a href="tel:+14049812361" className="cta-light mt-10 self-start" aria-label="Call JD's Horse Ranch at 404 981 2361">
              <span aria-hidden="true">☎</span> Call JD now <span aria-hidden="true">↗</span>
            </a>
            <a href="tel:+14049812361" className="mt-6 self-start font-editorial text-[clamp(2rem,4vw,3.2rem)] tracking-[-.035em] text-white underline decoration-[#ad946b] underline-offset-8">
              (404) 981-2361
            </a>
            <p className="mt-6 max-w-md text-sm leading-6 text-[#ccd9cf]">
              By appointment only. Dates and times are discussed with JD over the phone;
              nothing is reserved until JD confirms your arrangements.
            </p>
          </div>
          <div className="relative min-h-[350px] bg-[#344e3e] lg:min-h-[660px]">
            <Image src={photo} fill sizes="(max-width: 1024px) 100vw, 44vw" alt="A scene from JD's Horse Ranch" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#11271f]/45 to-transparent" aria-hidden="true"/>
            <span className="absolute bottom-8 left-8 border-l border-[#e8d6b8] pl-5 text-[11px] font-semibold uppercase tracking-[.22em] text-white">
              Fairburn, Georgia
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
