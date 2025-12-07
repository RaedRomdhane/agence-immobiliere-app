"use client";

import { useEffect, useState } from "react";
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter, useParams } from "next/navigation";
import { MapPin, Bed, Bath, Square } from "lucide-react";
import { getPropertyById } from '@/lib/api/properties';

export default function PropertyDetailsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    // Add to recently viewed in localStorage (per user)
    if (typeof window !== 'undefined' && user?.id) {
      const key = `recentlyViewedProperties_${user.id}`;
      let ids: string[] = [];
      try {
        ids = JSON.parse(localStorage.getItem(key) || '[]');
      } catch {}
      // Remove if already present
      ids = ids.filter((pid) => pid !== id);
      // Add to front
      ids.unshift(id as string);
      // Limit to 6
      if (ids.length > 6) ids = ids.slice(0, 6);
      localStorage.setItem(key, JSON.stringify(ids));
    }
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const data = await getPropertyById(id as string);
        setProperty(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-red-600 mb-4">{error || "Bien non trouvé."}</p>
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Retour
        </button>
      </div>
    );
  }

  const handleRetour = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/properties');
    }
  };
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-18">
        <div className="w-full max-w-3xl">
          <button
            onClick={handleRetour}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Retour
          </button>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">{property.title}</h1>
            {/* Status badge */}
            {property.status && (
              <div className="mb-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold 
                    ${property.status === 'disponible' ? 'bg-green-100 text-green-800' : ''}
                    ${property.status === 'loue' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${property.status === 'vendu' ? 'bg-red-100 text-red-800' : ''}
                  `}
                >
                  {property.status === 'disponible' && 'Disponible'}
                  {property.status === 'loue' && 'Loué'}
                  {property.status === 'vendu' && 'Vendu'}
                  {property.status === 'archive' && 'Archivé'}
                </span>
              </div>
            )}
            <div className="flex items-center text-gray-700 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {property.location?.city}, {property.location?.region}
            </div>
            <div className="flex items-center gap-6 mb-4">
              <span className="text-blue-600 text-2xl font-bold">{property.price?.toLocaleString()} TND</span>
              <span className="text-gray-700">• {property.surface} m²</span>
            </div>
            <div className="flex items-center gap-4 mb-6 text-gray-700">
              {property.bedrooms > 0 && (
                <div className="flex items-center"><Bed className="h-4 w-4 mr-1" />{property.bedrooms} ch.</div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center"><Bath className="h-4 w-4 mr-1" />{property.bathrooms} sdb.</div>
              )}
              {property.rooms > 0 && (
                <div className="flex items-center"><Square className="h-4 w-4 mr-1" />{property.rooms} pièces</div>
              )}
            </div>
            <p className="text-gray-800 mb-6">{property.description}</p>
            {/* Images */}
            {property.photos && property.photos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {property.photos.map((photo: any, idx: number) => (
                  <div key={idx} className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shadow">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${photo.url}`}
                      alt={`Photo ${idx + 1}`}
                      className="object-cover w-full h-full"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
