# Deployment Guide

## Current Status

✅ **Live in Production**: https://jds-horse-ranch-pwa.vercel.app

- Next.js 14 PWA deployed to Vercel
- Service worker registered for offline caching
- Contact API logging calls with timestamp/IP/user-agent
- Mobile-responsive design matching original site
- All services, gallery, testimonials, and contact info intact

## GitHub Repository

https://github.com/wizelements/jds-horse-ranch-pwa

## What's Included

### Features
- ✅ Responsive homepage with hero section
- ✅ Service cards (Riding Lessons, Trail Rides, Special Events)
- ✅ Photo gallery with lightbox
- ✅ Customer testimonials
- ✅ Contact section with maps link
- ✅ Call button with logging
- ✅ PWA manifest for installable app
- ✅ Service worker for offline caching
- ✅ Firebase setup (ready for push notifications)

### API Routes
- `POST /api/contact` - Log contact attempts (type, source, IP, user-agent, timestamp)
- `GET /api/contact` - View recent contact logs

## Next Steps: Firebase Push Notifications

To enable push notifications to JD's phone:

### 1. Create Firebase Project
```bash
# Go to https://console.firebase.google.com
# Create new project → Enable Cloud Messaging
```

### 2. Get Credentials
```bash
# In Firebase Console:
# Project Settings → Cloud Messaging tab
# Copy the credentials and VAPID key
```

### 3. Set Environment Variables on Vercel
```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
vercel env add NEXT_PUBLIC_FIREBASE_VAPID_KEY
```

### 4. Set Up Service Worker for Push Messages
Update `public/sw.js` to handle push notifications:
```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, data);
});
```

### 5. Send Notifications
From backend (Node.js/Python):
```javascript
const admin = require('firebase-admin');

admin.messaging().send({
  notification: {
    title: 'New Contact Request',
    body: 'Someone called from the website'
  },
  webpush: {
    fcmOptions: { link: 'https://jds-horse-ranch-pwa.vercel.app' }
  },
  token: userFCMToken
});
```

## Optional: Persistent Contact Logging

Current contact logs are in-memory (reset on redeploy). For persistence:

### Option A: Supabase
```bash
# Create Supabase project
# Add contact_logs table with: timestamp, type, source, ip, user_agent
# Update /api/contact route to use Supabase client
```

### Option B: MongoDB
```bash
# Create MongoDB cluster
# Update /api/contact to insert into contacts collection
```

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

## Deployment

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on git push
# Or manual deploy
vercel --prod --yes
```

## Customization

- **Colors**: Edit `tailwind.config.ts` (ranch-brown: #8B6F47, ranch-cream: #F5E6D3)
- **Images**: Update gallery URLs in `components/Gallery.tsx`
- **Services**: Modify pricing in `components/Services.tsx`
- **Phone Number**: Update in Hero, Services, and Contact components

## Monitoring

View Vercel logs:
```bash
vercel logs jds-horse-ranch-pwa --prod
```

View recent contact attempts:
```bash
curl https://jds-horse-ranch-pwa.vercel.app/api/contact
```

## Support

For questions about Next.js PWA setup, see:
- https://nextjs.org/docs
- https://web.dev/progressive-web-apps/
- https://firebase.google.com/docs/cloud-messaging/js
