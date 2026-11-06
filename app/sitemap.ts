import type { MetadataRoute } from "next";
import { absoluteUrl, PUBLIC_EXPERIENCE_PATHS } from "@/lib/seo";

/** Public, canonical pages with representative ranch photos. No private or Google-hosted media URLs. */
const experienceImages: Record<(typeof PUBLIC_EXPERIENCE_PATHS)[number], readonly string[]> = {
  "/horseback-riding-lessons-fairburn-ga": ["/photos/ranch-2.jpg", "/photos/guest-2025-ride.webp"],
  "/guided-horseback-trail-rides-fairburn-ga": ["/photos/guest-2024-woodland-ride.webp", "/photos/guest-2024-lake-view.webp"],
  "/horseback-riding-special-events-fairburn-ga": ["/photos/ranch-8.jpg"],
  "/visit-jds-horse-ranch-fairburn-ga": ["/photos/ranch-0.jpg", "/photos/guest-2025-ranch-sign.webp"],
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
      images: [
        absoluteUrl("/photos/guest-2025-ride.webp"),
        absoluteUrl("/photos/guest-2024-woodland-ride.webp"),
        absoluteUrl("/photos/guest-2024-lake-view.webp"),
        absoluteUrl("/photos/guest-2025-two-horses.webp"),
        absoluteUrl("/photos/guest-2025-black-horse.webp"),
        absoluteUrl("/photos/ranch-2.jpg"),
      ],
    },
    ...PUBLIC_EXPERIENCE_PATHS.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: experienceImages[path].map(image => absoluteUrl(image)),
    })),
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];
}
