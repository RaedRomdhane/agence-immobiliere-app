const Review = require('../models/Review');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { dispatchAdminNotification, notifyUser } = require('../utils/notificationUtils');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (authenticated users)
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await Review.findOne({ user: req.user._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà laissé un avis. Vous pouvez le modifier depuis votre profil.'
      });
    }

    // Créer l'avis (approuvé automatiquement)
    const review = await Review.create({
      user: req.user._id,
      rating,
      comment,
      isApproved: true  // Approbation automatique
    });

    // Peupler les informations utilisateur
    await review.populate('user', 'firstName lastName avatar');

    // Create notifications for admins (DB + WS)
    await dispatchAdminNotification(`${req.user.firstName} ${req.user.lastName} a laissé un avis avec ${rating} étoiles`, 'review', review._id);

    res.status(201).json({
      success: true,
      message: 'Votre avis a été publié avec succès !',
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création de l\'avis'
    });
  }
};

// @desc    Get all approved reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const reviews = await Review.find({ isApproved: true, isPublished: true })
      .populate('user', 'firstName lastName avatar')
      .populate('replies.author', 'firstName lastName avatar role')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Review.countDocuments({ isApproved: true, isPublished: true });

    // Calculer les statistiques
    const stats = await Review.aggregate([
      { $match: { isApproved: true, isPublished: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Calculer la distribution des notes
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (stats.length > 0) {
      stats[0].ratings.forEach(rating => {
        ratingDistribution[rating]++;
      });
    }

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      },
      stats: stats.length > 0 ? {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
        ratingDistribution
      } : {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis'
    });
  }
};

// @desc    Get user's own review
// @route   GET /api/reviews/my-review
// @access  Private
exports.getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName avatar')
      .populate('replies.author', 'firstName lastName avatar role');

    if (!review) {
      return res.json({
        success: true,
        data: null,
        message: 'Vous n\'avez pas encore laissé d\'avis'
      });
    }

    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching user review:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de votre avis'
    });
  }
};

// @desc    Update user's review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire de l'avis
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cet avis'
      });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.isApproved = true; // Garder l'approbation automatique après modification

    await review.save();
    await review.populate('user', 'firstName lastName avatar');

    // Create notifications for admins (DB + WS)
    await dispatchAdminNotification(`${req.user.firstName} ${req.user.lastName} a modifié son avis`, 'review', review._id);

    res.json({
      success: true,
      message: 'Votre avis a été modifié avec succès !',
      data: review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'avis'
    });
  }
};

// @desc    Delete user's review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le propriétaire de l'avis
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cet avis'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Votre avis a été supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'avis'
    });
  }
};

// ============================================
// ADMIN ROUTES
// ============================================

// @desc    Get all reviews (including pending)
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
exports.getAllReviewsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query;

    let filter = {};
    if (status === 'pending') {
      filter.isApproved = false;
    } else if (status === 'approved') {
      filter.isApproved = true;
    }

    const reviews = await Review.find(filter)
      .populate('user', 'firstName lastName email avatar')
      .populate('replies.author', 'firstName lastName avatar role')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(filter);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis'
    });
  }
};

// @desc    Approve/reject review
// @route   PUT /api/reviews/admin/:id/approve
// @access  Private/Admin
exports.approveReview = async (req, res) => {
  try {
    const { isApproved } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    review.isApproved = isApproved;
    await review.save();

    res.json({
      success: true,
      message: isApproved ? 'Avis approuvé avec succès' : 'Avis rejeté',
      data: review
    });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation de l\'avis'
    });
  }
};

// @desc    Reply to review (admin or user)
// @route   POST /api/reviews/:id/reply
// @access  Private
exports.addReplyToReview = async (req, res) => {
  try {
    const { message, parentReplyId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La réponse ne peut pas être vide'
      });
    }

    const review = await Review.findById(req.params.id).populate('user', 'firstName lastName');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isReviewOwner = review.user._id.toString() === req.user._id.toString();

    // All authenticated users can reply to reviews
    // (Authorization check removed - any logged-in user can participate in conversation)

    // Add reply to conversation thread
    review.replies.push({
      author: req.user._id,
      authorRole: req.user.role,
      message: message.trim(),
      parentReplyId: parentReplyId || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Update legacy fields for backward compatibility
    if (isAdmin) {
      review.adminReply = message.trim();
      review.adminRepliedAt = new Date();
    }

    await review.save();

    // Send notifications
    try {
      if (isAdmin) {
        // Admin replied → notify review owner
        await notifyUser(review.user._id, `L'équipe ImmoExpress a répondu à votre avis`, 'review', review._id);
      } else {
        // User replied → notify all admins
        await dispatchAdminNotification(`${review.user.firstName} ${review.user.lastName} a répondu à votre message sur son avis`, 'review', review._id);
      }
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    await review.populate('replies.author', 'firstName lastName avatar role');

    res.json({
      success: true,
      message: 'Réponse publiée avec succès',
      data: review
    });
  } catch (error) {
    console.error('Error adding reply to review:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la publication de la réponse'
    });
  }
};

