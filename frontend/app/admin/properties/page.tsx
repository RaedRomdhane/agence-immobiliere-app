'use client';

import React, { useEffect, useState, useRef } from 'react';
import AdminPropertiesMapSection from './AdminPropertiesMapSection';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import { getProperties, Property, archiveProperty, deleteProperty } from '@/lib/api/properties';
import { Plus, Building2, MapPin, Euro, History as HistoryIcon, Eye, Pencil, Archive as ArchiveIcon, Trash2 as TrashIcon } from 'lucide-react';
import Link from 'next/link';
import PhotoModal from '@/components/admin/PhotoModal';
import PropertyHistoryModal from '@/components/admin/PropertyHistoryModal';
import axios from 'axios';
export default function PropertiesPage() {
  // Success message state (for redirect after edit)
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  useEffect(() => {
    // Check for ?success=1 or ?success=2 in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const successType = params.get('success');
      if (successType === '1' || successType === '2') {
        setShowSuccess(true);
        setSuccessMessage(successType === '1' ? 'Bien modifié avec succès !' : 'Bien ajouté avec succès !');
        // Remove the query param from the URL after showing
        window.history.replaceState({}, document.title, window.location.pathname);
        // Hide the toast after 2 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      }
    }
  }, []);
  // Photo modal state and handlers
  // Status filter state
  const [statusFilter, setStatusFilter] = useState<string>('');
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const filters: any = { limit: 100 };
        if (statusFilter) filters.status = statusFilter;
        const token = localStorage.getItem('token') || undefined;
        const response = await getProperties(filters, token);
        setProperties(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des biens');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [statusFilter]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectingPropertyId, setSelectingPropertyId] = useState<string | null>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);

const handleSelectLocation = async (lat: number, lng: number) => {
  // Recenter the map to the selected location (emit event via window for PropertiesMap to catch)
  window.dispatchEvent(new CustomEvent('admin-property-map-recenter', { detail: { lat, lng } }));
  if (!selectingPropertyId) return;
  const property = properties.find((p) => p._id === selectingPropertyId);
  if (!property) return;
  // Optimistically update UI
  setProperties(prev => prev.map(p =>
    p._id === property._id
      ? {
          ...p,
          onMap: true,
          location: {
            ...p.location,
            coordinates: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      : p
  ));
  setSelectingPropertyId(null);
  const token = localStorage.getItem('token') || undefined;
  try {
    await import('@/lib/api/properties').then(({ updateProperty }) =>
      updateProperty(
        property._id,
        {
          ...property,
          onMap: true,
          location: {
            ...property.location,
            coordinates: {
              latitude: lat,
              longitude: lng
            }
          },
          existingPhotos: property.photos
        },
        token as string
      )
    );
    // Refresh properties with current filter
    const filters: any = { limit: 100 };
    if (statusFilter) filters.status = statusFilter;
    const response = await getProperties(filters, token);
    setProperties(response.data);
  } catch (err) {
    console.error('Error updating property on map:', err);
    setError('Erreur lors de la mise à jour de la carte');
  }
};
  const openPhotoModal = (property: Property, index: number) => {
    setSelectedProperty(property);
    setCurrentPhotoIndex(index);
  };
  const closePhotoModal = () => {
    setSelectedProperty(null);
    setCurrentPhotoIndex(0);
  };
  const nextPhoto = () => {
    if (selectedProperty && selectedProperty.photos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % selectedProperty.photos.length);
    }
  };
  const previousPhoto = () => {
    if (selectedProperty && selectedProperty.photos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + selectedProperty.photos.length) % selectedProperty.photos.length);
    }
  };
  const goToPhoto = (idx: number) => {
    setCurrentPhotoIndex(idx);
  };

  // Property history modal state and handlers
  const [historyOpen, setHistoryOpen] = useState(false);
  const [propertyHistory, setPropertyHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const openHistoryModal = async (propertyId: string) => {
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/properties/${propertyId}/history`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setPropertyHistory(data.data || []); // Use data.data as returned by backend
    } catch (err) {
      setPropertyHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };
  const closeHistoryModal = () => {
    setHistoryOpen(false);
    setPropertyHistory([]);
  };


  // CSV Import modal state
  const [importOpen, setImportOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Export filters
  const [exportFilters, setExportFilters] = useState({ type: '', transactionType: '', status: '', city: '' });

  // Download CSV template
  const handleDownloadTemplate = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/properties/csv-template`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_biens.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Open import modal
  const openImportModal = () => {
    setImportOpen(true);
    setImportResult(null);
  };
  const closeImportModal = () => {
    setImportOpen(false);
    setImportResult(null);
    setImportLoading(false);
  };

  // Handle CSV import
  const handleImportCsv = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0]) return;
    setImportLoading(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/properties/import-csv`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      } as any);
      const data = await res.json();
      setImportResult(data);
      if (data.success) {
        // Refresh list with current filter
        const filters: any = { limit: 100 };
        if (statusFilter) filters.status = statusFilter;
        const response = await getProperties(filters, token || undefined);
        setProperties(response.data);
      }
    } catch (err) {
      setImportResult({ success: false, message: 'Erreur import CSV' });
    } finally {
      setImportLoading(false);
    }
  };

  // Export CSV with filters
  const handleExportCsv = async () => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    Object.entries(exportFilters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const res = await fetch(`${API_URL}/properties/export-csv?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export_biens.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [confirmType, setConfirmType] = useState<string | null>(null);
  const [confirmProperty, setConfirmProperty] = useState<Property | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isUnarchive, setIsUnarchive] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Add any other state used in the render/handlers as needed


  // Archive property handler
  const handleArchive = (property: Property) => {
    setConfirmType('archive');
    setConfirmProperty(property);
    setIsUnarchive(property.status === 'archive');
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
      setIsUnarchive(false);
      // Refresh list: fetch all properties with current filter
      const filters: any = { limit: 100 };
      if (statusFilter) filters.status = statusFilter;
      const response = await getProperties(filters, token);
      setProperties(response.data);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Erreur lors de l’action');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
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
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        {/* Success toast after edit */}
        {showSuccess && (
          <div
            className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in"
            style={{ minWidth: '220px', textAlign: 'center' }}
          >
            {successMessage}
          </div>
        )}
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

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des biens</h1>
                <p className="mt-2 text-gray-600">
                  {properties.length} bien{properties.length > 1 ? 's' : ''} immobilier{properties.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex flex-row gap-4 items-center justify-end w-full md:w-auto">

                <div className="relative group">
                  <button
                    className="flex items-center gap-2 px-6 py-3 font-semibold bg-white text-gray-700 border border-gray-300 rounded-xl shadow-md hover:bg-gray-100 hover:border-blue-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <span className="text-lg">📄</span>
                    <span>Actions CSV</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 z-20 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
                    <button
                      onClick={handleDownloadTemplate}
                      className="w-full flex items-center gap-2 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-t-xl"
                    >
                      <span className="text-lg">📥</span>
                      <span>Télécharger le template CSV</span>
                    </button>
                    <button
                      onClick={openImportModal}
                      className="w-full flex items-center gap-2 px-4 py-3 text-left text-green-700 hover:bg-green-50"
                    >
                      <span className="text-lg">⬆️</span>
                      <span>Importer des biens (CSV)</span>
                    </button>
                    <button
                      onClick={handleExportCsv}
                      className="w-full flex items-center gap-2 px-4 py-3 text-left text-blue-700 hover:bg-blue-50 rounded-b-xl"
                    >
                      <span className="text-lg">📤</span>
                      <span>Exporter (CSV)</span>
                    </button>
                  </div>
                </div>
                <Link
                  href="/admin/properties/new"
                  className="flex items-center gap-2 px-6 py-3 font-semibold bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter un bien
                </Link>
              </div>
            </div>
          </div>
      {/* Modal Import CSV */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.08)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              onClick={closeImportModal}
              aria-label="Fermer"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">Importer des biens (CSV)</h2>
            {/* CSV Import Help Box */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              <div className="font-semibold mb-1 flex items-center gap-2">
                <span>ℹ️</span>
                <span>Aide import CSV</span>
              </div>
              <ul className="list-disc pl-5 mb-2">
                <li>Champs obligatoires : <b>title</b>, <b>description</b>, <b>type</b>, <b>transactionType</b>, <b>price</b>, <b>surface</b>, <b>location.address</b>, <b>location.city</b>, <b>location.region</b></li>
                <li>Champs optionnels : bedrooms, bathrooms, floor, features.* (parking, garden, etc.)</li>
                <li>Les champs <b>price</b> et <b>surface</b> doivent être des nombres strictement positifs.</li>
                <li>Les champs features (parking, garden, etc.) attendent <b>true</b> ou <b>false</b>.</li>
                <li>Pour mettre à jour un bien existant, fournissez l'<b>id</b> ou la <b>reference</b> (si déjà existant).</li>
              </ul>
              <div className="mb-1">Exemple de ligne CSV :</div>
              <pre className="bg-blue-100 rounded p-2 text-xs overflow-x-auto mb-1">title,description,type,transactionType,price,surface,location.address,location.city,location.region,features.parking
Appartement lumineux,Beau T3 rénové,appartement,vente,250000,70,12 rue de Paris,Lyon,Auvergne-Rhône-Alpes,true</pre>
              <div>
                Besoin d’un modèle ? <button type="button" className="underline text-blue-700 hover:text-blue-900" onClick={handleDownloadTemplate}>Télécharger le template CSV</button>
              </div>
            </div>
            <form onSubmit={handleImportCsv} className="flex flex-col gap-4">
              <input type="file" accept=".csv" ref={fileInputRef} required className="border rounded px-3 py-2 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" style={{minHeight: '44px'}} />
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium shadow-sm border-0 transition-colors"
                disabled={importLoading}
              >
                {importLoading ? 'Import en cours...' : 'Importer'}
              </button>
            </form>
            {importResult && (
              <div className="mt-4">
                {importResult.success ? (
                  <div className="text-green-700 mb-2">
                    {(importResult.created > 0 || importResult.updated > 0) ? (
                      <>
                        {importResult.created > 0 && (
                          <span>{importResult.created} bien(s) créé(s) avec succès.<br/></span>
                        )}
                        {importResult.updated > 0 && (
                          <span>{importResult.updated} bien(s) mis à jour avec succès.<br/></span>
                        )}
                      </>
                    ) : (
                      <span>0 bien importé ou mis à jour.</span>
                    )}
                  </div>
                ) : (
                  <div className="text-red-700 mb-2">Erreur : {importResult.message}</div>
                )}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto text-sm">
                    <div className="font-semibold mb-1 flex items-center justify-between">
                      <span>Erreurs d'import :</span>
                      <button
                        className="ml-2 px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200 text-xs font-medium"
                        onClick={async () => {
                          const token = localStorage.getItem('token');
                          const res = await fetch(`${API_URL}/properties/import-csv-errors`, {
                            headers: token ? { Authorization: `Bearer ${token}` } : {},
                          });
                          if (res.ok) {
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'import_errors.csv';
                            a.click();
                            window.URL.revokeObjectURL(url);
                          } else {
                            alert('Aucun rapport d\'erreurs à télécharger.');
                          }
                        }}
                        type="button"
                      >
                        Télécharger le rapport d'erreurs
                      </button>
                    </div>
                    <ul className="list-disc pl-5">
                      {importResult.errors.map((err: any, i: number) => (
                        <li key={i} className="text-red-600">Ligne {err.row}: {err.error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium shadow-sm border border-gray-300 transition-colors"
                onClick={closeImportModal}
                disabled={importLoading}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

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
                className={
                  `bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-shadow ` +
                  (property.status === 'archive' ? 'opacity-60' : 'hover:shadow-md')
                }
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
                  <div
                    className={
                      `absolute top-3 left-3 px-3 py-1 text-white text-xs font-medium rounded-full ` +
                      (property.status === 'loue'
                        ? 'bg-purple-600'
                        : property.status === 'vendu'
                          ? 'bg-red-600'
                          : property.transactionType === 'vente'
                            ? 'bg-blue-600'
                            : 'bg-green-600')
                    }
                  >
                    {property.status === 'loue'
                      ? 'Loué'
                      : property.status === 'vendu'
                        ? 'Vendu'
                        : property.transactionType === 'vente'
                          ? 'À vendre'
                          : 'À louer'}
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

                  <div className="flex gap-2 mb-2">
                    {/* Professional icon-only action buttons */}
                    <div className="flex flex-row gap-2 w-full justify-between">
                      {/* Toggle onMap, View, Edit, History, Delete buttons: disabled if archived */}
                      <button
                        type="button"
                        className={`group p-2 rounded-full border transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2
                          ${property.onMap ? 'border-green-600 bg-green-50 text-green-700 hover:bg-green-100'
                            : selectingPropertyId === property._id ? 'border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : 'border-gray-300 bg-white text-gray-500 hover:bg-green-50 hover:text-green-700'}
                          ${property.status !== 'archive' && !(!!selectingPropertyId && selectingPropertyId !== property._id) ? 'cursor-pointer' : 'cursor-default'}
                        `}
                        onClick={async () => {
                          if (property.onMap) {
                            setProperties(prev => prev.map(p => p._id === property._id ? { ...p, onMap: false } : p));
                            const token = localStorage.getItem('token') || '';
                            try {
                              await import('@/lib/api/properties').then(({ updateProperty }) =>
                                updateProperty(
                                  property._id,
                                  {
                                    ...property,
                                    onMap: false,
                                    existingPhotos: property.photos
                                  },
                                  token
                                )
                              );
                              // Refresh with current filter
                              const filters: any = { limit: 100 };
                              if (statusFilter) filters.status = statusFilter;
                              const response = await getProperties(filters, token || undefined);
                              setProperties(response.data);
                            } catch (err) {
                              setError('Erreur lors de la mise à jour de la carte');
                            }
                          } else if (selectingPropertyId === property._id) {
                            setSelectingPropertyId(null);
                          } else if (!selectingPropertyId) {
                            setSelectingPropertyId(property._id);
                            // Scroll to map section
                            setTimeout(() => {
                              mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 100);
                          }
                        }}
                        title={property.onMap
                          ? 'Retirer de la carte'
                          : selectingPropertyId === property._id
                            ? 'Annuler la sélection de l\'emplacement'
                            : selectingPropertyId
                              ? 'Sélection d\'emplacement en cours pour un autre bien'
                              : 'Ajouter à la carte'}
                        disabled={property.status === 'archive' || (!!selectingPropertyId && selectingPropertyId !== property._id)}
                        style={property.status === 'archive' ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                      >
                        {property.onMap ? (
                          <span className="inline-block" title="Sur la carte">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </span>
                        ) : selectingPropertyId === property._id ? (
                          <span className="inline-block" title="Annuler la sélection">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </span>
                        ) : (
                          <span className="inline-block" title="Ajouter à la carte">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                          </span>
                        )}
                      </button>
                      <Link
                        href={`/properties/${property._id}`}
                        className={`group p-2 rounded-full border border-blue-300 bg-white text-blue-600 hover:bg-blue-50 transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${property.status !== 'archive' ? 'cursor-pointer' : 'cursor-default'}`}
                        title="Voir"
                        tabIndex={property.status === 'archive' ? -1 : 0}
                        aria-disabled={property.status === 'archive'}
                        style={property.status === 'archive' ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link
                        href={`/admin/properties/${property._id}/edit`}
                        className={`group p-2 rounded-full border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${property.status !== 'archive' ? 'cursor-pointer' : 'cursor-default'}`}
                        title="Modifier"
                        tabIndex={property.status === 'archive' ? -1 : 0}
                        aria-disabled={property.status === 'archive'}
                        style={property.status === 'archive' ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                      >
                        <Pencil className="w-5 h-5" />
                      </Link>
                      <button
                        type="button"
                        className={`group p-2 rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${property.status !== 'archive' ? 'cursor-pointer' : 'cursor-default'}`}
                        onClick={() => openHistoryModal(property._id)}
                        title="Historique"
                        disabled={property.status === 'archive'}
                        style={property.status === 'archive' ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                      >
                        <HistoryIcon className="w-5 h-5" />
                      </button>
                      {/* Archive/Unarchive button: always enabled */}
                      {property.status === 'archive' ? (
                        <button
                          type="button"
                          className="group p-2 rounded-full border border-green-400 bg-white text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
                          onClick={() => handleArchive(property)}
                          title="Désarchiver"
                          style={{ pointerEvents: 'auto', opacity: 1 }}
                        >
                          <ArchiveIcon className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="group p-2 rounded-full border border-yellow-400 bg-white text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
                          onClick={() => handleArchive(property)}
                          title="Archiver"
                        >
                          <ArchiveIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        type="button"
                        className={`group p-2 rounded-full border border-red-400 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${property.status !== 'archive' ? 'cursor-pointer' : 'cursor-default'}`}
                        onClick={() => handleDelete(property)}
                        title="Supprimer"
                        disabled={property.status === 'archive'}
                        style={property.status === 'archive' ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Admin Map Section (moved below property cards) */}
        <div ref={mapSectionRef}>
        {selectingPropertyId && (
          <div className="w-full flex justify-center mb-4">
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded shadow text-center max-w-xl">
              Sélectionnez un emplacement sur la carte pour le bien <b>{properties.find(p => p._id === selectingPropertyId)?.title || ''}</b>.<br />
              Cliquez sur la carte pour placer le bien, ou cliquez sur la croix pour annuler.
            </div>
          </div>
        )}
        <AdminPropertiesMapSection
          selectLocationMode={!!selectingPropertyId}
          onSelectLocation={handleSelectLocation}
          selectedPropertyId={selectingPropertyId}
          properties={properties}
        />
        </div>
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
              {confirmType === 'archive'
                ? isUnarchive
                  ? 'Désarchiver ce bien ?'
                  : 'Archiver ce bien ?'
                : 'Supprimer définitivement ce bien ?'}
            </h2>
            <p className="mb-6 text-gray-700 text-base">
              {confirmType === 'archive'
                ? isUnarchive
                  ? 'Le bien sera restauré et redeviendra visible dans les recherches.'
                  : 'Le bien sera archivé et ne sera plus visible dans les recherches. Vous pourrez le restaurer plus tard.'
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
                className={`px-5 py-2 rounded-lg text-white font-medium shadow-sm border-0 transition-colors ${confirmType === 'archive' ? (isUnarchive ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700') : 'bg-red-600 hover:bg-red-700'}`}
                onClick={confirmAction}
                disabled={actionLoading}
              >
                {actionLoading
                  ? 'En cours...'
                  : confirmType === 'archive'
                    ? isUnarchive
                      ? 'Désarchiver'
                      : 'Archiver'
                    : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
