import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';
import { Building2, ShieldCheck, Lock } from 'lucide-react';

export const metadata = {
  title: 'Mot de passe oublié - Agence Immobilière',
  description: 'Réinitialisez votre mot de passe en toute sécurité',
};

export default function ForgotPasswordPage() {
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
              <p className="text-blue-100 text-sm">Récupération de compte sécurisée</p>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="relative z-10 space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/20 backdrop-blur-sm p-3 rounded-xl shrink-0">
                <ShieldCheck className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Processus sécurisé</h3>
                <p className="text-blue-100 text-sm">
                  Le lien de réinitialisation est chiffré et expire après 1 heure pour votre sécurité
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-500/20 backdrop-blur-sm p-3 rounded-xl shrink-0">
                <Lock className="h-6 w-6 text-purple-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Données protégées</h3>
                <p className="text-blue-100 text-sm">
                  Vos informations personnelles restent confidentielles et ne seront jamais partagées
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h4 className="text-white font-semibold mb-3">💡 Conseils de sécurité</h4>
            <ul className="space-y-2 text-blue-100 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Utilisez un mot de passe unique et complexe</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Ne partagez jamais vos identifiants</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Vérifiez l&apos;expéditeur de l&apos;email</span>
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
              Mot de passe oublié ?
            </h1>
            <p className="text-gray-600">
              Pas de souci, nous allons vous aider à le récupérer
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <ForgotPasswordForm />
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Vous vous souvenez de votre mot de passe ?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 underline font-medium">
              Retour à la connexion
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
