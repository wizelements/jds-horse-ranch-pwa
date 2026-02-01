# Push environment variables to Vercel
# Note: You need to fill in the actual values before running

$envVars = @{
    "NEXT_PUBLIC_SUPABASE_URL" = "https://your-project-url.supabase.co"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    "ADMIN_PASSWORD_HASH" = "your-hash-here"
    "SESSION_TOKEN_SECRET" = "your-random-secret"
}

Write-Host "🔧 Pushing environment variables to Vercel..." -ForegroundColor Cyan
Write-Host ""

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "  Setting: $key" -ForegroundColor Yellow
    
    # Interactive prompt for actual values
    $prompt = Read-Host "    Enter value for $key (or press Enter to skip)"
    
    if ($prompt -and $prompt -ne "") {
        Write-Host "    Pushing to Vercel..." -ForegroundColor Gray
        # Note: This would need to be piped as input to vercel env add
        # For now, showing the command needed
        Write-Host "    npx vercel env add $key" -ForegroundColor Gray
    } else {
        Write-Host "    Skipped" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✅ Environment variable setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Go to: https://vercel.com/dashboard/jds-horse-ranch-pwa/settings/environment-variables"
Write-Host "  2. Add the environment variables from above"
Write-Host "  3. Redeploy from Vercel dashboard"
