'use client';

import { Suspense } from 'react';
import LoginForm from '@/components/forms/LoginForm';
import Header from '@/components/layout/Header';
import { Building2, Shield, Users, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

// Wrapper pour isoler LoginForm du parent
function LoginFormWrapper() {
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <div className="min-h-screen flex pt-16">{/* pt-16 for fixed header spacing */}
      {/* Left Side - Branding & Benefits */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-10 flex-col justify-between relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-orange-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Logo & Title */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-white/25 backdrop-blur-md p-3 rounded-2xl shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Agence Immobilière</h2>
              <p className="text-blue-100 text-sm">Bienvenue ! Connectez-vous pour continuer</p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="relative z-10 space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/20 backdrop-blur-sm p-3 rounded-xl shrink-0">
                <CheckCircle2 className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Accès rapide</h3>
                <p className="text-blue-100 text-sm">Accédez instantanément à vos biens favoris et alertes personnalisées</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="bg-green-500/20 backdrop-blur-sm p-3 rounded-xl shrink-0">
                <Shield className="h-6 w-6 text-green-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Connexion sécurisée</h3>
                <p className="text-blue-100 text-sm">Vos données sont protégées avec un cryptage de niveau bancaire</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-500/20 backdrop-blur-sm p-3 rounded-xl shrink-0">
                <Clock className="h-6 w-6 text-purple-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Disponible 24/7</h3>
                <p className="text-blue-100 text-sm">Explorez nos annonces à tout moment, où que vous soyez</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6 mt-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">500+</div>
            <div className="text-blue-200 text-sm">Biens disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">10K+</div>
            <div className="text-blue-200 text-sm">Clients satisfaits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">50+</div>
            <div className="text-blue-200 text-sm">Villes couvertes</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Bon retour !
            </h1>
            <p className="text-gray-600">
              Connectez-vous à votre compte pour continuer
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <Suspense fallback={<div>Chargement...</div>}>
              <LoginFormWrapper />
            </Suspense>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-8">
            En vous connectant, vous acceptez nos{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
              Conditions d&apos;utilisation
            </a>{' '}
            et notre{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 underline">
              Politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}
