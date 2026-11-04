# JD's Horse Ranch — Independent Public Search Release

Target: https://jdshorseranch.codewithsolo.com
DNS owner: Cloudflare zone codewithsolo.com
Hosting: Vercel project jds-horse-ranch-pwa, team theangelsilvers-projects
Source: wizelements/jds-horse-ranch-pwa
Protected old site: jdshorseranch.com is NOT redirected, edited or claimed here.

## Current DNS requirement (from Vercel API)
- Cloudflare DNS: CNAME, name jdshorseranch
- Vercel's project-specific target: 402a742d5a890055.vercel-dns-016.com
- Set DNS only for initial verification and certificate issuance; do not add a redirect to the old .com.
- Re-read Vercel domain config before changing DNS in case Vercel updates its recommended target.
- Verify public A/CNAME answers, HTTPS, and live content from a second network before calling this live.

## Search identity
- Canonical URL and LocalBusiness @id refer exclusively to the new subdomain.
- Sitemap includes the home page, 4 genuinely distinct useful experience/visitor pages and privacy.
- Non-public admin, booking and API routes are excluded from the sitemap and from normal crawling.
- Preview deployments are noindex/disallow, production pages are indexable after go-live.
- Structured information must agree with the visible business address, phone, published rates and by-appointment policy.
- No invented reviews, star ratings, Google positions, operating hours, or guarantees.
- /llms.txt is an optional machine reference; Google's AI Overviews do not require it.

## Controlled production gate
RANCH_PUBLIC_ONLY_MODE=true with VERCEL_ENV=production serves marketing content
while returning 503 and noindex for private admin, booking, and API routes.
Do not use test credentials to enable private endpoints.
Full operations require production owner auth credentials, tested Turso migrations,
signed Square webhook and live/sandbox payment recovery certification,
and independent owner confirmation.

## Verification
- npm run lint
- npm run type-check
- npm test
- npm run build
- npm run test:acceptance (isolated local sandbox, never proof of real merchant live payments)
- Live smoke: /, /sitemap.xml, /robots.txt, /llms.txt, each experience page,
  redirect/canonical, private route 503, click-to-call, correct real photos, mobile.
- Google Search Console: verify the full URL-prefix property, inspect pages and submit
  https://jdshorseranch.codewithsolo.com/sitemap.xml.
- Bing Webmaster Tools: add/verify, submit sitemap.
- Claim/refresh Google Business Profile only with JD's permission; keep name,
  address and phone consistent. Request links from relevant genuine partners;
  do not purchase links, stuff keywords, or impersonate the old developer.
- Track impressions, calls, organic visits, 404s, index coverage and actual
  rankings for local ride-intent terms; compare with the old site over time.

Google controls indexing and rankings; publishing/valid schema cannot guarantee
that this subdomain outranks the established jdshorseranch.com.
