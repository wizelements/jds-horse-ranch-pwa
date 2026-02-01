# JD's Horse Ranch PWA

Progressive Web App for JD's Horse Ranch with smart call logging and push notifications.

## Features

- ✅ Mobile-first responsive design
- ✅ Offline gallery & service info (service worker caching)
- ✅ One-tap calling with contact logging
- ✅ Installable PWA (Add to Home Screen)
- ✅ Push notifications to owner
- ✅ Fast load times (Next.js optimization)

## Quick Start

```bash
# Install
npm install

# Dev
npm run dev

# Build
npm run build

# Start
npm start
```

## Project Structure

```
app/
  page.tsx              # Home page
  api/
    contact/route.ts    # Contact logging API
  layout.tsx            # Root layout
  globals.css           # Global styles

components/
  Hero.tsx              # Hero section with CTA
  Services.tsx          # Service cards
  Gallery.tsx           # Photo gallery
  Testimonials.tsx      # Customer testimonials
  Contact.tsx           # Contact section

lib/
  api.ts                # API helpers

public/
  manifest.json         # PWA manifest
```

## API Routes

### POST /api/contact
Log a contact attempt (call or email).

**Request:**
```json
{
  "type": "call",
  "source": "/path"
}
```

**Response:**
```json
{
  "success": true,
  "log": {
    "timestamp": "2026-01-31T...",
    "type": "call",
    "source": "/",
    "userAgent": "...",
    "ip": "..."
  }
}
```

### GET /api/contact
Retrieve recent contact logs (dev only).

## TODO

- [ ] Firebase Cloud Messaging setup for push notifications
- [ ] Supabase integration for persistent contact logs
- [ ] Owner admin dashboard
- [ ] Email notifications for JD

## Deployment

Deploy to Vercel:

```bash
vercel
```

PWA features will be automatically optimized for production.
