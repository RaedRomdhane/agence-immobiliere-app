'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Search, 
  Heart, 
  Bell, 
  Calendar,
  MessageSquare,
  User,
  TrendingUp,
  Clock,
  MapPin,
  Bed,
  Bath,
  Square,
  ArrowRight,
  Bookmark,
  Home as HomeIcon
} from 'lucide-react';

export default function DashboardHome() {
  const { user } = useAuth();

  // Données placeholder pour les biens récemment consultés
  const recentlyViewed = [
    { id: 1, title: 'Appartement Paris 16ème', price: '450 000 €', location: 'Paris 16ème', beds: 3, baths: 2, surface: 85, image: 'blue' },
    { id: 2, title: 'Maison Lyon 6ème', price: '580 000 €', location: 'Lyon 6ème', beds: 4, baths: 2, surface: 120, image: 'purple' },
    { id: 3, title: 'Villa Marseille 8ème', price: '1 200 000 €', location: 'Marseille 8ème', beds: 5, baths: 3, surface: 200, image: 'green' },
  ];

  // Données placeholder pour les recommandations
  const recommended = [
    { id: 4, title: 'Appartement moderne', price: '380 000 €', location: 'Nice Centre', beds: 2, baths: 1, surface: 75, image: 'orange', badge: 'Nouveau' },
    { id: 5, title: 'Duplex lumineux', price: '520 000 €', location: 'Bordeaux', beds: 3, baths: 2, surface: 110, image: 'pink', badge: 'Coup de cœur' },
    { id: 6, title: 'Loft design', price: '420 000 €', location: 'Toulouse', beds: 2, baths: 1, surface: 95, image: 'indigo', badge: 'Populaire' },
  ];

  const gradients = {
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    green: 'from-green-400 to-green-600',
    orange: 'from-orange-400 to-orange-600',
    pink: 'from-pink-400 to-pink-600',
    indigo: 'from-indigo-400 to-indigo-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-16">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Bienvenue, {user?.firstName || 'Utilisateur'} !
                </h1>
                <p className="text-blue-100 text-lg">
                  Découvrez les dernières opportunités immobilières
                </p>
              </div>
              <div className="mt-6 md:mt-0 flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span className="font-semibold">3 nouvelles notifications</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-8 -mt-8">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Rechercher un bien */}
              <Link href="/properties" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Rechercher un bien</h3>
                    <p className="text-gray-600 text-sm">Trouvez votre prochain bien idéal</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </Link>

              {/* Mes Favoris */}
              <Link href="/favorites" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start space-x-4">
                  <div className="bg-pink-100 p-3 rounded-lg group-hover:bg-pink-200 transition-colors">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Mes Favoris</h3>
                    <p className="text-gray-600 text-sm">12 biens sauvegardés</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-pink-600 transition-colors" />
                </div>
              </Link>

              {/* Recherches sauvegardées */}
              <Link href="/saved-searches" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Bookmark className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Recherches sauvegardées</h3>
                    <p className="text-gray-600 text-sm">5 alertes actives</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </Link>

              {/* Mes Rendez-vous */}
              <Link href="/appointments" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Mes Rendez-vous</h3>
                    <p className="text-gray-600 text-sm">2 visites planifiées</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
              </Link>

              {/* Messagerie */}
              <Link href="/messages" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <MessageSquare className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Messagerie</h3>
                    <p className="text-gray-600 text-sm">4 messages non lus</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                </div>
              </Link>

              {/* Mon Profil */}
              <Link href="/profile" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <User className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Mon Profil</h3>
                    <p className="text-gray-600 text-sm">Gérer mes informations</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Recently Viewed Properties */}
        <section className="py-12">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Récemment consultés</h2>
                <p className="text-gray-600">Les biens que vous avez vus dernièrement</p>
              </div>
              <Link href="/history" className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                <span>Voir tout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyViewed.map((property) => (
                <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`relative h-48 bg-gradient-to-br ${gradients[property.image as keyof typeof gradients]}`}>
                    <div className="absolute top-4 right-4">
                      <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                        <Clock className="h-5 w-5 text-gray-700" />
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{property.title}</h3>
                    <div className="flex items-center space-x-4 mb-4 text-gray-600">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.beds}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.baths}</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.surface} m²</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">{property.price}</span>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Revoir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recommended Properties */}
        <section className="py-12 bg-white">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Recommandés pour vous</h2>
                <p className="text-gray-600">Basés sur vos préférences et recherches</p>
              </div>
              <Link href="/properties" className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                <span>Voir plus</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommended.map((property) => (
                <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`relative h-48 bg-gradient-to-br ${gradients[property.image as keyof typeof gradients]}`}>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                        {property.badge}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                        <Heart className="h-5 w-5 text-gray-700" />
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{property.title}</h3>
                    <div className="flex items-center space-x-4 mb-4 text-gray-600">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.beds}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.baths}</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.surface} m²</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">{property.price}</span>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Voir plus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Votre activité</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">12</div>
                <div className="text-gray-600 text-sm">Favoris</div>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bookmark className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">5</div>
                <div className="text-gray-600 text-sm">Alertes actives</div>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">28</div>
                <div className="text-gray-600 text-sm">Biens vus</div>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">15</div>
                <div className="text-gray-600 text-sm">Contacts agents</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
