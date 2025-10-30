# Scripts de Vérification et Utilitaires

Ce dossier contient des scripts utilitaires pour faciliter le développement et la maintenance du projet.

## 📋 Scripts Disponibles

### 1. verify-setup.sh / verify-setup.ps1
**Vérification de l'environnement de développement**

Ces scripts vérifient que votre environnement de développement est correctement configuré.

#### Utilisation

**Linux/macOS (Bash):**
```bash
# Rendre le script exécutable
chmod +x scripts/verify-setup.sh

# Exécuter le script
./scripts/verify-setup.sh
```

**Windows (PowerShell):**
```powershell
# Exécuter le script
.\scripts\verify-setup.ps1

# Si vous rencontrez une erreur de politique d'exécution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\verify-setup.ps1
```

#### Ce qui est vérifié

##### 1️⃣ Outils requis
- ✅ Git (>= 2.40)
- ✅ Node.js (>= 20.0.0)
- ✅ npm (>= 10.0.0)
- ✅ MongoDB Shell (mongosh ou mongo)
- ⚠️ Docker (optionnel mais recommandé)
- ⚠️ Docker Compose (optionnel mais recommandé)

##### 2️⃣ Structure du projet
- ✅ Dossier `backend/`
- ✅ Dossier `frontend/`
- ✅ Dossier `infrastructure/`
- ✅ Dossier `docs/`

##### 3️⃣ Configuration Backend
- ✅ `backend/package.json`
- ✅ `backend/.env.example`
- ✅ `backend/.env` (avec MONGODB_URI et JWT_SECRET)
- ✅ `backend/node_modules/` (dépendances installées)

##### 4️⃣ Configuration Frontend
- ✅ `frontend/package.json`
- ⚠️ `frontend/.env.local` (optionnel)
- ⚠️ `frontend/node_modules/` (dépendances installées)

##### 5️⃣ Tests de connectivité
- ✅ MongoDB accessible (si installé localement)
- ✅ Port 27017 (MongoDB)
- ✅ Port 5000 (Backend API)
- ✅ Port 3000 (Frontend)

#### Codes de sortie

| Code | Signification |
|------|---------------|
| 0 | ✅ Tout est OK ou taux de réussite >= 80% |
| 1 | ❌ Environnement incomplet (< 80% de réussite) |

#### Exemple de sortie

```
========================================
🔍 Vérification de l'environnement de développement
========================================

========================================
1️⃣  Outils requis
========================================

✅ Git installé
   Version: git version 2.42.0
✅ Node.js installé
   Version: v20.10.0
✅ npm installé
   Version: 10.2.3
✅ Version Node.js compatible (v20)
✅ MongoDB Shell installé
   Version: mongosh 2.1.0
✅ Docker installé
   Version: Docker version 24.0.6
✅ Docker Compose installé
   Version: Docker Compose version 2.23.0

========================================
2️⃣  Structure du projet
========================================

✅ Dossier backend existe
✅ Dossier frontend existe
✅ Dossier infrastructure existe
✅ Dossier docs existe

========================================
📊 Résumé
========================================

Total de vérifications: 25
Réussies: 24
Échouées: 1

Taux de réussite: 96%

⚠️  Environnement presque prêt (quelques ajustements nécessaires)
```

## 🔧 Dépannage

### Erreur : "Permission denied"
**Linux/macOS:**
```bash
chmod +x scripts/verify-setup.sh
```

### Erreur : "Execution policy"
**Windows:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### MongoDB non accessible
1. Vérifiez que MongoDB est démarré :
   ```bash
   # Linux/macOS
   sudo systemctl status mongod
   
   # Windows
   Get-Service MongoDB
   ```

2. Ou utilisez Docker :
   ```bash
   docker-compose -f docker-compose.dev.yml up -d mongodb
   ```

### Ports déjà utilisés
**Trouver le processus utilisant un port:**

**Linux/macOS:**
```bash
lsof -i :5000
```

**Windows:**
```powershell
Get-NetTCPConnection -LocalPort 5000 | Select-Object -Property *, @{Name="ProcessName";Expression={(Get-Process -Id $_.OwningProcess).Name}}
```

### Dépendances non installées
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## 📚 Scripts Supplémentaires (à venir)

- `start-dev.sh` / `start-dev.ps1` - Démarrer l'environnement de développement
- `stop-dev.sh` / `stop-dev.ps1` - Arrêter l'environnement de développement
- `clean.sh` / `clean.ps1` - Nettoyer les fichiers temporaires
- `db-seed.sh` / `db-seed.ps1` - Peupler la base de données avec des données de test

## 🤝 Contribution

Pour ajouter un nouveau script :

1. Créez deux versions (Bash et PowerShell)
2. Ajoutez la documentation dans ce README
3. Testez sur différentes plateformes
4. Faites une Pull Request

## 📝 Notes

- Les scripts Bash sont compatibles avec Linux, macOS et WSL2
- Les scripts PowerShell sont compatibles avec Windows PowerShell 5.1+ et PowerShell Core 7+
- Utilisez toujours des chemins relatifs dans les scripts
- Ajoutez des messages d'erreur clairs et utiles

## 📞 Support

Si vous rencontrez des problèmes avec les scripts :

1. Consultez le guide `docs/DEV-SETUP-GUIDE.md`
2. Consultez le guide `docs/DOCKER-GUIDE.md` pour les problèmes Docker
3. Ouvrez une issue sur GitHub avec :
   - Le système d'exploitation utilisé
   - La sortie complète du script
   - Les messages d'erreur

---

**Dernière mise à jour :** Octobre 2025  
**Ticket :** AW-12 - Configuration Environnement DEV