// @desc    Update a reply in review conversation
// @route   PUT /api/reviews/:reviewId/reply/:replyId
// @access  Private
exports.updateReplyInReview = async (req, res) => {
  try {
    const { message } = req.body;
    const { reviewId, replyId } = req.params;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La réponse ne peut pas être vide'
      });
    }

    const review = await Review.findById(reviewId).populate('user', 'firstName lastName');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    const reply = review.replies.id(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'Réponse non trouvée'
      });
    }

    // Only the reply author can update it
    if (reply.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette réponse'
      });
    }

    const isAdmin = req.user.role === 'admin';

    // Update reply
    reply.message = message.trim();
    reply.updatedAt = new Date();

    // Update legacy field if it's admin's last reply
    if (isAdmin && review.replies[review.replies.length - 1]._id.toString() === replyId) {
      review.adminReply = message.trim();
      review.adminRepliedAt = new Date();
    }

    await review.save();

    // Send notification about modification
    try {
      if (isAdmin) {
        // Admin modified reply → notify review owner
        await notifyUser(review.user._id, `L'équipe ImmoExpress a modifié sa réponse à votre avis`, 'review', review._id);
      } else {
        // User modified reply → notify admins
        await dispatchAdminNotification(`${review.user.firstName} ${review.user.lastName} a modifié sa réponse sur son avis`, 'review', review._id);
      }
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    await review.populate('replies.author', 'firstName lastName avatar role');

    res.json({
      success: true,
      message: 'Réponse modifiée avec succès',
      data: review
    });
  } catch (error) {
    console.error('Error updating reply:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la réponse'
    });
  }
};

// @desc    Delete a reply from review conversation (cascading delete)
// @route   DELETE /api/reviews/:reviewId/reply/:replyId
// @access  Private
exports.deleteReplyFromReview = async (req, res) => {
  try {
    const { reviewId, replyId } = req.params;

    const review = await Review.findById(reviewId).populate('user', 'firstName lastName');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    const replyIndex = review.replies.findIndex(r => r._id.toString() === replyId);

    if (replyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Réponse non trouvée'
      });
    }

    const reply = review.replies[replyIndex];

    // Only the reply author or admin can delete it
    const isAdmin = req.user.role === 'admin';
    const isReplyAuthor = reply.author.toString() === req.user._id.toString();

    if (!isAdmin && !isReplyAuthor) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cette réponse'
      });
    }

    // Cascading delete: Remove this reply and all subsequent replies
    const repliesToDelete = review.replies.slice(replyIndex);
    const deletedCount = repliesToDelete.length;
    
    // Remove all replies from this index onwards
    review.replies = review.replies.slice(0, replyIndex);

    // Update legacy field - find last remaining admin reply
    const lastAdminReply = [...review.replies]
      .reverse()
      .find(r => r.authorRole === 'admin');
    
    if (lastAdminReply) {
      review.adminReply = lastAdminReply.message;
      review.adminRepliedAt = lastAdminReply.createdAt;
    } else {
      review.adminReply = undefined;
      review.adminRepliedAt = undefined;
    }

    await review.save();

    // Send notification about deletion
    try {
      if (reply.authorRole === 'admin') {
        // Admin deleted their reply → notify review owner
        const message = deletedCount > 1 
          ? `L'équipe ImmoExpress a supprimé sa réponse et ${deletedCount - 1} réponse(s) suivante(s)`
          : `L'équipe ImmoExpress a supprimé sa réponse à votre avis`;
        await notifyUser(review.user._id, message, 'review', review._id);
      } else {
        // User deleted their reply → notify admins
        const message = deletedCount > 1
          ? `${review.user.firstName} ${review.user.lastName} a supprimé sa réponse et ${deletedCount - 1} réponse(s) suivante(s)`
          : `${review.user.firstName} ${review.user.lastName} a supprimé sa réponse sur son avis`;
        await dispatchAdminNotification(message, 'review', review._id);
      }
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    await review.populate('replies.author', 'firstName lastName avatar role');

    res.json({
      success: true,
      message: deletedCount > 1 
        ? `${deletedCount} réponses supprimées avec succès`
        : 'Réponse supprimée avec succès',
      data: review
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la réponse'
    });
  }
};

// @desc    Legacy: Reply to review (admin) - Kept for backward compatibility
// @route   PUT /api/reviews/admin/:id/reply
// @access  Private/Admin
exports.replyToReview = async (req, res) => {
  // Redirect to new addReplyToReview function
  return exports.addReplyToReview(req, res);
};

// @desc    Delete review (admin)
// @route   DELETE /api/reviews/admin/:id
// @access  Private/Admin
exports.deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Avis non trouvé'
      });
    }

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Avis supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'avis'
    });
  }
};
