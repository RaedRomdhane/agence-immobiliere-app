'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { getProperties, Property } from '@/lib/api/properties';
import { Plus, Building2, MapPin, Euro } from 'lucide-react';
import Link from 'next/link';

export default function PropertiesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Vérification de l'authentification
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Chargement des biens
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        const response = await getProperties({ status: 'disponible', limit: 100 });
        setProperties(response.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchProperties();
    }
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des biens</h1>
            <p className="mt-2 text-gray-600">
              {properties.length} bien{properties.length > 1 ? 's' : ''} immobilier{properties.length > 1 ? 's' : ''}
            </p>
          </div>

          <Link
            href="/admin/properties/new"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter un bien
          </Link>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Liste des biens */}
        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun bien immobilier
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter votre premier bien immobilier.
            </p>
            <Link
              href="/admin/properties/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Ajouter un bien
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 bg-white">
                  {property.photos?.[0] ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${property.photos[0].url}`}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      style={{ display: 'block', backgroundColor: 'white' }}
                      onLoad={() => {
                        console.log('✅ Image chargée:', property.photos[0].url);
                      }}
                      onError={(e) => {
                        const url = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${property.photos[0].url}`;
                        console.error('❌ Erreur chargement image:', url);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {/* Badge type */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                    {property.transactionType === 'vente' ? 'À vendre' : 'À louer'}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location.city}, {property.location.region}</span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {property.price.toLocaleString()} TND
                    </span>
                    {property.surface && (
                      <span className="text-sm text-gray-500">
                        • {property.surface} m²
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 text-sm text-gray-600 mb-4">
                    {property.bedrooms ? (
                      <span>{property.bedrooms} ch.</span>
                    ) : null}
                    {property.bathrooms ? (
                      <span>• {property.bathrooms} sdb.</span>
                    ) : null}
                    {property.rooms ? (
                      <span>• {property.rooms} pièces</span>
                    ) : null}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/properties/${property._id}`}
                      className="flex-1 px-4 py-2 text-center border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Voir
                    </Link>
                    <Link
                      href={`/admin/properties/${property._id}/edit`}
                      className="flex-1 px-4 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Modifier
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
