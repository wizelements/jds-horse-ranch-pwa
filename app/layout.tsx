import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./register-sw";

// Public indexing is opt-in only after domain ownership and launch checks.
const indexingEnabled =
  process.env.VERCEL_ENV === "production" &&
  process.env.SEO_INDEXING_ENABLED === "true";

export const metadata: Metadata = {
  title: "JD's Horse Ranch | Riding Lessons & Trail Rides in Fairburn, GA",
  description: "Experience riding lessons, guided trail rides, and memorable moments at JD's Horse Ranch in Fairburn, Georgia. Visits are by appointment; call JD to talk about lessons, trail rides, and reservations.",
  metadataBase: new URL("https://jdshorseranch.com"),
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  icons: { icon: "/icon-192.png", apple: "/icon-180.png" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "JD's Horse Ranch" },
  openGraph: {
    type: "website",
    title: "JD's Horse Ranch | Horseback Riding Near Atlanta",
    description: "Step away from the city and enjoy the country life. Riding lessons and guided trail rides by appointment in Fairburn, Georgia.",
    url: "https://jdshorseranch.com",
    // This photo ships with the source; no old-host dependency.
    images: [{ url: "/photos/ranch-0.jpg", alt: "JD's Horse Ranch" }],
  },
  robots: indexingEnabled ? { index: true, follow: true } : { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, viewportFit:"cover", themeColor:"#254939",
};
const business = {
  "@context":"https://schema.org",
  "@type":"LocalBusiness",
  "@id":"https://jdshorseranch.com/#ranch",
  name:"JD's Horse Ranch",
  url:"https://jdshorseranch.com",
  telephone:"+1-404-981-2361",
  email:"jdshorseranch@gmail.com",
  description:"Riding lessons, guided horseback trail rides, and horse experiences by appointment.",
  address:{"@type":"PostalAddress",streetAddress:"7555 Jones Rd",addressLocality:"Fairburn",addressRegion:"GA",postalCode:"30213",addressCountry:"US"},
  sameAs:["https://www.facebook.com/Jdshorseranch/","https://www.instagram.com/jdshorseranch/"],
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><head><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(business)}} /></head>
    <body className="bg-ranch-cream text-ranch-dark"><RegisterSW/>{children}</body></html>;
}
