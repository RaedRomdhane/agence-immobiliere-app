'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import InputField from '../ui/InputField';
import PasswordStrengthMeter from '../ui/PasswordStrengthMeter';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { Lock, CheckCircle2 } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)'
      ),
    confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPassword = watch('newPassword');

  // Vérifier si le token est présent
  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Alert type="error">
          Lien de réinitialisation invalide. Veuillez demander un nouveau lien.
        </Alert>
        <div className="mt-4 text-center">
          <Link href="/forgot-password">
            <Button>Demander un nouveau lien</Button>
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setSuccess(true);

      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 3000);
    } catch (err: any) {
      console.error('Erreur:', err);

      const responseData = err.response?.data;
      let message = 'Une erreur est survenue. Veuillez réessayer.';

      // Gérer les erreurs de validation
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        message = responseData.errors.map((e: any) => e.message).join(' | ');
      } else if (responseData?.error?.errors && Array.isArray(responseData.error.errors)) {
        message = responseData.error.errors.map((e: any) => e.message).join(' | ');
      } else if (responseData?.message) {
        message = responseData.message;
      } else if (responseData?.error?.message) {
        message = responseData.error.message;
      }

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Mot de passe réinitialisé !
          </h3>
          <p className="text-gray-600 mb-6">
            Votre mot de passe a été changé avec succès. Vous allez être redirigé vers la
            page de connexion...
          </p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Conseils pour un mot de passe sécurisé :</strong>
            <br />• Au moins 8 caractères
            <br />• Une majuscule et une minuscule
            <br />• Un chiffre et un caractère spécial (@$!%*?&)
          </p>
        </div>

        <div>
          <InputField
            label="Nouveau mot de passe"
            type="password"
            placeholder="••••••••"
            {...register('newPassword')}
            error={errors.newPassword?.message}
            autoComplete="new-password"
          />
          {newPassword && <PasswordStrengthMeter password={newPassword} />}
        </div>

        <InputField
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
          autoComplete="new-password"
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          <Lock className="w-5 h-5 mr-2" />
          Réinitialiser le mot de passe
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Retour à la connexion
          </Link>
        </div>
      </form>
    </div>
  );
}
