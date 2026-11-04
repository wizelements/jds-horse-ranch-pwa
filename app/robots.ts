import type { MetadataRoute } from "next";
import { absoluteUrl, indexingEnabled } from "@/lib/seo";

/** Preview URLs must never be indexed. Do not expose private ranch operations. */
export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/booking/", "/ranch-login"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
