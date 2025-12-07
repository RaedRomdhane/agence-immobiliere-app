# Deploy to Production Script
# This will push your code to GitHub, which auto-deploys to Vercel and Railway

Write-Host "🚀 Deploying to Production..." -ForegroundColor Cyan
Write-Host ""

# Stage all changes
Write-Host "📦 Staging all changes..." -ForegroundColor Yellow
git add .

# Commit
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Deploy: Update to production environment"
}

Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "$commitMessage"

# Push to main branch
Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Code pushed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Railway will auto-deploy your backend" -ForegroundColor White
Write-Host "2. Vercel will auto-deploy your frontend" -ForegroundColor White
Write-Host "3. Wait 2-3 minutes for deployments to complete" -ForegroundColor White
Write-Host "4. Regenerate QR codes with production URL:" -ForegroundColor White
Write-Host "   railway run node backend/scripts/regenerate-qrcodes.js" -ForegroundColor Gray
Write-Host ""
Write-Host "🌍 Production URLs (work from ANY WiFi):" -ForegroundColor Green
Write-Host "Frontend: https://agence-immobiliere-app-4naj-hopf62eis.vercel.app" -ForegroundColor Cyan
Write-Host "Backend:  https://illustrious-cooperation-production-52c2.up.railway.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ After this, your QR codes will work from ANY WiFi network worldwide!" -ForegroundColor Green
