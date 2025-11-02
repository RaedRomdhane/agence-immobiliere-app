'use client';

import { Suspense } from 'react';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';
import { Building2, Shield, Lock, AlertTriangle } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Left Side - Branding & Security Info */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-10 flex-col justify-between relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Logo & Title */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-white/25 backdrop-blur-md p-3 rounded-2xl shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Agence Immobilière</h2>
              <p className="text-blue-100 text-sm">Réinitialisation sécurisée</p>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="relative z-10 space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-start space-x-4">
              <div className="bg-green-500/20 backdrop-blur-sm p-3 rounded-xl shrink-0">
                <Shield className="h-6 w-6 text-green-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Cryptage bancaire</h3>
                <p className="text-blue-100 text-sm">
                  Votre nouveau mot de passe sera crypté avec un algorithme de niveau bancaire (bcrypt)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-start space-x-4">
              <div className="bg-orange-500/20 backdrop-blur-sm p-3 rounded-xl shrink-0">
                <AlertTriangle className="h-6 w-6 text-orange-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Lien à usage unique</h3>
                <p className="text-blue-100 text-sm">
                  Ce lien ne peut être utilisé qu&apos;une seule fois et expire après 1 heure
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/20 backdrop-blur-sm p-3 rounded-xl shrink-0">
                <Lock className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Ancien mot de passe invalidé</h3>
                <p className="text-blue-100 text-sm">
                  Votre ancien mot de passe sera automatiquement invalidé après la réinitialisation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h4 className="text-white font-semibold mb-3">🔒 Bonnes pratiques</h4>
            <ul className="space-y-2 text-blue-100 text-sm">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Choisissez un mot de passe unique</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Mélangez majuscules, minuscules et symboles</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Évitez les informations personnelles</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Ne réutilisez pas d&apos;anciens mots de passe</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Nouveau mot de passe
            </h1>
            <p className="text-gray-600">
              Choisissez un mot de passe fort et sécurisé
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <Suspense fallback={
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                <p className="mt-2 text-gray-600">Chargement...</p>
              </div>
            }>
              <ResetPasswordForm />
            </Suspense>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Ce lien expire après <strong>1 heure</strong> pour votre sécurité
          </p>
        </div>
      </div>
    </div>
  );
}
