import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import CallToBook from "@/components/CallToBook";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import { getPublicData } from "@/lib/publicData";

export const revalidate = 60;
export default async function Home() {
  const content = await getPublicData();
  return <>
    <a href="#main-content" className="skip-link">Skip to content</a>
    <AccessibilityToolbar />
    <main id="main-content">
      <Hero />
      <Experience />
      <Services services={content.services} />
      <Gallery photos={content.photos} />
      <Testimonials testimonials={content.testimonials} />
      <CallToBook />
      <FAQ />
      <Contact />
    </main>
  </>;
}
