'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import InputField from '../ui/InputField';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { Mail, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email('Email invalide')
    .toLowerCase(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await apiClient.post('/auth/forgot-password', data);
      setSuccess(true);
    } catch (err: any) {
      console.error('Erreur:', err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Une erreur est survenue. Veuillez réessayer.';
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
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Email envoyé !
          </h3>
          <p className="text-gray-600 mb-6">
            Si un compte existe avec cette adresse email, vous recevrez un lien de
            réinitialisation dans quelques instants.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Le lien est valable pendant <strong>1 heure</strong>. Pensez à vérifier
            vos spams si vous ne recevez rien.
          </p>
          <Link href="/login">
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && <Alert type="error">{error}</Alert>}

        <div className="text-center mb-6">
          <p className="text-gray-600">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser
            votre mot de passe.
          </p>
        </div>

        <InputField
          label="Email"
          type="email"
          placeholder="jean.dupont@example.com"
          {...register('email')}
          error={errors.email?.message}
          autoComplete="email"
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          <Mail className="w-5 h-5 mr-2" />
          Envoyer le lien de réinitialisation
        </Button>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour à la connexion
          </Link>
        </div>
      </form>
    </div>
  );
}
