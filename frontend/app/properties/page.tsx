
'use client';

import Link from 'next/link';
import axios from 'axios';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertiesMapSection from './PropertiesMapSection';
import { ChevronDown } from 'lucide-react';
import { Search, MapPin, Bed, Bath, Square, Heart } from 'lucide-react';
import React, { useEffect, useState, useRef, useCallback } from 'react';
// --- Appointment status state for rendez-vous button ---
// Map of propertyId to { status, userId }
type AppointmentStatusMap = {
  [propertyId: string]: {
    status: 'pending' | 'accepted' | 'denied',
    userId: string
  } | undefined;
};
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { userApi, LastPropertySearchCriteria } from '@/lib/api/user';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Canonical property types (sync with admin form and backend)
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
export default function PropertiesPage() {
    // --- Save search state ---
    const [savingSearch, setSavingSearch] = useState(false);
    const [saveSearchName, setSaveSearchName] = useState("");
  const router = useRouter();
  // --- Track appointment request status for each property (for rendez-vous button) ---
  const [appointmentStatus, setAppointmentStatus] = useState<AppointmentStatusMap>({});
  // Ref for the map section
  const mapSectionRef = useRef<HTMLDivElement>(null);
  // Ref to prevent multiple simultaneous reset calls
  const isResettingRef = useRef(false);
  // ...existing code...
    // Ref for sort debounce timeout
    const sortTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset all filters to default and clear saved criteria
  const handleResetFilters = async () => {
    // Prevent multiple simultaneous calls
    if (isResettingRef.current) {
      console.log('[RESET] Already resetting, ignoring duplicate call');
      return;
    }

    isResettingRef.current = true;
    console.log('[RESET] Starting reset...');

    try {
      // Clear saved criteria first if user is logged in
      if (user && isAuthenticated) {
        try {
          await userApi.setLastPropertySearchCriteria(user.id, {});
        } catch (err) {
          console.error('Failed to clear saved criteria:', err);
        }
      }

      // Reset all filter states
      setFilterField('text');
      setFilterValue('');
      setTypeValue('');
      setTransactionTypeValue('');
      setSort('recent');
      setStatusFilter('');
      setFeatureFilters({
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
      });
      
      // Mark criteria as not restored
      setRestoredFromCriteria(false);
      restoredCriteriaRef.current = null;

      // Immediately fetch all properties with default filters
      setLoading(true);
      setError('');
      setProperties([]);

      const params = new URLSearchParams();
      params.append('limit', '100');
      params.append('sort', '-createdAt'); // Default sort: most recent

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const url = `${apiUrl}/properties?${params.toString()}`;
      
      console.log('[RESET] Fetching properties with URL:', url);

      let fetchOptions: RequestInit = {};
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        fetchOptions.headers = { Authorization: `Bearer ${token}` };
      }

      const res = await fetch(url, fetchOptions);
      if (!res.ok) throw new Error('Erreur lors du chargement des biens');
      
      const data = await res.json();
      console.log('[RESET] Received properties:', data.data?.length || 0);
      setProperties(data.data || []);
      setResultCount((data.data && Array.isArray(data.data)) ? data.data.length : 0);
    } catch (err: any) {
      console.error('[RESET] Error:', err);
      setError(err.message || 'Erreur inconnue');
      setProperties([]);
      setResultCount(0);
    } finally {
      setLoading(false);
      isResettingRef.current = false;
      console.log('[RESET] Reset complete');
    }
  };
  // ...existing code...
  const [properties, setProperties] = useState<any[]>([]);
  // Log whenever properties state changes
  useEffect(() => {
    console.log('[ADMIN DEBUG] useEffect: properties state updated:', properties);
  }, [properties]);

  const { user, isAuthenticated, isLoading } = useAuth();
  // Track favorites locally for optimistic UI
  const [favorites, setFavorites] = useState<string[]>([]);

  // Sync favorites when user changes
  useEffect(() => {
    setFavorites(user?.favorites || []);
  }, [user]);

  // Toggle favorite handler
  const handleToggleFavorite = async (propertyId: string) => {
    if (!user || !isAuthenticated) return;
    const isFav = favorites.includes(propertyId);
    // Optimistic update
    setFavorites(favs => isFav ? favs.filter(id => id !== propertyId) : [...favs, propertyId]);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      await fetch(`${apiUrl}/users/${user.id}/favorites`, {
        method: isFav ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyId }),
      });
    } catch (err) {
      // Rollback on error
      setFavorites(favs => isFav ? [...favs, propertyId] : favs.filter(id => id !== propertyId));
    }
  };

  // Handle Stripe payment for property
  const handlePayment = async (propertyId: string, title: string, price: number, transactionType: string) => {
    try {
      toast.info('Redirection vers le paiement...', { position: "top-center", autoClose: 2000 });
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          title,
          price,
          transactionType,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        toast.error('Erreur lors de la création de la session de paiement.', { position: "top-center", autoClose: 3000 });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Une erreur est survenue. Veuillez réessayer.', { position: "top-center", autoClose: 3000 });
    }
  };

  // Fetch global appointment status for all properties
  const fetchAppointments = useCallback(async () => {
    if (!user || !isAuthenticated) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      // Fetch global appointment status for all properties
      const res = await axios.get(`${apiUrl}/appointments/global-status`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      // Expected format: { [propertyId]: { status, userId } }
      if (res.data && typeof res.data === 'object') {
        setAppointmentStatus(res.data);
      }
    } catch (err) {
      // Ignore errors
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);
  // --- State for filters and properties ---
  // Status filter for admin
  const [statusFilter, setStatusFilter] = useState('');
  const [filterField, setFilterField] = useState('text');
  const [filterValue, setFilterValue] = useState('');
  // For select fields
  const [typeValue, setTypeValue] = useState('');
  const [transactionTypeValue, setTransactionTypeValue] = useState('');
  // Dropdown options for filter field
  const filterFieldOptions = [
    { value: 'text', label: 'Titre/Description' },
    { value: 'city', label: 'Ville' },
    { value: 'region', label: 'Région' },
    { value: 'address', label: 'Adresse' },
    { value: 'zipCode', label: 'Code postal' },
    { value: 'type', label: 'Type de bien' },
    { value: 'transactionType', label: 'Vente/Location' },
    { value: 'priceMax', label: 'Prix max' },
    { value: 'surfaceMin', label: 'Surface min' },
    { value: 'surfaceMax', label: 'Surface max' },
    { value: 'rooms', label: 'Pièces' },
    { value: 'bedrooms', label: 'Chambres' },
    { value: 'bathrooms', label: 'Salles de bain' },
    { value: 'floor', label: 'Étage' },
    // Features
    { value: 'parking', label: 'Parking' },
    { value: 'garden', label: 'Jardin' },
    { value: 'pool', label: 'Piscine' },
    { value: 'elevator', label: 'Ascenseur' },
    { value: 'balcony', label: 'Balcon' },
    { value: 'terrace', label: 'Terrasse' },
    { value: 'furnished', label: 'Meublé' },
    { value: 'airConditioning', label: 'Climatisation' },
    { value: 'heating', label: 'Chauffage' },
    { value: 'securitySystem', label: 'Système de sécurité' },
  ];
  // (removed duplicate declaration)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultCount, setResultCount] = useState(0);
  const [sort, setSort] = useState('recent');
  // Add state for features
  const [featureFilters, setFeatureFilters] = useState({
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
  });

  // Track if criteria was restored and store it
  const [restoredFromCriteria, setRestoredFromCriteria] = useState(false);
  const [restoringCriteria, setRestoringCriteria] = useState(true); // Start as true to prevent premature fetch
  const restoredCriteriaRef = useRef<LastPropertySearchCriteria | null>(null);
  const [triggerSearchFromUrl, setTriggerSearchFromUrl] = useState(false);

  // --- Prefill filters from URL query params or saved criteria for logged-in user ---
  useEffect(() => {
    if (!user || !isAuthenticated) {
      setRestoringCriteria(false);
      return;
    }
    let cancelled = false;
    setRestoringCriteria(true);
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    // Helper to parse boolean from string
    const parseBool = (v: string | null) => v === 'true';
    // If there are any query params relevant to search, use them
    const hasQueryParams = searchParams && Array.from(searchParams.keys()).length > 0;
    if (hasQueryParams && searchParams) {
      // Only set fields if present in query
      const qpFilterField = searchParams.get('filterField');
      const qpFilterValue = searchParams.get('filterValue');
      const qpTypeValue = searchParams.get('typeValue');
      const qpTransactionTypeValue = searchParams.get('transactionTypeValue');
      const qpSort = searchParams.get('sort');
      const qpSearchName = searchParams.get('searchName');
      // Feature filters
      const featureKeys = [
        'parking','garden','pool','elevator','balcony','terrace','furnished','airConditioning','heating','securitySystem'
      ];
      const qpFeatureFilters: any = {};
      featureKeys.forEach(key => {
        if (searchParams.has(key)) {
          qpFeatureFilters[key] = parseBool(searchParams.get(key));
        }
      });
      if (qpFilterField) setFilterField(qpFilterField);
      if (qpFilterValue !== null) setFilterValue(qpFilterValue);
      if (qpTypeValue !== null) setTypeValue(qpTypeValue);
      if (qpTransactionTypeValue !== null) setTransactionTypeValue(qpTransactionTypeValue);
      if (qpSort) setSort(qpSort);
      if (Object.keys(qpFeatureFilters).length > 0) setFeatureFilters((prev) => ({ ...prev, ...qpFeatureFilters }));
      if (qpSearchName !== null) setSaveSearchName(qpSearchName);
      setRestoredFromCriteria(true);
      setRestoringCriteria(false);
      // Also trigger a search after state is set (in next effect)
      restoredCriteriaRef.current = {
        filterField: qpFilterField ?? undefined,
        filterValue: qpFilterValue ?? undefined,
        typeValue: qpTypeValue ?? undefined,
        transactionTypeValue: qpTransactionTypeValue ?? undefined,
        sort: qpSort ?? undefined,
        featureFilters: qpFeatureFilters,
      };
      
      // Set flag to trigger search from URL params
      setTriggerSearchFromUrl(true);
      
      return;
    }
    // Otherwise, fall back to backend criteria
    async function fetchCriteria() {
      try {
        if (!user) return;
        const criteria = await userApi.getLastPropertySearchCriteria(user.id);
        if (criteria && !cancelled) {
          restoredCriteriaRef.current = criteria;
          if (criteria.filterField) setFilterField(criteria.filterField);
          if (criteria.filterValue !== undefined) setFilterValue(criteria.filterValue);
          if (criteria.typeValue !== undefined) setTypeValue(criteria.typeValue);
          if (criteria.transactionTypeValue !== undefined) setTransactionTypeValue(criteria.transactionTypeValue);
          if (criteria.sort) setSort(criteria.sort);
          if (criteria.featureFilters) setFeatureFilters((prev) => ({ ...prev, ...criteria.featureFilters }));
          setRestoredFromCriteria(true);
        }
      } catch (e) {
        // Ignore errors (user may not have any saved criteria)
      } finally {
        setRestoringCriteria(false);
      }
    }
    fetchCriteria();
    return () => { cancelled = true; };
  }, [user, isAuthenticated]);

  // --- Trigger search only after all filter states match the restored criteria ---
  const firstSearchDone = useRef(false);
  useEffect(() => {
    if (!restoredFromCriteria || firstSearchDone.current || !restoredCriteriaRef.current) return;
    const c = restoredCriteriaRef.current;
    // Check if all filter states match the restored criteria
    if (
      filterField === (c.filterField ?? 'text') &&
      filterValue === (c.filterValue ?? '') &&
      typeValue === (c.typeValue ?? '') &&
      transactionTypeValue === (c.transactionTypeValue ?? '') &&
      sort === (c.sort ?? 'recent') &&
      JSON.stringify(featureFilters) === JSON.stringify(c.featureFilters ?? {})
    ) {
      firstSearchDone.current = true;
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSearch(fakeEvent);
    }
  }, [restoredFromCriteria, filterField, filterValue, typeValue, transactionTypeValue, sort, featureFilters]);

  // --- Trigger search from URL parameters ---
  useEffect(() => {
    if (!triggerSearchFromUrl) return;
    // Wait a tick for all state updates to complete
    const timer = setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
      handleSearch(fakeEvent);
      setTriggerSearchFromUrl(false); // Reset flag
    }, 50);
    return () => clearTimeout(timer);
  }, [triggerSearchFromUrl, filterField, filterValue, typeValue, transactionTypeValue, sort, featureFilters]);

  // --- Fetch properties from backend on ANY filter change ---
  // --- Fetch properties when statusFilter changes (admin) or initial load (all users) ---
  useEffect(() => {
    // Only run when not restoring criteria
    if (restoringCriteria) return;
    // If still loading auth, wait
    if (isLoading) return;
    
    // For admins: fetch when statusFilter changes
    // For regular users: fetch only on initial load (when properties array is empty)
    if (user && user.role !== 'admin') {
      // Skip if not initial load (properties already fetched)
      if (properties.length > 0) return;
    }
    
    const controller = new AbortController();
    setLoading(true);
    setError('');
    
    async function doFetch() {
      try {
        const params = new URLSearchParams();
        // Always include status filter for admin
        if (statusFilter) params.append('status', statusFilter);
        // Force a high limit to rule out pagination issues
        params.append('limit', '100');
        // Map frontend sort value to backend sort string
        let backendSort = '-createdAt';
        if (sort === 'recent') backendSort = '-createdAt';
        else if (sort === 'price-asc') backendSort = 'price';
        else if (sort === 'price-desc') backendSort = '-price';
        else if (sort === 'surface-asc') backendSort = 'surface';
        else if (sort === 'surface-desc') backendSort = '-surface';
        params.append('sort', backendSort);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const url = `${apiUrl}/properties?${params.toString()}`;
        let fetchOptions: RequestInit = { signal: controller.signal };
        let debugToken = null;
        // Only add auth header if user is logged in
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          debugToken = token;
          fetchOptions = {
            ...fetchOptions,
            headers: {
              ...(fetchOptions.headers || {}),
              Authorization: `Bearer ${token}`,
            },
          };
        }
        // Debug log request
        console.log('[ADMIN DEBUG] Fetching properties:', { url, headers: fetchOptions.headers, statusFilter, user, isAuthenticated, debugToken });
        const res = await fetch(url, fetchOptions);
        if (!res.ok) throw new Error('Erreur lors du chargement des biens');
        const data = await res.json();
        // Debug log full response
        console.log('[ADMIN DEBUG] Full response:', data);
        setProperties(data.data || []);
        setResultCount((data.data && Array.isArray(data.data)) ? data.data.length : 0);
      } catch (err: any) {
        if (err.name !== 'AbortError') setError(err.message || 'Erreur inconnue');
        // Debug log error
        console.error('[ADMIN DEBUG] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    doFetch();
    return () => controller.abort();
  }, [statusFilter, user, isAuthenticated, sort, restoredFromCriteria, restoringCriteria]);

  // (Removed duplicate handleSearch implementation)

  // --- Handlers ---

  // --- Save criteria for logged-in user (optional feature) ---
  const saveCriteria = React.useCallback((criteria: Partial<LastPropertySearchCriteria>) => {
    if (!user || !isAuthenticated) return; // Skip saving for unauthenticated users
    if (user && isAuthenticated) {
      const updatedCriteria = {
        filterField,
        filterValue,
        typeValue,
        transactionTypeValue,
        sort,
        featureFilters,
        ...criteria,
      };
      
      // Save to backend
      userApi.setLastPropertySearchCriteria(user.id, updatedCriteria).catch(() => {});
      
      // Also save to localStorage for recommendations
      const searchKey = `lastSearchCriteria_${user.id}`;
      const searchData = {
        type: updatedCriteria.typeValue || '',
        city: updatedCriteria.filterField === 'city' ? updatedCriteria.filterValue : '',
        priceMax: updatedCriteria.filterField === 'priceMax' ? updatedCriteria.filterValue : '',
        bedrooms: updatedCriteria.filterField === 'bedrooms' ? updatedCriteria.filterValue : '',
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(searchKey, JSON.stringify(searchData));
    }
  }, [user, isAuthenticated, filterField, filterValue, typeValue, transactionTypeValue, sort, featureFilters]);

  function handleDropdownChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterField(e.target.value);
    setFilterValue('');
    setTypeValue('');
    setTransactionTypeValue('');
    saveCriteria({ filterField: e.target.value, filterValue: '', typeValue: '', transactionTypeValue: '' });
  }
  function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFilterValue(e.target.value);
    saveCriteria({ filterValue: e.target.value });
  }
  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setTypeValue(e.target.value);
    saveCriteria({ typeValue: e.target.value });
  }
  function handleTransactionTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setTransactionTypeValue(e.target.value);
    saveCriteria({ transactionTypeValue: e.target.value });
  }
  // Add handler for feature checkboxes
  function handleFeatureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const updated = { ...featureFilters, [e.target.name]: e.target.checked };
    setFeatureFilters(updated);
    saveCriteria({ featureFilters: updated });
  }

  // Filtering only when user submits the form
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setProperties([]); // Reset properties immediately
    setLoading(true); // Show loading spinner immediately
    const controller = new AbortController();
    async function fetchFilteredProperties() {
      setError('');
      try {
        const params = new URLSearchParams();
        // Map filter fields to backend query params
        if (filterField === 'type' && typeValue) {
          params.append('type', typeValue);
        } else if (filterField === 'transactionType' && transactionTypeValue) {
          params.append('transactionType', transactionTypeValue);
        } else if (filterField === 'priceMax' && filterValue) {
          params.append('maxPrice', filterValue);
        } else if (filterField === 'surfaceMin' && filterValue) {
          params.append('minSurface', filterValue);
        } else if (filterField === 'surfaceMax' && filterValue) {
          params.append('maxSurface', filterValue);
        } else if (filterField === 'rooms' && filterValue !== '') {
          params.append('rooms', String(Number(filterValue)));
        } else if (filterField === 'bedrooms' && filterValue !== '') {
          params.append('bedrooms', String(Number(filterValue)));
        } else if (filterField === 'bathrooms' && filterValue !== '') {
          params.append('bathrooms', String(Number(filterValue)));
        } else if (filterField === 'floor' && filterValue !== '') {
          params.append('floor', String(Number(filterValue)));
        } else if (filterField === 'city' && filterValue) {
          params.append('city', filterValue);
        } else if (filterField === 'region' && filterValue) {
          params.append('region', filterValue);
        } else if (filterField === 'address' && filterValue) {
          params.append('address', filterValue);
        } else if (filterField === 'zipCode' && filterValue) {
          params.append('zipCode', filterValue);
        } else if ({
          parking: true,
          garden: true,
          pool: true,
          elevator: true,
          balcony: true,
          terrace: true,
          furnished: true,
          airConditioning: true,
          heating: true,
          securitySystem: true,
        }[filterField]) {
          params.append(`features.${filterField}`, featureFilters[filterField as keyof typeof featureFilters] ? 'true' : 'false');
        } else if (filterField === 'text' && filterValue) {
          params.append('q', filterValue);
        }
        // Add status filter for admin
        if (user && user.role === 'admin' && statusFilter) {
          params.append('status', statusFilter);
        }
        // Force a high limit to rule out pagination issues
        params.append('limit', '100');
        // Map frontend sort value to backend sort string
        let backendSort = '-createdAt';
        if (sort === 'recent') backendSort = '-createdAt';
        else if (sort === 'price-asc') backendSort = 'price';
        else if (sort === 'price-desc') backendSort = '-price';
        else if (sort === 'surface-asc') backendSort = 'surface';
        else if (sort === 'surface-desc') backendSort = '-surface';
        params.append('sort', backendSort);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const url = `${apiUrl}/properties?${params.toString()}`;
        // Debug log
        console.log('[DEBUG] Fetching properties with URL:', url);
        let fetchOptions: RequestInit = { signal: controller.signal };
        // Only add auth header if user is logged in
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          fetchOptions = {
            ...fetchOptions,
            headers: {
              ...(fetchOptions.headers || {}),
              Authorization: `Bearer ${token}`,
            },
          };
        }
        const res = await fetch(url, fetchOptions);
        if (!res.ok) throw new Error('Erreur lors du chargement des biens');
        const data = await res.json();
        setProperties(data.data || []);
        setResultCount((data.data && Array.isArray(data.data)) ? data.data.length : 0);
        // Save criteria after search
        saveCriteria({});
      } catch (err: any) {
        if (err.name !== 'AbortError') setError(err.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }
    fetchFilteredProperties();
  }


  // --- Render ---
  if (restoringCriteria) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <span className="text-lg text-gray-700">Chargement des critères de recherche...</span>
      </div>
    );
  }

  // Debug: log properties and loading before grid render
  console.log('[ADMIN DEBUG] Render: properties:', properties, 'loading:', loading);
  // --- Save current search as a saved search ---
  const handleSaveSearch = async () => {
    if (!user || !isAuthenticated) {
      toast.error("Vous devez être connecté pour enregistrer une recherche.", { position: "top-center", autoClose: 3500 });
      return;
    }
    setSavingSearch(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const criteria = {
        filterField,
        filterValue,
        typeValue,
        transactionTypeValue,
        sort,
        featureFilters,
      };
      const headers: HeadersInit = token
        ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        : { 'Content-Type': 'application/json' };
      const res = await fetch(`${apiUrl}/users/${user.id}/saved-searches`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: saveSearchName, criteria }),
      });
      if (res.ok) {
        toast.success('Recherche sauvegardée avec succès !', { position: "top-center", autoClose: 3500 });
        setSaveSearchName("");
      } else {
        const data = await res.json();
        toast.error(data.message || "Erreur lors de l'enregistrement.", { position: "top-center", autoClose: 3500 });
      }
    } catch {
      toast.error("Erreur lors de l'enregistrement.", { position: "top-center", autoClose: 3500 });
    } finally {
      setSavingSearch(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Découvrez Nos Biens
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Parcourez notre sélection de propriétés disponibles à la vente et à la location
              </p>
            </div>
            {/* Search Bar */}
            <form id="property-search-form" onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <select
                  value={filterField}
                  onChange={handleDropdownChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                  style={{ minWidth: 180 }}
                >
                  {filterFieldOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {/* Show the appropriate input for the selected field */}
                {['parking','garden','pool','elevator','balcony','terrace','furnished','airConditioning','heating','securitySystem'].includes(filterField) ? (
                  <input
                    type="checkbox"
                    name={filterField}
                    checked={featureFilters[filterField as keyof typeof featureFilters]}
                    onChange={handleFeatureChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                ) : filterField === 'type' ? (
                  <select
                    value={typeValue}
                    onChange={handleTypeChange}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    style={{ minWidth: 180 }}
                  >
                    <option value="">Type de bien</option>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                ) : filterField === 'transactionType' ? (
                  <select
                    value={transactionTypeValue}
                    onChange={handleTransactionTypeChange}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    style={{ minWidth: 180 }}
                  >
                    <option value="">Vente ou Location</option>
                    <option value="vente">Vente</option>
                    <option value="location">Location</option>
                  </select>
                ) : (
                  <input
                    type={["priceMax","surfaceMin","surfaceMax","rooms","bedrooms","bathrooms","floor"].includes(filterField) ? 'number' : 'text'}
                    value={filterValue}
                    onChange={handleValueChange}
                    placeholder={filterFieldOptions.find(opt => opt.value === filterField)?.label || 'Recherche'}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                    style={{ minWidth: 180 }}
                    min={["priceMax","surfaceMin","surfaceMax","rooms","bedrooms","bathrooms","floor"].includes(filterField) ? 0 : undefined}
                  />
                )}
                <button
                  type="submit"
                  className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  style={{ minWidth: 150 }}
                >
                  <Search className="h-5 w-5" />
                  <span>Rechercher</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="ml-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 flex items-center justify-center space-x-2"
                  style={{ minWidth: 150 }}
                >
                  Réinitialiser
                </button>
              </div>
            </form>
            {/* Save Search Button - Only for authenticated users */}
            {isAuthenticated && user && (
              <div className="max-w-4xl mx-auto mt-4 flex flex-col md:flex-row items-center gap-4">
                <input
                  type="text"
                  value={saveSearchName}
                  onChange={e => setSaveSearchName(e.target.value)}
                  placeholder="Nom de la recherche"
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 flex-1"
                  style={{ minWidth: 180 }}
                  disabled={savingSearch}
                />
                <button
                  type="button"
                  onClick={handleSaveSearch}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 font-semibold shadow"
                  disabled={savingSearch}
                >
                  {savingSearch ? 'Enregistrement...' : 'Enregistrer cette recherche'}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {user && user.role === 'admin' ? 'Tous les biens (admin)' : 'Tous les biens disponibles'}
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">{loading ? 'Chargement...' : `${resultCount} résultat${resultCount > 1 ? 's' : ''}`}</span>
                {/* Status filter dropdown for admin only */}
                {user && user.role === 'admin' && (
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                    value={statusFilter}
                    onChange={e => {
                      setStatusFilter(e.target.value);
                    }}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="disponible">Disponible</option>
                    <option value="loue">Loué</option>
                    <option value="vendu">Vendu</option>
                    <option value="archive">Archivé</option>
                  </select>
                )}
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                  value={sort}
                  onChange={e => {
                    const newSort = e.target.value;
                    setSort(newSort);
                    // Debounce to ensure state is updated before search
                    if (sortTimeoutRef.current) clearTimeout(sortTimeoutRef.current);
                    sortTimeoutRef.current = setTimeout(() => {
                      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                      handleSearch(fakeEvent);
                    }, 50);
                  }}
                  style={{ color: '#222', backgroundColor: '#fff' }}
                >
                  <option value="recent" style={{ color: '#222', backgroundColor: '#fff' }}>Plus récent</option>
                  <option value="price-asc" style={{ color: '#222', backgroundColor: '#fff' }}>Prix croissant</option>
                  <option value="price-desc" style={{ color: '#222', backgroundColor: '#fff' }}>Prix décroissant</option>
                  <option value="surface-asc" style={{ color: '#222', backgroundColor: '#fff' }}>Surface croissante</option>
                  <option value="surface-desc" style={{ color: '#222', backgroundColor: '#fff' }}>Surface décroissante</option>
                </select>
              </div>
            </div>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              key={`properties-grid-${properties.length}-${properties[0]?._id || 'none'}`}
            >
              {loading ? (
                <div className="col-span-full text-center py-12 text-lg text-gray-500">Chargement...</div>
              ) : properties.length === 0 ? (
                <div className="col-span-full text-center py-12 text-lg text-gray-500">Aucun bien trouvé.</div>
              ) : (
                properties.map((property: any) => {
                  // Find the first photo (prefer isPrimary, else first)
                  let imageUrl = '';
                  console.log('[IMAGE DEBUG] Property:', property._id, 'Photos:', property.photos);
                  if (property.photos && property.photos.length > 0) {
                    const primary = property.photos.find((p: any) => p.isPrimary) || property.photos[0];
                    console.log('[IMAGE DEBUG] Primary photo:', primary);
                    imageUrl = primary.url || primary.filename || '';
                    console.log('[IMAGE DEBUG] Image URL before processing:', imageUrl);
                    if (imageUrl && !imageUrl.startsWith('http')) {
                      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
                      imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                      console.log('[IMAGE DEBUG] Image URL after processing:', imageUrl);
                    }
                  } else {
                    console.log('[IMAGE DEBUG] No photos found for property:', property._id);
                  }

                  // --- Appointment logic ---
                  const propertyId = String(property._id);
                  const appointment = appointmentStatus[propertyId];
                  const status = appointment?.status;
                  const statusUserId = appointment?.userId;
                  const isCurrentUser = user && statusUserId === user.id;
                  const isPending = status === 'pending';
                  const isAccepted = status === 'accepted';
                  const isDenied = status === 'denied';
                  const showReserveBadge = isAccepted;
                  // Rendez-vous button logic
                  let rendezVousDisabled = false;
                  let rendezVousText = 'Prendre rendez-vous';
                  if (isPending) {
                    if (isCurrentUser) {
                      rendezVousDisabled = true;
                      rendezVousText = 'En attente (votre demande)';
                    } else {
                      rendezVousDisabled = true;
                      rendezVousText = 'En attente (autre utilisateur)';
                    }
                  } else if (isAccepted) {
                    rendezVousDisabled = true;
                    if (isCurrentUser) {
                      rendezVousText = 'Prendre rendez-vous';
                    } else {
                      rendezVousText = 'Réservé';
                    }
                  } else if (isDenied) {
                    rendezVousDisabled = false;
                    rendezVousText = 'Prendre rendez-vous';
                  }
                  let louerDisabled = rendezVousDisabled;
                  let louerClass = property.status === 'disponible' && !louerDisabled ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed';
                  let rendezVousClass = property.status === 'disponible' && !rendezVousDisabled ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed';

                  return (
                    <div key={`property-card-${property._id}-${property.status}`}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                      <div className="relative h-64 bg-gradient-to-br from-blue-400 to-blue-600">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={property.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              console.error('[IMAGE ERROR] Failed to load image:', imageUrl);
                              e.currentTarget.style.display = 'none';
                            }}
                            onLoad={() => {
                              console.log('[IMAGE SUCCESS] Loaded image:', imageUrl);
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                            Aucune image
                          </div>
                        )}
                        {/* Transaction type badge */}
                        <span className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
                          {property.transactionType === 'vente' ? 'À vendre' : property.transactionType === 'location' ? 'À louer' : ''}
                        </span>
                        {/* Status badge (refactored for all statuses) */}
                        <span
                          className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold shadow
                            ${showReserveBadge ? 'bg-purple-200 text-purple-800' : ''}
                            ${!showReserveBadge && property.status === 'disponible' ? 'bg-green-100 text-green-800' : ''}
                            ${property.status === 'loue' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${property.status === 'vendu' ? 'bg-red-100 text-red-800' : ''}
                            ${property.status === 'archive' ? 'bg-gray-300 text-gray-700' : ''}
                          `}
                        >
                          {showReserveBadge ? 'Réservé' : property.status === 'disponible' ? 'Disponible' : property.status === 'loue' ? 'Loué' : property.status === 'vendu' ? 'Vendu' : property.status === 'archive' ? 'Archivé' : ''}
                        </span>
                        {/* Heart button below status badge */}
                        {/* Hide heart button for admin */}
                        {(!isLoading && user && user.role !== 'admin') && (
                          <button
                            className="absolute right-4 top-14 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                            onClick={e => {
                              e.preventDefault();
                              handleToggleFavorite(property._id);
                            }}
                            aria-label={favorites.includes(property._id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                          >
                            <Heart className={`h-5 w-5 ${favorites.includes(property._id) ? 'text-red-500 fill-red-500' : 'text-gray-700'}`} />
                          </button>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{property.city}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{property.description}</p>
                        <div className="flex items-center space-x-4 mb-4 text-gray-600">
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            <span className="text-sm">{property.bedrooms}</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            <span className="text-sm">{property.bathrooms}</span>
                          </div>
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-1" />
                            <span className="text-sm">{property.surface} m²</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-600">{property.price?.toLocaleString('fr-FR')} TND</span>
                          <div className="flex gap-2 flex-wrap">
                            <Link href={`/properties/${property._id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm">
                              Voir plus
                            </Link>
                            {/* Vendre/Louer button: only for users, not admin */}
                            {!(user && user.role === 'admin') && (
                              <button
                                className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors ${louerClass}`}
                                disabled={property.status !== 'disponible' || louerDisabled}
                                onClick={async () => {
                                  if (!user || !user.id) {
                                    toast.info('Veuillez vous connecter pour continuer.', { position: "top-center", autoClose: 3000 });
                                    setTimeout(() => {
                                      router.push('/login');
                                    }, 1000);
                                    return;
                                  }
                                  if (property.status === 'disponible' && !louerDisabled) {
                                    // Initiate Stripe payment
                                    handlePayment(property._id, property.title, property.price, property.transactionType);
                                  }
                                }}
                              >
                                {property.transactionType === 'vente' ? (property.status === 'vendu' ? 'Vendu' : 'Vendre') : property.transactionType === 'location' ? (property.status === 'loue' ? 'Loué' : 'Louer') : 'Action'}
                              </button>
                            )}
                            {/* Rendez-vous button: only for users, only if disponible */}
                            {!(user && user.role === 'admin') && (
                              <button
                                className={`px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors ${rendezVousClass}`}
                                disabled={property.status !== 'disponible' || rendezVousDisabled}
                                onClick={async () => {
                                  const propId = String(property._id);
                                  if (!user || !user.id) {
                                    toast.info('Veuillez vous connecter pour prendre rendez-vous.', { position: "top-center", autoClose: 3000 });
                                    setTimeout(() => {
                                      router.push('/login');
                                    }, 1000);
                                    return;
                                  }
                                  if (property.status === 'disponible' && !rendezVousDisabled) {
                                    try {
                                      const token = localStorage.getItem('token');
                                      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                                      const res = await axios.post(
                                        `${apiUrl}/appointments`,
                                        { propertyId: propId },
                                        { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
                                      );
                                      if (res.data.success) {
                                        toast.success("Demande de rendez-vous envoyée à l'administrateur.", {
                                          position: "top-center",
                                          autoClose: 3500,
                                          hideProgressBar: false,
                                          closeOnClick: true,
                                          pauseOnHover: true,
                                          draggable: true
                                        } as any);
                                        // No forced dismiss: rely on autoClose only (react-toastify latest)
                                        // Optimistically update local status to pending for immediate UI feedback
                                        setAppointmentStatus(prev => {
                                          // Prevent overwriting if another request is in progress
                                          if (prev[propId]?.status === 'pending' && prev[propId]?.userId === user.id) {
                                            return prev;
                                          }
                                          return {
                                            ...prev,
                                            [propId]: { status: 'pending', userId: user.id }
                                          };
                                        });
                                        // Then re-fetch global appointment status from backend for consistency
                                        fetchAppointments();
                                      } else {
                                        toast.error(res.data.message || 'Erreur lors de la demande de rendez-vous.', {
                                          position: "top-center",
                                          autoClose: 3500
                                        });
                                      }
                                    } catch (err: any) {
                                      if (err.response && err.response.data && err.response.data.message) {
                                        toast.error(err.response.data.message, { position: "top-center", autoClose: 3500 });
                                      } else {
                                        toast.error('Erreur lors de la demande de rendez-vous.', { position: "top-center", autoClose: 3500 });
                                      }
                                    }
                                  }
                                }}
                              >
                                {rendezVousText}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {/* Pagination (optional, not implemented) */}
          </div>
        </section>
        {/* Map Section */}
        <section className="pt-16" ref={mapSectionRef} id="map-section">
          <PropertiesMapSection />
        </section>
      </main>
      <Footer />
      {/* ToastContainer removed: ensure only one exists in the app, place it in _app.tsx or layout.tsx */}
    </div>
  );
}
