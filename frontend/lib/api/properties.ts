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

    if (propertyData.rooms !== undefined && propertyData.rooms !== null) formData.append('rooms', propertyData.rooms.toString());
    if (propertyData.bedrooms !== undefined && propertyData.bedrooms !== null) formData.append('bedrooms', propertyData.bedrooms.toString());
    if (propertyData.bathrooms !== undefined && propertyData.bathrooms !== null) formData.append('bathrooms', propertyData.bathrooms.toString());
    if (propertyData.floor !== undefined && propertyData.floor !== null) formData.append('floor', propertyData.floor.toString());

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
