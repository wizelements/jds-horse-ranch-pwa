# Environment Variables Setup

## Quick Setup (Manual in Vercel Dashboard)

### Step 1: Go to Vercel Settings
1. Visit: https://vercel.com/dashboard
2. Click: `jds-horse-ranch-pwa` project
3. Click: **Settings** (top navigation)
4. Click: **Environment Variables** (left sidebar)

### Step 2: Get Your Supabase Credentials

From your Supabase project (https://supabase.com/dashboard):

1. **Project URL**
   - Click: **Settings** → **API**
   - Copy: The `Project URL` (looks like: `https://xxxxx.supabase.co`)

2. **Anon Public Key**
   - Same page: Copy the `Anon Public` key (starts with: `eyJ...`)

### Step 3: Generate Admin Password Hash

Open PowerShell and run:
```powershell
$password = "your-secure-password-here"
$hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($password))
[System.BitConverter]::ToString($hash) -replace "-", ""
```

Or use web tool: https://www.tools.hashashish.com/hash_sha256

### Step 4: Add Variables to Vercel

In Vercel Settings → Environment Variables, click **Add New** and fill in:

| Name | Value | Scope |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...your-key...` | Production, Preview, Development |
| `ADMIN_PASSWORD_HASH` | `your-hash-from-step-3` | Production, Preview, Development |
| `SESSION_TOKEN_SECRET` | `random-string-123456` | Production only |

**Important**: Check all three scopes for the first 3 variables:
- ✅ Production
- ✅ Preview  
- ✅ Development

For `SESSION_TOKEN_SECRET`, only check:
- ✅ Production

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Find the latest commit (should be the admin dashboard one)
3. Click **Redeploy**
4. Wait for ✅ green checkmark (2-3 minutes)

### Step 6: Test

Visit: https://jds-horse-ranch-pwa.vercel.app/admin/login

Try logging in with your password. If successful, you're done!

---

## CLI Method (Advanced)

If you prefer using CLI:

```powershell
cd c:/Users/jacla/projects/jds-horse-ranch-pwa

# Add each variable
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add ADMIN_PASSWORD_HASH
npx vercel env add SESSION_TOKEN_SECRET

# Redeploy
npx vercel deploy --prod

# Verify
npx vercel env ls
```

When prompted for values, paste them in. The CLI will handle the rest.

---

## What You Should Have

After setup:

```
✅ NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...your-key...
✅ ADMIN_PASSWORD_HASH = your-hash-here
✅ SESSION_TOKEN_SECRET = random-secret
```

All four should appear in:
https://vercel.com/dashboard/jds-horse-ranch-pwa/settings/environment-variables

---

## Troubleshooting

**Can't find Environment Variables in Settings?**
- Make sure you're in the right project
- Try: https://vercel.com/dashboard/jds-horse-ranch-pwa/settings/environment-variables

**Build still failing after adding vars?**
- Check all three scopes are selected
- Wait 5 minutes and try again
- Manually redeploy from Deployments tab

**Login not working?**
- Double-check password hash is correct
- Make sure Supabase URL and key are correct
- Clear browser cache and try again

---

## Next Steps

Once environment variables are set and deployment is successful:

1. Visit `/admin/login`
2. Test admin dashboard
3. Share `ADMIN_README.md` with JD
4. Done! 🎉
