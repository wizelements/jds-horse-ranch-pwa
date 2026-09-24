# WhatsApp Bot Setup — JD's Horse Ranch

## Purpose

This integration adds WhatsApp as a controlled booking-intake channel. It does **not** auto-approve rides.

Required flow:

1. Customer starts on WhatsApp.
2. Bot collects name, rider count, rider height/weight, requested date/time, experience, and optional email.
3. Request enters `PENDING_JD`.
4. Customer is told the requested spot is held for up to 24 hours and must call JD.
5. JD personally confirms, declines, or changes the request.
6. Only after JD approval does the admin action send `JD_PAYMENT_URL`.
7. Payment/booking states can then be marked in the admin queue.

## Meta / WhatsApp Cloud API

Configure the public callback URL:

```
https://jdshorseranch.com/api/whatsapp/webhook
```

Set the same value you choose for `WHATSAPP_VERIFY_TOKEN` in Meta's webhook configuration.

Subscribe the WhatsApp Business Account to the messages webhook field.

## Required environment variables

```
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=14049812361
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_GRAPH_VERSION=v26.0
JD_PAYMENT_URL=
```

`JD_PAYMENT_URL` should be the approved Square payment URL for the ranch workflow.

## Database

Apply:

```
supabase/migrations/002_whatsapp_intake.sql
```

The migration creates `booking_inquiries` and `whatsapp_messages`, enables RLS, and intentionally adds no public policies. Server routes use the service role key.

## Security

The POST webhook validates Meta's `X-Hub-Signature-256` using `WHATSAPP_APP_SECRET`. Unsigned or invalid webhook requests are rejected.

Never commit real tokens or local environment files.
