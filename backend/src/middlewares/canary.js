const FeatureFlagService = require('../services/featureFlagService');

/**
 * Feature flag middleware to control canary deployments
 * Checks if a feature is enabled before allowing access
 */
const canaryFeatureFlag = (featureName) => {
  return async (req, res, next) => {
    try {
      const isEnabled = await FeatureFlagService.isEnabled(featureName, {
        userId: req.user?.id,
        environment: process.env.NODE_ENV,
        version: process.env.APP_VERSION,
        canary: process.env.CANARY_DEPLOYMENT === 'true'
      });

      if (!isEnabled) {
        return res.status(503).json({
          error: 'Feature not available',
          message: `Feature ${featureName} is currently disabled`,
          canaryStatus: 'disabled'
        });
      }

      // Add canary info to request
      req.canaryEnabled = true;
      req.featureName = featureName;
      next();
    } catch (error) {
      console.error('Feature flag check error:', error);
      // Fail open - allow request if flag service is down
      next();
    }
  };
};

/**
 * Canary traffic splitting middleware
 * Routes percentage of traffic to canary deployment
 */
const canaryTrafficSplit = (canaryPercentage = 10) => {
  return (req, res, next) => {
    // Check if this is a canary deployment
    const isCanary = process.env.CANARY_DEPLOYMENT === 'true';
    
    if (!isCanary) {
      return next();
    }

    // Generate random number 0-100
    const random = Math.random() * 100;
    
    // If random is greater than canary percentage, redirect to stable
    if (random > canaryPercentage) {
      // Set header to route to stable version
      res.setHeader('X-Canary-Routed', 'stable');
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'Please retry your request',
        canaryStatus: 'bypassed'
      });
    }

    // Mark as canary traffic
    req.isCanaryTraffic = true;
    res.setHeader('X-Canary-Routed', 'canary');
    res.setHeader('X-Canary-Version', process.env.APP_VERSION || 'unknown');
    next();
  };
};

/**
 * Canary metrics tracking middleware
 * Tracks canary-specific metrics for comparison
 */
const canaryMetrics = (req, res, next) => {
  if (req.isCanaryTraffic) {
    // Track canary request
    req.canaryRequestStart = Date.now();
    
    // Track response
    const originalSend = res.send;
    res.send = function(data) {
      const duration = Date.now() - req.canaryRequestStart;
      
      // Log canary metrics
      console.log('Canary Request:', {
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        duration,
        version: process.env.APP_VERSION,
        timestamp: new Date().toISOString()
      });

      return originalSend.call(this, data);
    };
  }
  
  next();
};

module.exports = {
  canaryFeatureFlag,
  canaryTrafficSplit,
  canaryMetrics
};
