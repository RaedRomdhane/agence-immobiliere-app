'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Star, Send, Trash2, MessageSquare, Edit2 } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '@/lib/api/client';

interface Reply {
  _id: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
  authorRole: 'admin' | 'client';
  message: string;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  replies: Reply[];
  adminReply?: string;
  adminRepliedAt?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminReviewsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
  } | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
      return;
    }
    if (user && user.role === 'admin') {
      fetchReviews();
    }
  }, [user, isLoading, router]);

  const fetchReviews = async () => {
    try {
      const res = await apiClient.get('/reviews/admin/all');
      setReviews(res.data.data);
      
      // Calculate statistics
      const reviewsData = res.data.data;
      if (reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum: number, r: Review) => sum + r.rating, 0);
        const avgRating = totalRating / reviewsData.length;
        
        const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviewsData.forEach((r: Review) => {
          distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });
        
        setStats({
          totalReviews: reviewsData.length,
          averageRating: avgRating,
          ratingDistribution: distribution
        });
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast.error('Erreur lors du chargement des avis');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error('Veuillez saisir une réponse');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post(`/reviews/${reviewId}/reply`, {
        message: replyText
      });
      
      // Update the review with new data from server
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === reviewId ? res.data.data : review
        )
      );
      
      toast.success('Réponse publiée avec succès');
      setReplyText('');
      setReplyingTo(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la publication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReply = async (reviewId: string, replyId: string) => {
    if (!replyText.trim()) {
      toast.error('Veuillez saisir une réponse');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.put(`/reviews/${reviewId}/reply/${replyId}`, {
        message: replyText
      });
      
      // Update the review with new data from server
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === reviewId ? res.data.data : review
        )
      );
      
      toast.success('Réponse modifiée avec succès');
      setReplyText('');
      setEditingReplyId(null);
      setReplyingTo(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (reviewId: string, replyId: string) => {
    const review = reviews.find(r => r._id === reviewId);
    if (!review) return;

    const replyIndex = review.replies.findIndex(r => r._id === replyId);
    const subsequentReplies = review.replies.length - replyIndex - 1;
    
    const confirmMessage = subsequentReplies > 0
      ? `Êtes-vous sûr de vouloir supprimer cette réponse ?\n\nAttention : ${subsequentReplies} réponse(s) suivante(s) sera/seront également supprimée(s).`
      : 'Êtes-vous sûr de vouloir supprimer cette réponse ?';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const res = await apiClient.delete(`/reviews/${reviewId}/reply/${replyId}`);
      
      // Update the review with new data from server
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === reviewId ? res.data.data : review
        )
      );
      
      toast.success(res.data.message || 'Réponse supprimée avec succès');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    try {
      await apiClient.delete(`/reviews/admin/${reviewId}`);
      toast.success('Avis supprimé avec succès');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading || loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Avis</h1>
            <p className="text-gray-600 mt-2">
              {reviews.length} avis au total
            </p>
          </div>

          {/* Statistics Section */}
          {stats && stats.totalReviews > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-900 mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
                <p className="text-gray-600">
                  Basé sur {stats.totalReviews} avis
                </p>
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <p className="text-gray-600 text-lg">
                Aucun avis pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {review.user.avatar ? (
                        <img
                          src={review.user.avatar}
                          alt={`${review.user.firstName} ${review.user.lastName}`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {review.user.firstName[0]}{review.user.lastName[0]}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {review.user.firstName} {review.user.lastName}
                            </h3>
                            <div className="flex items-center space-x-1">
                              {renderStars(review.rating)}
                              <span className="text-sm font-medium text-gray-700 ml-2">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                      {/* Conversation Thread */}
                      {review.replies && review.replies.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {review.replies.map((reply, index) => (
                            <div
                              key={reply._id}
                              className={`p-4 rounded-lg border-l-4 ${
                                reply.authorRole === 'admin'
                                  ? 'bg-blue-50 border-blue-500'
                                  : 'bg-gray-50 border-gray-400'
                              }`}
                              style={{ marginLeft: `${Math.min(index * 24, 72)}px` }}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <MessageSquare className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm font-semibold text-gray-900">
                                    {reply.authorRole === 'admin'
                                      ? 'Réponse de l\'équipe'
                                      : `${reply.author.firstName} ${reply.author.lastName}`}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(reply.createdAt).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  {reply.createdAt !== reply.updatedAt && (
                                    <span className="text-xs text-gray-400 italic">(modifié)</span>
                                  )}
                              </div>
                              {reply.authorRole === 'admin' && user?.id === reply.author._id && (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => {
                                      setReplyingTo(review._id);
                                      setEditingReplyId(reply._id);
                                      setReplyText(reply.message);
                                    }}
                                    className="text-gray-500 hover:text-blue-600 text-sm flex items-center space-x-1"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                    <span>Modifier</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReply(review._id, reply._id)}
                                    className="text-gray-500 hover:text-red-600 text-sm flex items-center space-x-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Supprimer</span>
                                  </button>
                                </div>
                              )}
                              </div>
                              <p className="text-gray-700 mb-3">{reply.message}</p>
                              <button
                                onClick={() => {
                                  setReplyingTo(review._id);
                                  setEditingReplyId(null);
                                  setReplyText('');
                                }}
                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                              >
                                <MessageSquare className="h-3 w-3" />
                                <span>Répondre</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Form */}
                      {replyingTo === review._id ? (
                        <div className="mt-4 space-y-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Écrivez votre réponse..."
                            maxLength={1000}
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {replyText.length} / 1000 caractères
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setEditingReplyId(null);
                                  setReplyText('');
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={() => {
                                  if (editingReplyId) {
                                    handleEditReply(review._id, editingReplyId);
                                  } else {
                                    handleReply(review._id);
                                  }
                                }}
                                disabled={submitting || !replyText.trim()}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                              >
                                <Send className="h-4 w-4" />
                                <span>{submitting ? 'Envoi...' : editingReplyId ? 'Modifier' : 'Envoyer'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setReplyingTo(review._id);
                            setEditingReplyId(null);
                            setReplyText('');
                          }}
                          className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Répondre</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
