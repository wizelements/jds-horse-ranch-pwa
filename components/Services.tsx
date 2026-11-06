import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/lib/types";

const art: Record<string, { lead: string; image: string; alt: string }> = {
  "service-riding-lessons": { lead: "Find your confidence in the saddle.", image: "/photos/ranch-2.jpg", alt: "A rider on a brown horse with a guide standing next to them" },
  "service-trail-rides": { lead: "Take the scenic route.", image: "/photos/ranch-7.jpg", alt: "A group of mounted riders and children outside a ranch stable in an archival photo" },
  "service-special-events": { lead: "Make moments worth remembering.", image: "/photos/ranch-8.jpg", alt: "A guest smiling beside birthday cupcakes at an outdoor ranch celebration" },
};
const detailsHref: Record<string, string> = {
  "service-riding-lessons": "/horseback-riding-lessons-fairburn-ga",
  "service-trail-rides": "/guided-horseback-trail-rides-fairburn-ga",
  "service-special-events": "/horseback-riding-special-events-fairburn-ga",
};
const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: value % 1 ? 2 : 0 }).format(value);

export default function Services({ services }: { services: Service[] }) {
  return <section id="experiences" className="section-space bg-white">
    <div className="wrap-wide">
      <header className="mb-12 flex flex-col justify-between gap-8 lg:mb-16 lg:flex-row lg:items-end">
        <div><p className="overline mb-5 text-[#8d7351]">Ways to ride</p><h2 className="font-editorial text-[clamp(3rem,6vw,6.3rem)] leading-[1.06] tracking-[-.055em] text-[#183329]">Your time. <em>Your experience.</em></h2></div>
        <p className="max-w-sm text-[15px] leading-7 text-[#606d63]">Whether you&apos;re starting with riding lessons or planning a trail ride near Atlanta, compare the options and published prices before calling JD about an appointment.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-3">
        {services.map((ride, index) => {
          const image = art[ride.id] || { lead: "Make time for the country.", image: "/photos/ranch-0.jpg", alt: "A handler and chestnut horse at the ranch" };
          return <article key={ride.id} className="group flex flex-col border border-[#e7e2d8] bg-[#fdfcf9]">
            <div className="relative aspect-[1.23/1] overflow-hidden bg-[#d5dccf]">
              <Image src={image.image} alt={image.alt} fill sizes="(max-width:1024px) 100vw,33vw" className="photo-zoom object-cover" />
              <span className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center bg-[#f9f5ea] font-editorial text-lg text-[#183329]">{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="flex flex-1 flex-col px-6 pb-8 pt-8 sm:px-8">
              <h3 className="font-editorial text-[clamp(2rem,3vw,2.6rem)] leading-tight tracking-[-.045em] text-[#183329]">{ride.name}</h3>
              <p className="mt-4 text-[15px] font-semibold text-[#8b7454]">{image.lead}</p>
              <p className="mt-4 flex-1 text-sm leading-7 text-[#667068]">{ride.description}</p>
              <div className="mt-8 border-t border-[#e4dfd4] pt-5">
                <p className="text-sm font-bold text-[#273b30]">{ride.duration_minutes ? `${ride.duration_minutes} minutes · ` : ""}{ride.price_min != null ? `From ${money(ride.price_min)}` : "Call JD for pricing"}</p>
                {ride.price_detail && <p className="mt-1 text-xs leading-5 text-[#697168]">{ride.price_detail}</p>}
              </div>
              {detailsHref[ride.id] && <Link href={detailsHref[ride.id]} className="mt-5 inline-flex text-sm font-semibold text-[#183329] underline underline-offset-4 hover:text-[#806745]">View {ride.name.toLowerCase()} details &amp; prices</Link>}
              <a href="tel:+14049812361" className="mt-7 flex items-center justify-between border-b border-[#87978a] pb-3 text-[11px] font-bold uppercase tracking-[.14em] text-[#183329] hover:border-[#ad946b] hover:text-[#806745]">Ask JD about availability <span aria-hidden="true" className="text-lg font-normal">↗</span></a>
            </div>
          </article>;
        })}
      </div>
      {services.length === 0 && <p className="text-center text-stone-700">Call JD to discuss the experiences currently available.</p>}
      <p className="mt-7 text-center text-sm"><Link href="/visit-jds-horse-ranch-fairburn-ga" className="font-semibold text-[#183329] underline underline-offset-4">Plan your visit and get directions to the ranch</Link></p>
      <p className="mt-7 text-center text-xs leading-6 text-[#697168]">By appointment only. Deposits are non-refundable. Rescheduling requires at least 24 hours&apos; notice and JD&apos;s approval.</p>
    </div>
  </section>;
}
