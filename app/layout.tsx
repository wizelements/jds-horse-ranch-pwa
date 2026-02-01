import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JD's Horse Ranch - Atlanta Horseback Riding",
  description: "Experience horseback riding lessons and trail rides near Atlanta, Georgia.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JD's Horse Ranch",
  },
  formatDetection: {
    telephone: true,
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
      </head>
      <body className="bg-ranch-cream text-ranch-dark">{children}</body>
    </html>
  );
}
