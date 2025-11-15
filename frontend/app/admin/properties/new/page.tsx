'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import PropertyForm from '@/components/admin/PropertyForm';
import { ArrowLeft } from 'lucide-react';

export default function NewPropertyPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Vérification de l'authentification
  React.useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            Ajouter un bien immobilier
          </h1>
          <p className="mt-2 text-gray-600">
            Remplissez le formulaire ci-dessous pour ajouter un nouveau bien à la plateforme.
          </p>
        </div>

        {/* Formulaire */}
        <PropertyForm />
      </div>
    </div>
  );
}
