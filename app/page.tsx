"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import { logContact } from "@/lib/api";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCall = async () => {
    setIsLoading(true);
    try {
      await logContact("call", window.location.pathname);
      window.location.href = "tel:(404) 981-2361";
    } catch (error) {
      console.error("Failed to log contact", error);
      window.location.href = "tel:(404) 981-2361";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AccessibilityToolbar />
      <main>
        <Hero onCall={handleCall} isLoading={isLoading} />
        <Experience />
        <Services onCall={handleCall} isLoading={isLoading} />
        <Gallery />
        <Testimonials />
        <FAQ />
        <Contact onCall={handleCall} isLoading={isLoading} />
      </main>
    </>
  );
}
