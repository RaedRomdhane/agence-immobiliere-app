'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginSchema, LoginFormData } from '@/lib/validations/authSchema';
import { authApi } from '@/lib/api/auth';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import GoogleButton from '../ui/GoogleButton';
import { LogIn } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Afficher message de succès si venant de l'inscription
  useState(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authApi.login({
        ...data,
        rememberMe,
      });

      // Sauvegarder le token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Rediriger vers la page d'accueil
      router.push('/');
    } catch (err: any) {
      console.error('Erreur de connexion:', err);

      const responseData = err.response?.data;
      const message =
        responseData?.message ||
        responseData?.error?.message ||
        'Une erreur est survenue lors de la connexion';

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Success Message */}
        {successMessage && <Alert type="success">{successMessage}</Alert>}

        {/* Error Message */}
        {error && <Alert type="error">{error}</Alert>}

        {/* Email */}
        <InputField
          label="Email"
          type="email"
          placeholder="jean.dupont@example.com"
          {...register('email')}
          error={errors.email?.message}
          autoComplete="email"
        />

        {/* Password */}
        <div>
          <InputField
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
            autoComplete="current-password"
          />
          
          {/* Forgot Password Link */}
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label
            htmlFor="rememberMe"
            className="ml-2 block text-sm text-gray-700 cursor-pointer"
          >
            Se souvenir de moi
          </label>
        </div>

        {/* Login Button */}
        <Button type="submit" isLoading={isLoading} className="w-full">
          <LogIn className="w-5 h-5 mr-2" />
          Se connecter
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
          </div>
        </div>

        {/* Google Login */}
        <GoogleButton onClick={() => authApi.googleLogin()}>
          Se connecter avec Google
        </GoogleButton>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-600">
          Pas encore de compte ?{' '}
          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            S&apos;inscrire
          </Link>
        </p>
      </form>
    </div>
  );
}
