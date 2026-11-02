import type { MetadataRoute } from "next";

// Ownership and launch verification gate: never index previews or a
// production Vercel address before JD controls jdshorseranch.com.
const indexingEnabled =
  process.env.VERCEL_ENV === "production" &&
  process.env.SEO_INDEXING_ENABLED === "true";

export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/booking/", "/ranch-login"],
      },
    ],
    sitemap: "https://jdshorseranch.com/sitemap.xml",
  };
}
