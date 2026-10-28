# JD's Horse Ranch — phone-first guest experience

JD handles new reservations through a real telephone conversation, not website forms, SMS, WhatsApp, chatbot, or email intake. Public CTAs consistently open `tel:+14049812361` and display the number for desktop visitors. Service prices are indicative until JD confirms them over the phone.

The public website remains a premium visual introduction to the ranch, its experiences, photographs, questions, location, and an invitation to call. Do not imply that tapping a call link proves a phone call was completed or that availability is known.

`POST /api/booking` intentionally returns HTTP 410; it no longer writes guest intake to Turso. The legacy booking data and private admin remain intact for existing records. No new WhatsApp or SMS outbound messages are permitted.

**Owner workflow remains partly manual:** JD discusses details on the phone. The existing private reservation queue contains historical records only; it does not automatically record new calls. Calendar integration, new phone-booking capture inside admin, and production Square verification need separate certification. Do not claim these are already operational.

All customers are expected to speak directly with JD. The site does not promise immediate pickup, staffing hours, a booked time, or a guaranteed response.
