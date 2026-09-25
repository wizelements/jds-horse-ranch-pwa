import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./register-sw";

export const metadata: Metadata = {
  title: "JD's Horse Ranch | Riding Lessons & Trail Rides near Atlanta",
  description:
    "Horseback riding lessons, guided trail rides, and special experiences in Fairburn, Georgia. Start your reservation through WhatsApp; JD personally reviews each request before payment.",
  keywords:
    "horseback riding Atlanta, horse ranch Atlanta, trail rides near Atlanta, riding lessons Atlanta Georgia, horse trails Fairburn GA, equestrian center near me, western riding lessons, guided trail rides Atlanta, horse riding experiences Atlanta, horseback riding tours Fairburn",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JD's Horse Ranch",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    url: "https://jdshorseranch.com",
    title: "JD's Horse Ranch | Horseback Riding near Atlanta",
    description:
      "Request riding lessons, guided trail rides, and special experiences through the JD's Horse Ranch WhatsApp reservation assistant.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "JD's Horse Ranch horseback riding in Fairburn, Georgia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JD's Horse Ranch | Horseback Riding near Atlanta",
    description:
      "Start your JD's Horse Ranch riding request through WhatsApp.",
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
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://jdshorseranch.com",
    name: "JD's Horse Ranch",
    image: "https://jdshorseranch.com/og-image.jpg",
    description:
      "Horseback riding lessons, guided trail rides, and special experiences in Fairburn, Georgia.",
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
    areaServed: [
      { "@type": "City", name: "Atlanta" },
      { "@type": "State", name: "Georgia" },
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "18:00",
    },
  };

  const serviceSchema = {
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
  };

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="JD's Horse Ranch" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#8B6F47" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />

        <meta name="geo.placename" content="Fairburn, Georgia" />
        <meta name="geo.position" content="33.5472;-84.4955" />
        <meta name="ICBM" content="33.5472, -84.4955" />
        <meta name="author" content="JD's Horse Ranch" />
        <meta name="copyright" content="JD's Horse Ranch" />
      </head>
      <body className="bg-ranch-cream text-ranch-dark">
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
