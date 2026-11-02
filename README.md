# JD's Horse Ranch

Phone-first public website and private ranch workspace built with Next.js 15.5.28, React 19, and Turso/libSQL. The original website and domain remain unchanged while account ownership and production connections are resolved.

The current implementation and its limits are documented in [the release handoff](docs/RELEASE_HANDOFF_2026-11-01.md). This supersedes older activation, delivery, and completion reports in this repository.

## Guest journey

Guests explore the ranch, its genuine photography, experiences, and published prices, then call JD. Public reservation forms and WhatsApp routes are disabled. Only the owner records a phone conversation privately.

JD reviews availability, approves an exact time/duration and total, then manually shares a booking-specific Square checkout link. The appointment becomes confirmed only after the server retrieves and verifies Square's completed payment. A return-page visit never proves payment. Customer updates remain personal phone conversations; the site sends no customer messages.

## Owner workspace

`/ranch-login` signs into `/admin/dashboard`.

- Exact dashboard counts; searchable, paginated reservations and contact histories.
- Correct contact/rider details, manage notes, approve/reschedule/cancel, and record completed rides and phone confirmations.
- A monthly schedule, blocked times, Google Calendar OAuth/free-busy checks, calendar-file imports, private calendar subscriptions, and appointment downloads.
- Payment retries with stable idempotency keys; signed, replay-safe webhooks; manual payment refresh; late-payment review/recovery; verified refund tracking.
- Editable public experiences, prices, gallery and reviews, with immediate cache invalidation.
- Private exports and optional Firebase owner alerts. Alerts contain no customer details.

One group at a time and a 15-minute inter-appointment gap are conservative defaults until JD certifies staffing/horse capacity. Unconnected calendars still require manual review. Calendar imports are snapshots; unsupported recurrence rules are refused instead of guessing availability.

## Development and verification

Use Node 24 and npm 10+.

```sh
npm ci
npm run lint
npm run db:verify
npm test
npm run type-check
npm run build
npm run test:acceptance
```

Acceptance tests create a temporary local database and a loopback Square simulator. They run against the actual production Next.js server and real API handlers. They cannot create real payments, send customer messages, or access a live database. They prove application behavior, not the real Square, Google, Firebase, GA4, or Android installation connections.

Normal development uses `npm run dev`; copy the relevant placeholders from `.env.example` into an ignored local environment. Never connect a public preview to the production customer database.

## Database and deployment

Turso is the source of truth. Apply `npm run db:migrate` explicitly with the intended environment; migrations never run in a Vercel build. The migration is additive and preserves existing business edits and deleted gallery/review records. Back up a real database before migrating.

Git integration builds preview branches. Keep preview protection and noindex safeguards. Public launch requires the JD-owned domain, working private account connections, real Sandbox/provider acceptance tests, a tested production deployment, and migration/rollback sign-off. Build success does not certify public launch.

## Photos and PWA

Ten original ranch JPEGs ship in `public/photos`, independently of the old hosting. [The provenance manifest](docs/RANCH_PHOTO_PROVENANCE.json) records their official sources and SHA-256 fingerprints. The app icons use the existing JD monogram. Both public and private manifests reference real icons. Offline caching excludes customer records, APIs, login, and payment routes.
