const PropertyHistory = require('../models/PropertyHistory');

/**
 * @desc    Get modification history for a property
 * @route   GET /api/properties/:id/history
 * @access  Private/Admin
 */
exports.getPropertyHistory = async (req, res) => {
  try {
    const history = await PropertyHistory.find({ propertyId: req.params.id })
      .populate('changedBy', 'firstName lastName email')
      .sort({ changedAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur récupération historique', error: error.message });
  }
};
