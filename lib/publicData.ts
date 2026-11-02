import "server-only";
import { unstable_cache } from "next/cache";
import { DEFAULT_PHOTOS, DEFAULT_SERVICES, DEFAULT_TESTIMONIALS } from "@/lib/publicContent";
import { getGalleryPhotos, getServices, getTestimonials } from "@/lib/turso";

export const getPublicData = unstable_cache(async () => {
  const fallback = { services: DEFAULT_SERVICES, photos: DEFAULT_PHOTOS, testimonials: DEFAULT_TESTIMONIALS };
  if (!process.env.TURSO_DATABASE_URL) return fallback;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.all([getServices(), getGalleryPhotos(), getTestimonials()]).then(([services, photos, testimonials]) => ({ services, photos, testimonials })),
      new Promise<typeof fallback>((resolve) => { timer = setTimeout(() => resolve(fallback), 1500); }),
    ]);
  } catch {
    // The public phone line and verified business information remain available.
    return fallback;
  } finally { if (timer) clearTimeout(timer); }
}, ["ranch-public-content-v1"], { revalidate: 60, tags: ["ranch-public-content"] });
