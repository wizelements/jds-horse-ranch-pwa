# JD's Horse Ranch Reservation Assistant

Production-oriented Next.js PWA for JD's Horse Ranch with governed reservation intake, JD approval, booking-specific Square checkout, WhatsApp/SMS communication, lifecycle reminders, and a Turso/libSQL database.

## Governing booking rule

JD remains the approval authority.

```
Customer request
→ 24-hour provisional hold
→ JD conversation/review
→ JD approves final time + amount
→ booking-specific Square checkout
→ Square webhook verifies completed payment
→ booking confirmed
→ reminder
→ ride
→ follow-up
```

No customer receives a payment request before JD approves.

## Database

**Turso is the database source of truth.**

Required variables:

```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

Apply/verify the schema:

```bash
npm run db:migrate
npm run db:verify
```

The canonical schema is `turso/schema.sql`.

A one-time legacy importer is available for existing Supabase records:

```bash
LEGACY_SUPABASE_URL=...
LEGACY_SUPABASE_SERVICE_ROLE_KEY=...
npm run db:migrate:legacy
```

Remove those legacy credentials after migration.

Supabase is not used as the application database. The existing gallery may continue using a Supabase Storage bucket for image objects; gallery metadata is stored in Turso.

## Core capabilities

- Website reservation intake
- WhatsApp Cloud API intake
- Optional Twilio SMS intake
- Unified Turso reservation record
- Rider age/height/weight collection
- Preferred and alternate date/time
- Separate marketing consent
- 24-hour provisional hold
- JD admin decision queue
- JD-controlled final time and price
- Booking-specific Square Checkout
- Signed Square webhook payment verification
- Automatic hold expiry
- Confirmation retry
- ~24-hour ride reminders
- Post-ride follow-up
- Durable signed admin sessions
- Audit/event history
- Contact logging
- Service/testimonial/gallery administration

## Development

```bash
npm ci
npm run db:verify
npm run lint
npm run type-check
npm run build
npm run dev
```

## Release gates

CI requires:

1. reproducible `npm ci`
2. production dependency audit
3. lint
4. executable Turso schema verification
5. TypeScript check
6. production Next.js build

The feature is intentionally kept off production until external credentials, Turso migration, Square webhook verification, and real messaging E2E tests pass.

## Environment

See `.env.example` and `WHATSAPP_SETUP.md` for the current production variables and activation sequence.

## Production site

Current public baseline: https://jds-horse-ranch-pwa.vercel.app
