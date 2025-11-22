'use client';

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { getProperties, Property } from '@/lib/api/properties';
import { Plus, Building2, MapPin, Euro, History as HistoryIcon } from 'lucide-react';
import Link from 'next/link';
import PhotoModal from '@/components/admin/PhotoModal';
import PropertyHistoryModal from '@/components/admin/PropertyHistoryModal';
import axios from 'axios';

  // Duplicate function removed


export default function PropertiesPage() {
    // State for property history modal
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [propertyHistory, setPropertyHistory] = useState<any[]>([]);
    const [historyPropertyId, setHistoryPropertyId] = useState<string | null>(null);

    // Fetch property history
    const openHistoryModal = async (propertyId: string) => {
      setHistoryOpen(true);
      setHistoryLoading(true);
      setPropertyHistory([]);
      setHistoryPropertyId(propertyId);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/properties/${propertyId}/history`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        setPropertyHistory(res.data.data || []);
      } catch (err) {
        setPropertyHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    const closeHistoryModal = () => {
      setHistoryOpen(false);
      setPropertyHistory([]);
      setHistoryPropertyId(null);
    };
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Vérification de l'authentification
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Chargement des biens + écoute temps réel
  useEffect(() => {
    let socket: Socket | null = null;
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
      // Setup Socket.IO client
      socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '', {
        transports: ['websocket'],
      });
      socket.on('propertyUpdated', (event) => {
        // Optionally: check if the updated property is in the current list
        fetchProperties();
      });
    }
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user]);

  // Fonctions pour le modal
  const openPhotoModal = (property: Property, photoIndex: number = 0) => {
    setSelectedProperty(property);
    setCurrentPhotoIndex(photoIndex);
  };

  const closePhotoModal = () => {
    setSelectedProperty(null);
    setCurrentPhotoIndex(0);
  };

  const goToPhoto = (index: number) => {
    setCurrentPhotoIndex(index);
  };

  const nextPhoto = () => {
    if (selectedProperty && selectedProperty.photos) {
      setCurrentPhotoIndex((prev) =>
        prev === selectedProperty.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const previousPhoto = () => {
    if (selectedProperty && selectedProperty.photos) {
      setCurrentPhotoIndex((prev) =>
        prev === 0 ? selectedProperty.photos.length - 1 : prev - 1
      );
    }
  };

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
          {/* Retour button */}
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-900 transition-colors shadow border border-gray-300"
            >
              <span className="text-lg">←</span> Retour à l'accueil admin
            </Link>
          </div>
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
                <div 
                  className="relative h-48 bg-gray-200 cursor-pointer overflow-hidden group"
                  onClick={() => openPhotoModal(property, 0)}
                >
                  {property.photos?.[0] ? (
                    <>
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${property.photos[0].url}`}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onLoad={() => {
                          console.log('✅ Image chargée:', property.photos[0].url);
                        }}
                        onError={(e) => {
                          const url = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${property.photos[0].url}`;
                          console.error('❌ Erreur chargement image:', url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {/* Badge nombre de photos */}
                      {property.photos.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium z-10">
                          📸 {property.photos.length}
                        </div>
                      )}
                    </>
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
                      href={`/properties/${property._id}`}
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
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 text-center border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                      onClick={() => openHistoryModal(property._id)}
                      title="Voir l'historique des modifications"
                    >
                      <HistoryIcon className="w-4 h-4" />
                      Historique
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal pour voir les photos en grand */}
      {selectedProperty && selectedProperty.photos && selectedProperty.photos.length > 0 && (
        <PhotoModal
          photos={selectedProperty.photos}
          currentIndex={currentPhotoIndex}
          onClose={closePhotoModal}
          onNext={nextPhoto}
          onPrevious={previousPhoto}
          onGoToPhoto={goToPhoto}
          propertyTitle={selectedProperty.title}
        />
      )}

      {/* Modal pour voir l'historique des modifications */}
      <PropertyHistoryModal
        open={historyOpen}
        onClose={closeHistoryModal}
        history={propertyHistory}
        loading={historyLoading}
        RetourButton={
          <button
            onClick={closeHistoryModal}
            className="mt-6 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-900 transition-colors shadow-md border border-gray-300"
          >
            ← Retour à la liste
          </button>
        }
        modalClassName="max-w-2xl w-full p-8 rounded-2xl shadow-2xl border border-gray-200 bg-white"
        headerClassName="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2"
        contentClassName="min-h-[120px] text-gray-700 text-base"
        emptyStateClassName="text-gray-500 text-center py-8 text-lg"
      />
    </div>
  );
}
