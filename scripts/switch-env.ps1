# Switch Environment Script
# Usage: .\scripts\switch-env.ps1 [local|production]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("local", "production")]
    [string]$Environment
)

Write-Host "Switching to $Environment environment..." -ForegroundColor Cyan

if ($Environment -eq "local") {
    # Get current local IP
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -like "192.168.*"})[0].IPAddress
    
    if (-not $localIP) {
        Write-Host "Could not find local IP (192.168.x.x). Please check your network connection." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Detected local IP: $localIP" -ForegroundColor Green
    
    # Read existing .env files and update IPs
    Write-Host "Updating backend/.env..." -ForegroundColor Yellow
    
    # Read current backend .env
    if (Test-Path "backend\.env") {
        $backendContent = Get-Content "backend\.env" -Raw
        # Update URLs with new IP
        $backendContent = $backendContent -replace 'CLIENT_URL=http://[^:]+:3000', "CLIENT_URL=http://${localIP}:3000"
        $backendContent = $backendContent -replace 'FRONTEND_URL=http://[^:]+:3000', "FRONTEND_URL=http://${localIP}:3000"
        $backendContent | Out-File -FilePath "backend\.env" -Encoding UTF8 -NoNewline
    } else {
        Write-Host "Warning: backend\.env not found. Please create it manually." -ForegroundColor Yellow
    }
    
    # Update frontend .env.local
    Write-Host "Updating frontend/.env.local..." -ForegroundColor Yellow
    
    # Read current frontend .env.local
    if (Test-Path "frontend\.env.local") {
        $frontendContent = Get-Content "frontend\.env.local" -Raw
        # Update URLs with new IP
        $frontendContent = $frontendContent -replace 'NEXT_PUBLIC_API_URL=http://[^:]+:5000/api', "NEXT_PUBLIC_API_URL=http://${localIP}:5000/api"
        $frontendContent = $frontendContent -replace 'NEXT_PUBLIC_WS_URL=ws://[^:]+:5000', "NEXT_PUBLIC_WS_URL=ws://${localIP}:5000"
        $frontendContent | Out-File -FilePath "frontend\.env.local" -Encoding UTF8 -NoNewline
    } else {
        Write-Host "Warning: frontend\.env.local not found. Please create it manually." -ForegroundColor Yellow
    }
    
    Write-Host "Environment switched to LOCAL" -ForegroundColor Green
    Write-Host "Using IP: $localIP" -ForegroundColor Cyan
    Write-Host "" 
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Restart backend: cd backend && npm run dev" -ForegroundColor White
    Write-Host "   2. Restart frontend: cd frontend && npm run dev" -ForegroundColor White
    Write-Host "   3. Regenerate QR codes: cd backend && node scripts/regenerate-qrcodes.js" -ForegroundColor White
    
} else {
    Write-Host "Production environment uses Vercel and Railway" -ForegroundColor Green
    Write-Host "   Frontend: https://agence-immobiliere-app-4naj-hopf62eis.vercel.app" -ForegroundColor Cyan
    Write-Host "   Backend: https://illustrious-cooperation-production-52c2.up.railway.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To deploy to production:" -ForegroundColor Yellow
    Write-Host "   1. Push to GitHub: git push origin main" -ForegroundColor White
    Write-Host "   2. Vercel and Railway will auto-deploy" -ForegroundColor White
    Write-Host "   3. Regenerate QR codes on Railway (see DEPLOY-PRODUCTION.md)" -ForegroundColor White
}
