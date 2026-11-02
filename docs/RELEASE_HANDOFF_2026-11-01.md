# JD's Horse Ranch release handoff

Date: November 1, 2026 (America/New_York). Scope: independently complete and verify the redesign while leaving `jdshorseranch.com`, the old developer's hosting, DNS, and Google accounts unchanged.

This is the current implementation record. Older completion, activation, marketing-guarantee, and WhatsApp documents in this repository describe historical work and do not establish current readiness.

## Actual outcome and limits

The redesign now implements a complete phone-first guest-to-owner reservation flow, including real database operations, protected owner pages, calendar controls, provider-verified payment states, retries, cancellations, refund tracking, and late-payment recovery. Guest booking stays by phone. No public booking forms, WhatsApp integration, or automated customer messages are enabled.

Application behavior is tested with an isolated database and a local Square simulator running against the production Next.js server. These tests cannot certify JD's real merchant account, Google permissions, notification delivery, analytics collection, or physical Android installation. Those require the owner connections and provider/device acceptance described below.

The live preview inspected before this release reported:

| Connection | Observed result |
| --- | --- |
| Turso | Variables present; connection failed; schema could not be verified |
| Owner sign-in | V2 credentials/session configuration absent |
| Square | Required configuration absent |
| Vercel environment API | HTTP 403 for both metadata reads and a branch-scoped non-secret write |
| Local Vercel CLI identity | No CLI installation, token, or configured authentication available |

The deployment's account permissions are a real blocker to repairing these live settings in this session. A successful build must not be described as a functioning live admin or production-certified payment system.

## Delivered behavior

| Area | Implementation |
| --- | --- |
| Guest experience | Existing elegant design retained; intentional ranch images; phone booking and directions; verified published business details/prices; corrected main booking button |
| Photo independence | All ten original JPEGs are versioned with source URL, size, and SHA-256 provenance; public images no longer load from the old host |
| Owner records | Record calls idempotently; search/page reservations; correct contact/rider details; private notes; contact histories; exact aggregate dashboard counts; safe CSV exports |
| Availability | Atomic single-group slot holds; explicit duration/end time; 15-minute gap; Eastern-time conversion; DST ambiguity rejection; local calendar blocks; rescheduling conflict checks |
| Square | Explicit Sandbox/live separation; live enablement gate; stable retry keys; checkout revocation on cancellation; current payment retrieval before confirmation; signature validation; replay handling; currency/amount/location checks |
| Recovery | Failed/uncertain checkout retry; active hold expiration; payment-review records; explicit owner recovery of matching late payments into a new free slot; pending/completed refund reconciliation and duplicate prevention |
| Calendar | Google OAuth with PKCE/state checks; encrypted refresh tokens; calendar selection; free/busy checks at approval; expanded ICS busy-time imports; generic appointment downloads and revocable private subscription feed |
| Content management | Services, gallery, and review edits reach the public page; inactive records remain editable; validated mutations; public cache invalidation; original content available during database outages |
| Security | Next.js 15.5.28 and sharp 0.35.5; patched gRPC transitive dependency; early private-page session gate plus independent API authorization; origin checks; persistent sign-in throttling; private no-store/noindex headers |
| Measurement | Optional JD-owned GA4 ID; consent before loading; call/direction events; no rider/customer fields; private workspace excluded; browser privacy signals honored |
| PWA | Real 192/512/180 icons; public/private manifests; install prompt support; safe offline fallback; no private-record/payment-response caching; owner offline-state notice |
| Push foundation | Optional Firebase registration and owner device management; generic, customer-free alerts; payment notification outbox; bounded retry dispatch; explicit device delivery test |

Capacity is deliberately conservative until JD verifies staffing and available horses. Google availability is a point-in-time check; another system can change after approval. Calendar imports are snapshots and refuse recurrence/time-zone formats they cannot safely interpret. Late or mismatched payments require owner review. Customer identity is not inferred from a shared family phone number.

## Verification

Run the reproducible checks with Node 24:

```sh
npm ci
npm run lint
npm run db:verify
npm test
npm run type-check
npm run build
npm run test:acceptance
npm audit --omit=dev --audit-level=high
```

The acceptance suite starts its own temporary local database and Next.js production server. Its provider simulator is restricted to `127.0.0.1`. Fixture flags are rejected by Vercel deployment preflight and cannot redirect a deployed app's Square credentials to a fixture.

The scenarios cover unauthenticated/forged/expired sessions, cross-site writes, sign-in throttling, idempotent call records, repeat-family contacts, concurrent/overlapping approvals, stable checkout retries after uncertain provider results, unsigned/non-completed/mismatched payments, duplicate events, current provider verification, late/cancelled payment safety, calendar conflicts, rescheduling, late-payment recovery, phone confirmations, refund limits/retries/statuses, safe calendar imports/feed rotation, owner-to-public content changes, corrections, repeat migrations, exports, manifests/icons, and noindex/offline boundaries.

The managed local browser preview could not start because its runner supplied Vite-only options to Next.js. Its infrastructure was not bypassed. Local HTTP tests use the actual built Next.js server; visual review uses the Vercel preview. A real signed-in owner walkthrough and Android install remain required after account setup.

## Owner-controlled setup, in order

