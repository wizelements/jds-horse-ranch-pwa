# JD's Horse Ranch — WhatsApp-First Reservation System

## Product rule

The website is a trust-and-conversion surface. **WhatsApp is the primary reservation desk.**

The ranch phone number and email may appear as general contact information, but the public site must not advertise calling as the booking path.

JD remains the reservation approval authority. Square remains the payment-settlement authority.

## Production flow

```text
Website
  -> Start Booking on WhatsApp
  -> WhatsApp Cloud API
  -> /api/whatsapp/webhook
  -> structured reservation intake
  -> Turso
  -> PENDING_JD
  -> JD admin review
  -> approve / adjust / decline
  -> Square payment link after approval
  -> Square webhook verifies completed payment
  -> BOOKED
  -> WhatsApp confirmation
  -> reminder
  -> ride
  -> completion / follow-up
```

No customer is told to call JD to complete this flow.

## Booking lifecycle

```text
COLLECTING_INFORMATION
  -> PENDING_JD
  -> AWAITING_PAYMENT
  -> BOOKED
  -> COMPLETED
```

Terminal outcomes:

- `DECLINED`
- `CANCELLED`
- `EXPIRED`

Customer change requests do not overwrite the current booking automatically. They remain pending until JD approves or declines the requested change.

## WhatsApp commands

The reservation assistant supports:

- `BOOK` — begin/continue a request
- `STATUS` — show the current booking state
- `CHANGE` — request a reservation change
- `HUMAN` or `JD` — pause automation and request JD
- `RESUME` — resume the assistant after human takeover
- `CANCEL` — cancel an unpaid active request
- `STOP`, `UNSUBSCRIBE`, or `OPT OUT` — disable promotional messaging
- `HELP` — show available controls

Necessary reservation messaging is kept separate from optional marketing consent.

## Human takeover

When a customer sends `HUMAN` or `JD`:

1. the inquiry is marked `automation_paused`;
2. JD sees the takeover request in `/admin/inquiries`;
3. JD can send a free-form WhatsApp reply while the customer's 24-hour service window is open;
4. the assistant remains paused until JD or the customer resumes it.

If the free-form window is closed, business-initiated contact must use an approved WhatsApp template.

## WhatsApp delivery truth

Inbound messages are deduplicated using the provider message ID.

Outbound status webhooks are persisted in `communication_status_events`, including:

- sent
- delivered
- read
- failed

Do not infer successful delivery merely because the Cloud API accepted the send request.

## WhatsApp Cloud API configuration

Callback URL:

```text
https://jdshorseranch.com/api/whatsapp/webhook
```

The GET verification handshake uses:

```text
WHATSAPP_VERIFY_TOKEN
```

POST webhook signatures are verified from the raw request body with:

```text
X-Hub-Signature-256
WHATSAPP_APP_SECRET
```

Required production environment:

```text
NEXT_PUBLIC_WHATSAPP_NUMBER=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_GRAPH_VERSION=
WHATSAPP_TEMPLATE_LANGUAGE=en_US
```

`WHATSAPP_GRAPH_VERSION` is intentionally explicit. Do not rely on a hard-coded fallback; set the currently supported Graph API version during Meta activation.

## Approved utility templates

Configure these template environment variables:

```text
WHATSAPP_PAYMENT_TEMPLATE_NAME=jd_booking_payment_ready
WHATSAPP_DECLINE_TEMPLATE_NAME=jd_booking_update
WHATSAPP_CONFIRMATION_TEMPLATE_NAME=jd_booking_confirmed
WHATSAPP_REMINDER_TEMPLATE_NAME=jd_booking_reminder
WHATSAPP_EXPIRED_TEMPLATE_NAME=jd_request_expired
WHATSAPP_FOLLOWUP_TEMPLATE_NAME=jd_ride_followup
WHATSAPP_UPDATE_TEMPLATE_NAME=jd_booking_change_update
```

Recommended purposes:

### Payment ready

Parameters:

1. approved date/time
2. Square checkout URL

The message must make clear that approval is not the same as payment confirmation.

### Booking confirmed

Parameter:

1. confirmed date/time

Send only after Square reports the expected payment as completed.

### Reminder

Parameter:

1. appointment date/time

### Decline / booking update

Use for JD-reviewed reservation updates that may occur outside the free-form customer-service window.

### Expired request

Use when a provisional request expires before JD approval.

