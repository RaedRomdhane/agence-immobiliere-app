import RegisterForm from '@/components/forms/RegisterForm';
import { Building2, Shield, Users, TrendingUp, Award, Headphones } from 'lucide-react';

export const metadata = {
  title: 'Inscription - Agence Immobilière',
  description: 'Créez votre compte pour accéder à nos services immobiliers',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Left Side - Branding & Features */}
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
              <p className="text-blue-100 text-sm">Votre partenaire de confiance pour acheter, vendre ou louer</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="relative z-10 space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="bg-orange-500/20 backdrop-blur-sm p-3 rounded-xl shrink-0">
                <Shield className="h-6 w-6 text-orange-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Sécurité garantie</h3>
                <p className="text-blue-100 text-sm">Cryptage bancaire et protection de vos données personnelles</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="bg-green-500/20 backdrop-blur-sm p-3 rounded-xl shrink-0">
                <TrendingUp className="h-6 w-6 text-green-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Trouvez rapidement</h3>
                <p className="text-blue-100 text-sm">Des milliers d'annonces actualisées quotidiennement</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="bg-purple-500/20 backdrop-blur-sm p-3 rounded-xl shrink-0">
                <Headphones className="h-6 w-6 text-purple-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Support 7j/7</h3>
                <p className="text-blue-100 text-sm">Une équipe dédiée pour vous accompagner à chaque étape</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats & Testimonial */}
        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-white">5000+</div>
              <div className="text-xs text-blue-100">Utilisateurs</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-white">15k+</div>
              <div className="text-xs text-blue-100">Annonces</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-white">4.9/5</div>
              <div className="text-xs text-blue-100">Satisfaction</div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <Award className="h-5 w-5 text-orange-300" />
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-orange-300">★</span>
                ))}
              </div>
            </div>
            <p className="text-white/95 text-base italic mb-3">
              "Interface intuitive, recherche rapide et service client réactif. J'ai trouvé mon appartement en moins d'une semaine !"
            </p>
            <p className="text-blue-100 text-sm font-medium">— Sarah M., Cliente satisfaite</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 lg:p-12">
        <div className="max-w-lg w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-2xl shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Form Card with enhanced shadow */}
          <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100/50 backdrop-blur-sm">
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                Créer un compte
              </h1>
              <p className="text-gray-600 text-base">
                Créez votre compte et trouvez le bien parfait en quelques clics
              </p>
            </div>
            
            <RegisterForm />

            {/* CTA secondaire */}
            <div className="mt-6">
              <a 
                href="/discover" 
                className="block text-center py-3 px-6 text-sm font-medium text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-blue-200"
              >
                Découvrir la plateforme sans créer de compte
              </a>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-center text-gray-500 leading-relaxed">
                En vous inscrivant, vous acceptez nos{' '}
                <a href="/terms" className="text-blue-600 hover:underline font-medium">
                  Conditions d&apos;utilisation
                </a>{' '}
                et notre{' '}
                <a href="/privacy" className="text-blue-600 hover:underline font-medium">
                  Politique de confidentialité
                </a>
              </p>
            </div>
          </div>

          {/* Trust Badges - Enhanced */}
          <div className="mt-8 flex items-center justify-center flex-wrap gap-6 text-gray-500">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium">Paiement sécurisé</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium">+5000 utilisateurs</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Award className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-medium">Note 4.9/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
