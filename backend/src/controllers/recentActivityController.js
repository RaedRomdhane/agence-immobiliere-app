const Property = require('../models/Property');
const User = require('../models/User');
const PropertyHistory = require('../models/PropertyHistory');
const ContactMessage = require('../models/ContactMessage');

/**
 * @desc    Get recent activities for admin dashboard
 * @route   GET /api/admin/recent-activities
 * @access  Private/Admin
 */
exports.getRecentActivities = async (req, res) => {
  try {
    // Last 4 users
    const users = await User.find().sort({ createdAt: -1 }).limit(4).select('firstName lastName createdAt');
    // Last 4 properties
    const properties = await Property.find().sort({ createdAt: -1 }).limit(4).select('title createdAt');
    // Last 4 property changes
    const propertyChanges = await PropertyHistory.find().sort({ changedAt: -1 }).limit(4).populate('changedBy', 'firstName lastName').populate('propertyId', 'title');
    // Last 4 contact messages
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(4).select('subject createdAt');

    res.json({
      success: true,
      data: {
        users,
        properties,
        propertyChanges,
        messages
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des activités récentes', error: err.message });
  }
};
