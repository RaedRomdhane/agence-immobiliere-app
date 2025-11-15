# 🧪 Guide de Test - US 1.1 : Ajouter un bien immobilier

## ✅ Statut de l'implémentation

- ✅ Backend API fonctionnel (port 5000)
- ✅ Frontend Next.js fonctionnel (port 3000)
- ✅ Modèle Property avec QR code automatique
- ✅ Upload de photos (1-10 max)
- ✅ Formulaire avec validation complète
- ✅ Routes protégées (admin only)

## 📋 Tests Manuels à Effectuer

### 1️⃣ Test d'Authentification (Prérequis)

**Connexion Admin:**
1. Aller sur http://localhost:3000
2. Cliquer sur "Se connecter"
3. Utiliser les identifiants admin:
   - Email: `admin@agence.com`
   - Password: `Admin123!`
4. ✅ Vérifier: Redirection vers la page d'accueil avec menu admin

### 2️⃣ Test d'Accès à la Page de Création

**Navigation:**
1. Une fois connecté comme admin
2. Aller sur: http://localhost:3000/admin/properties
3. ✅ Vérifier: Page "Gestion des biens" s'affiche
4. Cliquer sur "Ajouter un bien"
5. ✅ Vérifier: Formulaire de création s'affiche

**OU accès direct:**
- Aller sur: http://localhost:3000/admin/properties/new
- ✅ Vérifier: Formulaire accessible uniquement si admin connecté

### 3️⃣ Test de Validation du Formulaire

**Champs Requis:**
1. Cliquer sur "Créer le bien" sans remplir le formulaire
2. ✅ Vérifier: Messages d'erreur s'affichent pour:
   - Titre (min 5 caractères)
   - Description (min 20 caractères)
   - Type de bien
   - Type de transaction
   - Prix
   - Surface
   - Adresse
   - Ville
   - Région
   - Photos (au moins 1)

**Validation des Champs:**
1. Titre trop court (< 5 caractères)
   - ✅ "Le titre doit contenir au moins 5 caractères"
2. Description trop courte (< 20 caractères)
   - ✅ "La description doit contenir au moins 20 caractères"
3. Prix négatif
   - ✅ "Le prix ne peut pas être négatif"
4. Surface < 1 m²
   - ✅ "La surface doit être au moins 1 m²"

### 4️⃣ Test d'Upload de Photos

**Upload Simple:**
1. Cliquer sur "parcourez vos fichiers"
2. Sélectionner 1 image JPEG/PNG/WebP
3. ✅ Vérifier: 
   - Image s'affiche en prévisualisation
   - Badge "Principale" sur la première photo
   - Compteur "1 / 10 photos ajoutées"

**Upload Multiple:**
1. Ajouter 5 photos supplémentaires (6 au total)
2. ✅ Vérifier:
   - Toutes les photos s'affichent
   - Compteur "6 / 10 photos ajoutées"
   - Bouton "Ajouter" visible

**Drag & Drop:**
1. Glisser-déposer 2 photos dans la zone
2. ✅ Vérifier:
   - Photos ajoutées (total 8)
   - Animation drag & drop fonctionne

**Suppression:**
1. Survoler une photo
2. Cliquer sur le bouton X rouge
3. ✅ Vérifier:
   - Photo supprimée
   - Compteur mis à jour
   - Si 1ère photo supprimée, nouvelle 1ère devient "Principale"

**Limite Max:**
1. Essayer d'ajouter plus de 10 photos
2. ✅ Vérifier: Alert "Maximum 10 photos autorisées"

**Types de Fichiers:**
1. Essayer d'ajouter un fichier PDF ou TXT
2. ✅ Vérifier: Fichier rejeté (filtre: images seulement)

### 5️⃣ Test de Création Complète

**Données de Test:**
```
Titre: Magnifique appartement F3 vue mer - Carthage
Description: Superbe appartement de 120m² situé à Carthage avec vue panoramique sur la mer Méditerranée. Entièrement rénové en 2024, cet appartement lumineux dispose de 3 chambres spacieuses, un grand salon, une cuisine équipée moderne, et deux salles de bain.
Type: Appartement
Transaction: Vente
Prix: 350000 TND
Surface: 120 m²
Pièces: 4
Chambres: 3
Salles de bain: 2
Étage: 3

Adresse: 12 Avenue Habib Bourguiba
Ville: Carthage
Région: Tunis
Code postal: 2016

Caractéristiques (cocher):
✅ Parking
✅ Ascenseur
✅ Balcon
✅ Meublé
✅ Climatisation
✅ Système de sécurité

Photos: 3-5 photos
```

**Étapes:**
1. Remplir tous les champs avec les données ci-dessus
2. Uploader 3 à 5 photos
3. Cliquer sur "Créer le bien"
4. ✅ Vérifier:
   - Message de succès "Bien immobilier créé avec succès ! 🎉"
   - Redirection vers /admin/properties
   - Nouveau bien visible dans la liste

