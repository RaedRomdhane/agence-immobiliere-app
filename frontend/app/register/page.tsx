'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import RegisterForm from '@/components/forms/RegisterForm';
import Header from '@/components/layout/Header';
import { Building2, Shield, Users, TrendingUp, Award, Headphones, X } from 'lucide-react';

function RegisterContent() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalReviews: 0,
    cities: 0
  });
  const [testimonial, setTestimonial] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        // Fetch all properties
        const propsRes = await fetch(`${apiUrl}/properties`);
        const propsData = await propsRes.json();
        const totalProperties = propsData.data?.length || 0;
        
        // Calculate unique cities
        const cities = new Set(
          (propsData.data || []).map((p: any) => p.city || p.location?.city).filter(Boolean)
        );
        
        // Fetch reviews stats and get a random review
        const reviewsRes = await fetch(`${apiUrl}/reviews`);
        const reviewsData = await reviewsRes.json();
        const totalReviews = reviewsData.stats?.totalReviews || 0;
        
        // Get a random review with rating 5
        const topReviews = reviewsData.data?.filter((r: any) => r.rating === 5) || [];
        if (topReviews.length > 0) {
          const randomReview = topReviews[Math.floor(Math.random() * topReviews.length)];
          setTestimonial(randomReview);
        }
        
        setStats({
          totalProperties,
          totalReviews,
          cities: cities.size
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const error = searchParams?.get('error');
    if (error) {
      setErrorMessage(decodeURIComponent(error));
      
      // Effacer l'erreur de l'URL après 5 secondes
      const timer = setTimeout(() => {
        setErrorMessage(null);
        window.history.replaceState({}, '', '/register');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <div className="min-h-screen flex pt-16">{/* pt-16 for fixed header spacing */}
      {/* Error Notification */}
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-5 duration-300">
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <X className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 mb-1">
                Erreur d&apos;inscription
              </h3>
              <p className="text-sm text-red-700">
                {errorMessage}
              </p>
            </div>
            <button
              onClick={() => {
                setErrorMessage(null);
                window.history.replaceState({}, '', '/register');
              }}
              className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

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
              <div className="text-2xl font-bold text-white">{stats.totalReviews}+</div>
              <div className="text-xs text-blue-100">Utilisateurs</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{stats.totalProperties}+</div>
              <div className="text-xs text-blue-100">Annonces</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{stats.cities}+</div>
              <div className="text-xs text-blue-100">Villes</div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-3 mb-3">
              <Award className="h-5 w-5 text-orange-300" />
              <div className="flex space-x-1">
                {[...Array(testimonial?.rating || 5)].map((_, i) => (
                  <span key={i} className="text-orange-300">★</span>
                ))}
              </div>
            </div>
            {testimonial ? (
              <>
                <p className="text-white/95 text-base italic mb-3">
                  "{testimonial.comment}"
                </p>
                <p className="text-blue-100 text-sm font-medium">
                  — {testimonial.user?.firstName || 'Client'} {testimonial.user?.lastName || ''}, Client satisfait
                </p>
              </>
            ) : (
              <>
                <p className="text-white/95 text-base italic mb-3">
                  "Interface intuitive, recherche rapide et service client réactif. J'ai trouvé mon appartement en moins d'une semaine !"
                </p>
                <p className="text-blue-100 text-sm font-medium">— Sarah M., Cliente satisfaite</p>
              </>
            )}
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

            {/* CTA secondaire
            <div className="mt-6">
              <a 
                href="/discover" 
                className="block text-center py-3 px-6 text-sm font-medium text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-blue-200"
              >
                Découvrir la plateforme sans créer de compte
              </a>
            </div> */}
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-center text-gray-500 leading-relaxed">
                En vous inscrivant, vous acceptez nos{' '}
                <a href="/legal/terms" className="text-blue-600 hover:underline font-medium">
                  Conditions d&apos;utilisation
                </a>{' '}
                et notre{' '}
                <a href="/legal/privacy" className="text-blue-600 hover:underline font-medium">
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
              <span className="text-xs font-medium">+{stats.totalReviews} utilisateurs</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Building2 className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-medium">{stats.totalProperties} biens</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
