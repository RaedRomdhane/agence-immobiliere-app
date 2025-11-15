const express = require('express');
const router = express.Router();
const featureFlagController = require('../controllers/featureFlagController');
const { protect, restrictTo } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');
const { body, param } = require('express-validator');

// Validation rules
const createFlagValidation = [
  body('key')
    .trim()
    .notEmpty().withMessage('Flag key is required')
    .matches(/^[a-z0-9-_]+$/).withMessage('Flag key must contain only lowercase letters, numbers, hyphens, and underscores'),
  body('name')
    .trim()
    .notEmpty().withMessage('Flag name is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('Flag description is required'),
  body('enabled')
    .optional()
    .isBoolean().withMessage('Enabled must be a boolean'),
];

const updateFlagValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Flag name cannot be empty'),
  body('description')
    .optional()
    .trim()
    .notEmpty().withMessage('Flag description cannot be empty'),
  body('enabled')
    .optional()
    .isBoolean().withMessage('Enabled must be a boolean'),
];

const whitelistValidation = [
  body('emails')
    .optional()
    .isArray().withMessage('Emails must be an array'),
  body('emails.*')
    .optional()
    .isEmail().withMessage('Invalid email format'),
  body('userIds')
    .optional()
    .isArray().withMessage('UserIds must be an array'),
];

const keyParamValidation = [
  param('key')
    .trim()
    .notEmpty().withMessage('Flag key is required')
    .matches(/^[a-z0-9-_]+$/).withMessage('Invalid flag key format'),
];

// Public route - check if flag is enabled (requires auth)
router.get(
  '/:key/check',
  keyParamValidation,
  validate,
  protect,
  featureFlagController.checkFlag
);

// Get user's flags (requires auth)
router.get(
  '/my-flags',
  protect,
  featureFlagController.getMyFlags
);

// Admin routes (require admin role)
router.use(protect, restrictTo('admin'));

// CRUD operations
router.route('/')
  .get(featureFlagController.getAllFlags)
  .post(createFlagValidation, validate, featureFlagController.createFlag);

router.route('/:key')
  .get(keyParamValidation, validate, featureFlagController.getFlag)
  .put(keyParamValidation, updateFlagValidation, validate, featureFlagController.updateFlag)
  .delete(keyParamValidation, validate, featureFlagController.deleteFlag);

// Toggle flag
router.patch(
  '/:key/toggle',
  keyParamValidation,
  validate,
  featureFlagController.toggleFlag
);

// Whitelist management
router.post(
  '/:key/whitelist',
  keyParamValidation,
  whitelistValidation,
  validate,
  featureFlagController.addToWhitelist
);

router.delete(
  '/:key/whitelist',
  keyParamValidation,
  whitelistValidation,
  validate,
  featureFlagController.removeFromWhitelist
);

module.exports = router;
