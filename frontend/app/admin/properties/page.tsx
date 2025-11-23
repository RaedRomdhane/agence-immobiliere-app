'use client';

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { getProperties, Property, archiveProperty, deleteProperty } from '@/lib/api/properties';
import { Plus, Building2, MapPin, Euro, History as HistoryIcon, Eye, Pencil, Archive as ArchiveIcon, Trash2 as TrashIcon } from 'lucide-react';
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

  // Archive/Delete modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<'archive' | 'delete' | null>(null);
  const [confirmProperty, setConfirmProperty] = useState<Property | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

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

  // Archive property handler
  const handleArchive = (property: Property) => {
    setConfirmType('archive');
    setConfirmProperty(property);
    setConfirmOpen(true);
  };

  // Delete property handler
  const handleDelete = (property: Property) => {
    setConfirmType('delete');
    setConfirmProperty(property);
    setConfirmOpen(true);
  };

  // Confirm action
  const confirmAction = async () => {
    if (!confirmProperty || !confirmType) return;
    setActionLoading(true);
    setActionError('');
    try {
      const token = localStorage.getItem('token') || '';
      if (confirmType === 'archive') {
        await archiveProperty(confirmProperty._id, token);
      } else {
        await deleteProperty(confirmProperty._id, token);
      }
      setConfirmOpen(false);
      setConfirmProperty(null);
      setConfirmType(null);
      // Refresh list
      const response = await getProperties({ status: 'disponible', limit: 100 });
      setProperties(response.data);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Erreur lors de l’action');
    } finally {
      setActionLoading(false);
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
                      className="flex-1 px-3 py-2 text-center border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                      title="Voir"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link
                      href={`/admin/properties/${property._id}/edit`}
                      className="flex-1 px-3 py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      title="Modifier"
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>
                    <button
                      type="button"
                      className="flex-1 px-3 py-2 text-center border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
                      onClick={() => openHistoryModal(property._id)}
                      title="Historique"
                    >
                      <HistoryIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className="flex-1 px-3 py-2 text-center border border-yellow-500 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors flex items-center justify-center"
                      onClick={() => handleArchive(property)}
                      title="Archiver"
                    >
                      <ArchiveIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className="flex-1 px-3 py-2 text-center border border-red-500 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                      onClick={() => handleDelete(property)}
                      title="Supprimer"
                    >
                      <TrashIcon className="w-5 h-5" />
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

      {/* Confirmation Modal */}
      {confirmOpen && confirmProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.08)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative animate-fade-in">
            {/* Close Icon */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              onClick={() => setConfirmOpen(false)}
              aria-label="Fermer"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">
              {confirmType === 'archive' ? 'Archiver ce bien ?' : 'Supprimer définitivement ce bien ?'}
            </h2>
            <p className="mb-6 text-gray-700 text-base">
              {confirmType === 'archive'
                ? 'Le bien sera archivé et ne sera plus visible dans les recherches. Vous pourrez le restaurer plus tard.'
                : 'Cette action est irréversible. Le bien sera supprimé définitivement.'}
            </p>
            {actionError && <div className="text-red-600 mb-2">{actionError}</div>}
            <div className="flex gap-4 justify-end mt-4">
              <button
                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium shadow-sm border border-gray-300 transition-colors"
                onClick={() => setConfirmOpen(false)}
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                className={`px-5 py-2 rounded-lg text-white font-medium shadow-sm border-0 transition-colors ${confirmType === 'archive' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'}`}
                onClick={confirmAction}
                disabled={actionLoading}
              >
                {actionLoading ? 'En cours...' : confirmType === 'archive' ? 'Archiver' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
