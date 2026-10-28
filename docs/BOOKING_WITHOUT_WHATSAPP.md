# JD's Horse Ranch: web-first reservations

WhatsApp is not required for new or existing site deployments. Public CTAs use `#request-ride`; the form POSTs to `/api/booking` and writes a `PENDING_JD` record to Turso. JD reviews it privately; approval creates a Square payment link and a verified Square payment event is required to mark the ride `BOOKED`.

**Important:** Online requests do not send automatic notifications, and the site does not promise that they do. JD must contact the guest manually using the phone or email in the reservation queue and share any approved payment link. An optional separately configured Twilio SMS workflow continues for records whose preferred channel is SMS.

Historical WhatsApp communication rows and booking channel values remain in the Turso schema to avoid destructive migrations. The public links, WhatsApp webhook endpoint, provider sender module, and mandatory WhatsApp environment variables have been removed. Remove any WhatsApp webhook subscription pointing to this project from Meta separately; the old webhook URL no longer responds in new deployments.

Production still requires real Turso, secure admin authentication, Square payment keys, Square webhook configuration and `CRON_SECRET`. A successful preview build does not validate those external dependencies.
