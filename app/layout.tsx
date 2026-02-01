import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./register-sw";

export const metadata: Metadata = {
  title: "JD's Horse Ranch - #1 Horseback Riding Lessons & Trail Rides in Atlanta, Fairburn GA",
  description: "Best horseback riding in Atlanta, GA. Professional riding lessons ($45-$85), guided trail rides ($85-$245), and special events. Safe, friendly, experienced instructors. Call (404) 981-2361 to book today.",
  keywords: "horseback riding Atlanta, horse ranch Atlanta, trail rides near Atlanta, riding lessons Atlanta Georgia, horse trails Fairburn GA, equestrian center near me, best horse ranch Georgia, western riding lessons, guided trail rides Atlanta, horse riding experiences Atlanta, horseback riding tours Fairburn",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JD's Horse Ranch",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: "website",
    url: "https://jdshorseranch.com",
    title: "JD's Horse Ranch - Best Horseback Riding in Atlanta, GA",
    description: "Experience unforgettable horseback riding lessons and guided trail rides near Atlanta. Professional instructors, gentle horses, and scenic trails await.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "JD's Horse Ranch - Horseback Riding in Atlanta",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JD's Horse Ranch - Horseback Riding in Atlanta",
    description: "Best trail rides and riding lessons near Atlanta, Georgia",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  alternates: {
    canonical: "https://jdshorseranch.com",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="JD's Horse Ranch" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#8B6F47" />
        
        {/* SEO: Google Business Profile & Local Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "@id": "https://jdshorseranch.com",
              name: "JD's Horse Ranch",
              image: "https://jdshorseranch.com/og-image.jpg",
              description: "Professional horseback riding lessons and guided trail rides in Atlanta, Georgia",
              url: "https://jdshorseranch.com",
              telephone: "(404) 981-2361",
              email: "jdshorseranch@gmail.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "7555 Jones Rd",
                addressLocality: "Fairburn",
                addressRegion: "GA",
                postalCode: "30213",
                addressCountry: "US",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "33.5472",
                longitude: "-84.4955",
              },
              sameAs: [
                "https://www.facebook.com/Jdshorseranch/",
                "https://www.instagram.com/jdshorseranch/",
                "https://www.youtube.com/channel/UCDSI825ADeouC31jTQmlgyQ",
              ],
              priceRange: "$45-$245",
              serviceArea: {
                "@type": "City",
                name: "Atlanta",
              },
              areaServed: [
                {
                  "@type": "City",
                  name: "Atlanta",
                  "@id": "https://en.wikipedia.org/wiki/Atlanta"
                },
                {
                  "@type": "State",
                  name: "Georgia",
                  "@id": "https://en.wikipedia.org/wiki/Georgia_(U.S._state)"
                }
              ],
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                opens: "08:00",
                closes: "18:00",
              },
            }),
          }}
        />
        
        {/* SEO: Service Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "JD's Horse Ranch",
              url: "https://jdshorseranch.com",
              telephone: "(404) 981-2361",
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "Horseback Riding Services",
                itemListElement: [
                  {
                    "@type": "Offer",
                    name: "Riding Lessons",
                    description: "1 hour horseback riding lessons starting at $85",
                    price: "85",
                    priceCurrency: "USD",
                  },
                  {
                    "@type": "Offer",
                    name: "Trail Rides for 1",
                    description: "Guided 1 hour trail ride for 1 person",
                    price: "85",
                    priceCurrency: "USD",
                  },
                  {
                    "@type": "Offer",
                    name: "Trail Rides for 2",
                    description: "Guided 1 hour trail ride for 2 people",
                    price: "160",
                    priceCurrency: "USD",
                  },
                  {
                    "@type": "Offer",
                    name: "Trail Rides for 3",
                    description: "Guided 1 hour trail ride for 3 people",
                    price: "245",
                    priceCurrency: "USD",
                  },
                ],
              },
            }),
          }}
        />
        
        {/* SEO: Aggregate Rating Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "JD's Horse Ranch",
              url: "https://jdshorseranch.com",
              logo: "https://jdshorseranch.com/logo.png",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "42",
                bestRating: "5",
                worstRating: "1",
              },
            }),
          }}
        />
        
        {/* Additional SEO Meta Tags */}
        <meta name="geo.placename" content="Fairburn, Georgia" />
        <meta name="geo.position" content="33.5472;-84.4955" />
        <meta name="ICBM" content="33.5472, -84.4955" />
        <meta name="author" content="JD's Horse Ranch" />
        <meta name="copyright" content="JD's Horse Ranch" />
        <meta name="revisit-after" content="7 days" />
        <meta name="audience" content="all" />
      </head>
      <body className="bg-ranch-cream text-ranch-dark">
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
