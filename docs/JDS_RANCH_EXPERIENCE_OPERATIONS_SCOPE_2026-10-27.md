# JD's Horse Ranch — Experience + Ranch Operations Master Scope
Status: **implementation blueprint / not production certification**
Date: 2026-10-27
Owners: JD (ranch/business approval), product/design engineering (implementation), designated staff with authorized access
Project: `wizelements/jds-horse-ranch-pwa`
Development starting point: `feature/whatsapp-first-production`. Preserve production and existing data until tested.

## North star
A visitor should discover a real JD's Horse Ranch experience, confidently request a ride, and receive a clear approved, paid confirmation. JD should open one private, installable ranch application and immediately see what needs his attention, what rides are coming, which riders are returning, which resources are available, and which payments require follow-up.

This is **one ranch system, two audiences**. No arbitrary content, decorative widgets, invented offers, unverified reviews, unverified photos, or technical jargon in customer-facing language.

## Previous decisions that must survive
- WhatsApp is the primary reservation desk; do not advertise calling as the booking path. General contact details may remain.
- JD personally accepts/changes/declines every riding reservation and evaluates rider/horse suitability. The assistant must never independently accept a rider.
- Shared request record and audit across website, WhatsApp, and optional SMS; preserve existing STATUS/CHANGE/HUMAN/RESUME/CANCEL/STOP behavior, human takeover and message-window rules.
- Existing request hold and approval logic must be reviewed, not silently replaced. No payment until JD approves. After approval, send a booking-specific Square payment request. **Only verified Square payment changes the reservation to BOOKED.**
- Turso/libSQL remains the authoritative ranch reservation datastore; do not introduce competing booking databases or discard old inquiries.
- Public ranch copy is natural, welcoming and accurate. Fairburn location; only actual horses/property, green arena panels, appropriate instruction and real customer consent.

## User roles, needs and screens
### Customers (public)
- Home: ranch atmosphere, real imagery, actual experiences, primary "Request a Ride" call to action, proper appointment-only explanation.
- Experiences: riding lessons, guided trail rides, verified event offerings; service-specific duration, approved prices, rider guidelines and what to expect.
- About the Ranch: JD, horses, actual premises and thoughtful community story.
- Plan Your Visit: location, directions, timing, attire, what to bring, questions and policies.
- Request a Ride: WhatsApp-first structured intake, plain-language status, no false reservation confirmations.
- Confirmation and follow-up: correct approved date, payment state, directions, reschedule instructions, review/rebook only where consent permits.
- Seasonal events/camps only when genuinely active; do not imply offerings without JD approval.
- No public rider data, no bogus reviews/stars, and no raw internal status identifiers.

### JD (private, phone-first)
**Today**: rides today, approved/paid vs pending distinction, urgent requests waiting for JD, approaching rides, follow-up issues, and calendar connection warnings. Prioritize actionable items over vanity counters or IP address logs.
**Reservations**: filter/search by name/date/status/service/channel, open each request, assess rider fit, approve/adjust/decline, set real time and approved price, resolve clashes and create secure payment request, follow payment, reschedule/cancel/complete, see exact history.
**Calendar**: day/week/month; show confirmed rides, tentative holds, external busy time and unavailability as distinct states. Create ranch closures, blackout dates, guide/horse/arena limits, realistic turnaround and preparation buffers. Make conflicts impossible to silently approve.
**Customers**: one customer profile with normalized phone + optional email, history of inquiries/visits/payments, future bookings, contact preference, contact notes, household/group riders, guardian relationship when relevant, reviews/rebooking preferences, consents. Do not put children's information in general lists.
**Payments**: links issued, paid/unpaid/refunded/partially refunded, deposits vs total, link expiry, failed delivery and reconciliation with Square; never infer "paid" from a redirect.
**Messages**: WhatsApp conversation/status, templates, human takeover, unanswered messages, delivery failures, explicit non-promotional operational messaging and marketing opt-in/out.
**Ranch resources** (incrementally): horses (eligibility/rest/workload and approved status), guides/staff, riding capacity, event spaces and equipment limits. No automatic assignment of animals or riders without approval.
**Website content**: edit services/prices/policies, welcome text, current announcements, photos/video, real testimonials, published events; preview changes and audit publication.
**Insights**: inquiry-to-approved, approved-to-paid, attended, cancellation/no-show, repeat visitors, demand and revenue actually verified by Square; no invented forecasts.
**Settings**: operating hours, closures, policies, roles, linked calendars, connection health, message templates, notification preferences, data export/retention and audit.

### Authorized staff
JD is the final approval authority. Optional staff accounts have limited duties: schedule/support vs content editing vs owner access. Restrict personal/rider information to those who need it; log financial and reservation changes by actor.

