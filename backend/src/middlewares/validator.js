/**
 * Middleware de validation avec express-validator
 */
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware pour valider les résultats de express-validator
 * Doit être placé après les règles de validation
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Formater les erreurs
    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    // Message d'erreur principal
    const message = 'Validation échouée';

    // Créer une erreur personnalisée avec les détails
    const error = ApiError.badRequest(message);
    error.errors = extractedErrors;

    return next(error);
  }

  next();
};

module.exports = validate;
