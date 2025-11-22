const FeatureFlagService = require('../services/featureFlagService');
const { ApiResponse, ApiError, asyncHandler } = require('../utils');

/**
 * @desc    Get all feature flags
 * @route   GET /api/feature-flags
 * @access  Admin
 */
const getAllFlags = asyncHandler(async (req, res) => {
  const flags = await FeatureFlagService.getAllFlags();
  
  res.status(200).json(ApiResponse.success('Feature flags retrieved successfully', flags));
});

/**
 * @desc    Get feature flags for current user
 * @route   GET /api/feature-flags/my-flags
 * @access  Private
 */
const getMyFlags = asyncHandler(async (req, res) => {
  const flags = await FeatureFlagService.getAllFlagsForUser(req.user);
  
  res.status(200).json(ApiResponse.success('Your feature flags retrieved successfully', flags));
});

/**
 * @desc    Get a specific feature flag
 * @route   GET /api/feature-flags/:key
 * @access  Admin
 */
const getFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlagService.getFlag(req.params.key);
  
  if (!flag) {
    throw ApiError.notFound('Feature flag not found');
  }
  
  res.status(200).json(ApiResponse.success('Feature flag retrieved successfully', flag));
});

/**
 * @desc    Create a new feature flag
 * @route   POST /api/feature-flags
 * @access  Admin
 */
const createFlag = asyncHandler(async (req, res) => {
  const { key, name, description, enabled, targeting } = req.body;
  
  const flag = await FeatureFlagService.createFlag(
    { key, name, description, enabled, targeting },
    req.user
  );
  
  res.status(201).json(ApiResponse.created('Feature flag created successfully', flag));
});

/**
 * @desc    Update a feature flag
 * @route   PUT /api/feature-flags/:key
 * @access  Admin
 */
const updateFlag = asyncHandler(async (req, res) => {
  const { name, description, enabled, targeting } = req.body;
  
  const flag = await FeatureFlagService.updateFlag(
    req.params.key,
    { name, description, enabled, targeting },
    req.user
  );
  
  res.status(200).json(ApiResponse.success('Feature flag updated successfully', flag));
});

/**
 * @desc    Toggle a feature flag on/off
 * @route   PATCH /api/feature-flags/:key/toggle
 * @access  Admin
 */
const toggleFlag = asyncHandler(async (req, res) => {
  const flag = await FeatureFlagService.toggleFlag(req.params.key, req.user);
  
  res.status(200).json(ApiResponse.success(
    `Feature flag ${flag.enabled ? 'enabled' : 'disabled'} successfully`,
    flag
  ));
});

/**
 * @desc    Delete a feature flag
 * @route   DELETE /api/feature-flags/:key
 * @access  Admin
 */
const deleteFlag = asyncHandler(async (req, res) => {
  await FeatureFlagService.deleteFlag(req.params.key);
  
  res.status(200).json(ApiResponse.success('Feature flag deleted successfully', null));
});

/**
 * @desc    Add users to whitelist
 * @route   POST /api/feature-flags/:key/whitelist
 * @access  Admin
 */
const addToWhitelist = asyncHandler(async (req, res) => {
  const { emails = [], userIds = [] } = req.body;
  
  const flag = await FeatureFlagService.addToWhitelist(
    req.params.key,
    emails,
    userIds,
    req.user
  );
  
  res.status(200).json(ApiResponse.success('Users added to whitelist successfully', flag));
});

/**
 * @desc    Remove users from whitelist
 * @route   DELETE /api/feature-flags/:key/whitelist
 * @access  Admin
 */
const removeFromWhitelist = asyncHandler(async (req, res) => {
  const { emails = [], userIds = [] } = req.body;
  
  const flag = await FeatureFlagService.removeFromWhitelist(
    req.params.key,
    emails,
    userIds,
    req.user
  );
  
  res.status(200).json(ApiResponse.success('Users removed from whitelist successfully', flag));
});

/**
 * @desc    Check if a flag is enabled for current user
 * @route   GET /api/feature-flags/:key/check
 * @access  Private
 */
const checkFlag = asyncHandler(async (req, res) => {
  const isEnabled = await FeatureFlagService.isEnabled(req.params.key, req.user);
  
  res.status(200).json(ApiResponse.success(
    'Feature flag checked successfully',
    { key: req.params.key, enabled: isEnabled }
  ));
});

module.exports = {
  getAllFlags,
  getMyFlags,
  getFlag,
  createFlag,
  updateFlag,
  toggleFlag,
  deleteFlag,
  addToWhitelist,
  removeFromWhitelist,
  checkFlag,
};
