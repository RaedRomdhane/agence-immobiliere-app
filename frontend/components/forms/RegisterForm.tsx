'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { registerSchema, RegisterFormData } from '@/lib/validations/authSchema';
import { authApi } from '@/lib/api/auth';
import InputField from '../ui/InputField';
import PasswordStrengthMeter from '../ui/PasswordStrengthMeter';
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
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    shouldUnregister: false, // Garder les valeurs des champs même après erreur
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    // Ne pas effacer l'erreur immédiatement - elle sera effacée seulement en cas de succès

    try {
      // Nettoyer les données : supprimer phone s'il est vide
      const cleanData = {
        ...data,
        phone: data.phone?.trim() || undefined,
      };

      const response = await authApi.register(cleanData);
      
      // Effacer les erreurs seulement en cas de succès
      setError(null);
      
      // Sauvegarder le token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Rediriger directement vers la page d'accueil avec paramètre de succès
      router.push('/?registered=true');
    } catch (err: any) {
      // Log pour débogage - afficher la structure complète
      console.error('Erreur complète:', err);
      console.error('Response data:', JSON.stringify(err.response?.data, null, 2));
      
      const responseData = err.response?.data;
      const message = responseData?.message || responseData?.error?.message || "Une erreur est survenue lors de l'inscription";
      
      // Extraire les erreurs de validation détaillées si disponibles
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        const validationErrors = responseData.errors
          .map((e: any) => `${e.field}: ${e.message}`)
          .join(' | ');
        setError(validationErrors);
      } else if (responseData?.error?.errors && Array.isArray(responseData.error.errors)) {
        const validationErrors = responseData.error.errors
          .map((e: any) => `${e.field}: ${e.message}`)
          .join(' | ');
        setError(validationErrors);
      } else {
        setError(message);
      }
      // Ne pas réinitialiser le formulaire en cas d'erreur
      // L'utilisateur peut corriger ses informations
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Error Message - Plus visible avec animation */}
        {error && (
          <Alert type="error" className="animate-in fade-in-50 duration-300">
            <div className="font-medium">{error}</div>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Prénom"
            placeholder="Jean"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <InputField
            label="Nom"
            placeholder="Dupont"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        <InputField
          label="Email"
          type="email"
          placeholder="jean.dupont@example.com"
          {...register('email')}
          error={errors.email?.message}
        />

        <InputField
          label="Téléphone (optionnel)"
          type="tel"
          placeholder="+21698765432 ou 98765432"
          {...register('phone')}
          error={errors.phone?.message}
        />

        <div className="space-y-2">
          <InputField
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
          {password && <PasswordStrengthMeter password={password} />}
        </div>

        <InputField
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          S&apos;inscrire
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou</span>
          </div>
        </div>

        <GoogleButton onClick={() => authApi.googleSignup()}>
          S&apos;inscrire avec Google
        </GoogleButton>

        <p className="text-center text-sm text-gray-600">
          Vous avez déjà un compte ?{' '}
          <a
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Se connecter
          </a>
        </p>
      </form>
    </div>
  );
}
