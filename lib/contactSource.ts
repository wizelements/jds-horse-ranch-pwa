/** Strict, non-identifying call origins for the public ranch website.
 * Never send arbitrary URL paths, query strings, fragments or rider information.
 */
const SOURCE = /^[a-z0-9_-]{1,48}$/;

const knownPublicLandingPages: Readonly<Record<string, string>> = {
  "/horseback-riding-lessons-fairburn-ga": "lessons_page",
  "/guided-horseback-trail-rides-fairburn-ga": "trail_page",
  "/horseback-riding-special-events-fairburn-ga": "events_page",
  "/visit-jds-horse-ranch-fairburn-ga": "visit_page",
};

export function sourceForPublicCall(pathname: string, sectionId: string | undefined): string {
  // All service pages get distinct, stable labels regardless of component layout.
  // A trailing slash is a common browser/client variation of the same public page.
  const path = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const landing = knownPublicLandingPages[path];
  if (landing) return landing;
  // On the homepage, retain where the call was tapped (services, footer, etc.).
  if (path === "/" && sectionId && SOURCE.test(sectionId)) return sectionId;
  return "navigation";
}
