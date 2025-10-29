#!/bin/bash

###############################################################################
# Script de déploiement de l'infrastructure Terraform
# Usage: ./deploy.sh [dev|staging|prod] [plan|apply|destroy]
###############################################################################

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les arguments
if [ $# -lt 2 ]; then
    log_error "Usage: $0 [dev|staging|prod] [plan|apply|destroy]"
    exit 1
fi

ENVIRONMENT=$1
ACTION=$2

# Valider l'environnement
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    log_error "Environnement invalide: $ENVIRONMENT. Utiliser: dev, staging ou prod"
    exit 1
fi

# Valider l'action
if [[ ! "$ACTION" =~ ^(plan|apply|destroy)$ ]]; then
    log_error "Action invalide: $ACTION. Utiliser: plan, apply ou destroy"
    exit 1
fi

# Confirmation pour production
if [ "$ENVIRONMENT" == "prod" ]; then
    log_warn "Vous êtes sur le point de modifier l'environnement PRODUCTION!"
    read -p "Êtes-vous sûr de vouloir continuer? (yes/no): " -r
    if [[ ! $REPLY =~ ^yes$ ]]; then
        log_info "Opération annulée."
        exit 0
    fi
fi

# Dossier de l'environnement
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="$SCRIPT_DIR/../terraform/environments/$ENVIRONMENT"

if [ ! -d "$ENV_DIR" ]; then
    log_error "Le dossier d'environnement n'existe pas: $ENV_DIR"
    exit 1
fi

cd "$ENV_DIR"

log_info "========================================="
log_info "Environnement: $ENVIRONMENT"
log_info "Action: $ACTION"
log_info "Dossier: $ENV_DIR"
log_info "========================================="

# Vérifier que Terraform est installé
if ! command -v terraform &> /dev/null; then
    log_error "Terraform n'est pas installé ou n'est pas dans le PATH!"
    exit 1
fi
log_info "Terraform version: $(terraform version -json | jq -r '.terraform_version')"

# Vérifier les credentials AWS
if ! aws sts get-caller-identity &> /dev/null; then
    log_error "Credentials AWS non configurées!"
    log_error "Exécutez: aws configure"
    exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_USER=$(aws sts get-caller-identity --query Arn --output text)
log_info "AWS Account: $AWS_ACCOUNT"
log_info "AWS User: $AWS_USER"

# Initialiser Terraform
log_info "Initialisation de Terraform..."
terraform init

if [ $? -ne 0 ]; then
    log_error "L'initialisation Terraform a échoué!"
    exit 1
fi

# Valider la configuration
log_info "Validation de la configuration..."
terraform validate

if [ $? -ne 0 ]; then
    log_error "La validation Terraform a échoué!"
    exit 1
fi

# Formater les fichiers
log_info "Formatage des fichiers Terraform..."
terraform fmt -recursive

# Exécuter l'action
case $ACTION in
    plan)
        log_info "Génération du plan Terraform..."
        terraform plan -out=tfplan
        
        if [ $? -eq 0 ]; then
            log_info "========================================="
            log_info "Plan généré avec succès! Fichier: tfplan"
            log_info "Pour appliquer: ./deploy.sh $ENVIRONMENT apply"
            log_info "========================================="
        else
            log_error "La génération du plan a échoué!"
            exit 1
        fi
        ;;
    
    apply)
        log_info "Application de la configuration Terraform..."
        
        # Si un plan existe, l'utiliser
        if [ -f "tfplan" ]; then
            log_info "Utilisation du plan existant..."
            terraform apply tfplan
            
            if [ $? -eq 0 ]; then
                rm -f tfplan
            fi
        else
            log_warn "Aucun plan trouvé, application directe..."
            terraform apply -auto-approve
        fi
        
        if [ $? -eq 0 ]; then
            log_info "========================================="
            log_info "Déploiement terminé avec succès!"
            log_info "========================================="
            
            # Afficher les outputs
            log_info "Outputs de l'infrastructure:"
            terraform output
            
            # Afficher des informations utiles
            log_info ""
            log_info "Prochaines étapes:"
            SECRET_NAME=$(terraform output -raw database_secret_name)
            DB_ENDPOINT=$(terraform output -raw database_endpoint)
            log_info "1. Récupérer le mot de passe DB: aws secretsmanager get-secret-value --secret-id $SECRET_NAME"
            log_info "2. Se connecter à la DB: mongodb://admin:<password>@$DB_ENDPOINT:27017"
            log_info "3. Vérifier les ressources: aws ec2 describe-vpcs --region eu-west-3"
        else
            log_error "Le déploiement a échoué!"
            exit 1
        fi
        ;;
    
    destroy)
        log_warn "========================================="
        log_warn "ATTENTION: Vous allez DÉTRUIRE l'infrastructure!"
        log_warn "========================================="
        
        if [ "$ENVIRONMENT" == "prod" ]; then
            log_error "La destruction de la production nécessite une confirmation supplémentaire!"
            read -p "Tapez 'destroy-prod' pour confirmer: " -r
            if [[ ! $REPLY == "destroy-prod" ]]; then
                log_info "Opération annulée."
                exit 0
            fi
        else
            read -p "Tapez 'yes' pour confirmer la destruction: " -r
            if [[ ! $REPLY =~ ^yes$ ]]; then
                log_info "Opération annulée."
                exit 0
            fi
        fi
        
        log_info "Destruction de l'infrastructure..."
        terraform destroy
        
        if [ $? -eq 0 ]; then
            log_info "Infrastructure détruite avec succès."
        else
            log_error "La destruction a échoué!"
            exit 1
        fi
        ;;
esac

log_info "========================================="
log_info "Opération terminée!"
log_info "========================================="
