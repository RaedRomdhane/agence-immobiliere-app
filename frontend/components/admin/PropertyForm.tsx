'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import PhotoUploader from './PhotoUploader';
import { createProperty, PropertyFormData } from '@/lib/api/properties';
import { useAuth } from '@/components/auth/AuthProvider';

// Schéma de validation Zod
// Liste canonique des types de biens (value => label)
const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'studio', label: 'Studio' },
  { value: 'villa', label: 'Villa' },
  { value: 'maison', label: 'Maison' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'triplex', label: 'Triplex' },
  { value: 'riad', label: 'Riad' },
  { value: 'immeuble_residentiel', label: 'Immeuble résidentiel' },
  { value: 'local_commercial', label: 'Local commercial' },
  { value: 'magasin', label: 'Magasin' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'espace_coworking', label: 'Espace coworking' },
  { value: 'showroom', label: 'Showroom' },
  { value: 'entrepot', label: 'Entrepôt / Hangar' },
  { value: 'usine', label: 'Usine' },
  { value: 'terrain', label: 'Terrain' },
  { value: 'terrain_agricole', label: 'Terrain agricole' },
  { value: 'terrain_nu', label: 'Terrain nu' },
  { value: 'ferme', label: 'Ferme' },
  { value: 'parking', label: 'Parking / Garage' },
  { value: 'cave', label: 'Cave' },
  { value: 'hotel', label: "Hôtel / Maison d'hôtes" },
  { value: 'fonds_commerce', label: 'Fonds de commerce' },
  { value: 'clinique', label: 'Clinique / Cabinet médical' },
  { value: 'ecole', label: 'École / Crèche' },
  { value: 'salle_fete', label: 'Salle de fête' },
];