1. In the existing Vercel team `team_HLmyvqEhI158ahAD2U1p7MxM`, grant the deployment operator environment-variable access to project `prj_pIWeP2s571lCryqRL7Zv5nYSa3SI` (`jds-horse-ranch-pwa`). Keep the production branch/domain settings unchanged.
2. Create or repair a **separate Preview Turso database/token**. Confirm it with `SELECT 1`; back up any existing real records before migrating. Apply `npm run db:migrate` explicitly to the intended database. Builds never migrate a live database.
3. Choose a strong owner password in the owner's password manager. Supply it over stdin to `node scripts/admin-credentials.mjs`; do not put it in shell arguments/history. The script writes a new ignored `.env.owner.local` bundle with mode 0600 and refuses overwrites. Import its named values through the account's secure environment settings. Keep the calendar encryption key in the owner's password manager, then remove the local bundle. Preview and Production must use separate credentials.
4. Add Square **Sandbox** access token, location ID, webhook signature key, and exact notification URL. Keep `SQUARE_ENVIRONMENT=sandbox`; do not set live enablement yet. Subscribe to `payment.created`, `payment.updated`, `refund.created`, and `refund.updated`.
5. Make the **Sandbox webhook destination reachable through Vercel protection**. For a service that cannot send a custom bypass header, Vercel documents appending its automation bypass secret as a query parameter to the webhook URL. Preserve preview protection; keep the bypass token encrypted and out of source/logs. `SQUARE_WEBHOOK_NOTIFICATION_URL` must exactly match the complete registered URL, including that query parameter, because Square signs it. Production readiness expects the final public webhook URL without a bypass query. Verify provider delivery; do not assume redirects or share cookies will work for Square.
6. Redeploy the same tested preview commit. Verify `/api/health/integrations` reports database reachability/schema and admin/Square configuration. Then perform the real Sandbox acceptance below.
7. For Google, create an OAuth app owned by JD, enable the Calendar API, set the exact preview callback `/api/admin/calendars/google/callback`, and configure the client ID/secret plus calendar encryption key. Connect from Settings and select all relevant calendars. Requested scopes are free/busy plus calendar-list read access; no customer contacts or event text are requested. Certify a real busy-time rejection and revoked-access failure.
8. For Firebase, configure the JD-owned project, web app/public VAPID settings, service account email/private key, and FCM HTTP v1 access. Register the owner device from Settings and verify foreground/background/click behavior. Notifications are supplementary; the database schedule remains authoritative.
9. Create a GA4 property under JD's control and set its public measurement ID. Confirm consent behavior, `page_view`, `call_click`, and `directions_click` in DebugView. Never copy the former developer's tag or claim access to their history.
10. Optional owner photo uploads need a configured Supabase `gallery-photos` public storage bucket and server-only storage credential. Built-in photographs need no external storage service. Test real upload, public readback, edit, and delete before calling this connection certified.

## Real Square and owner acceptance

Use Sandbox test data only. Do not contact real customers or move real funds during certification.

- Sign in on a phone; record a test call; correct its contact/rider fields; find it in Reservations and Customer History.
- Approve a free time; attempt an overlapping booking from another session; verify rejection. Reschedule to another free time and verify blocked Google/local time is refused.
- Open the generated Sandbox checkout and complete a test payment. Verify the real provider webhook reaches the app, the server retrieves the payment, and the record changes exactly once to Confirmed. Visiting the return page alone must not confirm it.
- Exercise payment decline, incomplete checkout, duplicate delivery, an expired hold, a late payment, current-status refresh after missed delivery, and deliberate owner late-payment recovery.
- Issue an approved test partial refund and a full refund. Verify real provider status updates, balance limits, duplicate retry behavior, and the final booking/history state. Record Square reference IDs in the private certification record, never public repository files.
- Verify owner phone confirmations are recorded as manual actions and no customer messages are automatically sent.
- Log out, reconnect/reopen the app, verify private responses are no-store, then test Android installation, app icons, updates, offline behavior, and a fresh authenticated session.
- Verify content edits, gallery uploads if configured, and exported records in JD's own hands. Have JD complete the core tasks without developer assistance.

## Cutover and recovery

Before cutover, confirm JD's domain/DNS ownership, Search Console and Business Profile ownership, the approved canonical URL, and a genuine GA4 baseline. Capture the old site's URLs/titles/descriptions, source snapshot, and DNS records. The old public page's phone number, address, experience pricing, and appointment policy are retained. Hash fragments are not sitemap URLs.

Build and test a **production** deployment without assigning the canonical domain. Use separate production secrets and a backed-up production database. Only after live payment approval/certification set `SQUARE_ENVIRONMENT=production` and `SQUARE_PRODUCTION_ENABLED=true`. Keep `SEO_INDEXING_ENABLED` unset until the approved canonical cutover.

At the approved window, assign the canonical domain to the tested production deployment, verify TLS/redirects/200 responses, then enable indexing and submit the real sitemap. Check phone links, images, robots, canonical/schema, analytics, owner sign-in, and payment webhook delivery against the canonical domain. Do not promise Google rankings or traffic equivalence.

For application rollback, restore the previous verified deployment through the same Vercel project. For DNS rollback, restore the recorded prior values. Schema changes are additive; leave new tables/columns in place rather than issuing destructive down-migrations. Preserve customer and Square records across any rollback. Reconcile provider payments/refunds received during the change window before reopening booking capacity.

## Primary references

- [Published ranch details and photography](https://jdshorseranch.com/)
- [Next.js patched image-optimization advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw)
- [gRPC patched certificate-validation advisory](https://github.com/advisories/GHSA-m9gg-hp2v-232j)
- [Square checkout management](https://developer.squareup.com/docs/checkout-api/manage-checkout)
- [Square signature validation](https://developer.squareup.com/docs/webhooks/step3validate)
- [Google Calendar free/busy API](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query)
- [Firebase web messaging](https://firebase.google.com/docs/cloud-messaging/web/get-started)
- [Vercel automation protection bypass](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)
