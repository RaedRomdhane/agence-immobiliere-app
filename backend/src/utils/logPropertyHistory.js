// Usage: Call this function after updating a property to log the change
const PropertyHistory = require('../models/PropertyHistory');

/**
 * Log property update history
 * @param {Object} params
 * @param {string} params.propertyId
 * @param {string} params.changedBy
 * @param {Object} params.changes
 */
async function logPropertyHistory({ propertyId, changedBy, changes }) {
  try {
    await PropertyHistory.create({
      propertyId,
      changedBy,
      changes,
      changedAt: new Date(),
    });
  } catch (err) {
    console.error('Erreur enregistrement historique bien:', err);
  }
}

module.exports = { logPropertyHistory };