const propertySchema = z.object({
  title: z
    .string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
  description: z
    .string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères'),
  // Type: string validated against PROPERTY_TYPES below
  type: z.string().nonempty('Veuillez sélectionner un type de bien').refine((val) => PROPERTY_TYPES.some(t => t.value === val), { message: 'Type de bien invalide' }),
  transactionType: z.enum(['vente', 'location'], { message: 'Veuillez sélectionner vente ou location' }),
  price: z.number({ message: 'Le prix doit être un nombre valide' }).min(0, 'Le prix ne peut pas être négatif'),
  surface: z.number({ message: 'La surface doit être un nombre valide' }).min(1, 'La surface doit être au moins 1 m²'),
  rooms: z.number({ message: 'Le nombre de pièces doit être un nombre' }).min(0).optional(),
  bedrooms: z.number({ message: 'Le nombre de chambres doit être un nombre' }).min(0).optional(),
  bathrooms: z.number({ message: 'Le nombre de salles de bain doit être un nombre' }).min(0).optional(),
  floor: z.number({ message: 'L\'étage doit être un nombre' }).min(0).optional(),
  location: z.object({
    address: z.string().min(1, 'L\'adresse est requise'),
    city: z
      .string()
      .min(1, 'La ville est requise')
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'La ville ne doit contenir que des lettres'),
    region: z
      .string()
      .min(1, 'La région est requise')
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'La région ne doit contenir que des lettres'),
    zipCode: z
      .string()
      .regex(/^\d*$/, 'Le code postal ne doit contenir que des chiffres')
      .optional()
      .or(z.literal('')),
  }),
  features: z.object({
    parking: z.boolean(),
    garden: z.boolean(),
    pool: z.boolean(),
    elevator: z.boolean(),
    balcony: z.boolean(),
    terrace: z.boolean(),
    furnished: z.boolean(),
    airConditioning: z.boolean(),
    heating: z.boolean(),
    securitySystem: z.boolean(),
  }),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export default function PropertyForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    mode: 'onChange', // Validation en temps réel pendant la saisie
    defaultValues: {
      features: {
        parking: false,
        garden: false,
        pool: false,
        elevator: false,
        balcony: false,
        terrace: false,
        furnished: false,
        airConditioning: false,
        heating: false,
        securitySystem: false,
      },
    },
  });

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');
      setPhotoError('');

      // Validation des photos
      if (photos.length === 0) {
        setPhotoError('Au moins une photo est requise');
        setIsSubmitting(false);
        return;
      }

      if (photos.length > 10) {
        setPhotoError('Maximum 10 photos autorisées');
        setIsSubmitting(false);
        return;
      }

      // Vérifier les doublons (même nom et taille de fichier)
      const photoSignatures = photos.map(photo => `${photo.name}-${photo.size}`);
      const uniqueSignatures = new Set(photoSignatures);
      if (photoSignatures.length !== uniqueSignatures.size) {
        setPhotoError('Vous avez ajouté la même photo plusieurs fois');
        setIsSubmitting(false);
        return;
      }

      // Préparation des données
      const propertyData: PropertyFormData = {
        ...data,
        photos,
      };

      // Récupération du token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté pour créer un bien');
      }

      // Envoi au backend
      const response = await createProperty(propertyData, token);

      // Succès - Redirection vers la liste des biens
      alert('Bien immobilier créé avec succès ! 🎉');
      router.push('/admin/properties');
    } catch (error: any) {
      console.error('Erreur création bien:', error);
      setSubmitError(error.message || 'Une erreur est survenue lors de la création du bien');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Ajouter un nouveau bien immobilier
        </h2>

        {/* Erreur globale */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        {/* Informations de base */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Informations générales
          </h3>

          {/* Titre */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Titre du bien *
            </label>
            <input
              type="text"
              id="title"
              {...register('title')}
              className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Bel appartement F3 avec vue mer"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              rows={5}
              {...register('description')}
              className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Décrivez le bien en détail..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Type et Transaction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type de bien *
              </label>
              <select
                id="type"
                {...register('type')}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionnez un type</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-1">
                Type de transaction *
              </label>
              <select
                id="transactionType"
                {...register('transactionType')}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.transactionType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionnez</option>
                <option value="vente">Vente</option>
                <option value="location">Location</option>
              </select>
              {errors.transactionType && (
                <p className="mt-1 text-sm text-red-600">{errors.transactionType.message}</p>
              )}
            </div>
          </div>

          {/* Prix et Surface */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Prix (TND) *
              </label>
              <input
                type="number"
                id="price"
                {...register('price', { valueAsNumber: true })}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="150000"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="surface" className="block text-sm font-medium text-gray-700 mb-1">
                Surface (m²) *
              </label>
              <input
                type="number"
                id="surface"
                {...register('surface', { valueAsNumber: true })}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.surface ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="85"
              />
              {errors.surface && (
                <p className="mt-1 text-sm text-red-600">{errors.surface.message}</p>
              )}
            </div>
          </div>

          {/* Pièces */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-1">
                Pièces
              </label>
              <input
                type="number"
                id="rooms"
                {...register('rooms', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Chambres
              </label>
              <input
                type="number"
                id="bedrooms"
                {...register('bedrooms', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                Salles de bain
              </label>
              <input
                type="number"
                id="bathrooms"
                {...register('bathrooms', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Étage
              </label>
              <input
                type="number"
                id="floor"
                {...register('floor', { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="space-y-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Localisation
          </h3>

          <div>
            <label htmlFor="location.address" className="block text-sm font-medium text-gray-700 mb-1">
              Adresse *
            </label>
            <input
              type="text"
              id="location.address"
              {...register('location.address')}
              className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.location?.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="12 Avenue Habib Bourguiba"
            />
            {errors.location?.address && (
              <p className="mt-1 text-sm text-red-600">{errors.location.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="location.city" className="block text-sm font-medium text-gray-700 mb-1">
                Ville *
              </label>
              <input
                type="text"
                id="location.city"
                {...register('location.city')}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.location?.city ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tunis"
              />
              {errors.location?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.location.city.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="location.region" className="block text-sm font-medium text-gray-700 mb-1">
                Région *
              </label>
              <input
                type="text"
                id="location.region"
                {...register('location.region')}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.location?.region ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tunis"
              />
              {errors.location?.region && (
                <p className="mt-1 text-sm text-red-600">{errors.location.region.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="location.zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                Code postal
              </label>
              <input
                type="text"
                id="location.zipCode"
                {...register('location.zipCode')}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 ${
                  errors.location?.zipCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1000"
              />
              {errors.location?.zipCode && (
                <p className="mt-1 text-sm text-red-600">{errors.location.zipCode.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Caractéristiques */}
        <div className="space-y-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Caractéristiques
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'parking', label: 'Parking' },
              { name: 'garden', label: 'Jardin' },
              { name: 'pool', label: 'Piscine' },
              { name: 'elevator', label: 'Ascenseur' },
              { name: 'balcony', label: 'Balcon' },
              { name: 'terrace', label: 'Terrasse' },
              { name: 'furnished', label: 'Meublé' },
              { name: 'airConditioning', label: 'Climatisation' },
              { name: 'heating', label: 'Chauffage' },
              { name: 'securitySystem', label: 'Système de sécurité' },
            ].map((feature) => (
              <label key={feature.name} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register(`features.${feature.name as keyof PropertyFormValues['features']}`)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{feature.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Photos *
          </h3>

          <PhotoUploader
            photos={photos}
            onPhotosChange={(newPhotos) => {
              setPhotos(newPhotos);
              // Clear l'erreur quand l'utilisateur change les photos
              if (photoError && newPhotos.length > 0) {
                setPhotoError('');
              }
            }}
            maxPhotos={10}
            error={photoError}
          />
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Création en cours...' : 'Créer le bien'}
          </button>
        </div>
      </div>
    </form>
  );
}
