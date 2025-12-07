"use client";

import { useEffect, useState } from "react";

// List of feature filter keys for type safety
const featureFiltersKeys = [
  'parking',
  'garden',
  'pool',
  'elevator',
  'balcony',
  'terrace',
  'furnished',
  'airConditioning',
  'heating',
  'securitySystem',
] as const;
import { useAuth } from "@/components/auth/AuthProvider";
import apiClient from "@/lib/api/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";


interface SavedSearch {
  _id: string;
  name: string;
  criteria: Record<string, any>;
  createdAt: string;
}

export default function SavedSearchesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedSearches = async () => {
      if (!user?.id) return setLoading(false);
      try {
        const res = await apiClient.get(`/users/${user.id}/saved-searches`);
        setSavedSearches(res.data?.data || []);
      } catch {
        setSavedSearches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedSearches();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-8 px-2 sm:px-0">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center mb-6 text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Retour
        </button>
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-blue-700">Mes recherches sauvegardées</h1>
          <p className="text-gray-500 mb-6">Retrouvez ici toutes vos alertes et recherches sauvegardées.</p>
          {loading ? (
            <div className="text-blue-500 animate-pulse">Chargement...</div>
          ) : savedSearches.length === 0 ? (
            <div className="text-gray-400 text-center py-12">Aucune recherche sauvegardée.</div>
          ) : (
            <ul className="space-y-6">
              {savedSearches.map((search) => (
                <li key={search._id} className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between p-5 border border-blue-100 hover:shadow-xl transition-shadow">
                  <div>
                    <div className="font-semibold text-lg text-blue-800">{search.name || "Recherche sans nom"}</div>
                    <div className="text-gray-500 text-sm">Créée le {new Date(search.createdAt).toLocaleDateString("fr-FR")}</div>
                    <div className="text-gray-700 text-xs mt-2">
                      Critères :
                      <ul className="list-disc ml-5 mt-1">
                        {search.criteria.filterField && (
                          <li><span className="font-medium">Type de filtre</span>: {search.criteria.filterField}</li>
                        )}
                        {search.criteria.filterValue && (
                          <li><span className="font-medium">Valeur du filtre</span>: {search.criteria.filterValue}</li>
                        )}
                        {search.criteria.typeValue && (
                          <li><span className="font-medium">Type de bien</span>: {search.criteria.typeValue}</li>
                        )}
                        {search.criteria.transactionTypeValue && (
                          <li><span className="font-medium">Type de transaction</span>: {search.criteria.transactionTypeValue}</li>
                        )}
                        {search.criteria.sort && (
                          <li><span className="font-medium">Tri</span>: {search.criteria.sort}</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Link
                      href={(() => {
                        const c = search.criteria;
                        const params = new URLSearchParams();
                        // Use frontend state variable names for /properties page
                        if (c.filterField) params.append('filterField', c.filterField);
                        if (c.filterValue !== undefined) params.append('filterValue', c.filterValue);
                        if (c.typeValue) params.append('typeValue', c.typeValue);
                        if (c.transactionTypeValue) params.append('transactionTypeValue', c.transactionTypeValue);
                        if (c.sort) params.append('sort', c.sort);
                        // Features as top-level params (true/false)
                        if (c.featureFilters) {
                          featureFiltersKeys.forEach(key => {
                            if (typeof c.featureFilters[key] !== 'undefined') {
                              params.append(key, String(!!c.featureFilters[key]));
                            }
                          });
                        }
                        // Add search name if present
                        if (search.name) params.append('searchName', search.name);
                        return `/properties?${params.toString()}`;
                      })()}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow"
                    >
                      Voir résultats
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}