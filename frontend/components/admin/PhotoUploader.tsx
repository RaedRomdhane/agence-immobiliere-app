'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface PhotoUploaderProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
  error?: string;
}

export default function PhotoUploader({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  error,
}: PhotoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Générer les URLs de prévisualisation avec base64
  React.useEffect(() => {
    const loadPreviews = async () => {
      const urls: string[] = [];
      
      for (const photo of photos) {
        try {
          // Lire le fichier en base64
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = (e) => {
              const result = e.target?.result as string;
              console.log('✅ Base64 créé pour:', photo.name);
              resolve(result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(photo);
          });
          urls.push(base64);
        } catch (error) {
          console.error('❌ Erreur lecture:', photo.name, error);
        }
      }
      
      setPreviewUrls(urls);
    };

    loadPreviews();
  }, [photos]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    // Filtrer uniquement les images
    const imageFiles = files.filter((file) =>
      file.type.startsWith('image/')
    );

    // Vérifier le nombre maximum
    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      alert(`Vous ne pouvez ajouter que ${maxPhotos} photos maximum`);
      return;
    }

    const filesToAdd = imageFiles.slice(0, remainingSlots);
    onPhotosChange([...photos, ...filesToAdd]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-gray-100 rounded-full">
            <Upload className="w-8 h-8 text-gray-600" />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-700">
              Glissez-déposez vos photos ici
            </p>
            <p className="text-sm text-gray-500 mt-1">
              ou{' '}
              <button
                type="button"
                onClick={openFileDialog}
                className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                aria-label="Parcourir les fichiers"
              >
                parcourez vos fichiers
              </button>
            </p>
          </div>

          <p className="text-xs text-gray-500">
            JPEG, PNG, WebP - Max {maxPhotos} photos (5 MB chacune)
          </p>

          <p className="text-sm font-medium text-gray-600">
            {photos.length} / {maxPhotos} photos ajoutées
          </p>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-red-600 rounded-full" />
          {error}
        </p>
      )}

      {/* Prévisualisation des photos */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {previewUrls.map((url, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border-2 border-gray-300"
              style={{
                aspectRatio: '1/1',
                backgroundColor: '#ffffff'
              }}
            >
              {/* Image */}
              <img
                src={url}
                alt={`Photo ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  position: 'relative',
                  zIndex: 1
                }}
                onLoad={(e) => {
                  console.log(`✅ Image ${index + 1} affichée avec succès`);
                  const img = e.currentTarget;
                  console.log(`Dimensions: ${img.naturalWidth}x${img.naturalHeight}`);
                  console.log(`Source URL: ${url.substring(0, 50)}...`);
                }}
                onError={(e) => {
                  console.error(`❌ Erreur chargement image ${index + 1}`);
                  console.error(`Source URL problématique: ${url.substring(0, 100)}`);
                }}
              />

              {/* Badge "Principale" pour la première photo */}
              {index === 0 && (
                <div 
                  className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium"
                  style={{ zIndex: 10 }}
                >
                  Principale
                </div>
              )}

              {/* Bouton de suppression */}
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="
                  absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full
                  opacity-0 group-hover:opacity-100 transition-opacity
                  hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500
                "
                style={{ zIndex: 10 }}
                aria-label={`Supprimer la photo ${index + 1}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Bouton pour ajouter plus de photos */}
          {photos.length < maxPhotos && (
            <button
              type="button"
              onClick={openFileDialog}
              className="
                aspect-square rounded-lg border-2 border-dashed border-gray-300
                hover:border-blue-500 hover:bg-blue-50 transition-colors
                flex flex-col items-center justify-center space-y-2
                text-gray-600 hover:text-blue-600 cursor-pointer
              "
              aria-label="Ajouter des photos"
            >
              <ImageIcon className="w-8 h-8" />
              <span className="text-sm font-medium">Ajouter</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
