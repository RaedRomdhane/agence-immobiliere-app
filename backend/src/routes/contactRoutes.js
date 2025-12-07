const express = require('express');
const contactController = require('../controllers/contactController');
const { protect } = require('../middlewares/auth');
const router = express.Router();
// GET /api/contact/unread-count - Get count of unread messages for the logged-in user
router.get('/unread-count', protect, contactController.getUnreadMessagesCount);
// POST /api/contact (authenticated only)
router.post('/', protect, contactController.sendContactMessage);
// GET /api/contact/my-messages
router.get('/my-messages', protect, contactController.getMyMessages);
// POST /api/contact/messages/:id/reply
router.post('/messages/:id/reply', protect, contactController.replyToMessage);

module.exports = router;
