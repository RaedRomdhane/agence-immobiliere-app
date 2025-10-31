# AW-17 - Page d'Inscription - Plan de Développement

## ✅ Statut Backend

**TERMINÉ ET COMMITTÉ** (commit 65c41c3)

### Ce qui a été fait :
- ✅ Service d'authentification avec hashage bcrypt
- ✅ Google OAuth 2.0 (Passport.js)
- ✅ Envoi d'email de bienvenue (Nodemailer)
- ✅ Logs d'activité (fichiers JSON)
- ✅ Validation stricte (email, password, phone)
- ✅ Routes complètes (/register, /login, /google)
- ✅ Documentation Swagger
- ✅ 13 tests d'intégration passants

### Endpoints disponibles :
```
POST /api/auth/register        - Inscription classique
POST /api/auth/login           - Connexion
GET  /api/auth/google          - OAuth Google (redirection)
GET  /api/auth/google/callback - Callback OAuth
```

---

## 🚧 TODO : Frontend Next.js

### Phase 1 : Initialisation Next.js 14

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
```

**Options recommandées :**
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ App Router
- ❌ Pas de src/ directory
- ✅ ESLint
- ✅ Import alias (@/*)

### Phase 2 : Structure du Projet

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx          # Callback Google OAuth
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── forms/
│   │   ├── RegisterForm.tsx      # Formulaire d'inscription
│   │   ├── InputField.tsx        # Champ input réutilisable
│   │   └── PasswordStrengthMeter.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Alert.tsx
│   │   └── GoogleButton.tsx
│   └── providers/
│       └── AuthProvider.tsx
├── lib/
│   ├── api/
│   │   ├── auth.ts               # Fonctions API auth
│   │   └── client.ts             # Axios client configuré
│   ├── validations/
│   │   └── authSchema.ts         # Schémas Zod
│   ├── utils/
│   │   └── passwordValidator.ts  # Utils validation
│   └── hooks/
│       ├── useAuth.ts
│       └── useRegister.ts
├── types/
│   └── auth.ts                   # Types TypeScript
└── public/
    └── google-icon.svg
```

### Phase 3 : Installation des Dépendances

```bash
npm install axios react-hook-form @hookform/resolvers zod
npm install @tanstack/react-query
npm install js-cookie
npm install lucide-react  # Icons
```

### Phase 4 : Configuration API Client

**`lib/api/client.ts`** :
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

**`lib/api/auth.ts`** :
```typescript
import apiClient from './client';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
    };
    token: string;
  };
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  googleLogin: () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`;
  },
};
```

### Phase 5 : Schéma de Validation Zod

**`lib/validations/authSchema.ts`** :
```typescript
import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le prénom ne peut contenir que des lettres'),

  lastName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres'),

  email: z.string()
    .email('Email invalide')
    .toLowerCase(),

  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'
    ),

  confirmPassword: z.string(),

  phone: z.string()
    .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Format de téléphone invalide')
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
```

### Phase 6 : Composant Formulaire d'Inscription

**`components/forms/RegisterForm.tsx`** :
```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerSchema, RegisterFormData } from '@/lib/validations/authSchema';
import { authApi } from '@/lib/api/auth';
import InputField from './InputField';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import GoogleButton from '../ui/GoogleButton';

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.register(data);
      
      // Sauvegarder le token
      localStorage.setItem('token', response.data.token);
      
      // Rediriger vers /login avec message de succès
      router.push('/login?registered=true');
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 
                     'Une erreur est survenue lors de l\'inscription';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Prénom"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <InputField
            label="Nom"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        <InputField
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />

        <InputField
          label="Téléphone (optionnel)"
          type="tel"
          placeholder="+33612345678"
          {...register('phone')}
          error={errors.phone?.message}
        />

        <div className="space-y-2">
          <InputField
            label="Mot de passe"
            type="password"
            {...register('password')}
            error={errors.password?.message}
          />
          {password && <PasswordStrengthMeter password={password} />}
        </div>

        <InputField
          label="Confirmer le mot de passe"
          type="password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          S'inscrire
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou</span>
          </div>
        </div>

        <GoogleButton onClick={() => authApi.googleLogin()}>
          S'inscrire avec Google
        </GoogleButton>

        <p className="text-center text-sm text-gray-600">
          Vous avez déjà un compte ?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Se connecter
          </a>
        </p>
      </form>
    </div>
  );
}
```

### Phase 7 : Page d'Inscription

**`app/(auth)/register/page.tsx`** :
```typescript
import RegisterForm from '@/components/forms/RegisterForm';

