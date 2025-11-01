/**
 * Règles de validation pour les utilisateurs
 */
const { body, param, query } = require('express-validator');

/**
 * Validation pour la création d'un utilisateur
 */
const createUserValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères'),

  body('phone')
    .optional()
    .trim()
    .matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/)
    .withMessage('Format de téléphone français invalide'),

  body('role')
    .optional()
    .isIn(['admin', 'client'])
    .withMessage('Le rôle doit être "admin" ou "client"'),

  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La rue ne peut pas dépasser 200 caractères'),

  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ville ne peut pas dépasser 100 caractères'),

  body('address.postalCode')
    .optional()
    .trim()
    .matches(/^\d{5}$/)
    .withMessage('Le code postal doit contenir 5 chiffres'),

  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le pays ne peut pas dépasser 100 caractères'),
];

/**
 * Validation pour la mise à jour d'un utilisateur
 */
const updateUserValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID utilisateur invalide'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/)
    .withMessage('Format de téléphone français invalide'),

  body('role')
    .optional()
    .isIn(['admin', 'client'])
    .withMessage('Le rôle doit être "admin" ou "client"'),

  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('La rue ne peut pas dépasser 200 caractères'),

  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La ville ne peut pas dépasser 100 caractères'),

  body('address.postalCode')
    .optional()
    .trim()
    .matches(/^\d{5}$/)
    .withMessage('Le code postal doit contenir 5 chiffres'),

  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le pays ne peut pas dépasser 100 caractères'),
];

/**
 * Validation pour récupérer un utilisateur par ID
 */
const getUserByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID utilisateur invalide'),
];

/**
 * Validation pour la suppression
 */
const deleteUserValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID utilisateur invalide'),
];

/**
 * Validation pour les query params de pagination
 */
const getAllUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un nombre entier positif'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),

  query('sort')
    .optional()
    .isString()
    .withMessage('Le tri doit être une chaîne'),

  query('role')
    .optional()
    .isIn(['admin', 'client'])
    .withMessage('Le rôle doit être "admin" ou "client"'),

  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen'),

  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('La recherche doit contenir entre 1 et 100 caractères'),
];

/**
 * Validation pour changer le statut
 */
const toggleStatusValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID utilisateur invalide'),

  body('isActive')
    .isBoolean()
    .withMessage('isActive doit être un booléen'),
];

/**
 * Validation pour changer le rôle
 */
const changeRoleValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID utilisateur invalide'),

  body('role')
    .notEmpty()
    .withMessage('Le rôle est requis')
    .isIn(['admin', 'client'])
    .withMessage('Le rôle doit être "admin" ou "client"'),
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  getUserByIdValidation,
  deleteUserValidation,
  getAllUsersValidation,
  toggleStatusValidation,
  changeRoleValidation,
};
