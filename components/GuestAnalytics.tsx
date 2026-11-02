"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
const CONSENT_KEY = "jds-analytics-choice";

export default function GuestAnalytics({ measurementId }: { measurementId: string }) {
  const [choice, setChoice] = useState<string | null>(null);
  const validId = /^G-[A-Z0-9]{5,20}$/.test(measurementId);
  useEffect(() => {
    const privacy = navigator as Navigator & { globalPrivacyControl?: boolean };
    setChoice(privacy.globalPrivacyControl || navigator.doNotTrack === "1"
      ? "declined" : localStorage.getItem(CONSENT_KEY) || "pending");
  }, []);
  useEffect(() => {
    if (choice !== "accepted" || !validId) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer!.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", measurementId, {
      allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: window.location.origin + window.location.pathname,
    });
    const click = (event: MouseEvent) => {
      const anchor = (event.target as Element)?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      const name = href.startsWith("tel:") ? "call_click"
        : href.includes("google.com/maps") ? "directions_click" : null;
      if (name === "call_click") {
        navigator.sendBeacon?.("/api/contact", new Blob([JSON.stringify({ type: "call", source: anchor.closest("section,footer")?.id || "navigation" })], { type: "application/json" }));
      }
      if (name) window.gtag?.("event", name, {
        section: anchor.closest("section,footer")?.id || "navigation",
        transport_type: "beacon",
      });
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, [choice, measurementId, validId]);
  function decide(next: string) { localStorage.setItem(CONSENT_KEY, next); setChoice(next); }
  if (!validId) return null;
  return <>
    {choice === "accepted" && <Script id="jd-ga4" strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />}
    {choice === "pending" && <aside aria-label="Optional analytics" className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 rounded-lg border border-stone-300 bg-white p-5 text-sm text-stone-900 shadow-lg">
      <p className="max-w-md">Allow optional analytics to help us understand visits and calls? Your booking details are never included. <a className="underline" href="/privacy">Privacy</a></p>
      <div className="flex gap-3"><button type="button" onClick={() => decide("declined")} className="rounded border border-stone-400 px-4 py-3">Decline</button><button type="button" onClick={() => decide("accepted")} className="rounded bg-[#183329] px-4 py-3 text-white">Allow analytics</button></div>
    </aside>}
    {choice && choice !== "pending" && <button type="button" onClick={() => {
      localStorage.removeItem(CONSENT_KEY);
      // A fresh page removes the analytics script as well as its listeners.
      window.location.reload();
    }} className="fixed bottom-2 left-2 z-30 rounded bg-white px-3 py-2 text-xs text-stone-800 shadow">Analytics preferences</button>}
  </>;
}
