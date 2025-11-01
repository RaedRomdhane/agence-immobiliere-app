const { body } = require('express-validator');

/**
 * Validateurs pour les routes d'authentification
 */

/**
 * Validation pour l'inscription
 */
const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Le prénom ne peut contenir que des lettres, espaces, apostrophes et tirets'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('L\'email doit être valide')
    .normalizeEmail()
    .toLowerCase(),

  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('La confirmation du mot de passe est requise')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^(\+216|00216)?[2-9]\d{7}$/)
    .withMessage('Le numéro de téléphone doit être au format tunisien (+216XXXXXXXX ou XXXXXXXX)'),

  body('role')
    .optional()
    .isIn(['client', 'admin'])
    .withMessage('Le rôle doit être "client" ou "admin"'),
];

/**
 * Validation pour la connexion
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('L\'email doit être valide')
    .normalizeEmail()
    .toLowerCase(),

  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis'),
];

/**
 * Validation pour la demande de réinitialisation de mot de passe
 */
const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('L\'email doit être valide')
    .normalizeEmail()
    .toLowerCase(),
];

/**
 * Validation pour la réinitialisation de mot de passe
 */
const resetPasswordValidation = [
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('La confirmation du mot de passe est requise')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    }),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
