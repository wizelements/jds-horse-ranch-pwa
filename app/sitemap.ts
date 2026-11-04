import type { MetadataRoute } from "next";
import { absoluteUrl, PUBLIC_EXPERIENCE_PATHS } from "@/lib/seo";

/** Only useful, public, canonical pages. No fragments, admin routes or calls to action. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    ...PUBLIC_EXPERIENCE_PATHS.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];
}
