'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Shield, Users, Award, TrendingUp, Heart, Clock } from 'lucide-react';
import apiClient from '@/lib/api/client';

export default function AboutPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    cities: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total properties
      const propsRes = await apiClient.get('/properties');
      const properties = propsRes.data.data || [];
      const totalProperties = properties.length;

      // Calculate unique cities
      const cities = new Set(
        properties.map((p: any) => p.address?.city).filter(Boolean)
      );

      // Fetch reviews stats
      const reviewsRes = await apiClient.get('/reviews');
      const averageRating = reviewsRes.data.stats?.averageRating || 0;
      const totalReviews = reviewsRes.data.stats?.totalReviews || 0;

      setStats({
        totalUsers: totalReviews, // Nombre d'avis comme proxy pour clients satisfaits
        totalProperties,
        cities: cities.size,
        averageRating
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default values on error
      setStats({
        totalUsers: 0,
        totalProperties: 0,
        cities: 0,
        averageRating: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                À Propos d&apos;ImmoExpress
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Votre partenaire de confiance pour toutes vos transactions immobilières depuis 2020
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Mission</h2>
                <p className="text-gray-600 text-lg mb-4">
                  Chez ImmoExpress, nous croyons que trouver le bien immobilier parfait devrait être simple, 
                  rapide et transparent. Notre plateforme digitale révolutionne l&apos;expérience immobilière 
                  en combinant technologie de pointe et service personnalisé.
                </p>
                <p className="text-gray-600 text-lg mb-4">
                  Nous mettons en relation acheteurs, vendeurs et locataires à travers une interface 
                  intuitive qui simplifie chaque étape du processus immobilier.
                </p>
                <p className="text-gray-600 text-lg">
                  Notre engagement : vous accompagner avec professionnalisme et transparence dans la 
                  réalisation de votre projet immobilier.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {loading ? '...' : `${stats.totalUsers}+`}
                    </div>
                    <div className="text-gray-600">Clients satisfaits</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {loading ? '...' : `${stats.totalProperties}+`}
                    </div>
                    <div className="text-gray-600">Biens disponibles</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {loading ? '...' : `${stats.cities}+`}
                    </div>
                    <div className="text-gray-600">Villes couvertes</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {loading ? '...' : stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)}/5` : 'N/A'}
                    </div>
                    <div className="text-gray-600">Note moyenne</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Valeurs</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Les principes qui guident notre action au quotidien
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Confiance</h3>
                <p className="text-gray-600">
                  La transparence et l&apos;honnêteté sont au cœur de toutes nos interactions. 
                  Nous construisons des relations durables basées sur la confiance mutuelle.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Réactivité</h3>
                <p className="text-gray-600">
                  Disponibles 24/7, nous répondons rapidement à toutes vos questions et 
                  vous accompagnons à chaque étape de votre projet.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Accompagnement</h3>
                <p className="text-gray-600">
                  Chaque client bénéficie d&apos;un accompagnement personnalisé adapté à 
                  ses besoins spécifiques et à son budget.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
                <p className="text-gray-600">
                  Nous utilisons les dernières technologies pour vous offrir la meilleure 
                  expérience immobilière digitale.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Heart className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Passion</h3>
                <p className="text-gray-600">
                  Notre équipe partage une vraie passion pour l&apos;immobilier et 
                  l&apos;envie d&apos;aider nos clients à réaliser leurs rêves.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
                <p className="text-gray-600">
                  Nous visons l&apos;excellence dans tout ce que nous faisons, de la 
                  sélection des biens au service client.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Only show if user is not logged in */}
        {!user && (
          <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Prêt à démarrer votre projet immobilier ?
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Rejoignez des milliers de clients satisfaits et trouvez le bien de vos rêves
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/register"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Créer un compte gratuit
                </a>
                <a
                  href="/contact"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Nous contacter
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
