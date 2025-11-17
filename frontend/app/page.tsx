'use client';

import Link from 'next/link';
import { useAuth } from "@/components/auth/AuthProvider";
import DashboardHome from '@/components/dashboard/DashboardHome';
import AdminDashboard from '@/components/admin/AdminDashboard';
import Alert from '@/components/ui/Alert';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Search, 
  Heart, 
  Bell, 
  TrendingUp, 
  Shield, 
  Users, 
  Clock, 
  Star,
  MapPin,
  Bed,
  Bath,
  Square,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

// Composant qui utilise useSearchParams (doit être wrappé dans Suspense)
function HomeContent() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur vient de s'inscrire
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      setShowSuccessToast(true);
      
      // Nettoyer l'URL après 100ms
      setTimeout(() => {
        router.replace('/', { scroll: false });
      }, 100);

      // Masquer le toast après 5 secondes
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
    }
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, afficher le dashboard personnalisé
  if (isAuthenticated) {
    // Si l'utilisateur est admin, afficher le dashboard admin
    if (user?.role === 'admin') {
      return (
        <>
          {/* <Header /> removed, now in layout */}
          {/* Success Toast - Position fixe en haut à droite */}
          {showSuccessToast && (
            <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-right duration-300">
              <Alert type="success" className="shadow-lg">
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Bienvenue {user?.firstName} !</p>
                    <p className="text-sm">Votre compte a été créé avec succès.</p>
                  </div>
                </div>
              </Alert>
            </div>
          )}
          <AdminDashboard />
          {/* <Footer /> removed, now in layout */}
        </>
      );
    }
    
    // Sinon, afficher le dashboard client
    return (
      <>
        {/* <Header /> removed, now in layout */}
        {/* Success Toast - Position fixe en haut à droite */}
        {showSuccessToast && (
          <div className="fixed top-20 right-4 z-50 max-w-md animate-in slide-in-from-right duration-300">
            <Alert type="success" className="shadow-lg">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Bienvenue {user?.firstName} !</p>
                  <p className="text-sm">Votre compte a été créé avec succès.</p>
                </div>
              </div>
            </Alert>
          </div>
        )}
        <DashboardHome />
        {/* <Footer /> removed, now in layout */}
      </>
    );
  }

  // Sinon, afficher la landing page pour les visiteurs
  return (
    <div className="min-h-screen bg-white">
      <main className="pt-16">{/* Padding for fixed header */}
        {/* Hero Section (logo removed as requested) */}
        <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
          {/* ...existing code... */}
        </section>
        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Fonctionnalités principales
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Des outils puissants pour vous aider à trouver le bien parfait
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Recherche avancée
                </h3>
                <p className="text-gray-600">
                  Filtres personnalisés pour trouver exactement ce que vous cherchez
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Favoris
                </h3>
                <p className="text-gray-600">
                  Sauvegardez vos biens préférés et comparez-les facilement
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Alertes personnalisées
                </h3>
                <p className="text-gray-600">
                  Soyez notifié des nouvelles offres correspondant à vos critères
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl hover:shadow-xl transition-all transform hover:-translate-y-2">
                <div className="bg-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Analyses de marché
                </h3>
                <p className="text-gray-600">
                  Données et statistiques pour prendre les meilleures décisions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Properties Preview Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Biens populaires
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Découvrez une sélection de nos biens les plus recherchés
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* Property Card 1 */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className="relative h-64 bg-gradient-to-br from-blue-200 to-indigo-300">
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-600">
                    Nouveau
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    Paris 16ème
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Appartement moderne
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Magnifique appartement de 85m² avec vue dégagée
                  </p>
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      3 ch
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      2 sdb
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      85 m²
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">450 000 €</span>
                    <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                      Voir plus
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Property Card 2 */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className="relative h-64 bg-gradient-to-br from-purple-200 to-pink-300">
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-purple-600">
                    Populaire
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    Lyon 6ème
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Maison familiale
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Belle maison avec jardin, idéale pour famille
                  </p>
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      4 ch
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      2 sdb
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      120 m²
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">580 000 €</span>
                    <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                      Voir plus
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Property Card 3 */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className="relative h-64 bg-gradient-to-br from-green-200 to-emerald-300">
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-green-600">
                    Exclusif
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    Marseille 8ème
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Villa de luxe
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Villa d'exception avec piscine et vue mer
                  </p>
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      5 ch
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      3 sdb
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      200 m²
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">1 200 000 €</span>
                    <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                      Voir plus
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/properties"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
              >
                Voir tous les biens
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Pourquoi nous choisir ?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Nous nous engageons à vous offrir la meilleure expérience immobilière
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Reason 1 */}
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Sécurité garantie
                </h3>
                <p className="text-gray-600">
                  Transactions sécurisées et vérification de tous les biens
                </p>
              </div>

              {/* Reason 2 */}
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Réactivité 24/7
                </h3>
                <p className="text-gray-600">
                  Support client disponible à tout moment pour vous aider
                </p>
              </div>

              {/* Reason 3 */}
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Accompagnement personnalisé
                </h3>
                <p className="text-gray-600">
                  Des experts à votre écoute pour vous guider
                </p>
              </div>

              {/* Reason 4 */}
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Satisfaction client
                </h3>
                <p className="text-gray-600">
                  95% de nos clients recommandent nos services
                </p>
              </div>
            </div>

            {/* CTA Banner */}
            <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
              <h3 className="text-3xl font-bold mb-4">
                Prêt à trouver votre prochain bien ?
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Rejoignez des milliers d'utilisateurs satisfaits dès aujourd'hui
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-100 transition-all shadow-lg"
                >
                  Créer un compte gratuit
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-blue-600 transition-all"
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}

// Wrapper principal avec Suspense pour Next.js 16
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
