# JD's Horse Ranch — telephone-first experience

Guests call JD at (404) 981-2361 to discuss and book. Public CTAs are telephone links, with the number visible on desktops. No public forms, WhatsApp, SMS, automated customer messaging, or live availability claims.

The private admin can record a conversation at `/admin/inquiries/new`. This owner-only entry saves a phone-origin record (`voice`) to Turso in the status `PENDING_JD`, for JD's review. No customer messages are sent; a `phone_conversation_recorded` event records manual entry, not automatic phone tracking.

`POST /api/booking` is HTTP 410 and does not collect requests. Historical records remain. Existing signed Square events can verify paid bookings. Automated lifecycle notifications and inbound SMS handling are disabled.

Production admin needs real login credentials and Turso. Square payments require configured merchant keys and end-to-end certification. Automatic inbound phone logging, calendar integrations, and production payments are not yet certified; the design must not imply they are.
