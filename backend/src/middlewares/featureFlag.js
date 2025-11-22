const FeatureFlagService = require('../services/featureFlagService');
const { ApiError } = require('../utils');

/**
 * Middleware to check if a feature flag is enabled for the current user
 * @param {string} flagKey - The feature flag key to check
 * @returns {Function} Express middleware
 */
const requireFeatureFlag = (flagKey) => {
  return async (req, res, next) => {
    try {
      const user = req.user; // Assumes auth middleware has already run
      
      const isEnabled = await FeatureFlagService.isEnabled(flagKey, user);
      
      if (!isEnabled) {
        throw ApiError.forbidden(
          `This feature is not available. Feature flag '${flagKey}' is disabled.`
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to attach feature flags to request object
 * Evaluates all flags for the current user
 */
const attachFeatureFlags = async (req, res, next) => {
  try {
    const user = req.user;
    
    if (user) {
      req.featureFlags = await FeatureFlagService.getAllFlagsForUser(user);
    } else {
      req.featureFlags = {};
    }
    
    next();
  } catch (error) {
    // Don't block the request if feature flags fail to load
    console.error('Error loading feature flags:', error);
    req.featureFlags = {};
    next();
  }
};

/**
 * Helper to check if a flag is enabled in route handlers
 * @param {Request} req - Express request object
 * @param {string} flagKey - Feature flag key
 * @returns {boolean}
 */
const isFlagEnabled = (req, flagKey) => {
  return req.featureFlags && req.featureFlags[flagKey] === true;
};

module.exports = {
  requireFeatureFlag,
  attachFeatureFlags,
  isFlagEnabled,
};
