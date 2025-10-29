# Scripts de Déploiement Infrastructure

Ce dossier contient les scripts pour déployer et valider l'infrastructure Terraform.

## 📁 Contenu

- **`deploy.ps1`** - Script PowerShell de déploiement (Windows)
- **`deploy.sh`** - Script Bash de déploiement (Linux/Mac)
- **`validate.ps1`** - Script de validation pré-déploiement (Windows)

## 🚀 Scripts de Déploiement

### Windows (PowerShell)

```powershell
# Validation avant déploiement
.\validate.ps1 -Environment dev

# Générer un plan
.\deploy.ps1 -Environment dev -Action plan

# Appliquer le plan
.\deploy.ps1 -Environment dev -Action apply

# Détruire l'infrastructure
.\deploy.ps1 -Environment dev -Action destroy
```

### Linux/Mac (Bash)

```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Générer un plan
./deploy.sh dev plan

# Appliquer le plan
./deploy.sh dev apply

# Détruire l'infrastructure
./deploy.sh dev destroy
```

## ✅ Script de Validation

Le script `validate.ps1` effectue 10 vérifications automatiques :

1. ✓ Terraform >= 1.5.0 installé
2. ✓ AWS CLI installé
3. ✓ Credentials AWS configurées
4. ✓ Dossier environnement existe
5. ✓ Fichiers Terraform requis présents
6. ✓ Fichier terraform.tfvars configuré
7. ✓ Modules Terraform présents
8. ✓ Configuration Terraform valide
9. ✓ Fichiers Terraform formatés
10. ✓ Région AWS accessible

### Utilisation

```powershell
# Valider l'environnement DEV
.\validate.ps1 -Environment dev

# Valider l'environnement STAGING
.\validate.ps1 -Environment staging

# Valider l'environnement PROD
.\validate.ps1 -Environment prod
```

### Interprétation des résultats

```
Score: 100% → Prêt à déployer ✓
Score: 80-99% → Quelques warnings mais OK ⚠️
Score: < 80% → Corrigez les erreurs avant déploiement ✗
```

## 🔐 Sécurité

### Confirmations requises

- **DEV/STAGING** : Confirmation `yes` pour destroy
- **PRODUCTION** :
  - Confirmation `yes` pour toute action
  - Confirmation `destroy-prod` pour la destruction

### Protections intégrées

- ✅ Validation des credentials AWS avant déploiement
- ✅ Vérification de l'identité AWS (Account, User)
- ✅ Validation Terraform automatique
- ✅ Double confirmation pour la production
- ✅ Formatage automatique du code

## 📊 Outputs après déploiement

Après un déploiement réussi, le script affiche :

- VPC ID et subnets
- Security Groups IDs
- Database endpoint
- Secret name (mot de passe DB)
- Connection string

### Récupérer le mot de passe DB

```powershell
# PowerShell
$secretName = terraform output -raw database_secret_name
aws secretsmanager get-secret-value --secret-id $secretName --query SecretString --output text | ConvertFrom-Json
```

```bash
# Bash
SECRET_NAME=$(terraform output -raw database_secret_name)
aws secretsmanager get-secret-value --secret-id $SECRET_NAME --query SecretString --output text | jq -r .password
```

## 🐛 Dépannage

### Erreur "Terraform not found"

```powershell
# Installer Terraform
choco install terraform  # Windows avec Chocolatey

# OU télécharger depuis
# https://www.terraform.io/downloads
```

### Erreur "AWS credentials not configured"

```powershell
# Configurer AWS CLI
aws configure

# Ou définir les variables d'environnement
$env:AWS_ACCESS_KEY_ID="..."
$env:AWS_SECRET_ACCESS_KEY="..."
$env:AWS_DEFAULT_REGION="eu-west-3"
```

### Erreur "Permission denied" (Linux/Mac)

```bash
# Rendre le script exécutable
chmod +x deploy.sh
```

### Le script plante en cours d'exécution

```powershell
# Windows : Vérifier la politique d'exécution
Get-ExecutionPolicy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Ou exécuter avec bypass
powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -Environment dev -Action plan
```

## 📝 Logs et Debugging

### Activer les logs détaillés Terraform

```powershell
# PowerShell
$env:TF_LOG="DEBUG"
$env:TF_LOG_PATH="terraform-debug.log"
.\deploy.ps1 -Environment dev -Action plan
```

```bash
# Bash
export TF_LOG=DEBUG
export TF_LOG_PATH=terraform-debug.log
./deploy.sh dev plan
```

### Vérifier l'état Terraform

```powershell
cd ..\terraform\environments\dev
terraform show
terraform state list
```

## 🔄 Workflow Recommandé

### 1. Première fois (Setup)

```powershell
# 1. Créer terraform.tfvars
Copy-Item terraform.tfvars.example terraform.tfvars
# Éditer et ajouter vos IPs SSH

# 2. Valider la configuration
.\validate.ps1 -Environment dev

# 3. Générer un plan
.\deploy.ps1 -Environment dev -Action plan

# 4. Vérifier le plan, puis appliquer
.\deploy.ps1 -Environment dev -Action apply
```

### 2. Modifications (Changes)

```powershell
# 1. Modifier les fichiers Terraform

# 2. Formater le code
terraform fmt -recursive

# 3. Valider
.\validate.ps1 -Environment dev

# 4. Plan
.\deploy.ps1 -Environment dev -Action plan

# 5. Apply
.\deploy.ps1 -Environment dev -Action apply
```

### 3. Nettoyage (Cleanup)

```powershell
# Détruire l'infrastructure
.\deploy.ps1 -Environment dev -Action destroy
```

## ⚙️ Variables d'Environnement Utiles

```powershell
# PowerShell
$env:AWS_PROFILE="mon-profil"           # Utiliser un profil AWS spécifique
$env:AWS_DEFAULT_REGION="eu-west-3"     # Forcer la région
$env:TF_LOG="DEBUG"                     # Logs Terraform détaillés
$env:TF_LOG_PATH="terraform.log"        # Fichier de log
```

```bash
# Bash
export AWS_PROFILE=mon-profil
export AWS_DEFAULT_REGION=eu-west-3
export TF_LOG=DEBUG
export TF_LOG_PATH=terraform.log
```

## 📚 Ressources

- [Terraform CLI Documentation](https://www.terraform.io/cli)
- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

## 🆘 Support

En cas de problème :
1. Exécuter `.\validate.ps1` pour diagnostiquer
2. Vérifier les logs Terraform
3. Consulter la documentation des modules
4. Contacter l'équipe DevOps

---

**Dernière mise à jour** : Décembre 2024
