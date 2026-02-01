# JDS Horse Ranch PWA - Full Deployment Checklist

## What's New in This Version

✅ **Admin Dashboard** - Full control without coding  
✅ **Persistent Database** - Supabase PostgreSQL  
✅ **Contact Management** - View & export all contact logs  
✅ **Service Manager** - Edit pricing, descriptions  
✅ **Testimonials Manager** - Add/edit/delete reviews  
✅ **Gallery Manager** - Upload & organize photos  
✅ **YouTube Embed** - "The Experience" video section  
✅ **Accessibility Toolbar** - Text size + contrast controls  

---

## Pre-Deployment Setup (One Time)

### 1. Create Supabase Account
- [ ] Go to https://supabase.com
- [ ] Click "Sign up" → Create account
- [ ] Create a new project
- [ ] Wait 2-3 minutes for initialization

### 2. Get Credentials
- [ ] Go to **Settings → API**
- [ ] Copy **Project URL** (save somewhere safe)
- [ ] Copy **Anon Public Key** (save somewhere safe)

### 3. Create Storage Bucket
- [ ] In Supabase, go to **Storage** (left sidebar)
- [ ] Click **+ New Bucket**
- [ ] Name: `gallery-photos`
- [ ] Set to **Public**
- [ ] Click **Create**

### 4. Run Database Migrations
- [ ] In Supabase, go to **SQL Editor**
- [ ] Create new query
- [ ] Copy entire content from `supabase/migrations/001_init_schema.sql`
- [ ] Paste into query
- [ ] Click **Run**
- [ ] Wait for success

### 5. Generate Admin Password Hash
Open terminal/PowerShell and run:

**Windows (PowerShell):**
```powershell
$password = "YOUR_SECURE_PASSWORD_HERE"
$hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($password))
[System.BitConverter]::ToString($hash) -replace "-", ""
```

**Mac/Linux:**
```bash
echo -n "YOUR_SECURE_PASSWORD_HERE" | sha256sum
```

**Web (if you don't have terminal):**
Go to https://www.tools.hashashish.com/hash_sha256 and paste your password

Save the resulting hash.

### 6. Create `.env.local` (Local Development Only)
In project root, create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_PASSWORD_HASH=your_hash_from_step_5
SESSION_TOKEN_SECRET=dev-secret-change-in-prod
```

Replace:
- `your-project.supabase.co` = your Project URL
- `eyJh...` = your Anon Public Key
- `your_hash_from_step_5` = hash from Step 5
- `dev-secret-change-in-prod` = random string (e.g., `super-secret-123456`)

### 7. Test Locally
```bash
npm install  # Install Supabase dependency
npm run dev # Start dev server
```

Visit http://localhost:3000/admin/login and try logging in with your password.

---

## Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Add admin dashboard with Supabase, YouTube video, accessibility toolbar"
git push
```

### 2. Set Environment Variables in Vercel
- [ ] Go to https://vercel.com/dashboard
- [ ] Select your jds-horse-ranch-pwa project
- [ ] Go to **Settings → Environment Variables**
- [ ] Add each variable:

| Variable | Value | Scope |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Anon Public Key | Production, Preview, Development |
| `ADMIN_PASSWORD_HASH` | Your hash from Step 5 | Production, Preview, Development |
| `SESSION_TOKEN_SECRET` | Random string | Production only |

### 3. Trigger Deployment
- [ ] Go to **Deployments** tab
- [ ] Click **Redeploy** on the latest commit
- [ ] Wait 2-3 minutes for build
- [ ] Check for ✅ green checkmark

### 4. Verify Admin Access
- [ ] Visit https://jds-horse-ranch-pwa.vercel.app/admin/login
- [ ] Login with your password
- [ ] Test each section:
  - [ ] Dashboard loads
  - [ ] Services page shows 3 services
  - [ ] Can edit a service
  - [ ] Testimonials page loads
  - [ ] Can add a testimonial
  - [ ] Gallery page loads
  - [ ] Can upload a photo
  - [ ] Contact logs page loads
  - [ ] Can export CSV

---

## Post-Deployment: Content Setup for JD

### 1. Update Services
1. Go to https://jds-horse-ranch-pwa.vercel.app/admin/dashboard
2. Click **Services** in nav
3. For each service, click **Edit**:
   - Update pricing if needed
   - Update descriptions
   - Update duration/age requirements
   - Click **Save Changes**

### 2. Add Testimonials
1. Click **Testimonials** in nav
2. Click **+ Add Testimonial**
3. Enter customer name, their quote, rating
4. Click **Create**
5. Repeat for all testimonials

### 3. Upload Gallery Photos
1. Click **Gallery** in nav
2. Click in the dashed box
3. Select a photo from your computer
4. Wait for upload
5. Add title and description
6. Click **Save**
7. Repeat for all photos

### 4. Monitor Contacts
1. Click **Contact Logs** in nav
2. View all customer contact attempts
3. Use **Export CSV** to download for records
4. Check back regularly for new contacts

---

## Features Summary

### For Website Visitors
- ✅ Responsive mobile design
- ✅ Works offline (service worker)
- ✅ Can install as app ("Add to Home Screen")
- ✅ One-click call button
- ✅ Video of "The Experience"
- ✅ Accessibility toolbar (text size + contrast)
- ✅ Photo gallery with lightbox
- ✅ Testimonials

### For JD (Admin)
- ✅ Simple password login
- ✅ Edit all services without coding
- ✅ Add/edit/delete testimonials
- ✅ Upload & manage photos
- ✅ View all contact logs
- ✅ Export contacts as CSV
- ✅ Dashboard with stats

---

## Troubleshooting

### "Login Failed" / Wrong Password
- Double-check your password hash in Vercel env vars
- Make sure it matches the hash you generated
- Clear browser cache

### "Database Connection Failed"
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Restart dev server: `Ctrl+C` then `npm run dev`

### "Photo Upload Failed"
- Check that `gallery-photos` bucket exists in Supabase Storage
- Verify it's set to **Public**
- Check your file size (max 50MB recommended)

### "Services/Testimonials Not Loading"
- Verify you ran the SQL migration
- Check Supabase SQL Editor shows the tables exist
- Try hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### "Contacts Not Saving"
- Check that contact logging is working: `/api/contact` POST request
- Verify `contacts` table exists in Supabase

---

## Security Best Practices

1. **Never share your password** with anyone
2. **Change password every 3 months**:
   - Generate new hash
   - Update in Vercel env vars
   - Redeploy

3. **Keep API keys secure**:
   - Don't commit `.env.local` to Git
   - Only share with people you trust

4. **Monitor contacts regularly**
   - Export logs regularly for backups
   - Delete old contacts monthly for privacy

5. **Update Next.js occasionally**:
   ```bash
   npm update next react react-dom
   git push
   ```

---

## Making Changes (For JD or Future Developers)

**To edit anything without deploying:**
1. Go to admin dashboard
2. Make changes (services, testimonials, photos)
3. Changes are live immediately

**To deploy code changes:**
1. Make changes to files
2. Run `git add .`
3. Run `git commit -m "Your message"`
4. Run `git push`
5. Vercel auto-deploys
6. Wait 2-3 minutes for new version

---

## Support

If something breaks:
1. Check this checklist
2. Read error messages carefully
3. Try logging out/in
4. Clear browser cache
5. Ask a developer for help

**Contact DevSolo for complex issues:**
- GitHub issues: https://github.com/wizelements/jds-horse-ranch-pwa/issues
- Email: Include error message + screenshots

---

**Congratulations! Your website is now fully editable without coding knowledge.**
