# Script de verification de l'environnement de developpement (Windows)
# Usage: .\scripts\verify-setup.ps1

$Script:Passed = 0
$Script:Failed = 0

function Print-Header {
    param([string]$Message)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Check-Command {
    param([string]$Command, [string]$Name, [string]$MinVersion)
    
    try {
        $version = & $Command --version 2>&1 | Select-Object -First 1
        Write-Host "[OK] $Name installe" -ForegroundColor Green
        Write-Host "     Version: $version" -ForegroundColor Gray
        $Script:Passed++
        return $true
    }
    catch {
        Write-Host "[ERREUR] $Name NON installe" -ForegroundColor Red
        Write-Host "         Requis: $MinVersion" -ForegroundColor Gray
        $Script:Failed++
        return $false
    }
}

function Check-File {
    param([string]$Path, [string]$Name)
    
    if (Test-Path $Path -PathType Leaf) {
        Write-Host "[OK] $Name existe" -ForegroundColor Green
        $Script:Passed++
        return $true
    }
    else {
        Write-Host "[ERREUR] $Name MANQUANT" -ForegroundColor Red
        Write-Host "         Chemin: $Path" -ForegroundColor Gray
        $Script:Failed++
        return $false
    }
}

function Check-Directory {
    param([string]$Path, [string]$Name)
    
    if (Test-Path $Path -PathType Container) {
        Write-Host "[OK] $Name existe" -ForegroundColor Green
        $Script:Passed++
        return $true
    }
    else {
        Write-Host "[ERREUR] $Name MANQUANT" -ForegroundColor Red
        Write-Host "         Chemin: $Path" -ForegroundColor Gray
        $Script:Failed++
        return $false
    }
}

Clear-Host
Print-Header "Verification de l'environnement de developpement"

# 1. Verification des outils
Print-Header "1. Outils requis"

Check-Command "git" "Git" ">= 2.40"
Check-Command "node" "Node.js" ">= 20.0.0"
Check-Command "npm" "npm" ">= 10.0.0"

# Verifier la version de Node.js
try {
    $nodeVersionString = node -v
    $nodeVersionParts = $nodeVersionString.TrimStart("v").Split(".")
    $nodeVersion = [int]$nodeVersionParts[0]
    
    if ($nodeVersion -ge 20) {
        Write-Host "[OK] Version Node.js compatible (v$nodeVersion)" -ForegroundColor Green
        $Script:Passed++
    }
    else {
        Write-Host "[ERREUR] Version Node.js trop ancienne (v$nodeVersion)" -ForegroundColor Red
        Write-Host "         Requis: >= v20" -ForegroundColor Gray
        $Script:Failed++
    }
}
catch {
    Write-Host "[ERREUR] Impossible de verifier la version de Node.js" -ForegroundColor Red
    $Script:Failed++
}

# MongoDB
try {
    $null = mongosh --version 2>&1
    Check-Command "mongosh" "MongoDB Shell" ">= 1.0"
}
catch {
    Write-Host "[AVERTISSEMENT] MongoDB Shell non trouve (optionnel avec Docker)" -ForegroundColor Yellow
}

# Docker
try {
    $null = docker --version 2>&1
    Check-Command "docker" "Docker" ">= 20.0"
}
catch {
    Write-Host "[AVERTISSEMENT] Docker non trouve (optionnel)" -ForegroundColor Yellow
}

# 2. Structure du projet
Print-Header "2. Structure du projet"

Check-Directory "backend" "Dossier backend"
Check-Directory "frontend" "Dossier frontend"
Check-Directory "infrastructure" "Dossier infrastructure"
Check-Directory "docs" "Dossier docs"

# 3. Configuration Backend
Print-Header "3. Configuration Backend"

Check-File "backend\package.json" "package.json"
Check-File "backend\.env.example" ".env.example"

if (Test-Path "backend\.env" -PathType Leaf) {
    Write-Host "[OK] Fichier .env existe" -ForegroundColor Green
    $Script:Passed++
    
    $envContent = Get-Content "backend\.env" -Raw
    
    if ($envContent -match "MONGODB_URI=") {
        Write-Host "     MONGODB_URI configure" -ForegroundColor Green
    }
    else {
        Write-Host "     MONGODB_URI MANQUANT" -ForegroundColor Red
        $Script:Failed++
    }
    
    if ($envContent -match "JWT_SECRET=") {
        Write-Host "     JWT_SECRET configure" -ForegroundColor Green
    }
    else {
        Write-Host "     JWT_SECRET MANQUANT" -ForegroundColor Red
        $Script:Failed++
    }
}
else {
    Write-Host "[ERREUR] Fichier .env MANQUANT" -ForegroundColor Red
    Write-Host "         Creez-le avec: Copy-Item backend\.env.example backend\.env" -ForegroundColor Gray
    $Script:Failed++
}

Check-Directory "backend\node_modules" "Dependencies backend installees"

# 4. Configuration Frontend
Print-Header "4. Configuration Frontend"

Check-File "frontend\package.json" "package.json (frontend)"

if (Test-Path "frontend\node_modules" -PathType Container) {
    Write-Host "[OK] Dependencies frontend installees" -ForegroundColor Green
    $Script:Passed++
}
else {
    Write-Host "[AVERTISSEMENT] Dependencies frontend NON installees" -ForegroundColor Yellow
    Write-Host "                Executez: cd frontend; npm install" -ForegroundColor Gray
}

# 5. Resume
Print-Header "Resume"

$total = $Script:Passed + $Script:Failed
if ($total -gt 0) {
    $successRate = [math]::Round(($Script:Passed / $total) * 100, 0)
}
else {
    $successRate = 0
}

Write-Host "Total de verifications: $total" -ForegroundColor White
Write-Host "Reussies: $Script:Passed" -ForegroundColor Green
Write-Host "Echouees: $Script:Failed" -ForegroundColor Red
Write-Host "`nTaux de reussite: $successRate%" -ForegroundColor White

if ($Script:Failed -eq 0) {
    Write-Host "`n[SUCCES] Environnement pret pour le developpement!" -ForegroundColor Green
    exit 0
}
elseif ($successRate -ge 80) {
    Write-Host "`n[AVERTISSEMENT] Environnement presque pret (quelques ajustements necessaires)" -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "`n[ERREUR] Environnement incomplet - Consultez docs\DEV-SETUP-GUIDE.md" -ForegroundColor Red
    exit 1
}
