import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./register-sw";
import { SITE_ORIGIN, absoluteUrl, indexingEnabled } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Horseback Riding Near Atlanta | JD's Horse Ranch in Fairburn",
  description: "Explore guided horseback trail rides and riding lessons at JD's Horse Ranch in Fairburn, Georgia, near Atlanta. By appointment only. Call JD to book.",
  metadataBase: new URL(SITE_ORIGIN),
  alternates: { canonical: SITE_ORIGIN + "/" },
  manifest: "/manifest.json",
  icons: { icon: "/icon-192.png", apple: "/icon-180.png" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "JD's Horse Ranch" },
  openGraph: {
    type: "website",
    title: "JD's Horse Ranch | Horseback Riding Near Atlanta",
    description: "Step away from the city and enjoy the country life. Riding lessons and guided trail rides by appointment in Fairburn, Georgia.",
    url: SITE_ORIGIN,
    // This photo ships with the source; no old-host dependency.
    images: [{ url: "/photos/ranch-2.jpg", alt: "A guest on horseback with a guide at JD's Horse Ranch" }],
  },
  robots: indexingEnabled ? { index: true, follow: true } : { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, viewportFit:"cover", themeColor:"#254939",
};
const business = {
  "@context":"https://schema.org",
  "@type":"LocalBusiness",
  "@id":SITE_ORIGIN + "/#ranch",
  name:"JD's Horse Ranch",
  url:SITE_ORIGIN,
  telephone:"+1-404-981-2361",
  email:"jdshorseranch@gmail.com",
  description:"Riding lessons, guided horseback trail rides, and horse experiences by appointment.",
  address:{"@type":"PostalAddress",streetAddress:"7555 Jones Rd",addressLocality:"Fairburn",addressRegion:"GA",postalCode:"30213",addressCountry:"US"},
  sameAs:["https://www.facebook.com/Jdshorseranch/","https://www.instagram.com/jdshorseranch/"],
  image: [absoluteUrl("/photos/ranch-2.jpg"), absoluteUrl("/photos/ranch-0.jpg")],
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><head><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(business)}} /></head>
    <body className="bg-ranch-cream text-ranch-dark"><RegisterSW/>{children}</body></html>;
}
