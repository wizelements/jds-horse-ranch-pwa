# JDS Horse Ranch — Domain-independent completion and launch gates

Status: **pre-launch only; no domain ownership or search ranking certification**
Last reviewed: 2026-11-01
Scope: the redesigned Next.js PWA, not the third-party-managed live WordPress website.

## What can be completed before registrar/DNS access

- Finish and verify public page copy, confirmed riding services, real owner-approved photographs, accessibility, keyboard navigation and mobile call-to-book interactions.
- Verify private admin login, access boundaries, ride records, staff-entered phone bookings, actual calendar view and customer history with test fixtures and separately scoped live data.
- Verify Square payment initiation, signed webhook processing, idempotency, cancellations, refunds and reconciliation using owner-authorized sandbox and production credentials when provided. Never claim BOOKED on redirect alone.
- Implement and test secure PWA manifest, service worker cache exclusions for admin/API/payment and real-device installation.
- Prepare Google Analytics 4 event tracking and connection instructions. A real GA4 measurement ID and owner consent/approval are required to switch it on.
- Confirm sitemap contains *only actual indexable paths*, canonical URLs are correct and admin/preview stay non-indexed.
- Run lint, type-check, local Turso schema test, build and security review on the candidate release. Preview READY is **not** production certification.
- Audit photos copied or hotlinked from the old website, which may become inaccessible if the old hosting is discontinued. Store owner-authorized originals independently before migration.
- Assemble a pre-migration URL inventory from discoverable public URLs and owner records, map every valuable old URL to an equivalent destination, and prepare 301 rules for paths that will change.

## SEO guardrail

- Default: non-production deployments **must not be indexed**, regardless of where they are hosted.
- Production indexing must be explicitly enabled with `SEO_INDEXING_ENABLED=true` only **after** JD has control of `jdshorseranch.com`, its DNS points to the approved production build, public access is independently verified, metadata/canonical URLs match the domain, and a responsible owner approves cutover.
- This is a visibility switch, **not** a substitute for authentication, domain ownership, Search Console verification or Google indexing.
- The current site has one canonical public homepage. Fragment identifiers such as `#experiences` are not separate web pages and must not appear in sitemap XML. Publish real service-page URLs only when those pages exist and are tested.
- Leave prior site publicly accessible; do not make domain/DNS changes without authenticated registrar access and a documented rollback.
- Do not promise rank 1, a fixed time to rank, or percentages for reviews or backlinks. Get baseline numbers from Search Console where possible.

## Blocked until an authorized owner supplies access or proof

1. Domain registration and DNS control, or a legally supported process to resolve ownership.
2. Existing developer-owned Search Console/Analytics/Tag Manager history and settings (unless independently verified from an owner-controlled account).
3. Google Business Profile manager access, if not already owned by JD; follow Google's official request/appeal process.
4. A real GA4 ID and consent/privacy decisions for tracking, and calendar/notification credentials as applicable.
5. Actual production webhook URLs, payment credentials, signed event readback, live receipts, mobile install evidence and final release approval.

## Proof JD should receive

- Before: screenshots/exports of Search Console 90-day query/page clicks, impressions, CTR, position; available Business Profile interactions; public indexed URL inventory.
- Candidate: git commit and matching build, tests, site audit, phone/directions click tests, valid schema and mobile screenshots, known gaps and rollback plan.
- Launch: domain DNS ownership/readback, independent HTTPS fetch, service and photo assets reachable, correct canonical/robots/sitemap/redirect readback, GA4 Realtime event verification.
- After: 7-, 14-, 30- and 60-day comparison of equivalent Google queries/pages and phone-to-paid-ride conversion rates. Note seasonality and search ranking volatility.

No production switch or claim of SEO uplift before this evidence exists.
