'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Search, 
  Heart, 
  Bell, 
  Calendar,
  MessageSquare,
  User,
  TrendingUp,
  Clock,
  MapPin,
  Bed,
  Bath,
  Square,
  ArrowRight,
  Bookmark,
  Home as HomeIcon,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Info
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNotificationContext } from '@/components/notifications/NotificationContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import apiClient from '@/lib/api/client';
import type { Property } from '@/lib/api/properties';


export default function DashboardHome() {
    const { user } = useAuth();
    const { unreadCount, lastNotification } = useNotificationContext();
    // Unread messages count for Messagerie card
    const [unreadMessagesCount, setUnreadMessagesCount] = useState<number | null>(null);
    useEffect(() => {
      const fetchUnreadCount = async () => {
        if (!user?.id) return;
        try {
          const res = await apiClient.get('/contact/unread-count');
          setUnreadMessagesCount(res.data?.count ?? 0);
        } catch {
          setUnreadMessagesCount(0);
        }
      };
      fetchUnreadCount();
    }, [user?.id]);

  // Biens récemment consultés dynamiques
  const [recentlyViewed, setRecentlyViewed] = useState<Property[]>([]);

  // Real activity stats
  const [activityStats, setActivityStats] = useState({
    favoritesCount: 0,
    savedSearchesCount: 0,
    viewedCount: 0,
    contactsCount: 0
  });

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (typeof window === 'undefined' || !user?.id) return;
      const key = `recentlyViewedProperties_${user.id}`;
      const ids = JSON.parse(localStorage.getItem(key) || '[]');
      if (!Array.isArray(ids) || ids.length === 0) {
        setRecentlyViewed([]);
        return;
      }
      try {
        // Fetch each property by ID (could be optimized with a batch endpoint)
        const results = await Promise.all(
          ids.slice(0, 6).map(async (id: string) => {
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
    };
    fetchRecentlyViewed();
  }, [user?.id]);

  // Fetch real activity statistics
  useEffect(() => {
    const fetchActivityStats = async () => {
      if (!user?.id) return;
      
      try {
        // Get favorites count
        const favoritesCount = user.favorites?.length || 0;
        
        // Get saved searches count
        const savedSearchesRes = await apiClient.get(`/users/${user.id}/saved-searches`);
        const savedSearchesCount = savedSearchesRes.data?.data?.length || 0;
        
        // Get viewed properties count from localStorage
        const historyKey = `recentlyViewedProperties_${user.id}`;
        const viewedIds = JSON.parse(localStorage.getItem(historyKey) || '[]');
        const viewedCount = viewedIds.length || 0;
        
        // Get contacts/messages count
        const contactsRes = await apiClient.get('/contact/unread-count');
        const contactsCount = contactsRes.data?.totalCount || 0;
        
        setActivityStats({
          favoritesCount,
          savedSearchesCount,
          viewedCount,
          contactsCount
        });
      } catch (error) {
        console.error('Error fetching activity stats:', error);
      }
    };
    
    fetchActivityStats();
  }, [user?.id, user?.favorites]);

  // Recommandations personnalisées basées sur l'historique
  const [recommended, setRecommended] = useState<any[]>([]);
  const [recommendationReasons, setRecommendationReasons] = useState<{ [key: string]: string }>({});
  const [propertyFeedback, setPropertyFeedback] = useState<{ [key: string]: 'like' | 'dislike' | null }>({});

  useEffect(() => {
    // Load existing feedback from localStorage
    if (user?.id) {
      const feedbackKey = `recommendationFeedback_${user.id}`;
      const existingFeedback = JSON.parse(localStorage.getItem(feedbackKey) || '{}');
      const feedbackMap: { [key: string]: 'like' | 'dislike' | null } = {};
      Object.keys(existingFeedback).forEach(propId => {
        feedbackMap[propId] = existingFeedback[propId].feedback;
      });
      setPropertyFeedback(feedbackMap);
    }
  }, [user?.id]);

  useEffect(() => {
    const fetchPersonalizedRecommendations = async () => {
      if (!user?.id) return;
      
      try {
        // Get user's browsing history
        const historyKey = `recentlyViewedProperties_${user.id}`;
        const viewedIds = JSON.parse(localStorage.getItem(historyKey) || '[]');
        
        // Get user's last search criteria
        const searchKey = `lastSearchCriteria_${user.id}`;
        const lastSearch = JSON.parse(localStorage.getItem(searchKey) || '{}');
        
        // Fetch recommendations based on history and preferences
        const params: any = {
          limit: 6,
          sort: '-createdAt',
        };
        
        // Apply filters from last search
        if (lastSearch.type) params.type = lastSearch.type;
        if (lastSearch.city) params.city = lastSearch.city;
        if (lastSearch.priceMin) params.priceMin = lastSearch.priceMin;
        if (lastSearch.priceMax) params.priceMax = lastSearch.priceMax;
        if (lastSearch.bedrooms) params.bedrooms = lastSearch.bedrooms;
        
        const res = await apiClient.get('/properties', { params });
        const properties = res.data?.data || [];
        
        // Filter out already viewed properties
        const filteredProperties = properties.filter((p: any) => !viewedIds.includes(p._id));
        
        // Generate recommendation reasons
        const reasons: { [key: string]: string } = {};
        filteredProperties.forEach((p: any) => {
          const reasonParts = [];
          if (lastSearch.type && p.type === lastSearch.type) {
            reasonParts.push(`Type: ${p.type}`);
          }
          if (lastSearch.city && p.city === lastSearch.city) {
            reasonParts.push(`Localisation: ${p.city}`);
          }
          if (lastSearch.bedrooms && p.bedrooms === lastSearch.bedrooms) {
            reasonParts.push(`${p.bedrooms} chambres`);
          }
          if (reasonParts.length === 0) {
            reasonParts.push('Nouvelle annonce');
          }
          reasons[p._id] = reasonParts.join(' • ');
        });
        
        setRecommendationReasons(reasons);
        setRecommended(filteredProperties.slice(0, 3));
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommended([]);
      }
    };
    
    fetchPersonalizedRecommendations();
  }, [user?.id]);

  // Handle recommendation feedback
  const handleRecommendationFeedback = (propertyId: string, feedback: 'like' | 'dislike') => {
    if (!user?.id) return;
    
    const feedbackKey = `recommendationFeedback_${user.id}`;
    const existingFeedback = JSON.parse(localStorage.getItem(feedbackKey) || '{}');
    
    // Toggle feedback if clicking the same button
    const currentFeedback = propertyFeedback[propertyId];
    const newFeedback = currentFeedback === feedback ? null : feedback;
    
    if (newFeedback === null) {
      // Remove feedback
      delete existingFeedback[propertyId];
      setPropertyFeedback(prev => ({ ...prev, [propertyId]: null }));
    } else {
      // Add/update feedback
      existingFeedback[propertyId] = {
        feedback: newFeedback,
        timestamp: new Date().toISOString()
      };
      setPropertyFeedback(prev => ({ ...prev, [propertyId]: newFeedback }));
    }
    
    localStorage.setItem(feedbackKey, JSON.stringify(existingFeedback));
    
    // Remove from recommendations if disliked
    if (newFeedback === 'dislike') {
      setRecommended(prev => prev.filter(p => p._id !== propertyId));
      
      // Show feedback message
      toast.info('Merci pour votre retour ! Nous améliorerons vos recommandations.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else if (newFeedback === 'like') {
      // Show feedback message
      toast.success('Merci ! Nous vous proposerons plus de biens similaires.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const gradients = {
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    green: 'from-green-400 to-green-600',
    orange: 'from-orange-400 to-orange-600',
    pink: 'from-pink-400 to-pink-600',
    indigo: 'from-indigo-400 to-indigo-600',
  };

  const favoritesCount = user?.favorites?.length || 0;
  // --- Planned visits count ---
  const [plannedVisits, setPlannedVisits] = useState<number | null>(null);
  useEffect(() => {
    const fetchPlannedVisits = async () => {
      if (!user?.id) return setPlannedVisits(0);
      try {
        const { getUserAppointmentsCount } = await import('@/lib/api/appointments');
        const count = await getUserAppointmentsCount();
        setPlannedVisits(count);
      } catch {
        setPlannedVisits(0);
      }
    };
    fetchPlannedVisits();
  }, [user?.id]);

  // --- Active alerts count for saved searches ---
  const [activeAlerts, setActiveAlerts] = useState<number | null>(null);
  useEffect(() => {
    const fetchActiveAlerts = async () => {
      if (!user?.id) return setActiveAlerts(0);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${apiUrl}/users/${user.id}/saved-searches`, { headers });
        if (res.ok) {
          const data = await res.json();
          setActiveAlerts(Array.isArray(data.data) ? data.data.length : 0);
        } else {
          setActiveAlerts(0);
        }
      } catch {
        setActiveAlerts(0);
      }
    };
    fetchActiveAlerts();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <main className="pt-16">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Bienvenue, {user?.firstName || 'Utilisateur'} !
                </h1>
                <p className="text-blue-100 text-lg">
                  Découvrez les dernières opportunités immobilières
                </p>
              </div>
              <div className="mt-6 md:mt-0 flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
                  <div className="flex flex-col items-start space-y-1">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span className="font-semibold">
                        {unreadCount > 0 ? `${unreadCount} nouvelle${unreadCount > 1 ? 's' : ''} notification${unreadCount > 1 ? 's' : ''}` : 'Aucune nouvelle notification'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-white/90 bg-blue-700/60 px-3 py-2 rounded max-w-xl w-full mx-auto">
                      <span className="font-semibold">Dernière notification :</span> {lastNotification ? lastNotification.message : 'Aucune notification'}
                      <span className="ml-2 text-xs text-blue-100">{lastNotification && lastNotification.createdAt ? new Date(lastNotification.createdAt).toLocaleString('fr-FR') : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-8 -mt-8">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Rechercher un bien */}
              <Link href="/properties" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Rechercher un bien</h3>
                    <p className="text-gray-600 text-sm">Trouvez votre prochain bien idéal</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </Link>

              {/* Mes Favoris */}
              <Link href="/favorites" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start space-x-4">
                  <div className="bg-pink-100 p-3 rounded-lg group-hover:bg-pink-200 transition-colors">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Mes Favoris</h3>
                    <p className="text-gray-600 text-sm">{favoritesCount} bien{favoritesCount !== 1 ? 's' : ''} sauvegardé{favoritesCount !== 1 ? 's' : ''}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-pink-600 transition-colors" />
                </div>
              </Link>

              {/* Recherches sauvegardées */}
              <Link href="/saved-searches" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Bookmark className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Recherches sauvegardées</h3>
                    <p className="text-gray-600 text-sm">{activeAlerts === null ? '...' : `${activeAlerts} alerte${activeAlerts !== 1 ? 's' : ''} active${activeAlerts !== 1 ? 's' : ''}`}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
              </Link>

              {/* Mes Rendez-vous */}
              <Link href="/appointments" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Mes Rendez-vous</h3>
                    <p className="text-gray-600 text-sm">
                      {plannedVisits === null ? '...' : `${plannedVisits} visite${plannedVisits !== 1 ? 's' : ''} planifiée${plannedVisits !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
              </Link>

              {/* Messagerie */}
              <Link href="/messages" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <MessageSquare className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Messagerie</h3>
                    <p className="text-gray-600 text-sm">
                      {unreadMessagesCount === null ? '...' : `${unreadMessagesCount} message${unreadMessagesCount !== 1 ? 's' : ''} non lu${unreadMessagesCount !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                </div>
              </Link>

              {/* Mon Profil */}
              <Link href="/profile" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <User className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Mon Profil</h3>
                    <p className="text-gray-600 text-sm">Gérer mes informations</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Recently Viewed Properties */}
        <section className="py-12">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Récemment consultés</h2>
                <p className="text-gray-600">Les biens que vous avez vus dernièrement</p>
              </div>
              <Link href="/history" className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                <span>Voir tout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentlyViewed.length === 0 ? (
                <div className="col-span-3 text-center text-gray-400 py-12">Aucun bien récemment consulté</div>
              ) : (
                recentlyViewed.map((property) => (
                  <div key={property._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className={`relative h-48 bg-gradient-to-br from-blue-400 to-blue-600`}>
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
                ))
              )}
            </div>
          </div>
        </section>

        {/* Recommended Properties */}
        <section className="py-12 bg-white">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Recommandés pour vous</h2>
                <p className="text-gray-600">Basés sur vos préférences et recherches</p>
              </div>
              <Link href="/properties" className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                <span>Voir plus</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommended.length === 0 ? (
                <div className="col-span-3 text-center text-gray-400 py-12">
                  <p className="mb-2">Aucune recommandation disponible pour le moment</p>
                  <p className="text-sm">Explorez nos annonces pour recevoir des recommandations personnalisées</p>
                </div>
              ) : (
                recommended.map((property) => {
                  // Find the primary photo or first photo
                  let imageUrl = '';
                  if (property.photos && property.photos.length > 0) {
                    const primary = property.photos.find((p: any) => p.isPrimary) || property.photos[0];
                    imageUrl = primary.url || primary.filename || '';
                    if (imageUrl && !imageUrl.startsWith('http')) {
                      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
                      imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                    }
                  }
                  
                  return (
                  <div key={property._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-48 bg-gradient-to-br from-blue-400 to-blue-600">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={property.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            console.error('[RECOMMENDATION IMAGE ERROR]', imageUrl);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                          Aucune image
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                          <Sparkles className="h-3 w-3" />
                          <span>Recommandé</span>
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleRecommendationFeedback(property._id, 'like');
                          }}
                          className={`p-2 rounded-full transition-all ${
                            propertyFeedback[property._id] === 'like'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-white/90 backdrop-blur-sm hover:bg-white'
                          }`}
                          title="J'aime cette suggestion"
                        >
                          <ThumbsUp className={`h-4 w-4 ${
                            propertyFeedback[property._id] === 'like' ? 'text-white' : 'text-green-600'
                          }`} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleRecommendationFeedback(property._id, 'dislike');
                          }}
                          className={`p-2 rounded-full transition-all ${
                            propertyFeedback[property._id] === 'dislike'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-white/90 backdrop-blur-sm hover:bg-white'
                          }`}
                          title="Pas intéressé"
                        >
                          <ThumbsDown className={`h-4 w-4 ${
                            propertyFeedback[property._id] === 'dislike' ? 'text-white' : 'text-red-600'
                          }`} />
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.location?.city || property.location?.address || ''}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{property.title}</h3>
                      
                      {/* Recommendation reason */}
                      {recommendationReasons[property._id] && (
                        <div className="mb-3 flex items-start space-x-1 text-xs text-blue-600 bg-blue-50 px-2 py-1.5 rounded">
                          <Info className="h-3 w-3 mt-0.5 shrink-0" />
                          <span>{recommendationReasons[property._id]}</span>
                        </div>
                      )}
                      
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
                        <Link href={`/properties/${property._id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Voir plus
                        </Link>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Votre activité</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{activityStats.favoritesCount}</div>
                <div className="text-gray-600 text-sm">Favoris</div>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bookmark className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{activityStats.savedSearchesCount}</div>
                <div className="text-gray-600 text-sm">Alertes actives</div>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{activityStats.viewedCount}</div>
                <div className="text-gray-600 text-sm">Biens vus</div>
              </div>

              <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{activityStats.contactsCount}</div>
                <div className="text-gray-600 text-sm">Contacts agents</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
