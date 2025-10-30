#!/bin/bash

###############################################################################
# Script de vérification de l'environnement de développement
# Usage: ./scripts/verify-setup.sh
###############################################################################

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
PASSED=0
FAILED=0

# Fonctions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

check_command() {
    local cmd=$1
    local name=$2
    local min_version=$3
    
    if command -v $cmd &> /dev/null; then
        local version=$($cmd --version 2>&1 | head -n 1)
        echo -e "${GREEN}✅ $name installé${NC}"
        echo -e "   Version: $version"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ $name NON installé${NC}"
        echo -e "   Requis: $min_version"
        ((FAILED++))
        return 1
    fi
}

check_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Port $port disponible (service: $service)${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${YELLOW}⚠️  Port $port NON utilisé${NC}"
        echo -e "   $service n'est peut-être pas démarré"
        return 0
    fi
}

check_file() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $name existe${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ $name MANQUANT${NC}"
        echo -e "   Chemin: $file"
        ((FAILED++))
        return 1
    fi
}

check_directory() {
    local dir=$1
    local name=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ $name existe${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ $name MANQUANT${NC}"
        echo -e "   Chemin: $dir"
        ((FAILED++))
        return 1
    fi
}

# En-tête
clear
print_header "🔍 Vérification de l'environnement de développement"

# 1. Vérification des outils
print_header "1️⃣  Outils requis"

check_command "git" "Git" ">= 2.40"
check_command "node" "Node.js" ">= 20.0.0"
check_command "npm" "npm" ">= 10.0.0"

# Vérifier la version de Node.js
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    echo -e "${GREEN}✅ Version Node.js compatible (v$NODE_VERSION)${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ Version Node.js trop ancienne (v$NODE_VERSION)${NC}"
    echo -e "   Requis: >= v20"
    ((FAILED++))
fi

# MongoDB
if command -v mongosh &> /dev/null; then
    check_command "mongosh" "MongoDB Shell" ">= 1.0"
elif command -v mongo &> /dev/null; then
    check_command "mongo" "MongoDB (legacy)" ">= 5.0"
else
    echo -e "${YELLOW}⚠️  MongoDB Shell non trouvé${NC}"
    echo -e "   Vérifiez que MongoDB est installé ou utilisez Docker"
fi

# Docker (optionnel)
if command -v docker &> /dev/null; then
    check_command "docker" "Docker" ">= 20.0"
    check_command "docker-compose" "Docker Compose" ">= 2.0" || \
    check_command "docker" "Docker Compose (intégré)" "docker compose version"
else
    echo -e "${YELLOW}⚠️  Docker non trouvé (optionnel)${NC}"
fi

# 2. Structure du projet
print_header "2️⃣  Structure du projet"

check_directory "backend" "Dossier backend"
check_directory "frontend" "Dossier frontend"
check_directory "infrastructure" "Dossier infrastructure"
check_directory "docs" "Dossier docs"

# 3. Configuration Backend
print_header "3️⃣  Configuration Backend"

check_file "backend/package.json" "package.json"
check_file "backend/.env.example" ".env.example"

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ Fichier .env existe${NC}"
    ((PASSED++))
    
    # Vérifier les variables importantes
    if grep -q "MONGODB_URI=" backend/.env; then
        echo -e "${GREEN}   ✓ MONGODB_URI configuré${NC}"
    else
        echo -e "${RED}   ✗ MONGODB_URI MANQUANT${NC}"
        ((FAILED++))
    fi
    
    if grep -q "JWT_SECRET=" backend/.env; then
        echo -e "${GREEN}   ✓ JWT_SECRET configuré${NC}"
    else
        echo -e "${RED}   ✗ JWT_SECRET MANQUANT${NC}"
        ((FAILED++))
    fi
else
    echo -e "${RED}❌ Fichier .env MANQUANT${NC}"
    echo -e "   Créez-le avec: cp backend/.env.example backend/.env"
    ((FAILED++))
fi

check_directory "backend/node_modules" "Dependencies backend installées"

# 4. Tests de connectivité
print_header "4️⃣  Tests de connectivité"

# MongoDB
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.version()" --quiet >/dev/null 2>&1; then
        echo -e "${GREEN}✅ MongoDB accessible${NC}"
        MONGO_VERSION=$(mongosh --eval "db.version()" --quiet)
        echo -e "   Version: $MONGO_VERSION"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  MongoDB non accessible${NC}"
        echo -e "   Assurez-vous que MongoDB est démarré"
    fi
else
    echo -e "${YELLOW}⚠️  Impossible de tester MongoDB (mongosh non trouvé)${NC}"
fi

# Ports
echo -e "\n${BLUE}Vérification des ports:${NC}"
check_port 27017 "MongoDB"
check_port 5000 "Backend API"
check_port 3000 "Frontend"

# 5. Résumé
print_header "📊 Résumé"

TOTAL=$((PASSED + FAILED))
SUCCESS_RATE=$((PASSED * 100 / TOTAL))

echo -e "Total de vérifications: $TOTAL"
echo -e "${GREEN}Réussies: $PASSED${NC}"
echo -e "${RED}Échouées: $FAILED${NC}"
echo -e "\nTaux de réussite: ${SUCCESS_RATE}%"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Environnement prêt pour le développement!${NC}"
    exit 0
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "\n${YELLOW}⚠️  Environnement presque prêt (quelques ajustements nécessaires)${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Environnement incomplet - Consultez le guide DEV-SETUP-GUIDE.md${NC}"
    exit 1
fi