## Calendar strategy — avoid the double-booking trap
**Turso ranch reservations are the booking source of truth.** External calendars contribute busy blocks and receive approved events. A Google or Calendly appointment alone must never auto-confirm a horse ride.
1. Connect one Google Calendar first through a secure account authorization flow. JD chooses which calendars to read, which one may receive confirmed ranch events, timezone, availability rule and whether private event titles are shown. Calendar data belongs to its owner.
2. Sync initial events then incremental changes; recover expired sync tokens, disconnected accounts and webhook/watch renewals; show last successful sync and failures in JD's settings.
3. External busy blocks prevent an automatic "free" assumption; personal titles can be hidden by default. Create/update/cancel ranch event only after correct approval/payment lifecycle; maintain a stable external event ID to prevent duplicates.
4. Calendly (if actually used) is a distinct integration: bring confirmed external schedules into the unified view through its current API and webhooks where available. Respect plan-dependent webhook access; do not pretend Calendly can perform all Google Calendar operations. Start read-only if no authoritative booking workflow is agreed.
5. Add Outlook/Microsoft 365 only if JD uses it. A generic iCal subscription can show *read-only* external blocks; it cannot guarantee live, two-way edits.
6. On changing a confirmed ride, manage external event changes, notifications, and payment/refund policy as one audited workflow. If syncing fails, flag "Needs attention"; never mark complete silently.
7. Reserve a specific ride resource/time atomically in Turso before final confirmation; check overlap with approved rides, pending reservations, horse/guide/arena constraints, external busy blocks and buffers. Concurrent requests for the same horse/guide/time must not both succeed.

## Customer history and responsible record handling
- Proposed entities: Customers; Rider Profiles (optional guardian link); Households/Groups; Reservations/Inquiry History; Ride Participants; Availability Blocks; Horses/Guides/Resources; External Calendar Accounts/Events; Payments/Refunds; Messages/Consents; Waivers; Staff/Roles; Website Content; Audit Events; Notification Preferences/Devices.
- Begin with a non-destructive adapter over existing `booking_inquiries` and `booking_events`, then migrate in stages with reversible schema changes and duplicate review. Normalize contact phone/identity; do not merge people solely because they share a phone number. A guardian may book for several riders.
- Retain only the minimum rider age/height/weight and notes required for JD's safety assessment and policies. Encrypt sensitive fields at rest where feasible; use least-privilege viewing, retention, export and deletion rules. Waivers need version, signature/guardian identity and durable proof; **do not treat a checkbox as a legally approved waiver**.
- Customer marketing consent is independent of booking/status communication. Honor STOP and other channel-specific opt-outs. Never infer consent from completed payment.
- Imported historical data is labeled with source/confidence. Do not transform contact clicks or IP logs into "customers".

## PWA and notifications
- One fast, HTTPS mobile-first public website with installability; private admin receives its own clearly named installed experience/shortcut once correct authenticated start URL, manifest scope and lifecycle are tested.
- Valid app icons (including maskable), manifest, home-screen installation, accessible tap targets, loading/empty/error states, responsive mobile design, and offline fallback. Do not promise offline booking or offline approval.
- Public static material may cache; NEVER cache authenticated admin pages, API responses, customer/rider data, payment information, or private calendar events. Show "Reconnect to continue" offline for admin operations.
- Future Firebase Cloud Messaging: preserve a deliberate service worker design now; later allow JD/staff to **opt in** to actionable notifications (new request, upcoming ride, failed payment, calendar sync fault). Minimize notification contents on locked devices; never include minors' details.
- Tokens are tied to authenticated person/device, rotate/expire/unsubscribe on logout, fail gracefully when permission denied, and retain other reliable communication methods. Sending requires server-side authorization, event deduplication, retries and delivery tracking.
- For customers, request push permission only after an understandable benefit and consent, not on first page load. Browser and platform support will differ. No claim "push is active" until real device receipt is verified.

## Security and reliability gates
- Replace old main-branch SHA256/password + in-memory admin session implementation by choosing the newer improved candidate or robust managed auth, with account recovery, role boundaries, login rate limits, session revocation and MFA option. Protect **both page routes and every private action**.
- Use scoped authorization for Google and Calendly, encrypted provider credentials, authenticated callback/state, narrow permissions, revoke/disconnect controls and secret-safe logs.
- Webhook signature verification, idempotent processing, transactional lifecycle changes, strict price validation and no double-payment links/confirmed ride duplication. Refunds/cancellations must use actual Square truth.
- Test production/preview data separation, backups and restores, migrations, webhooks, concurrency, incident recovery and rollback before launch.
- Remove unsupported structured ratings, invented opening hours and unverifiable "No. 1" SEO claims. Verify testimonials/photo permissions.
- Accessibility: keyboard and screen reader support, readable contrast/type, useful error messages and plain English; WCAG 2.2 AA target.
- Privacy: source of truth, access audit, retain/destroy/export per adopted policies. No personal calendar event details or rider records in public views or service worker caches.

