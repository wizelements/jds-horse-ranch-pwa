# Quick Deploy Guide

**Time needed: ~30 minutes**

## What You Need

From your Supabase project dashboard (https://supabase.com/dashboard):
- Project URL (looks like: `https://xxxxx.supabase.co`)
- Anon Public Key (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

A secure password (at least 12 characters, mix of letters/numbers/symbols)

## Step 1: Hash Your Password

Windows PowerShell:
```powershell
$password = "your-secure-password-here"
$hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($password))
[System.BitConverter]::ToString($hash) -replace "-", ""
```

Mac/Linux:
```bash
echo -n "your-secure-password-here" | sha256sum
```

Or use web tool: https://www.tools.hashashish.com/hash_sha256

**Copy your hash - you'll need it next.**

## Step 2: Supabase Setup (5 minutes)

1. Create storage bucket:
   - Go to Supabase dashboard
   - Click **Storage** (left menu)
   - Click **+ New Bucket**
   - Name: `gallery-photos`
   - Toggle **Public** ON
   - Click **Create**

2. Run migrations:
   - Click **SQL Editor** (left menu)
   - Click **New Query**
   - Copy entire `supabase/migrations/001_init_schema.sql`
   - Paste into editor
   - Click **Run**
   - Wait for ✅

## Step 3: Local Testing (5 minutes)

```bash
# Install Supabase
npm install

# Create .env.local with your values:
```

Create file `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-key...
ADMIN_PASSWORD_HASH=your-hash-from-step-1
SESSION_TOKEN_SECRET=random-secret-string-123
```

```bash
# Start dev server
npm run dev
```

Visit http://localhost:3000/admin/login and test login.

## Step 4: Push to GitHub (2 minutes)

```bash
git add .
git commit -m "Add admin dashboard with Supabase"
git push
```

**Do NOT commit .env.local** (it's already in .gitignore)

## Step 5: Deploy to Vercel (10 minutes)

1. Go to https://vercel.com/dashboard
2. Click your project: `jds-horse-ranch-pwa`
3. Click **Settings** → **Environment Variables**
4. Add these variables (copy from your .env.local):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://your-project.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ...your-key... |
| `ADMIN_PASSWORD_HASH` | your-hash |
| `SESSION_TOKEN_SECRET` | random-string |

5. Click **Deployments** tab
6. Find latest commit
7. Click **Redeploy**
8. Wait for ✅ green checkmark (2-3 minutes)

## Step 6: Test Live Admin (5 minutes)

Visit: https://jds-horse-ranch-pwa.vercel.app/admin/login

Login with your password. Test:
- [ ] Dashboard loads
- [ ] Click Services → can see 3 services
- [ ] Click Testimonials → can add new
- [ ] Click Gallery → can upload photo
- [ ] Click Contacts → can export CSV

## Done! 🎉

Your admin dashboard is now live.

## First Time Using Admin?

See **ADMIN_README.md** for how to manage:
- Services (pricing, descriptions)
- Testimonials (customer reviews)
- Gallery (photos)
- Contacts (logs)

## Troubleshooting

**"Login failed"**
- Check password hash is correct in Vercel env vars
- Clear browser cache

**"Database connection error"**
- Check URL and API key are correct
- Make sure you ran the SQL migrations

**"Photo upload failed"**
- Check `gallery-photos` bucket exists
- Check it's set to Public

**Anything else broken?**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear cache: Settings → Privacy → Clear Cookies
- Contact a developer

---

**Questions? See DEPLOYMENT_CHECKLIST.md for detailed instructions.**
