# JD's Horse Ranch PWA

Progressive Web App for JD's Horse Ranch with smart call logging and push notifications.

**🔴 LIVE**: https://jds-horse-ranch-pwa.vercel.app

## Features

- ✅ Mobile-first responsive design (matches original site)
- ✅ Offline gallery & service info (service worker caching)
- ✅ One-tap calling with contact logging (timestamp, IP, user-agent)
- ✅ Installable PWA (Add to Home Screen on mobile)
- ✅ Push notifications ready (Firebase config needed)
- ✅ Fast load times (<1s First Contentful Paint)
- ✅ Full-page gallery with lightbox
- ✅ Customer testimonials
- ✅ Maps integration

## Quick Start

```bash
# Install dependencies
npm install

# Local development
npm run dev
# Open http://localhost:3000

# Build for production
npm run build

# Start production server
npm start
```

## Deploy

```bash
# GitHub (already connected)
git push origin main

# Vercel auto-deploys or use:
vercel --prod --yes
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

## Next Steps

### Priority 1: Firebase Push Notifications
- [ ] Set up Firebase Cloud Messaging
- [ ] Add push notification handler to service worker
- [ ] Test notifications on mobile

### Priority 2: Persistent Contact Logging
- [ ] Integrate Supabase or MongoDB for contact logs
- [ ] Update `/api/contact` to save to database
- [ ] Create admin dashboard to view contacts

### Priority 3: Analytics
- [ ] Add Google Analytics
- [ ] Track call button clicks
- [ ] Monitor user engagement by section

## Setup Instructions

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Firebase Cloud Messaging setup
- Environment variables configuration
- Persistent database integration
- Admin dashboard creation

## API Reference

### POST /api/contact
Log a contact attempt when user clicks call button.

**Request:**
```json
{
  "type": "call",
  "source": "/"
}
```

**Response:**
```json
{
  "success": true,
  "log": {
    "timestamp": "2026-02-01T02:00:00Z",
    "type": "call",
    "source": "/",
    "userAgent": "Mozilla/5.0...",
    "ip": "203.0.113.45"
  }
}
```

### GET /api/contact
View recent contact logs (dev endpoint).

**Response:**
```json
{
  "total": 5,
  "recent": [
    { "timestamp": "...", "type": "call", "source": "/", "ip": "..." }
  ]
}
```