## Phased plan and acceptance
**Phase 0 — Evidence and guardrails.** Inventory live deployment and branches, confirm owner/policies/pricing/resources/provider accounts, inspect existing DB without exposing customer data, select target branch. Result: signed-off baseline and rollback plan.
**Phase 1 — Private owner workspace.** Update Today dashboard to show real reservation state, add read-only Schedule and Customers history over existing Turso data, friendly status labels, basic search. Result: data present iff real data exists, pages owner-authenticated, no invented rides.
**Phase 2 — Reservation completeness.** Join multi-channel intake, approve/adjust/decline, Square links/webhooks/refunds, timed resource reservations and customer history; real testing. Result: end-to-end tests including payment failure, collisions, cancellations and reconnection.
**Phase 3 — Calendar connections.** Google first, then Calendly if JD uses it; external busy blocks, safe event publishing, controls, sync warnings and recovery. Result: create/change/cancel and disconnect/reconnect across calendars without double bookings.
**Phase 4 — Customer delight and content.** Full brand redesign, real imagery, service pages, content editing, helpful pre/post-visit communications. Result: full mobile/customer usability tests with no arbitrarily placed sections.
**Phase 5 — App experience.** Installable PWA verification on Android/iOS/desktop; safe static offline behavior, cache/privacy verification, upgrade and reinstallation scenarios. Result: installed public/app experience performs correctly on real devices.
**Phase 6 — Firebase push and growth.** Controlled rollout for JD first, then opt-in customers as appropriate; consent/device lifecycle, failure recovery, retention/repeat visit reports. Result: real push receipt, permission decline, logout unsubscribe and no sensitive lock-screen text.
**Phase 7 — Production proof.** Staging/live isolation, owner acceptance, access reviews, migrations, backups, measured real transactions, rollback plan, verified domain cutover, monitoring; label GO/CONDITIONAL GO/NO-GO. No public rollout on build-success alone.

## Priorities and economic logic
1. Prevent lost or double-booked rides and preserve JD's decision authority.
2. Give JD the daily schedule and returning-customer context he needs (time saved and repeat business).
3. Fix customer friction between interest, request, approval and payment (conversion).
4. Calendar sync before elaborate marketing automation (operating truth).
5. Maintainable branded content, then push/marketing optimization (compounding growth).

Track real completed rides, paid amount, contact-to-confirmed conversion, repeat visitor rate, average response time, booking conflicts, denied/failed payment rate, and operator time saved. Do not count call-clicks as paid customers.

## Explicit non-goals until verified
- No automatic rider/horse safety approval.
- No calendar provider described as "connected" without owner authorization and successful sync proof.
- No generic "connect any calendar" promise; support verified integrations individually.
- No customer PWA login by default; only if it materially helps and privacy requirements are satisfied.
- No stock imagery presented as JD's ranch, synthetic reviews, unapproved rates or unsupported ratings.
- No new competing CRM or reservation database, no direct production data migration without rollback.
- No production release, payment traffic or customer messaging without explicit successful end-to-end testing and owner acceptance.

## Known existing gaps as of this scope
- `main` admin Today shows contact logs/call vs email counts; `feature/whatsapp-first-production` adds reservation queue and JD actions but dashboard still presents contact clicks rather than daily rides.
- The first admin implementation uses process-memory sessions and SHA256 passwords; the later branch has stronger signed session auth, but rate-limiting, individual staff roles and end-to-end deployment protections remain unverified.
- PWA `public/sw.js` tries precaching `/globals.css`, which is not a published static path in the inspected project; caching every request from the same origin is unsafe for private admin and customer records.
- Static metadata currently claims opening hours and an aggregate rating that have not been substantiated in this audit.
- Customer history and external calendar provider integrations have not been verified as implemented.
- WhatsApp-first branch has a READY Vercel preview; READY alone does not certify actual external Meta/Square/Turso transactions.

## Implementation tracking
Each change gets: owner, user outcome, exact files/dependencies, prerequisites, tests, security review, release gate and rollback instructions. Keep customer-facing wording plain: "Request a Ride", "Awaiting JD", "Payment needed", "Confirmed", "Today's rides", "Customers", "Connected calendars", "Needs attention".
