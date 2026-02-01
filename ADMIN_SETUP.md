# Admin Dashboard Setup Guide for JD's Horse Ranch

## Step 1: Create Supabase Account

1. Go to https://supabase.com/
2. Click "Sign up" and create an account
3. Create a new project (choose a region close to you)
4. Wait for the project to initialize (2-3 minutes)

## Step 2: Get Your Credentials

Once your project is ready:

1. **Go to Settings → API**
2. Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy your **Anon Public Key** (starts with `eyJ...`)
4. Keep these safe

## Step 3: Create Storage Bucket

1. **In Supabase dashboard**, go to **Storage** (left sidebar)
2. Click **+ New Bucket**
3. Name it: `gallery-photos`
4. Make it **Public** (toggle the switch)
5. Click **Create**

## Step 4: Run Migrations

The database tables are already created in `supabase/migrations/001_init_schema.sql`.

To apply them:

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase/migrations/001_init_schema.sql`
3. Paste it into a new query
4. Click **Run**

## Step 5: Create Admin Password

Choose a strong password (something only you know).

Calculate the hash:
```bash
node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD_HERE').digest('hex'))"
```

Keep the hash for the next step.

## Step 6: Create `.env.local` File

In the project root directory, create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-key-here
ADMIN_PASSWORD_HASH=your-hash-from-step-5
SESSION_TOKEN_SECRET=change-this-to-random-string
```

Replace:
- `your-project.supabase.co` with your Project URL from Step 2
- `eyJ...your-key-here` with your Anon Public Key from Step 2
- `your-hash-from-step-5` with the hash from Step 5
- `change-this-to-random-string` with a random string (for production security)

## Step 7: Deploy to Vercel

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Add admin dashboard with Supabase"
   git push
   ```

2. Go to Vercel dashboard
3. Click on your project
4. Go to **Settings → Environment Variables**
5. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Anon Public Key
   - `ADMIN_PASSWORD_HASH` = your hash
   - `SESSION_TOKEN_SECRET` = random string

6. Redeploy (Changes → Deploy)

## Step 8: Access Your Admin Dashboard

Once deployed:

1. Go to `https://jds-horse-ranch-pwa.vercel.app/admin/login`
2. Enter your password
3. You're in!

## Using the Admin Panel

### Dashboard
- Overview of recent contacts
- Quick stats on calls vs emails

### Services
- Edit service names, descriptions, pricing
- Update age requirements and duration
- Click "Edit" on any service

### Testimonials
- Add new customer testimonials
- Edit existing testimonials
- Delete old ones
- Rate testimonials (1-5 stars)

### Gallery
- Upload photos by clicking the upload area
- Add titles and descriptions
- Delete photos you don't want

### Contact Logs
- View all customer contact attempts
- See timestamps, IP addresses, contact type
- **Export CSV** button to download all contacts

## Important Security Notes

- **Never share your admin password** with anyone
- Change your password every 3 months
- The password hash in `.env.local` should be kept secret
- Supabase API keys are public but safe (they can only read/write your data)

## Troubleshooting

### "Database Connection Failed"
- Check that your `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Make sure you ran the migrations in Supabase SQL Editor

### "Upload Failed"
- Verify the `gallery-photos` storage bucket exists
- Check that it's set to **Public** in Supabase

### "Login Failed"
- Make sure your password hash is correct
- Clear your browser cache and try again
- Check that `ADMIN_PASSWORD_HASH` is set in Vercel env vars

## Contact Support

If you need help:
1. Check the Supabase docs: https://supabase.com/docs
2. Contact Vercel support: https://vercel.com/support
3. Ask for help in the project repo

---

**That's it! You now have full control of your website without needing to know how to code.**
