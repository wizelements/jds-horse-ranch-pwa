#!/bin/bash

# Push dummy environment variables to Vercel for jds-horse-ranch-pwa

PROJECT="jds-horse-ranch-pwa"

echo "🔧 Pushing environment variables to Vercel..."
echo ""

# Variables to push
declare -A env_vars=(
    ["NEXT_PUBLIC_SUPABASE_URL"]="https://example-project.supabase.co"
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUtcHJvamVjdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjc3NzY4NDAwLCJleHAiOjE5OTMzNDQ0MDB9.example-key"
    ["ADMIN_PASSWORD_HASH"]="your_hashed_password_here"
    ["SESSION_TOKEN_SECRET"]="your_random_secret_here"
)

# Push each variable
for key in "${!env_vars[@]}"; do
    value="${env_vars[$key]}"
    echo "  📝 Setting: $key"
    echo "$value" | npx vercel env add "$key" --yes 2>/dev/null || true
    echo "    ✅ Done"
done

echo ""
echo "✅ Environment variables pushed to Vercel!"
echo ""
echo "📋 To verify:"
echo "   npx vercel env ls"
echo ""
echo "🚀 To redeploy:"
echo "   npx vercel deploy --prod"
