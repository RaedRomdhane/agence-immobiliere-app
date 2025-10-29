###############################################################################
# Script de déploiement de l'infrastructure Terraform
# Usage: .\deploy.ps1 -Environment [dev|staging|prod] -Action [plan|apply|destroy]
###############################################################################

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('dev', 'staging', 'prod')]
    [string]$Environment,
    
    [Parameter(Mandatory=$true)]
    [ValidateSet('plan', 'apply', 'destroy')]
    [string]$Action
)

# Configuration des couleurs
$InfoColor = "Green"
$WarnColor = "Yellow"
$ErrorColor = "Red"

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

# Confirmation pour production
if ($Environment -eq "prod") {
    Log-Warn "Vous êtes sur le point de modifier l'environnement PRODUCTION!"
    $confirmation = Read-Host "Êtes-vous sûr de vouloir continuer? (yes/no)"
    if ($confirmation -ne "yes") {
        Log-Info "Opération annulée."
        exit 0
    }
}

# Dossier de l'environnement
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$envDir = Join-Path $scriptPath "..\terraform\environments\$Environment"

if (-not (Test-Path $envDir)) {
    Log-Error "Le dossier d'environnement n'existe pas: $envDir"
    exit 1
}

# Changer de répertoire
Push-Location $envDir

try {
    Log-Info "========================================="
    Log-Info "Environnement: $Environment"
    Log-Info "Action: $Action"
    Log-Info "Dossier: $envDir"
    Log-Info "========================================="

    # Vérifier que Terraform est installé
    $terraformVersion = terraform version -json 2>$null | ConvertFrom-Json
    if (-not $terraformVersion) {
        Log-Error "Terraform n'est pas installé ou n'est pas dans le PATH!"
        exit 1
    }
    Log-Info "Terraform version: $($terraformVersion.terraform_version)"

    # Vérifier les credentials AWS
    try {
        $awsIdentity = aws sts get-caller-identity 2>$null | ConvertFrom-Json
        Log-Info "AWS Account: $($awsIdentity.Account)"
        Log-Info "AWS User: $($awsIdentity.Arn)"
    }
    catch {
        Log-Error "Credentials AWS non configurées!"
        Log-Error "Exécutez: aws configure"
        exit 1
    }

    # Initialiser Terraform
    Log-Info "Initialisation de Terraform..."
    terraform init
    if ($LASTEXITCODE -ne 0) {
        Log-Error "L'initialisation Terraform a échoué!"
        exit 1
    }

    # Valider la configuration
    Log-Info "Validation de la configuration..."
    terraform validate
    if ($LASTEXITCODE -ne 0) {
        Log-Error "La validation Terraform a échoué!"
        exit 1
    }

    # Formater les fichiers
    Log-Info "Formatage des fichiers Terraform..."
    terraform fmt -recursive

    # Exécuter l'action
    switch ($Action) {
        "plan" {
            Log-Info "Génération du plan Terraform..."
            terraform plan -out=tfplan
            
            if ($LASTEXITCODE -eq 0) {
                Log-Info "========================================="
                Log-Info "Plan généré avec succès! Fichier: tfplan"
                Log-Info "Pour appliquer: .\deploy.ps1 -Environment $Environment -Action apply"
                Log-Info "========================================="
            }
            else {
                Log-Error "La génération du plan a échoué!"
                exit 1
            }
        }
        
        "apply" {
            Log-Info "Application de la configuration Terraform..."
            
            # Si un plan existe, l'utiliser
            if (Test-Path "tfplan") {
                Log-Info "Utilisation du plan existant..."
                terraform apply tfplan
                
                if ($LASTEXITCODE -eq 0) {
                    Remove-Item "tfplan" -ErrorAction SilentlyContinue
                }
            }
            else {
                Log-Warn "Aucun plan trouvé, application directe..."
                terraform apply -auto-approve
            }
            
            if ($LASTEXITCODE -eq 0) {
                Log-Info "========================================="
                Log-Info "Déploiement terminé avec succès!"
                Log-Info "========================================="
                
                # Afficher les outputs
                Log-Info "Outputs de l'infrastructure:"
                terraform output
                
                # Afficher des informations utiles
                Log-Info ""
                Log-Info "Prochaines étapes:"
                Log-Info "1. Récupérer le mot de passe DB: aws secretsmanager get-secret-value --secret-id $(terraform output -raw database_secret_name)"
                Log-Info "2. Se connecter à la DB: mongodb://admin:<password>@$(terraform output -raw database_endpoint):27017"
                Log-Info "3. Vérifier les ressources: aws ec2 describe-vpcs --region eu-west-3"
            }
            else {
                Log-Error "Le déploiement a échoué!"
                exit 1
            }
        }
        
        "destroy" {
            Log-Warn "========================================="
            Log-Warn "ATTENTION: Vous allez DÉTRUIRE l'infrastructure!"
            Log-Warn "========================================="
            
            if ($Environment -eq "prod") {
                Log-Error "La destruction de la production nécessite une confirmation supplémentaire!"
                $confirmation = Read-Host "Tapez 'destroy-prod' pour confirmer"
                if ($confirmation -ne "destroy-prod") {
                    Log-Info "Opération annulée."
                    exit 0
                }
            }
            else {
                $confirmation = Read-Host "Tapez 'yes' pour confirmer la destruction"
                if ($confirmation -ne "yes") {
                    Log-Info "Opération annulée."
                    exit 0
                }
            }
            
            Log-Info "Destruction de l'infrastructure..."
            terraform destroy
            
            if ($LASTEXITCODE -eq 0) {
                Log-Info "Infrastructure détruite avec succès."
            }
            else {
                Log-Error "La destruction a échoué!"
                exit 1
            }
        }
    }

    Log-Info "========================================="
    Log-Info "Opération terminée!"
    Log-Info "========================================="
}
finally {
    # Revenir au répertoire initial
    Pop-Location
}
