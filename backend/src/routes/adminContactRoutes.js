const express = require('express');
const adminContactController = require('../controllers/adminContactController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

// All routes require admin authentication
router.use(protect, restrictTo('admin'));

router.get('/messages', adminContactController.getAllMessages);
router.get('/messages/:id', adminContactController.getMessageById);
router.post('/messages/:id/reply', adminContactController.replyToMessage);

module.exports = router;
