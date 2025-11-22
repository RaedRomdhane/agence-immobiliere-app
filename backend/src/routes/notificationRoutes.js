const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middlewares/auth');

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for the logged-in user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('property', 'title');
    res.json({ success: true, data: notifications });
  } catch (err) {
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
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification non trouvée' });
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour notification', error: err.message });
  }
});

module.exports = router;
