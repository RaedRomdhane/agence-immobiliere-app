'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Search, MapPin, Bed, Bath, Square, Heart } from 'lucide-react';

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Découvrez Nos Biens
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Parcourez notre sélection de propriétés disponibles à la vente et à la location
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Localisation"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option>Type de bien</option>
                  <option>Appartement</option>
                  <option>Maison</option>
                  <option>Villa</option>
                  <option>Studio</option>
                </select>
                <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option>Prix max</option>
                  <option>200 000 €</option>
                  <option>500 000 €</option>
                  <option>1 000 000 €</option>
                  <option>2 000 000 €</option>
                </select>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Rechercher</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Tous les biens disponibles
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">126 résultats</span>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Plus récent</option>
                  <option>Prix croissant</option>
                  <option>Prix décroissant</option>
                  <option>Surface croissante</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Property Card 1 */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative h-64 bg-gradient-to-br from-blue-400 to-blue-600">
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Nouveau
                    </span>
                  </div>
                  <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                    <Heart className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">Paris 16ème</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Appartement moderne
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Magnifique appartement rénové avec vue dégagée
                  </p>
                  <div className="flex items-center space-x-4 mb-4 text-gray-600">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span className="text-sm">3</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span className="text-sm">2</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span className="text-sm">85 m²</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">450 000 €</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Voir plus
                    </button>
                  </div>
                </div>
              </div>

              {/* Property Card 2 */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative h-64 bg-gradient-to-br from-purple-400 to-purple-600">
                  <div className="absolute top-4 left-4">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Populaire
                    </span>
                  </div>
                  <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                    <Heart className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">Lyon 6ème</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Maison familiale
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Charmante maison avec jardin et garage
                  </p>
                  <div className="flex items-center space-x-4 mb-4 text-gray-600">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span className="text-sm">4</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span className="text-sm">2</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span className="text-sm">120 m²</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">580 000 €</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Voir plus
                    </button>
                  </div>
                </div>
              </div>

              {/* Property Card 3 */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative h-64 bg-gradient-to-br from-green-400 to-green-600">
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Exclusif
                    </span>
                  </div>
                  <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                    <Heart className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">Marseille 8ème</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Villa de luxe
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Villa d&apos;exception avec piscine et vue mer
                  </p>
                  <div className="flex items-center space-x-4 mb-4 text-gray-600">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span className="text-sm">5</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span className="text-sm">3</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span className="text-sm">200 m²</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">1 200 000 €</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Voir plus
                    </button>
                  </div>
                </div>
              </div>

              {/* Add more property cards... */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative h-64 bg-gradient-to-br from-pink-400 to-pink-600">
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Nouveau
                    </span>
                  </div>
                  <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                    <Heart className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">Nice Centre</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Studio refait à neuf
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Studio moderne proche de toutes commodités
                  </p>
                  <div className="flex items-center space-x-4 mb-4 text-gray-600">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span className="text-sm">1</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span className="text-sm">1</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span className="text-sm">35 m²</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">220 000 €</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Voir plus
                    </button>
                  </div>
                </div>
              </div>

              {/* Property Card 5 */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative h-64 bg-gradient-to-br from-yellow-400 to-orange-600">
                  <div className="absolute top-4 left-4">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Prix réduit
                    </span>
                  </div>
                  <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                    <Heart className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">Toulouse Capitole</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Loft design
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Loft atypique avec double hauteur
                  </p>
                  <div className="flex items-center space-x-4 mb-4 text-gray-600">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span className="text-sm">2</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span className="text-sm">1</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span className="text-sm">95 m²</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">380 000 €</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Voir plus
                    </button>
                  </div>
                </div>
              </div>

              {/* Property Card 6 */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative h-64 bg-gradient-to-br from-indigo-400 to-indigo-600">
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Coup de cœur
                    </span>
                  </div>
                  <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                    <Heart className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">Bordeaux Centre</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Duplex lumineux
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Duplex avec terrasse et parking
                  </p>
                  <div className="flex items-center space-x-4 mb-4 text-gray-600">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span className="text-sm">3</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span className="text-sm">2</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span className="text-sm">110 m²</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">520 000 €</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Voir plus
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-2 mt-12">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Précédent
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">2</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">3</button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Suivant
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