### Follow-up

Use after the completed ride for feedback/review follow-up.

## Database

Turso/libSQL is the application database.

Required environment:

```text
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

Apply the migration explicitly:

```bash
npm run db:migrate
npm run db:verify
```

Vercel builds **do not run database migrations**. Database mutation during application build is intentionally prohibited.

The migration upgrades existing databases with the WhatsApp operational fields when needed.

## Square

JD's approval creates a booking-specific Square payment link.

Configure:

```text
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_API_VERSION=
SQUARE_WEBHOOK_SIGNATURE_KEY=
SQUARE_WEBHOOK_NOTIFICATION_URL=https://jdshorseranch.com/api/square/webhook
```

Subscribe to the required payment events for the implementation:

- `payment.created`
- `payment.updated`

The webhook:

1. validates the Square signature;
2. requires `payment.status === COMPLETED`;
3. matches the stored Square order ID;
4. requires exact expected USD amount;
5. only then moves the inquiry to `BOOKED`.

There is intentionally no manual "mark paid" control.

## Admin

JD's queue:

```text
/admin/inquiries
```

For a new pending request JD can:

- enter the final approved date/time;
- enter the final amount;
- add an optional note;
- approve and create the Square checkout;
- decline the request.

For a customer change request JD can:

- approve a new date/time;
- keep the existing booking.

For human takeover JD can:

- reply in WhatsApp while the 24-hour service window is open;
- resume the automated assistant.

## Lifecycle automation

Vercel Cron calls:

```text
GET /api/cron/booking-lifecycle
Authorization: Bearer $CRON_SECRET
```

It handles:

- expired provisional requests;
- confirmation retry;
- appointment reminder;
- completed-ride follow-up.

## Production environment gate

Production Vercel deployment fails closed if required Turso, admin, WhatsApp, Square, or cron configuration is missing.

Preview deployments are allowed to build without production secrets so UI and compile behavior can be tested safely.

Preview and production should have intentionally separated secrets and databases when preview webhook/integration testing is enabled.

## Security rules

Before production promotion:

- rotate any credential ever committed to Git history;
- keep Meta, Turso, Square, admin, and cron secrets server-only;
- verify Meta webhook HMAC before parsing/trusting the payload;
- verify Square webhook signatures;
- retain message/event idempotency;
- keep JD approval authoritative;
- keep Square settlement authoritative;
- do not let AI invent availability, price, approval, payment success, or rider/horse safety clearance;
- store audit events for consequential state transitions.

## Verification commands

```bash
npm ci
npm audit --omit=dev --audit-level=high
npm run lint
npm run db:verify
npm run test:whatsapp
npm run type-check
npm run build
```

`npm run test:whatsapp` is a regression contract. It fails if the public booking UI reintroduces `Call Now`, `Call JD`, or a `tel:` booking link.

## Activation sequence

1. Rotate historically exposed credentials.
2. Create/select the production Turso database.
3. Set Turso credentials.
4. Run `npm run db:migrate`.
5. Verify `npm run db:verify`.
6. Configure the Meta Business Portfolio, WABA, ranch phone number, Cloud API credentials, and explicit Graph API version.
7. Configure the webhook callback and verification token.
8. Subscribe the WABA/app to message webhook events.
9. Create and approve all required utility templates.
10. Configure Square credentials and payment webhooks.
11. Configure fresh V2 admin credentials.
12. Set `CRON_SECRET`.
13. Configure all production Vercel environment values.
14. Verify the GitHub CI gate.
15. Verify a Vercel preview.
16. Test customer intake end-to-end.
17. Test JD approval and adjustment.
18. Test Square payment verification.
19. Test confirmation, reminder, and follow-up templates.
20. Test `STATUS`, `CHANGE`, `HUMAN`, `RESUME`, `CANCEL`, and `STOP`.
21. Test duplicate webhook replay.
22. Test sent/delivered/read/failed status persistence.
23. Promote only after the full lifecycle has reproducible evidence.

## Optional Meta administration layer

If the WhatsApp Business Tools MCP beta is available for the account, use it for Meta asset administration and debugging:

- discover the business/WABA;
- onboard/register the phone number;
- manage templates;
- configure webhooks;
- debug the Meta integration.

The production customer path remains Cloud API -> this application's webhook -> booking engine. The MCP is an administration/developer tool, not the customer runtime.
