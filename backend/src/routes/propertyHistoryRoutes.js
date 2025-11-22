const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middlewares/auth');
const propertyHistoryController = require('../controllers/propertyHistoryController');

// GET /api/properties/:id/history (admin only)
router.get(
  '/:id/history',
  protect,
  restrictTo('admin'),
  propertyHistoryController.getPropertyHistory
);

module.exports = router;