### 6️⃣ Test API Backend (cURL)

**Vérifier la création dans MongoDB:**

```powershell
# 1. Récupérer le token admin
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@agence.com","password":"Admin123!"}'

$token = $loginResponse.token

# 2. Créer un bien via API
$headers = @{
  "Authorization" = "Bearer $token"
}

# Note: Pour tester l'upload avec PowerShell, il faut utiliser multipart/form-data
# Utilisez Postman ou curl pour un test complet avec photos
```

**Avec curl (si disponible):**
```bash
# Connexion
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agence.com","password":"Admin123!"}' \
  | jq -r '.token')

# Créer un bien avec photos
curl -X POST http://localhost:5000/api/properties \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Test Villa Hammamet" \
  -F "description=Belle villa avec piscine et jardin, idéale pour famille nombreuse" \
  -F "type=villa" \
  -F "transactionType=vente" \
  -F "price=450000" \
  -F "surface=200" \
  -F "rooms=5" \
  -F "bedrooms=4" \
  -F "bathrooms=3" \
  -F 'location={"address":"Route Touristique","city":"Hammamet","region":"Nabeul"}' \
  -F 'features={"parking":true,"garden":true,"pool":true}' \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg"
```

### 7️⃣ Test de la Liste Admin

**Affichage:**
1. Aller sur http://localhost:3000/admin/properties
2. ✅ Vérifier:
   - Tous les biens créés s'affichent
   - Photo principale visible
   - Informations: titre, localisation, prix, surface, chambres
   - Badges "À vendre" / "À louer"
   - Boutons "Voir" et "Modifier"

**État Vide:**
1. Si aucun bien: message "Aucun bien immobilier"
2. Bouton "Ajouter un bien" visible

### 8️⃣ Test du QR Code (Backend)

**Vérification MongoDB:**
```javascript
// Dans MongoDB Compass ou mongosh
use agence-immobiliere-dev

// Trouver un bien
db.properties.findOne()

// Vérifier que le champ qrCode existe et contient une data URL
// Format attendu: "data:image/png;base64,iVBORw0KGgoAAAANS..."
```

**Test API:**
```powershell
# Récupérer un bien par ID
$propertyId = "ID_DU_BIEN"
$property = Invoke-RestMethod -Uri "http://localhost:5000/api/properties/$propertyId"

# Vérifier le QR code
$property.data.qrCode # Doit contenir "data:image/png;base64,..."
```

## 🐛 Problèmes Connus et Solutions

### Erreur: "Cannot find module '@/app/contexts/AuthContext'"
- ✅ **Corrigé**: Import changé vers `@/components/auth/AuthProvider`

### Erreur: "authorize is not a function"
- ✅ **Corrigé**: Middleware renommé `restrictTo` au lieu de `authorize`

### Erreur: Port 5000 déjà utilisé
```powershell
# Arrêter le processus sur le port 5000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess
```

### Photos ne s'uploadent pas
1. Vérifier que le dossier `backend/uploads/properties/` existe
2. Vérifier les permissions du dossier
3. Vérifier la taille des fichiers (max 5MB chacun)

### Token expiré
1. Se reconnecter en tant qu'admin
2. Le token JWT expire après 7 jours par défaut

## ✅ Checklist Finale US 1.1

### Fonctionnel
- [ ] Admin peut accéder au formulaire de création
- [ ] Formulaire valide tous les champs requis
- [ ] Upload de 1 à 10 photos fonctionne
- [ ] Drag & drop des photos fonctionne
- [ ] Suppression des photos avant envoi fonctionne
- [ ] Création du bien réussie
- [ ] QR code généré automatiquement
- [ ] Bien sauvegardé dans MongoDB
- [ ] Redirection vers la liste après création
- [ ] Bien visible dans la liste admin

### Sécurité
- [ ] Route protégée (admin seulement)
- [ ] Validation côté backend (express-validator)
- [ ] Validation côté frontend (Zod)
- [ ] Upload limité à 10 photos max
- [ ] Taille fichier limitée à 5MB
- [ ] Types de fichiers filtrés (JPEG, PNG, WebP)

### Performance
- [ ] Prévisualisation photos instantanée
- [ ] Pas de lag lors de l'upload
- [ ] QR code généré en < 500ms

### UX
- [ ] Messages d'erreur clairs et en français
- [ ] Badge "Principale" sur 1ère photo
- [ ] Compteur de photos visible
- [ ] Boutons désactivés pendant l'envoi
- [ ] Loading spinner pendant la création
- [ ] Toast de succès après création

## 🚀 Prochaines Étapes

Après validation complète de l'US 1.1:
1. ✅ Commiter les corrections
2. ✅ Pousser sur GitHub
3. ✅ Créer Pull Request vers `develop`
4. ⏳ Démarrer US 1.2: Modifier un bien

---

**Date de création:** 2025-11-15  
**Branche:** feature/US-1.1-ajouter-bien  
**Commit:** 86339ca
