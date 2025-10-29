###############################################################################
# Script de validation de l'infrastructure Terraform
# Usage: .\validate.ps1 -Environment [dev|staging|prod]
###############################################################################

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment
)

# Configuration des couleurs
$InfoColor = "Green"
$WarnColor = "Yellow"
$ErrorColor = "Red"
$SuccessColor = "Cyan"

# Fonctions pour afficher les messages
function Log-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $InfoColor
}

function Log-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor $WarnColor
}

function Log-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $ErrorColor
}

function Log-Success {
    param([string]$Message)
    Write-Host "[✓] $Message" -ForegroundColor $SuccessColor
}

# Variables de comptage
$checks = 0
$passed = 0
$failed = 0

function Run-Check {
    param(
        [string]$Name,
        [scriptblock]$Check
    )
    
    $script:checks++
    Write-Host "`n[$script:checks] $Name" -ForegroundColor Cyan
    
    try {
        $result = & $Check
        if ($result) {
            Log-Success "PASSED"
            $script:passed++
            return $true
        }
        else {
            Log-Error "FAILED"
            $script:failed++
            return $false
        }
    }
    catch {
        Log-Error "FAILED: $_"
        $script:failed++
        return $false
    }
}

# Dossier de l'environnement
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$envDir = Join-Path $scriptPath "..\terraform\environments\$Environment"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "VALIDATION DE L'INFRASTRUCTURE" -ForegroundColor Cyan
Write-Host "Environnement: $Environment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check 1: Terraform installé
Run-Check "Terraform est installé" {
    $version = terraform version -json 2>$null | ConvertFrom-Json
    if ($version) {
        Log-Info "Version: $($version.terraform_version)"
        $requiredVersion = [version]"1.5.0"
        $currentVersion = [version]$version.terraform_version
        
        if ($currentVersion -ge $requiredVersion) {
            Log-Info "Version requise (>= 1.5.0) satisfaite"
            return $true
        }
        else {
            Log-Warn "Version 1.5.0 ou supérieure requise"
            return $false
        }
    }
    return $false
}

# Check 2: AWS CLI installé
Run-Check "AWS CLI est installé" {
    $awsVersion = aws --version 2>$null
    if ($awsVersion) {
        Log-Info "Version: $awsVersion"
        return $true
    }
    return $false
}

# Check 3: Credentials AWS configurées
Run-Check "Credentials AWS sont configurées" {
    try {
        $identity = aws sts get-caller-identity 2>$null | ConvertFrom-Json
        if ($identity) {
            Log-Info "Account: $($identity.Account)"
            Log-Info "User: $($identity.Arn)"
            return $true
        }
    }
    catch {
        Log-Warn "Exécutez: aws configure"
    }
    return $false
}

# Check 4: Dossier environnement existe
Run-Check "Dossier de l'environnement existe" {
    if (Test-Path $envDir) {
        Log-Info "Chemin: $envDir"
        return $true
    }
    else {
        Log-Error "Chemin introuvable: $envDir"
        return $false
    }
}

# Check 5: Fichiers Terraform présents
Run-Check "Fichiers Terraform requis sont présents" {
    $requiredFiles = @("main.tf", "variables.tf", "outputs.tf")
    $allPresent = $true
    
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $envDir $file
        if (Test-Path $filePath) {
            Log-Info "✓ $file"
        }
        else {
            Log-Error "✗ $file manquant"
            $allPresent = $false
        }
    }
    
    return $allPresent
}

# Check 6: Fichier terraform.tfvars existe
Run-Check "Fichier terraform.tfvars est configuré" {
    $tfvarsPath = Join-Path $envDir "terraform.tfvars"
    
    if (Test-Path $tfvarsPath) {
        Log-Info "Fichier trouvé: terraform.tfvars"
        
        # Vérifier que ssh_allowed_ips est configuré
        $content = Get-Content $tfvarsPath -Raw
        if ($content -match 'ssh_allowed_ips\s*=\s*\[\s*\]' -or $content -notmatch 'ssh_allowed_ips') {
            Log-Warn "ssh_allowed_ips n'est pas configuré ou est vide"
            Log-Warn "Ajoutez vos IPs autorisées pour SSH"
            return $true  # Warning mais pas bloquant pour DEV
        }
        
        return $true
    }
    else {
        Log-Warn "Fichier terraform.tfvars manquant"
        Log-Info "Copiez terraform.tfvars.example vers terraform.tfvars"
        return $false
    }
}

# Check 7: Modules Terraform présents
Run-Check "Modules Terraform sont présents" {
    $modulesDir = Join-Path $scriptPath "..\terraform\modules"
    $requiredModules = @("network", "security", "database")
    $allPresent = $true
    
    foreach ($module in $requiredModules) {
        $modulePath = Join-Path $modulesDir $module
        if (Test-Path $modulePath) {
            Log-Info "✓ Module $module"
        }
        else {
            Log-Error "✗ Module $module manquant"
            $allPresent = $false
        }
    }
    
    return $allPresent
}

# Check 8: Validation Terraform
Run-Check "Configuration Terraform est valide" {
    Push-Location $envDir
    try {
        # Init silencieux
        terraform init -backend=false 2>&1 | Out-Null
        
        # Validation
        $validation = terraform validate -json 2>$null | ConvertFrom-Json
        
        if ($validation.valid) {
            Log-Info "Configuration valide"
            return $true
        }
        else {
            if ($validation.diagnostics) {
                foreach ($diag in $validation.diagnostics) {
                    Log-Error "$($diag.severity): $($diag.summary)"
                    if ($diag.detail) {
                        Log-Error "  $($diag.detail)"
                    }
                }
            }
            return $false
        }
    }
    finally {
        Pop-Location
    }
}

# Check 9: Format Terraform
Run-Check "Fichiers Terraform sont formatés" {
    Push-Location $envDir
    try {
        $changes = terraform fmt -check -recursive 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Log-Info "Tous les fichiers sont correctement formatés"
            return $true
        }
        else {
            Log-Warn "Certains fichiers nécessitent un formatage"
            Log-Info "Exécutez: terraform fmt -recursive"
            return $true  # Warning mais pas bloquant
        }
    }
    finally {
        Pop-Location
    }
}

# Check 10: Région AWS accessible
Run-Check "Région AWS est accessible" {
    $region = "eu-west-3"
    try {
        $vpcs = aws ec2 describe-vpcs --region $region 2>$null | ConvertFrom-Json
        if ($vpcs) {
            Log-Info "Région $region accessible"
            Log-Info "VPCs existants: $($vpcs.Vpcs.Count)"
            return $true
        }
    }
    catch {
        Log-Error "Impossible d'accéder à la région $region"
    }
    return $false
}

# Résumé final
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "RÉSUMÉ DE LA VALIDATION" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Total: $checks checks" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red

$percentage = [math]::Round(($passed / $checks) * 100, 2)
Write-Host "Score: $percentage%" -ForegroundColor $(if ($percentage -ge 80) { "Green" } elseif ($percentage -ge 60) { "Yellow" } else { "Red" })

Write-Host "`n=========================================" -ForegroundColor Cyan

if ($failed -eq 0) {
    Log-Success "✓ Tous les checks sont passés!"
    Log-Success "L'infrastructure est prête à être déployée."
    Write-Host "`nProchaine étape:" -ForegroundColor Cyan
    Write-Host "  .\deploy.ps1 -Environment $Environment -Action plan" -ForegroundColor White
    exit 0
}
else {
    Log-Error "✗ $failed check(s) ont échoué"
    Log-Error "Corrigez les erreurs avant de déployer."
    exit 1
}
