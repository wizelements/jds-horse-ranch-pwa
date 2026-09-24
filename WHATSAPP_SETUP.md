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

All channels write to the same `booking_inquiries` table.

## Database

Apply:

```
supabase/migrations/002_whatsapp_intake.sql
```

Despite the historical filename, this migration now creates the complete shared reservation model:

- `booking_inquiries`
- `communication_messages`
- `booking_events`

RLS is enabled with no public policies. Server routes use `SUPABASE_SERVICE_ROLE_KEY`.

## Square

JD's approval action calls Square Checkout:

```
POST /v2/online-checkout/payment-links
```

The request creates a booking-specific hosted checkout using the JD-approved amount. The resulting Square order ID and payment-link ID are persisted on the inquiry.

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

Interactive bot replies use text messages. Proactive lifecycle messages use approved WhatsApp templates. Configure these template names:

- `WHATSAPP_PAYMENT_TEMPLATE_NAME` — body vars: approved time, Square URL
- `WHATSAPP_DECLINE_TEMPLATE_NAME` — body var: JD note/reason
- `WHATSAPP_CONFIRMATION_TEMPLATE_NAME` — body var: confirmed time
- `WHATSAPP_REMINDER_TEMPLATE_NAME` — body var: confirmed time
- `WHATSAPP_EXPIRED_TEMPLATE_NAME` — no body vars
- `WHATSAPP_FOLLOWUP_TEMPLATE_NAME` — body var: review URL when used

## SMS

SMS is optional and uses Twilio Programmable Messaging. Configure the incoming message webhook as:

```
https://jdshorseranch.com/api/sms/webhook
```

Set `TWILIO_SMS_WEBHOOK_URL` to the exact same URL so signature validation uses the exact configured address.

## Lifecycle automation

Vercel Cron calls:

```
GET /api/cron/booking-lifecycle
```

hourly. The route requires `Authorization: Bearer $CRON_SECRET` and performs:

- expiration of unapproved 24-hour holds
- retry of booking confirmations that previously failed delivery
- reminders approximately 24 hours before the approved start
- post-ride follow-up after JD marks a ride complete

## Admin

`/admin/inquiries` is JD's decision queue.

For a pending request JD enters:

1. final approved ride date/time
2. final approved total
3. optional adjustment/note

Then **Approve + create Square payment** creates the booking-specific checkout and sends it through the customer's chosen channel.

There is intentionally no manual "mark paid" action. Payment settlement is Square-verified.

## Required production environment

Copy the variable names from `.env.example` into Vercel Production and Preview environments as appropriate. Never commit actual values.

## Security closure required before production

A local environment file was historically tracked in the repository. Removing the file from the current tree does not invalidate credentials that may have appeared in Git history. Rotate every credential that was ever stored there before production promotion.

Admin sessions are now stateless HMAC-signed cookies rather than process memory, so serverless restarts do not invalidate legitimate sessions.

## Activation checklist

1. Rotate any historically committed secrets.
2. Apply migration 002.
3. Set Supabase service role key.
4. Configure Square access token, location, webhook signature key, and webhook subscription.
5. Configure WhatsApp business credentials and approved operational templates.
6. Optionally configure Twilio SMS.
7. Set a strong `CRON_SECRET`.
8. Set `SESSION_TOKEN_SECRET` and admin password credentials.
9. Deploy a preview and run type-check/build.
10. Test: web request, WhatsApp intake, hold expiration, JD approval, Square checkout, signed Square payment webhook, confirmation, reminder, completion, follow-up.
11. Promote only after the full path passes.
