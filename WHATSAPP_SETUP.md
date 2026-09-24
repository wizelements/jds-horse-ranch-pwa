# JD's Horse Ranch Reservation Assistant V1

## Operating rule

Automation handles intake, persistence, payment delivery, settlement verification, reminders, and follow-up. **JD remains the approval authority.** No customer receives a payment request until JD personally approves the final ride time and amount.

## Lifecycle

```
COLLECTING_INFORMATION
  -> PENDING_JD (24-hour provisional hold)
  -> AWAITING_PAYMENT (JD approved + booking-specific Square link)
  -> BOOKED (Square webhook verified COMPLETED payment + exact amount/order match)
  -> COMPLETED
```

Terminal outcomes: `DECLINED`, `CANCELLED`, `EXPIRED`.

## Customer channels

- Website: `POST /api/booking`
- WhatsApp Cloud API: `/api/whatsapp/webhook`
- Optional Twilio SMS: `/api/sms/webhook`
- Voice remains intentionally outside V1 until the text reservation path is proven.

All channels write to the same Turso `booking_inquiries` table.

## Database — Turso / libSQL

Turso is the primary database for the entire application:

- booking inquiries
- communication history
- booking event/audit history
- contact logs
- services
- testimonials
- gallery metadata
- site settings

Required server environment:

```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

Apply the canonical schema:

```
npm run db:migrate
```

That executes `turso/schema.sql`.

If the existing production Supabase database contains data that must be preserved, set temporary legacy credentials:

```
LEGACY_SUPABASE_URL=
LEGACY_SUPABASE_SERVICE_ROLE_KEY=
```

Then run:

```
npm run db:migrate:legacy
```

The one-time importer copies compatible records into Turso. Remove the legacy credentials immediately after migration.

Supabase is **not** used as the application database after this cutover. It remains optional only for the existing gallery image bucket; image metadata is stored in Turso.

## Square

JD's approval action calls Square Checkout:

```
POST /v2/online-checkout/payment-links
```

The request creates a booking-specific hosted checkout using the JD-approved amount. The resulting Square order ID and payment-link ID are persisted in Turso.

Configure Square webhooks for:

- `payment.created`
- `payment.updated`

Notification URL:

```
https://jdshorseranch.com/api/square/webhook
```

The webhook validates `x-square-hmacsha256-signature`, requires `payment.status === COMPLETED`, matches the Square `order_id`, and verifies the exact expected USD amount before changing the inquiry to `BOOKED`.

## WhatsApp

Callback:

```
https://jdshorseranch.com/api/whatsapp/webhook
```

The GET handshake uses `WHATSAPP_VERIFY_TOKEN`. POST requests require a valid `X-Hub-Signature-256` generated with `WHATSAPP_APP_SECRET`.

Interactive bot replies use text messages. Proactive lifecycle messages use approved WhatsApp templates.

## SMS

SMS is optional and uses Twilio Programmable Messaging.

```
https://jdshorseranch.com/api/sms/webhook
```

Set `TWILIO_SMS_WEBHOOK_URL` to the exact same URL so signature validation uses the exact configured address.

## Lifecycle automation

Vercel Cron calls:

```
GET /api/cron/booking-lifecycle
```

The route requires `Authorization: Bearer $CRON_SECRET` and handles hold expiry, confirmation retries, reminders, and completed-ride follow-up.

## Admin

`/admin/inquiries` is JD's decision queue.

For a pending request JD enters:

1. final approved ride date/time
2. final approved total
3. optional adjustment/note

Then **Approve + create Square payment** creates the booking-specific checkout and sends it through the customer's chosen channel.

There is intentionally no manual "mark paid" action. Payment settlement is Square-verified.

## Security closure required before production

A local environment file was historically tracked in the repository. Removing it from the current tree does not invalidate credentials that may have appeared in Git history. Rotate every credential that was ever stored there before production promotion.

Admin sessions require fresh V2 credentials:

- `ADMIN_PASSWORD_HASH_V2`
- `ADMIN_PASSWORD_SALT_V2`
- `SESSION_TOKEN_SECRET_V2`

## Activation checklist

1. Rotate any historically committed secrets.
2. Create/select the Turso database and obtain a fresh database URL/token.
3. Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Preview and Production.
4. Run `npm run db:migrate`.
5. If needed, run the one-time Supabase→Turso migration and then remove the legacy credentials.
6. Configure the optional gallery storage credentials.
7. Configure Square access token, location, webhook signature key, and webhook subscription.
8. Configure WhatsApp credentials and approved operational templates.
9. Optionally configure Twilio SMS.
10. Set a strong `CRON_SECRET`.
11. Generate fresh V2 admin credentials.
12. Verify CI, preview build, and the complete customer → JD → Square → confirmation lifecycle.
13. Promote only after the full path passes.
