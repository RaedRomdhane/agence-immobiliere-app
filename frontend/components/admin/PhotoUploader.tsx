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

  // Générer les URLs de prévisualisation
  React.useEffect(() => {
    const urls = photos.map((photo) => URL.createObjectURL(photo));
    setPreviewUrls(urls);

    // Nettoyer les URLs quand le composant se démonte
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
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
                className="text-blue-600 hover:text-blue-700 font-medium"
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
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200"
            >
              <img
                src={url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Badge "Principale" pour la première photo */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
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
                aria-label={`Supprimer la photo ${index + 1}`}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Overlay au survol */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
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
                text-gray-600 hover:text-blue-600
              "
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
