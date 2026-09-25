import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Services from "@/components/Services";
import BookingRequest from "@/components/BookingRequest";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";

export default function Home() {
  return (
    <>
      <AccessibilityToolbar />
      <main>
        <Hero />
        <Experience />
        <Services />
        <BookingRequest />
        <Gallery />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
    </>
  );
}
