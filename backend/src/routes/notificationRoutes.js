const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middlewares/auth');
/**
 * @route   GET /api/notifications/admin
 * @desc    Get all notifications for admin users (admin only)
 * @access  Private/Admin
 */
const User = require('../models/User');
router.get('/admin', protect, async (req, res) => {
  try {
    // Only allow admin users
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès refusé. Privilèges administrateur requis.' });
    }
    // Fetch notifications for all admins (current user)
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ read: 1, createdAt: -1 })
      .populate('property', 'title');
    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error('[ERROR] /api/notifications/admin:', err);
    res.status(500).json({ success: false, message: 'Erreur récupération notifications admin', error: err.message });
  }
});



/**
 * @route   GET /api/notifications
 * @desc    Get notifications for the logged-in user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    console.log('[DEBUG] /api/notifications req.user:', req.user);
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('property', 'title');
    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error('[ERROR] /api/notifications:', err);
    res.status(500).json({ success: false, message: 'Erreur récupération notifications', error: err.message });
  }
});

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification non trouvée' });
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour notification', error: err.message });
  }
});

/**
 * @route   PATCH /api/notifications/mark-all-read
 * @desc    Mark all notifications as read for the current user
 * @access  Private
 */
router.patch('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour notifications', error: err.message });
  }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get count of unread notifications for the current user
 * @access  Private
 */
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur comptage notifications', error: err.message });
  }
});

module.exports = router;
