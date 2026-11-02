import type { MetadataRoute } from "next";

// The public site currently has one canonical page. HTML fragment links
// (#gallery, #experiences, etc.) are not separate indexable URLs.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://jdshorseranch.com/", changeFrequency: "monthly", priority: 1 }];
}