export const metadata = {
  title: 'Inscription - Agence Immobilière',
  description: 'Créez votre compte pour accéder à nos services immobiliers',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Créer un compte
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez notre plateforme immobilière
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
```

### Phase 8 : Callback OAuth Google

**`app/auth/callback/page.tsx`** :
```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Sauvegarder le token
      localStorage.setItem('token', token);
      
      // Rediriger vers le dashboard
      router.push('/dashboard');
    } else {
      // Erreur d'authentification
      router.push('/login?error=google_auth_failed');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Connexion en cours...</p>
      </div>
    </div>
  );
}
```

### Phase 9 : Variables d'Environnement

**`frontend/.env.local`** :
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Agence Immobilière
```

---

## 🧪 Tests Frontend (à implémenter)

### Test 1 : Validation Côté Client
```typescript
// __tests__/register-form.test.tsx
describe('RegisterForm', () => {
  it('should validate email format', () => {
    // Test validation email
  });

  it('should validate password strength', () => {
    // Test force du mot de passe
  });

  it('should match passwords', () => {
    // Test correspondance mots de passe
  });
});
```

### Test 2 : Intégration API
```typescript
// __tests__/api/auth.test.ts
describe('Auth API', () => {
  it('should register a new user', async () => {
    // Test inscription
  });

  it('should handle registration errors', async () => {
    // Test gestion erreurs
  });
});
```

---

## 📋 Critères d'Acceptation AW-17

### ✅ Backend (TERMINÉ)
- [x] Le formulaire contient : email, mot de passe, confirmation mot de passe
- [x] La validation côté serveur fonctionne (format email, force du mot de passe)
- [x] Le mot de passe est hashé en toute sécurité avant d'être stocké dans la base de données
- [x] Un email de bienvenue est envoyé à l'utilisateur après inscription réussie
- [x] Un bouton "S'inscrire avec Google" permet de créer un compte via Google OAuth
- [x] L'inscription via Google crée un compte utilisateur et associe l'identifiant Google
- [x] La création de compte est enregistrée dans les logs d'activité

### 🚧 Frontend (À FAIRE)
- [ ] Le formulaire contient : email, mot de passe, confirmation mot de passe (UI)
- [ ] La validation côté client fonctionne en temps réel
- [ ] Un bouton "S'inscrire avec Google" est présent et fonctionnel
- [ ] L'utilisateur est redirigé vers la page de login après inscription

---

## 🚀 Prochaines Étapes

1. **Initialiser Next.js 14** dans `/frontend`
2. **Créer la structure** des dossiers
3. **Installer les dépendances** (axios, react-hook-form, zod)
4. **Créer RegisterForm** avec validation Zod
5. **Créer la page** `/register`
6. **Créer le callback** OAuth `/auth/callback`
7. **Tester l'intégration** backend ↔ frontend
8. **Committer et pusher**

---

## 📝 Notes

- Le backend est **100% fonctionnel** et testé
- Google OAuth nécessite **credentials réelles** de Google Cloud Console
- Pour tester sans Google OAuth, utiliser l'inscription classique
- Les emails sont envoyés via Ethereal (fake SMTP) en développement

---

**Date** : 31 octobre 2025  
**Ticket** : AW-17  
**Status Backend** : ✅ TERMINÉ  
**Status Frontend** : 🚧 EN COURS
