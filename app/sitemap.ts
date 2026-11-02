import type { MetadataRoute } from "next";

// Only real public pages belong here. HTML fragment links
// (#gallery, #experiences, etc.) are not separate indexable URLs.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://jdshorseranch.com/", changeFrequency: "monthly", priority: 1 }, { url: "https://jdshorseranch.com/privacy", changeFrequency: "yearly", priority: 0.3 }];
}
