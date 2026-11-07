"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_KEY = "jds-analytics-choice";
const SOURCE = /^[a-z0-9_-]{1,48}$/;

function sourceOf(anchor: HTMLAnchorElement) {
  const nearest = anchor.closest<HTMLElement>("section[id],footer[id],header[id]");
  const section = nearest?.id || "navigation";
  return SOURCE.test(section) ? section : "navigation";
}

export default function GuestAnalytics({ measurementId }: { measurementId: string }) {
  const [choice, setChoice] = useState<string | null>(null);
  const pathname = usePathname();
  const publicPage = !/^\/(?:admin|api|booking|ranch-login)(?:\/|$)/.test(pathname || "/");
  const validId = /^G-[A-Z0-9]{5,20}$/.test(measurementId);
  useEffect(() => {
    const privacy = navigator as Navigator & { globalPrivacyControl?: boolean };
    const blocked = privacy.globalPrivacyControl === true || navigator.doNotTrack === "1";
    setChoice(blocked ? "declined" : localStorage.getItem(CONSENT_KEY) || "pending");
  }, []);

  useEffect(() => {
    if (choice !== "accepted" || !publicPage) return;
    if (validId) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer!.push(arguments); };
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: window.location.origin + window.location.pathname,
      });
    }
    const click = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      const isCall = href.startsWith("tel:");
      const isDirections = /^https:\/\/www\.google\.com\/maps\//.test(href);
      if (!isCall && !isDirections) return;
      const section = sourceOf(anchor);
      if (isCall) {
        // Anonymous, opted-in first-party counter; no phone number, personal
        // details, URL query strings, cookies or IP address are persisted.
        const payload = new Blob([JSON.stringify({ type: "call", source: section })], { type: "application/json" });
        const sent = navigator.sendBeacon?.("/api/contact", payload) ?? false;
        if (!sent) void fetch("/api/contact", { method: "POST", body: payload, keepalive: true, credentials: "omit" }).catch(() => undefined);
      }
      if (validId) window.gtag?.("event", isCall ? "call_click" : "directions_click", {
        section,
        transport_type: "beacon",
      });
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, [choice, measurementId, validId, publicPage]);

  function decide(next: "accepted" | "declined") {
    const privacy = navigator as Navigator & { globalPrivacyControl?: boolean };
    const value = (privacy.globalPrivacyControl === true || navigator.doNotTrack === "1") ? "declined" : next;
    localStorage.setItem(CONSENT_KEY, value);
    setChoice(value);
  }

  if (!publicPage) return null;

  return <>
    {choice === "accepted" && validId && <Script id="jd-ga4" strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />}
    {choice === "pending" && <aside aria-label="Optional website analytics" className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 rounded-lg border border-stone-300 bg-white p-5 text-sm text-stone-900 shadow-lg">
      <p className="max-w-md">Allow optional, anonymous counts of call-button taps to help improve the ranch website? No rider details or phone numbers are collected. <a className="underline" href="/privacy">Privacy</a></p>
      <div className="flex gap-3">
        <button type="button" onClick={() => decide("declined")} className="rounded border border-stone-400 px-4 py-3">No thanks</button>
        <button type="button" onClick={() => decide("accepted")} className="rounded bg-[#183329] px-4 py-3 text-white">Allow</button>
      </div>
    </aside>}
    {choice && choice !== "pending" && <button type="button" onClick={() => {
      localStorage.removeItem(CONSENT_KEY);
      window.location.reload();
    }} className="fixed bottom-2 left-2 z-30 rounded bg-white px-3 py-2 text-xs text-stone-800 shadow">Analytics preferences</button>}
  </>;
}
