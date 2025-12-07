const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/auth');
const {
  createReview,
  getReviews,
  getMyReview,
  updateReview,
  deleteReview,
  getAllReviewsAdmin,
  approveReview,
  replyToReview,
  addReplyToReview,
  updateReplyInReview,
  deleteReplyFromReview,
  deleteReviewAdmin
} = require('../controllers/reviewController');

// Public routes
router.get('/', getReviews);

// Protected routes (authenticated users)
router.post('/', protect, createReview);
router.get('/my-review', protect, getMyReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Conversation thread routes (authenticated users - admin or review owner)
router.post('/:id/reply', protect, addReplyToReview);
router.put('/:reviewId/reply/:replyId', protect, updateReplyInReview);
router.delete('/:reviewId/reply/:replyId', protect, deleteReplyFromReview);

// Admin routes
router.get('/admin/all', protect, restrictTo('admin'), getAllReviewsAdmin);
router.put('/admin/:id/approve', protect, restrictTo('admin'), approveReview);
router.put('/admin/:id/reply', protect, restrictTo('admin'), replyToReview); // Legacy route for backward compatibility
router.delete('/admin/:id', protect, restrictTo('admin'), deleteReviewAdmin);

module.exports = router;
