/** Public search identity. Keep this independent from the developer-controlled .com domain. */
export const SITE_ORIGIN = "https://jdshorseranch.codewithsolo.com";
export const SITE_NAME = "JD's Horse Ranch";
export const PUBLIC_EXPERIENCE_PATHS = [
  "/horseback-riding-lessons-fairburn-ga",
  "/guided-horseback-trail-rides-fairburn-ga",
  "/horseback-riding-special-events-fairburn-ga",
  "/visit-jds-horse-ranch-fairburn-ga",
] as const;
export const absoluteUrl = (pathname = "/") => new URL(pathname, SITE_ORIGIN).toString();
/** Preview stays noindex. Production may be explicitly disabled for rollback. */
export const indexingEnabled =
  process.env.VERCEL_ENV === "production" && process.env.SEO_INDEXING_ENABLED !== "false";
