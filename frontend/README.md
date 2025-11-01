# Frontend - Agence Immobilière

Application Next.js 14 avec TypeScript et Tailwind CSS pour le système d'authentification.

## 🚀 Démarrage

### Prérequis
- Node.js 18+ 
- Backend API démarrée sur `http://localhost:5000`

### Installation
```bash
npm install
```

### Variables d'environnement
Créer un fichier `.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Agence Immobilière
```

### Développement
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:3000`

## 📁 Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── register/            # Page d'inscription
│   │   └── page.tsx
│   └── auth/
│       └── callback/        # Callback OAuth Google
│           └── page.tsx
├── components/
│   ├── forms/               # Formulaires
│   │   └── RegisterForm.tsx
│   └── ui/                  # Composants UI réutilisables
│       ├── Alert.tsx
│       ├── Button.tsx
│       ├── GoogleButton.tsx
│       ├── InputField.tsx
│       └── PasswordStrengthMeter.tsx
├── lib/
│   ├── api/                 # Client API
│   │   ├── client.ts       # Instance Axios
│   │   └── auth.ts         # Fonctions d'authentification
│   └── validations/
│       └── authSchema.ts   # Schémas Zod
└── .env.local
```

## 🔐 Fonctionnalités d'authentification

### Inscription par email/mot de passe
- **Route** : `/register`
- **Validation côté client** : Zod avec React Hook Form
- **Validation côté serveur** : Express-validator
- **Sécurité** : Mot de passe hashé avec bcrypt
- **Feedback** : Indicateur de force du mot de passe en temps réel
- **Confirmation** : Email de bienvenue envoyé après inscription

### Inscription avec Google OAuth 2.0
- **Flux** : OAuth 2.0 via Passport.js
- **Callback** : `/auth/callback?token=xxx`
- **Stockage** : JWT sauvegardé dans localStorage
- **Redirection** : Vers page d'accueil après authentification

## 🧪 Tests

### Test manuel du formulaire d'inscription
1. Démarrer le backend : `cd ../backend && npm run dev`
2. Démarrer le frontend : `npm run dev`
3. Naviguer vers `http://localhost:3000/register`
4. Tester les validations :
   - Email invalide
   - Mot de passe trop court
   - Mots de passe non correspondants
   - Téléphone au format français invalide
5. Soumettre avec des données valides
6. Vérifier la console backend pour l'URL de preview de l'email (Ethereal)
7. Vérifier les logs d'activité dans `backend/logs/activity-YYYY-MM.log`

### Test du flux Google OAuth (si configuré)
1. Configurer les credentials Google OAuth dans `backend/.env`
2. Cliquer sur "S'inscrire avec Google"
3. Autoriser l'application
4. Vérifier la redirection vers `/auth/callback?token=xxx`
5. Vérifier le stockage du token dans localStorage
6. Vérifier la redirection finale

## 🔧 Validation

### Règles de validation (client + serveur)

**Prénom / Nom** :
- 2-50 caractères
- Lettres uniquement (accents acceptés)

**Email** :
- Format email valide

**Mot de passe** :
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial (@$!%*?&)

**Téléphone (optionnel)** :
- Format tunisien : +216XXXXXXXX, 00216XXXXXXXX ou XXXXXXXX
- 8 chiffres commençant par 2-9
- Ce champ est vraiment optionnel (peut être vide)

## 📦 Dépendances principales

- **Next.js 14** : Framework React avec App Router
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utility-first
- **React Hook Form** : Gestion de formulaires
- **Zod** : Validation de schémas
- **Axios** : Client HTTP
- **Lucide React** : Icônes

## 🔄 Flux d'authentification

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ 1. Soumet formulaire
       ▼
┌─────────────────┐
│  RegisterForm   │◄─── Validation Zod
└──────┬──────────┘
       │
       │ 2. POST /api/auth/register
       ▼
┌─────────────────┐
│   Backend API   │◄─── Validation Express
└──────┬──────────┘     Hachage bcrypt
       │                Envoi email
       │                Log activité
       │
       │ 3. Retourne { token, user }
       ▼
┌─────────────────┐
│  localStorage   │◄─── Sauvegarde token
└──────┬──────────┘
       │
       │ 4. Redirect /login?registered=true
       ▼
┌─────────────────┐
│   Page Login    │
└─────────────────┘
```

## 🎨 Composants UI

### `<InputField />`
Champ de saisie réutilisable avec label et affichage d'erreurs.

### `<Button />`
Bouton avec variantes (primary, secondary, outline) et état de chargement.

### `<Alert />`
Alerte contextuelle (success, error, warning, info) avec icônes.

### `<GoogleButton />`
Bouton stylisé Google avec logo officiel.

### `<PasswordStrengthMeter />`
Indicateur visuel de force du mot de passe avec checklist des exigences.

## 📝 Notes de développement

### Intercepteurs Axios
- **Request** : Ajoute automatiquement le token JWT depuis localStorage
- **Response** : Gère les erreurs 401 (token expiré/invalide), supprime le token et redirige vers `/login`

### Gestion des erreurs
Les erreurs API sont affichées via le composant `<Alert />` avec des messages traduits.

### Protection des routes
À implémenter : middleware Next.js pour protéger les routes nécessitant une authentification.

## 🚧 Tâches à venir (AW-18+)

- [ ] Page de connexion (`/login`)
- [ ] Dashboard utilisateur (`/dashboard`)
- [ ] Middleware d'authentification
- [ ] Page de réinitialisation de mot de passe
- [ ] Gestion du profil utilisateur
- [ ] Tests E2E avec Playwright/Cypress

## 📄 License

MIT
