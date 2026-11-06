import type { MetadataRoute } from "next";
import { absoluteUrl, PUBLIC_EXPERIENCE_PATHS } from "@/lib/seo";

/** Public and canonical pages only. Each image represents the actual ranch photo archive. */
const experienceImages: Record<(typeof PUBLIC_EXPERIENCE_PATHS)[number], string> = {
  "/horseback-riding-lessons-fairburn-ga": "/photos/ranch-2.jpg",
  "/guided-horseback-trail-rides-fairburn-ga": "/photos/ranch-7.jpg",
  "/horseback-riding-special-events-fairburn-ga": "/photos/ranch-8.jpg",
  "/visit-jds-horse-ranch-fairburn-ga": "/photos/ranch-0.jpg",
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
      images: [
        absoluteUrl("/photos/ranch-2.jpg"),
        absoluteUrl("/photos/ranch-1.jpg"),
        absoluteUrl("/photos/ranch-0.jpg"),
        absoluteUrl("/photos/ranch-8.jpg"),
      ],
    },
    ...PUBLIC_EXPERIENCE_PATHS.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [absoluteUrl(experienceImages[path])],
    })),
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
  ];
}
