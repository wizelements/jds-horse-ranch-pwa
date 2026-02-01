# Submit sitemap and request indexing from Google Search Console
# Prerequisites: vercel CLI installed and authenticated

Write-Host "🔍 JD's Horse Ranch SEO Submission Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if vercel is authenticated
Write-Host "📊 Checking Vercel deployment status..." -ForegroundColor Yellow

# Get the deployed URL
$deployedUrl = "https://jdshorseranch.com"
Write-Host "✅ Site URL: $deployedUrl" -ForegroundColor Green
Write-Host ""

# Instructions for Google Search Console
Write-Host "📋 NEXT STEPS (Manual - Requires Google Account):" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Go to: https://search.google.com/search-console/welcome" -ForegroundColor White
Write-Host "2️⃣  Add property: $deployedUrl" -ForegroundColor White
Write-Host "3️⃣  Click 'Sitemaps' in left menu" -ForegroundColor White
Write-Host "4️⃣  Add this sitemap URL:" -ForegroundColor White
Write-Host "    → $deployedUrl/sitemap.xml" -ForegroundColor Magenta
Write-Host ""
Write-Host "5️⃣  Click 'URL Inspection' tool" -ForegroundColor White
Write-Host "6️⃣  Paste and request indexing for these URLs:" -ForegroundColor White
Write-Host "    → $deployedUrl/" -ForegroundColor Magenta
Write-Host "    → $deployedUrl/#riding-lessons" -ForegroundColor Magenta
Write-Host "    → $deployedUrl/#trail-rides" -ForegroundColor Magenta
Write-Host ""

# Instructions for Google Business Profile
Write-Host "🏢 Google Business Profile (CRITICAL):" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Go to: https://business.google.com" -ForegroundColor White
Write-Host "2️⃣  Search and claim 'JD's Horse Ranch'" -ForegroundColor White
Write-Host "3️⃣  Fill in ALL details:" -ForegroundColor White
Write-Host "    - Phone: (404) 981-2361" -ForegroundColor Magenta
Write-Host "    - Address: 7555 Jones Rd, Fairburn, GA 30213" -ForegroundColor Magenta
Write-Host "    - Hours: Every day 8am-6pm" -ForegroundColor Magenta
Write-Host "    - Website: $deployedUrl" -ForegroundColor Magenta
Write-Host ""
Write-Host "4️⃣  Add 10+ photos:" -ForegroundColor White
Write-Host "    - Horses" -ForegroundColor Magenta
Write-Host "    - Trails" -ForegroundColor Magenta
Write-Host "    - Customers riding" -ForegroundColor Magenta
Write-Host "    - Facility overview" -ForegroundColor Magenta
Write-Host ""
Write-Host "5️⃣  Add services:" -ForegroundColor White
Write-Host "    - Riding Lessons ($85)" -ForegroundColor Magenta
Write-Host "    - Trail Rides ($85-$245)" -ForegroundColor Magenta
Write-Host "    - Special Events ($200)" -ForegroundColor Magenta
Write-Host ""

# Yelp instructions
Write-Host "⭐ Claim Yelp Profile:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Go to: https://www.yelp.com/biz/jds-horse-ranch-fairburn" -ForegroundColor White
Write-Host "2️⃣  Click 'Claim this business'" -ForegroundColor White
Write-Host "3️⃣  Verify ownership" -ForegroundColor White
Write-Host "4️⃣  Add photos and update all details" -ForegroundColor White
Write-Host ""

# Review generation
Write-Host "📝 Generate Reviews (MOST IMPACTFUL):" -ForegroundColor Cyan
Write-Host ""
Write-Host "Send this to recent customers via email/text:" -ForegroundColor White
Write-Host ""
Write-Host '┌─────────────────────────────────────────────────────────┐' -ForegroundColor Gray
Write-Host '│ Hi! Thanks for visiting JD\'s Horse Ranch! 🐎            │' -ForegroundColor Gray
Write-Host '│                                                         │' -ForegroundColor Gray
Write-Host '│ Would you leave a quick review? It helps other people   │' -ForegroundColor Gray
Write-Host '│ find us and supports our small business!                │' -ForegroundColor Gray
Write-Host '│                                                         │' -ForegroundColor Gray
Write-Host '│ Google: google.com/maps/search/jds+horse+ranch+atlanta' -ForegroundColor Gray
Write-Host '│ Yelp: yelp.com/biz/jds-horse-ranch-fairburn' -ForegroundColor Gray
Write-Host '│ TripAdvisor: tripadvisor.com' -ForegroundColor Gray
Write-Host '│                                                         │' -ForegroundColor Gray
Write-Host '│ Thank you! 🙏' -ForegroundColor Gray
Write-Host '└─────────────────────────────────────────────────────────┘' -ForegroundColor Gray
Write-Host ""

# Core Web Vitals check
Write-Host "⚡ Check Site Speed (PageSpeed Insights):" -ForegroundColor Cyan
Write-Host "→ https://pagespeed.web.dev/?url=$deployedUrl" -ForegroundColor Magenta
Write-Host ""

Write-Host "✅ All manual steps can be done in 30 minutes" -ForegroundColor Green
Write-Host "⏱️  Expected ranking improvement: 2-4 weeks" -ForegroundColor Yellow
Write-Host ""
Write-Host "PRIORITY ORDER:" -ForegroundColor Cyan
Write-Host "1. Google Business Profile (Claim + Photos) - 10 min" -ForegroundColor White
Write-Host "2. Get 5-10 customer reviews - 15 min" -ForegroundColor White
Write-Host "3. Google Search Console + sitemap - 5 min" -ForegroundColor White
Write-Host "4. Yelp profile - 5 min" -ForegroundColor White
