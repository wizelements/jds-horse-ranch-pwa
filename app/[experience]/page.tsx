import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ranchPages } from "@/lib/ranchPages";
import { absoluteUrl, PUBLIC_EXPERIENCE_PATHS, SITE_NAME, SITE_ORIGIN } from "@/lib/seo";

type Props = { params: Promise<{ experience: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(ranchPages).map((experience) => ({ experience }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { experience } = await params;
  const content = ranchPages[experience];
  if (!content) return {};
  const path = "/" + experience;
  return {
    title: content.title,
    description: content.description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: content.title,
      description: content.description,
      url: absoluteUrl(path),
      images: [{ url: content.image, alt: content.imageAlt }],
    },
  };
}

export default async function RanchExperiencePage({ params }: Props) {
  const { experience } = await params;
  const content = ranchPages[experience];
  if (!content) notFound();
  const pathname = "/" + experience;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_ORIGIN + "/" },
        { "@type": "ListItem", position: 2, name: content.heading, item: absoluteUrl(pathname) },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": absoluteUrl(pathname),
      url: absoluteUrl(pathname),
      name: content.heading,
      description: content.description,
      primaryImageOfPage: absoluteUrl(content.image),
      mainEntity: { "@id": absoluteUrl(pathname) + "#details" },
    },
    {
      "@context": "https://schema.org",
      "@type": content.serviceType ? "Service" : "WebPage",
      "@id": absoluteUrl(pathname) + "#details",
      name: content.heading,
      description: content.description,
      url: absoluteUrl(pathname),
      image: absoluteUrl(content.image),
      ...(content.serviceType
        ? {
            serviceType: content.serviceType,
            provider: { "@id": SITE_ORIGIN + "/#ranch" },
            areaServed: [{ "@type": "City", name: "Fairburn" }, { "@type": "Place", name: "Atlanta metropolitan area" }],
          }
        : {}),
    },
  ];
  return <main className="min-h-screen bg-[#f8f5ee] text-[#183329]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <a href="#experience-content" className="skip-link">Skip to experience details</a>
    <header className="border-b border-[#dfd8ca] bg-[#183329] text-white">
      <nav className="wrap-wide flex flex-wrap items-center justify-between gap-5 py-6" aria-label="Ranch navigation">
        <Link href="/" className="font-editorial text-2xl">JD&apos;s Horse Ranch</Link>
        <a href="tel:+14049812361" className="border border-[#eddfc7] px-5 py-3 text-xs font-bold uppercase tracking-[.12em]">Call JD to Book</a>
      </nav>
    </header>
    <div className="wrap-wide py-7 text-xs font-semibold tracking-wide">
      <Link href="/" className="underline underline-offset-4">Home</Link><span aria-hidden="true" className="px-3">/</span><span>{content.heading}</span>
    </div>
    <section className="wrap-wide grid gap-12 pb-16 pt-10 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:pb-28">
      <div>
        <p className="overline mb-7 text-[#8d7351]">{content.kicker}</p>
        <h1 className="font-editorial text-[clamp(2.8rem,6vw,5.6rem)] leading-[1.08] tracking-[-.045em]">{content.heading}</h1>
        <p className="mt-8 max-w-2xl text-[17px] leading-9 text-[#56675c]">{content.intro}</p>
        <a href="tel:+14049812361" className="cta-dark mt-9 inline-flex">Talk to JD · (404) 981-2361</a>
      </div>
      <figure>
        <div className="relative aspect-[1.16/1] overflow-hidden bg-[#d5dccf]">
          <Image src={content.image} alt={content.imageAlt} fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" priority />
        </div>
        <figcaption className="mt-4 border-l-2 border-[#bda27b] pl-4 text-xs leading-6 text-[#6b786a]">
          {content.photoSource && content.photoCredit
            ? <><a className="underline underline-offset-2" href={content.photoSource} target="_blank" rel="noopener noreferrer">{content.photoCredit}</a> · Used with permission. Confirm current arrangements by phone.</>
            : "An authentic moment from the ranch photo archive. Call JD for current riding arrangements."}
        </figcaption>
      </figure>
    </section>
    <section id="experience-content" className="border-y border-[#e5dfd3] bg-white py-14 lg:py-20">
      <div className="wrap-wide">
        <div className="grid gap-5 lg:grid-cols-3">
          {content.highlights.map((item) => <div key={item.label} className="border-l-2 border-[#bda27b] bg-[#f8f5ee] px-6 py-7">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#8d7351]">{item.label}</p>
            <p className="font-editorial text-2xl leading-snug">{item.value}</p>
          </div>)}
        </div>
        <div className="mt-16 grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <h2 className="font-editorial text-4xl leading-tight lg:text-5xl">{content.sectionTitle}</h2>
          <div className="space-y-6 text-base leading-8 text-[#56675c]">
            {content.details.map((detail) => <p key={detail}>{detail}</p>)}
            {experience === "visit-jds-horse-ranch-fairburn-ga" && <figure className="mt-8">
              <div className="relative aspect-[3/4] w-full max-w-[300px] overflow-hidden bg-[#e6e7da]">
                <Image src="/photos/guest-2025-ranch-sign.webp" alt="JD's Horse Ranch banner displaying the ranch name and phone number, seen in an April 2025 guest photograph" fill loading="lazy" sizes="(max-width:640px) 90vw, 300px" className="object-cover" />
              </div>
              <figcaption className="mt-3 max-w-sm text-xs leading-6 text-[#607065]">Ranch signage photographed in April 2025 by <a href="https://www.lemon8-app.com/@carla.marie.mills/7493317959583367723" target="_blank" rel="noopener noreferrer" className="underline">@carla.marie.mills</a>, reused with permission. Signage may change; call before driving over.</figcaption>
            </figure>}
            {experience === "visit-jds-horse-ranch-fairburn-ga" && <a className="inline-flex border-b border-[#183329] font-semibold text-[#183329]" href="https://www.google.com/maps/search/?api=1&query=7555+Jones+Rd+Fairburn+GA+30213">Get directions to 7555 Jones Road</a>}
          </div>
        </div>
      </div>
    </section>
    <section className="wrap-wide grid gap-10 py-16 lg:grid-cols-[.75fr_1.25fr] lg:py-24">
      <div><p className="overline text-[#8d7351]">Helpful answers</p><h2 className="mt-4 font-editorial text-4xl lg:text-5xl">Before your visit</h2></div>
      <div className="divide-y divide-[#d8d4ca] border-y border-[#d8d4ca]">
        {content.faq.map((item) => <details key={item.question} className="py-5">
          <summary className="cursor-pointer text-base font-semibold">{item.question}</summary>
          <p className="pt-4 text-sm leading-7 text-[#56675c]">{item.answer}</p>
        </details>)}
      </div>
    </section>
    <footer className="bg-[#183329] px-6 py-14 text-white">
      <div className="wrap-wide">
        <h2 className="font-editorial text-3xl">Make the call. Make the memory.</h2>
        <p className="mt-4 max-w-2xl leading-7 text-[#e2e9de]">JD&apos;s Horse Ranch · 7555 Jones Road, Fairburn, GA 30213. By appointment only. No walk-ins.</p>
        <a href="tel:+14049812361" className="mt-7 inline-flex border border-white px-6 py-4 text-sm font-bold">Call (404) 981-2361</a>
        <nav className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#e2e9de]" aria-label="More ranch information">
          <Link href="/">Home</Link>
          {PUBLIC_EXPERIENCE_PATHS.filter((path) => path !== pathname).map((path) => <Link key={path} href={path} className="underline underline-offset-4">{ranchPages[path.slice(1)].heading}</Link>)}
          <Link href="/privacy">Privacy</Link>
        </nav>
      </div>
    </footer>
  </main>;
}
