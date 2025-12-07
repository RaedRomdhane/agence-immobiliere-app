const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est requis']
  },
  rating: {
    type: Number,
    required: [true, 'La note est requise'],
    min: [1, 'La note doit être au minimum 1'],
    max: [5, 'La note doit être au maximum 5']
  },
  comment: {
    type: String,
    required: [true, 'Le commentaire est requis'],
    minlength: [10, 'Le commentaire doit contenir au moins 10 caractères'],
    maxlength: [1000, 'Le commentaire ne peut pas dépasser 1000 caractères']
  },
  // Legacy fields - kept for backward compatibility
  adminReply: {
    type: String,
    default: null,
    maxlength: [1000, 'La réponse ne peut pas dépasser 1000 caractères']
  },
  adminRepliedAt: {
    type: Date,
    default: null
  },
  // New conversation thread system
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorRole: {
      type: String,
      enum: ['admin', 'client'],
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'La réponse ne peut pas dépasser 1000 caractères']
    },
    parentReplyId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null // null means it's a direct reply to the main review
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isApproved: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances
reviewSchema.index({ user: 1 });
reviewSchema.index({ isApproved: 1, isPublished: 1 });
reviewSchema.index({ createdAt: -1 });

// Un utilisateur ne peut laisser qu'un seul avis
reviewSchema.index({ user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
