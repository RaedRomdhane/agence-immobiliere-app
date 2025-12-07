'use client';

import Link from 'next/link';
import { useAuth } from "@/components/auth/AuthProvider";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalReviews: 0,
    cities: 0
  });

  // Fetch popular properties and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        
        // Fetch properties
        const propsRes = await fetch(`${apiUrl}/properties?limit=3&sort=-createdAt&status=disponible`);
        const propsData = await propsRes.json();
        setProperties(propsData.data || []);
        
        // Fetch all properties for total count
        const allPropsRes = await fetch(`${apiUrl}/properties`);
        const allPropsData = await allPropsRes.json();
        const totalProperties = allPropsData.data?.length || 0;
        
        // Calculate unique cities
        const cities = new Set(
          (allPropsData.data || []).map((p: any) => p.city || p.location?.city).filter(Boolean)
        );
        
        // Fetch reviews stats
        const reviewsRes = await fetch(`${apiUrl}/reviews`);
        const reviewsData = await reviewsRes.json();
        const totalReviews = reviewsData.stats?.totalReviews || 0;
        
        setStats({
          totalProperties,
          totalReviews,
          cities: cities.size
        });
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Vérifier si l'utilisateur vient de s'inscrire
    const registered = searchParams?.get('registered');
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
          <Header />
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
          <Footer />
        </>
      );
    }
    
    // Sinon, afficher le dashboard client
    return (
      <>
        <Header />
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
        <Footer />
      </>
    );
  }

  // Sinon, afficher la landing page pour les visiteurs
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-16">{/* Padding for fixed header */}
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Trouvez le bien immobilier
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  de vos rêves
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Des milliers de biens disponibles à la vente et à la location. 
                Trouvez votre futur chez-vous en quelques clics.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/register"
                  className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Commencer maintenant
                </Link>
                <Link
                  href="/properties"
                  className="px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-all shadow-md hover:shadow-lg"
                >
                  Explorer les biens
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-gray-200">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-blue-600">{stats.totalProperties}+</div>
                  <div className="text-sm md:text-base text-gray-600 mt-1">Biens disponibles</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-blue-600">{stats.totalReviews}+</div>
                  <div className="text-sm md:text-base text-gray-600 mt-1">Clients satisfaits</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-blue-600">{stats.cities}+</div>
                  <div className="text-sm md:text-base text-gray-600 mt-1">Villes couvertes</div>
                </div>
              </div>
            </div>
          </div>
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
              {loadingProperties ? (
                // Loading skeletons
                [1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                    <div className="h-64 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="flex justify-between mb-4">
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))
              ) : properties.length > 0 ? (
                properties.map((property, index) => {
                  const badges = ['Nouveau', 'Populaire', 'Exclusif'];
                  const badgeColors = ['blue', 'purple', 'green'];
                  const gradients = [
                    'from-blue-200 to-indigo-300',
                    'from-purple-200 to-pink-300',
                    'from-green-200 to-emerald-300'
                  ];
                  
                  // Debug: log property photos
                  console.log('Property photos:', property.photos);
                  
                  return (
                    <div key={property._id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2">
                      <div className={`relative h-64 bg-gradient-to-br ${gradients[index % 3]}`}>
                        {property.photos && property.photos.length > 0 && (() => {
                          const photo = property.photos[0];
                          const photoUrl = typeof photo === 'string' ? photo : photo?.url;
                          if (!photoUrl) return null;
                          
                          const fullUrl = photoUrl.startsWith('http') 
                            ? photoUrl 
                            : `http://localhost:5000${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
                          
                          return (
                            <img 
                              src={fullUrl}
                              alt={property.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.log('Image load failed:', fullUrl);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          );
                        })()}
                        <div className={`absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-${badgeColors[index % 3]}-600`}>
                          {badges[index % 3]}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.city || property.location?.city || 'Non spécifié'}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {property.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {property.description}
                        </p>
                        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            {property.bedrooms || 0} ch
                          </div>
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            {property.bathrooms || 0} sdb
                          </div>
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-1" />
                            {property.surface || 0} m²
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-600">
                            {property.price?.toLocaleString('fr-FR') || 0} TND
                          </span>
                          <Link 
                            href={`/properties/${property._id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                          >
                            Voir plus
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-600">Aucun bien disponible pour le moment.</p>
                </div>
              )}
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

      <Footer />
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
