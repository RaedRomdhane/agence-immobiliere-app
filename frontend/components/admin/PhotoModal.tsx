'use client';

import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';

interface Photo {
  url: string;
  filename: string;
  isPrimary?: boolean;
}

interface PhotoModalProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onGoToPhoto?: (index: number) => void;
  propertyTitle: string;
}

export default function PhotoModal({
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onGoToPhoto,
  propertyTitle,
}: PhotoModalProps) {
  const currentPhoto = photos[currentIndex];
  const hasMultiplePhotos = photos.length > 1;

  // Fermer avec la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Navigation avec les flèches du clavier
  useEffect(() => {
    const handleArrow = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasMultiplePhotos) onPrevious();
      if (e.key === 'ArrowRight' && hasMultiplePhotos) onNext();
    };
    window.addEventListener('keydown', handleArrow);
    return () => window.removeEventListener('keydown', handleArrow);
  }, [hasMultiplePhotos, onNext, onPrevious]);

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95" onClick={onClose}>
      {/* Contenu du modal */}
      <div className="relative z-10 max-w-7xl w-full h-full flex flex-col p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-white">
            <h3 className="text-lg md:text-xl font-semibold">{propertyTitle}</h3>
            <p className="text-sm text-gray-300">
              Photo {currentIndex + 1} sur {photos.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-gray-800 rounded-full transition-colors shrink-0"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Image principale */}
        <div className="flex-1 flex items-center justify-center relative min-h-0">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${currentPhoto.url}`}
            alt={`${propertyTitle} - Photo ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          />

          {/* Flèche gauche */}
          {hasMultiplePhotos && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevious();
              }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 text-white rounded-full transition-all z-20"
              aria-label="Photo précédente"
            >
              <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          )}

          {/* Flèche droite */}
          {hasMultiplePhotos && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-gray-800 bg-opacity-80 hover:bg-opacity-100 text-white rounded-full transition-all z-20"
              aria-label="Photo suivante"
            >
              <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
            </button>
          )}
        </div>

        {/* Thumbnails */}
        {hasMultiplePhotos && (
          <div className="mt-6 md:mt-8 flex gap-3 md:gap-4 justify-center overflow-x-auto pb-2 px-2">
            {photos.map((photo, index) => (
              <button
                key={photo.filename}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onGoToPhoto) {
                    onGoToPhoto(index);
                  }
                }}
                className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all bg-gray-900 ${
                  index === currentIndex
                    ? 'border-blue-500 opacity-100 scale-110'
                    : 'border-gray-600 opacity-60 hover:opacity-90 hover:border-blue-300'
                }`}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${photo.url}`}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
