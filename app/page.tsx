"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
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
    <main>
      <Hero onCall={handleCall} isLoading={isLoading} />
      <Services onCall={handleCall} isLoading={isLoading} />
      <Gallery />
      <Testimonials />
      <Contact onCall={handleCall} isLoading={isLoading} />
    </main>
  );
}
