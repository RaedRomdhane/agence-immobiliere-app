"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api/client";
import type { Property } from "@/lib/api/properties";
import { MapPin, Bed, Bath, Square, Clock } from "lucide-react";

export default function HistoryPage() {
  const [recentlyViewed, setRecentlyViewed] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = require('@/components/auth/AuthProvider').useAuth();
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (typeof window === "undefined" || !user?.id) return;
      const key = `recentlyViewedProperties_${user.id}`;
      const ids = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(ids) || ids.length === 0) {
        setRecentlyViewed([]);
        setLoading(false);
        return;
      }
      try {
        const results = await Promise.all(
          ids.map(async (id: string) => {
            try {
              const res = await apiClient.get(`/properties/${id}`);
              return res.data?.data || null;
            } catch {
              return null;
            }
          })
        );
        setRecentlyViewed(results.filter(Boolean));
      } catch {
        setRecentlyViewed([]);
      }
      setLoading(false);
    };
    fetchRecentlyViewed();
  }, [user]);

  const handleRetour = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/dashboard";
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-16 max-w-5xl mx-auto px-4">
        <button
          onClick={handleRetour}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Retour
        </button>
        <h1 className="text-3xl font-bold mb-6">Historique des biens consultés</h1>
        {loading ? (
          <div className="text-center text-gray-500 py-12">Chargement...</div>
        ) : recentlyViewed.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Aucun bien récemment consulté</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentlyViewed.map((property) => (
              <div key={property._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600">
                  {property.primaryPhoto?.url ? (
                    <img
                      src={property.primaryPhoto.url.startsWith('http') ? property.primaryPhoto.url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${property.primaryPhoto.url}`}
                      alt={property.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : null}
                  <div className="absolute top-4 right-4">
                    <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                      <Clock className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.location?.city || property.location?.address || ''}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{property.title}</h3>
                  <div className="flex items-center space-x-4 mb-4 text-gray-600">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.bedrooms ?? '-'}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.bathrooms ?? '-'}</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.surface} m²</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">{property.price.toLocaleString()} TND</span>
                    <Link href={`/properties/${property._id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">Revoir</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
