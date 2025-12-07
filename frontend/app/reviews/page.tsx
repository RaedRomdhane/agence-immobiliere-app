'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Star, Send, Edit2, Trash2, CheckCircle, Clock, AlertCircle, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '@/lib/api/client';
import { useRouter } from 'next/navigation';

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
  parentReplyId?: string | null;
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
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

export default function ReviewsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [replyingToReview, setReplyingToReview] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [parentReplyId, setParentReplyId] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // Calculate indentation level for a reply based on its parent hierarchy
  const getReplyLevel = (reply: Reply, allReplies: Reply[]): number => {
    if (!reply.parentReplyId) return 0; // Direct reply to review
    
    let level = 1;
    let currentParentId = reply.parentReplyId;
    
    // Traverse up the parent chain
    while (currentParentId && level < 3) { // Max 3 levels deep
      const parent = allReplies.find(r => r._id === currentParentId);
      if (!parent || !parent.parentReplyId) break;
      currentParentId = parent.parentReplyId;
      level++;
    }
    
    return level;
  };

  // Get direct children of a reply
  const getChildReplies = (parentId: string, allReplies: Reply[]): Reply[] => {
    return allReplies.filter(r => r.parentReplyId === parentId);
  };

  // Count all descendants (children, grandchildren, etc.)
  const countDescendants = (parentId: string, allReplies: Reply[]): number => {
    const children = getChildReplies(parentId, allReplies);
    let count = children.length;
    children.forEach(child => {
      count += countDescendants(child._id, allReplies);
    });
    return count;
  };

  // Toggle reply visibility
  const toggleReplyExpansion = (replyId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(replyId)) {
        newSet.delete(replyId);
      } else {
        newSet.add(replyId);
      }
      return newSet;
    });
  };

  // Check if a reply should be visible based on parent expansion state
  const isReplyVisible = (reply: Reply, allReplies: Reply[]): boolean => {
    if (!reply.parentReplyId) return true; // Top-level replies always visible
    
    // Check if ALL ancestors in the chain are expanded
    let currentParentId: string | null | undefined = reply.parentReplyId;
    while (currentParentId) {
      if (!expandedReplies.has(currentParentId)) {
        return false; // If any ancestor is not expanded, hide this reply
      }
      const parent = allReplies.find(r => r._id === currentParentId);
      if (!parent) break;
      currentParentId = parent.parentReplyId;
    }
    
    return true; // All ancestors are expanded
  };

  // Sort replies in tree order: parent followed immediately by its children
  const sortRepliesInTreeOrder = (replies: Reply[]): Reply[] => {
    const result: Reply[] = [];
    const processed = new Set<string>();

    const addReplyAndChildren = (reply: Reply) => {
      if (processed.has(reply._id)) return;
      
      result.push(reply);
      processed.add(reply._id);

      // Get children and sort them by creation date
      const children = replies
        .filter(r => r.parentReplyId === reply._id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // Recursively add each child and their descendants
      children.forEach(child => addReplyAndChildren(child));
    };

    // Start with top-level replies (those without a parent), sorted by creation date
    const topLevel = replies
      .filter(r => !r.parentReplyId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    topLevel.forEach(reply => addReplyAndChildren(reply));

    return result;
  };

  useEffect(() => {
    fetchReviews();
    if (user) {
      fetchMyReview();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const res = await apiClient.get('/reviews');
      setReviews(res.data.data);
      setStats(res.data.stats);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReview = async () => {
    try {
      const res = await apiClient.get('/reviews/my-review');
      if (res.data.data) {
        setMyReview(res.data.data);
        setRating(res.data.data.rating);
        setComment(res.data.data.comment);
      }
    } catch (error: any) {
      console.error('Error fetching my review:', error);
    }
  };

  const handleReplyToReview = async (reviewId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour répondre');
      router.push('/login');
      return;
    }

    if (!replyText.trim()) {
      toast.error('Veuillez saisir une réponse');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post(`/reviews/${reviewId}/reply`, {
        message: replyText,
        parentReplyId: parentReplyId
      });

      // Update both reviews list and myReview if applicable
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === reviewId ? res.data.data : review
        )
      );

      if (myReview?._id === reviewId) {
        setMyReview(res.data.data);
      }

      toast.success('Réponse publiée avec succès');
      setReplyText('');
      setReplyingToReview(null);
      setParentReplyId(null);
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

      // Update both reviews list and myReview if applicable
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === reviewId ? res.data.data : review
        )
      );

      if (myReview?._id === reviewId) {
        setMyReview(res.data.data);
      }

      toast.success('Réponse modifiée avec succès');
      setReplyText('');
      setEditingReplyId(null);
      setReplyingToReview(null);
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
      
      // Update both reviews list and myReview if applicable
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review._id === reviewId ? res.data.data : review
        )
      );

      if (myReview?._id === reviewId) {
        setMyReview(res.data.data);
      }
      
      toast.success(res.data.message || 'Réponse supprimée avec succès');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Vous devez être connecté pour laisser un avis');
      router.push('/login');
      return;
    }

    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Le commentaire doit contenir au moins 10 caractères');
      return;
    }

    setSubmitting(true);

    try {
      if (isEditing && myReview) {
        // Update existing review
        const res = await apiClient.put(`/reviews/${myReview._id}`, {
          rating,
          comment
        });
        toast.success(res.data.message);
        setMyReview(res.data.data);
        setIsEditing(false);
      } else {
        // Create new review
        const res = await apiClient.post('/reviews', {
          rating,
          comment
        });
        toast.success(res.data.message);
        setMyReview(res.data.data);
      }
      
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la soumission de l\'avis');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!myReview) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer votre avis ?')) {
      return;
    }

    try {
      await apiClient.delete(`/reviews/${myReview._id}`);
      toast.success('Votre avis a été supprimé');
      setMyReview(null);
      setRating(0);
      setComment('');
      setIsEditing(false);
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const renderStars = (currentRating: number, interactive = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`h-8 w-8 ${
                star <= (interactive ? (hoveredRating || rating) : currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderRatingBar = (stars: number, count: number) => {
    const percentage = stats ? (count / stats.totalReviews) * 100 : 0;
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium w-12">{stars} ★</span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
      </div>
    );
  };

  if (authLoading || loading) {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-32 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Avis des clients
          </h1>
          <p className="text-lg text-gray-600">
            Partagez votre expérience et aidez-nous à nous améliorer
          </p>
        </div>

        {/* Statistics Section */}
        {stats && stats.totalReviews > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Average Rating */}
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

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star}>
                    {renderRatingBar(star, stats.ratingDistribution[star] || 0)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {user && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {myReview && !isEditing ? 'Votre avis' : isEditing ? 'Modifier votre avis' : 'Laisser un avis'}
            </h2>

            {myReview && !isEditing ? (
              <div className="border-l-4 border-blue-500 pl-4 py-2 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {renderStars(myReview.rating)}
                    {!myReview.isApproved && (
                      <span className="flex items-center text-orange-600 text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        En attente de validation
                      </span>
                    )}
                    {myReview.isApproved && (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Publié
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEdit}
                      className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700">{myReview.comment}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Posté le {new Date(myReview.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating Stars */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note *
                  </label>
                  {renderStars(rating, true)}
                  {rating > 0 && (
                    <p className="text-sm text-gray-600 mt-2">
                      {rating === 5 && 'Excellent !'}
                      {rating === 4 && 'Très bien'}
                      {rating === 3 && 'Bien'}
                      {rating === 2 && 'Moyen'}
                      {rating === 1 && 'Mauvais'}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Votre commentaire * (10-1000 caractères)
                  </label>
                  <textarea
                    id="comment"
                    rows={6}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Partagez votre expérience avec notre agence..."
                    maxLength={1000}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {comment.length} / 1000 caractères
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={submitting || rating === 0 || comment.trim().length < 10}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-5 w-5" />
                    <span>{submitting ? 'Envoi...' : isEditing ? 'Mettre à jour' : 'Envoyer'}</span>
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  )}
                </div>

                <div className="flex items-start space-x-2 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p>
                    Votre avis sera vérifié par notre équipe avant d'être publié. Merci de rester respectueux et constructif.
                  </p>
                </div>
              </form>
            )}
          </div>
        )}

        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8 text-center">
            <p className="text-lg text-gray-700 mb-4">
              Connectez-vous pour laisser un avis
            </p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </button>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Tous les avis ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <p className="text-gray-600 text-lg">
                Aucun avis pour le moment. Soyez le premier à partager votre expérience !
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
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
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {review.user.firstName} {review.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    
                    {/* Reply button for the main review */}
                    {user && replyingToReview !== review._id && (
                      <button
                        onClick={() => {
                          setReplyingToReview(review._id);
                          setEditingReplyId(null);
                          setReplyText('');
                          setParentReplyId(null); // Direct reply to review
                        }}
                        className="mt-3 text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Répondre</span>
                      </button>
                    )}
                    
                    {/* Conversation Thread */}
                    {review.replies && review.replies.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {sortRepliesInTreeOrder(review.replies)
                          .filter(reply => isReplyVisible(reply, review.replies))
                          .map((reply, index) => {
                          const level = getReplyLevel(reply, review.replies);
                          const marginLeft = level * 24; // 24px per level
                          const childCount = countDescendants(reply._id, review.replies);
                          const isExpanded = expandedReplies.has(reply._id);
                          
                          return (
                          <div
                            key={reply._id}
                            className={`p-4 rounded-lg border-l-4 ${
                              reply.authorRole === 'admin'
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-gray-50 border-gray-400'
                            }`}
                            style={{ marginLeft: `${marginLeft}px` }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-semibold text-gray-900">
                                  {reply.authorRole === 'admin'
                                    ? 'Réponse de l\'équipe'
                                    : user && user.id === reply.author._id
                                    ? 'Votre réponse'
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
                              {user && user.id === reply.author._id && (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => {
                                      setReplyingToReview(review._id);
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
                            <div className="flex items-center space-x-3">
                              {user && (
                                <button
                                  onClick={() => {
                                    setReplyingToReview(review._id);
                                    setEditingReplyId(null);
                                    setReplyText('');
                                    setParentReplyId(reply._id); // Reply to this specific reply
                                  }}
                                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                  <span>Répondre</span>
                                </button>
                              )}
                              {childCount > 0 && (
                                <button
                                  onClick={() => toggleReplyExpansion(reply._id)}
                                  className="text-gray-600 hover:text-gray-800 text-sm flex items-center space-x-1"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="h-3 w-3" />
                                      <span>Masquer {childCount} réponse{childCount > 1 ? 's' : ''}</span>
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-3 w-3" />
                                      <span>Voir {childCount} réponse{childCount > 1 ? 's' : ''}</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Reply Form for authenticated users */}
                    {user && replyingToReview === review._id && (
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
                                setReplyingToReview(null);
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
                                  handleReplyToReview(review._id);
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
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
