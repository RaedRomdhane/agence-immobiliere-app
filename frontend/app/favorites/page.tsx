
"use client";


import React, { useEffect, useState } from "react";
import { useNotificationContext } from "../../components/notifications/NotificationContext";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useAuth } from "@/components/auth/AuthProvider";
import { Property } from "@/lib/api/properties";
import { favoritesApi } from "@/lib/api/favorites";
import { MapPin, Bed, Bath, Square, Heart, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


const FavoritesPage = () => {

  const { user, isLoading, setUser } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Generate shareable URL (simple: user id as param)
  useEffect(() => {
    if (user) {
      setShareUrl(`${window.location.origin}/favorites/shared/${user.id}`);
    }
  }, [user]);

  const handleCopyShareUrl = () => {
    if (shareUrl) {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {}
        document.body.removeChild(textArea);
      }
    }
  };
  const router = useRouter();
  // Remove property from favorites
  const { refreshNotifications } = useNotificationContext();
  const handleRemoveFavorite = async (propertyId: string) => {
    if (!user) return;
    setRemoving(propertyId);
    try {
      await favoritesApi.removeFavorite(user.id, propertyId);
      setProperties((prev) => prev.filter((p) => p._id !== propertyId));
      // Refresh notifications after removing favorite
      await refreshNotifications();
    } catch (err: any) {
      setError(err.message || "Erreur lors du retrait du favori");
    } finally {
      setRemoving(null);
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !user.favorites || user.favorites.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const data = await favoritesApi.getFavoriteProperties(user.id);
        setProperties(data.data || []);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des favoris");
      } finally {
        setLoading(false);
      }
    };
    if (!isLoading) fetchFavorites();
  }, [user, isLoading]);

  // Drag and drop handler
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(properties);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setProperties(reordered);
    // Persist the new order to backend and update user context
    if (user) {
      try {
        await favoritesApi.updateFavoritesOrder(user.id, reordered.map((p) => p._id));
        setUser((prev) => prev ? { ...prev, favorites: reordered.map((p) => p._id) } : prev);
      } catch (err: any) {
        setError(err.message || "Erreur lors de la sauvegarde de l'ordre des favoris");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left space and retour button */}
      <div className="w-16 md:w-32 lg:w-48 flex flex-col items-start pt-10 pl-4">
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour
        </button>
      </div>
      {/* Main content */}
      <div className="flex-1 container mx-auto py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Mes Favoris</h1>
        </div>
        {loading ? (
          <div className="text-gray-500">Chargement...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : properties.length === 0 ? (
          <div className="text-gray-500">Aucun favori pour le moment.</div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="favorites-droppable" direction="horizontal">
              {(provided) => (
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {properties.map((property, index) => {
                    let imageUrl = "";
                    if (property.photos && property.photos.length > 0) {
                      const primary = property.photos.find((p) => p.isPrimary) || property.photos[0];
                      imageUrl = primary.url || primary.filename || "";
                      if (imageUrl && !imageUrl.startsWith("http")) {
                        imageUrl = `http://localhost:5000${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
                      }
                    }
                    return (
                      <Draggable key={property._id} draggableId={property._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 ${snapshot.isDragging ? 'ring-2 ring-blue-400' : ''}`}
                          >
                            <div className="relative h-64 bg-linear-to-br from-blue-400 to-blue-600">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={property.title}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              ) : null}
                              <div className="absolute top-4 left-4">
                                <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Favori</span>
                              </div>
                              <button
                                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-100 transition"
                                aria-label="Retirer des favoris"
                                onClick={() => handleRemoveFavorite(property._id)}
                                disabled={removing === property._id}
                              >
                                <Heart className={`h-5 w-5 text-red-500 fill-red-500 ${removing === property._id ? 'animate-pulse opacity-60' : ''}`} />
                              </button>
                            </div>
                            <div className="p-6">
                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                <span className="text-sm">{property.location?.city}</span>
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
                                <span className="text-2xl font-bold text-blue-600">{property.price?.toLocaleString('fr-TN', { maximumFractionDigits: 0 })} TND</span>
                                <a href={`/properties/${property._id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                  Voir plus
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
