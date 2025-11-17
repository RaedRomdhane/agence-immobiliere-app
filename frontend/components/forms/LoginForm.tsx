'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { loginSchema, LoginFormData } from '@/lib/validations/authSchema';
import { authApi } from '@/lib/api/auth';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import GoogleButton from '../ui/GoogleButton';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Message de succès uniquement au montage initial
  const [successMessage] = useState<string | null>(() => {
    const registered = searchParams.get('registered');
    return registered === 'true' ? 'Inscription réussie ! Vous pouvez maintenant vous connecter.' : null;
  });

  // Gérer les erreurs Google OAuth depuis l'URL
  useEffect(() => {
    const googleError = searchParams.get('error');
    if (googleError) {
      // Décoder le message d'erreur
      const decodedError = decodeURIComponent(googleError);
      
      // Messages d'erreur personnalisés selon le type
      let errorMessage = decodedError;
      
      if (decodedError.includes('Aucun compte trouvé') || decodedError.includes('compte trouvé')) {
        errorMessage = "❌ Aucun compte trouvé avec ce compte Google.\n\n👉 Veuillez vous inscrire d'abord en cliquant sur le lien \"S'inscrire\" ci-dessous, puis utilisez le bouton \"S'inscrire avec Google\".";
      } else if (decodedError === 'google_auth_failed') {
        errorMessage = "❌ Échec de l'authentification Google. Veuillez réessayer.";
      }
      
      setError(errorMessage);
      
      // Nettoyer l'URL après avoir affiché l'erreur
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    shouldUnregister: false,
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login({
        email: data.email,
        password: data.password,
        rememberMe: true, // Toujours activer la connexion persistante
      });

      // Toujours sauvegarder le token dans localStorage pour une connexion persistante
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Rediriger vers la page d'accueil
      router.push('/');
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      const responseData = err.response?.data;
      const message = responseData?.message || responseData?.error?.message || 'Identifiants invalides';
      setError(message);
      
      // Force le re-render pour afficher l'erreur
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Success Message */}
        {successMessage && (
          <Alert type="success" className="animate-in fade-in-50 duration-300">
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert type="error" className="animate-in fade-in-50 duration-300">
            <div className="font-medium whitespace-pre-line">{error}</div>
          </Alert>
        )}

        <InputField
          label="Email"
          type="email"
          placeholder="votre.email@example.com"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />

        <div className="space-y-2">
          <InputField
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password')}
            error={errors.password?.message}
          />
          {/* <div className="flex justify-end">
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Mot de passe oublié ?
            </a>
          </div> */}
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          <LogIn className="w-5 h-5 mr-2" />
          Se connecter
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
          Se connecter avec Google
        </GoogleButton>

        <p className="text-center text-sm text-gray-600">
          Vous n&apos;avez pas de compte ?{' '}
          <a
            href="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            S&apos;inscrire
          </a>
        </p>
      </form>
    </div>
  );
}
