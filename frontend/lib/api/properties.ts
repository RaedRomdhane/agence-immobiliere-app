// Update property by ID
// Update property by ID
export const updateProperty = async (id: string, data: any, token: string) => {
  try {
    const formData = new FormData();
    
    // Ajouter les champs simples
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('type', data.type);
    formData.append('transactionType', data.transactionType);
    formData.append('price', data.price.toString());
    formData.append('surface', data.surface.toString());

    // Ajouter les champs optionnels seulement s'ils existent
    if (data.rooms !== undefined) formData.append('rooms', data.rooms.toString());
    if (data.bedrooms !== undefined) formData.append('bedrooms', data.bedrooms.toString());
    if (data.bathrooms !== undefined) formData.append('bathrooms', data.bathrooms.toString());
    if (data.floor !== undefined) formData.append('floor', data.floor.toString());

    // Ajouter la localisation et les caractéristiques en JSON
    formData.append('location', JSON.stringify(data.location));
    formData.append('features', JSON.stringify(data.features));

    // Ajouter les photos existantes si elles existent
    if (data.existingPhotos && data.existingPhotos.length > 0) {
      formData.append('existingPhotos', JSON.stringify(data.existingPhotos));
    }

    // Ajouter les nouvelles photos
    if (data.photos && data.photos.length > 0) {
      data.photos.forEach((file: File) => {
        formData.append('photos', file);
      });
    }

    const response = await axios.put(`${API_URL}/properties/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Erreur lors de la modification du bien'
    );
  }
};
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Property {
  _id: string;
  title: string;
  description: string;
  type: string;
  transactionType: 'vente' | 'location';
  price: number;
  surface: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  location: {
    address: string;
    city: string;
    region: string;
    zipCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  features: {
    parking: boolean;
    garden: boolean;
    pool: boolean;
    elevator: boolean;
    balcony: boolean;
    terrace: boolean;
    furnished: boolean;
    airConditioning: boolean;
    heating: boolean;
    securitySystem: boolean;
  };
  photos: Array<{
    url: string;
    filename: string;
    isPrimary: boolean;
  }>;
  qrCode?: string;
  status: 'disponible' | 'vendu' | 'loue' | 'archive';
  views: number;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  pricePerSquareMeter?: number;
  primaryPhoto?: {
    url: string;
    filename: string;
    isPrimary: boolean;
  };
}

export interface PropertyFormData {
  title: string;
  description: string;
  type: string;
  transactionType: string;
  price: number;
  surface: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  location: {
    address: string;
    city: string;
    region: string;
    zipCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  features: {
    parking: boolean;
    garden: boolean;
    pool: boolean;
    elevator: boolean;
    balcony: boolean;
    terrace: boolean;
    furnished: boolean;
    airConditioning: boolean;
    heating: boolean;
    securitySystem: boolean;
  };
  photos: File[];
}

export interface PropertyFilters {
  page?: number;
  limit?: number;
  type?: string;
  transactionType?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minSurface?: number;
  maxSurface?: number;
  status?: string;
  sort?: string;
}

/**
 * Créer un nouveau bien immobilier
 */
export const createProperty = async (propertyData: PropertyFormData, token: string) => {
  try {
    const formData = new FormData();

    // Ajouter les champs simples
    formData.append('title', propertyData.title);
    formData.append('description', propertyData.description);
    formData.append('type', propertyData.type);
    formData.append('transactionType', propertyData.transactionType);
    formData.append('price', propertyData.price.toString());
    formData.append('surface', propertyData.surface.toString());

    if (propertyData.rooms) formData.append('rooms', propertyData.rooms.toString());
    if (propertyData.bedrooms) formData.append('bedrooms', propertyData.bedrooms.toString());
    if (propertyData.bathrooms) formData.append('bathrooms', propertyData.bathrooms.toString());
    if (propertyData.floor) formData.append('floor', propertyData.floor.toString());

    // Ajouter la localisation (JSON stringifié)
    formData.append('location', JSON.stringify(propertyData.location));

    // Ajouter les caractéristiques (JSON stringifié)
    formData.append('features', JSON.stringify(propertyData.features));

    // Ajouter les photos
    propertyData.photos.forEach((photo) => {
      formData.append('photos', photo);
    });

    const response = await axios.post(`${API_URL}/properties`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Erreur lors de la création du bien'
    );
  }
};

/**
 * Récupérer tous les biens avec filtres
 */
export const getProperties = async (filters?: PropertyFilters) => {
  try {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await axios.get(`${API_URL}/properties?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Erreur lors de la récupération des biens'
    );
  }
};

/**
 * Récupérer un bien par ID
 */
export const getPropertyById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/properties/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Erreur lors de la récupération du bien'
    );
  }
};
