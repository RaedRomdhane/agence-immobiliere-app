
'use client';

import React, { useEffect, useState } from 'react';
import PropertyForm from '@/components/admin/PropertyForm';
import { getPropertyById, Property } from '@/lib/api/properties';
import { useParams, useRouter } from 'next/navigation';

export default function EditPropertyPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const data = await getPropertyById(id as string);
        setProperty(data.data || data);
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la récupération du bien');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-lg text-red-600 mb-4">{error || 'Bien non trouvé.'}</p>
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-10">
      <PropertyForm property={property} mode="edit" />
    </div>
  );
}
