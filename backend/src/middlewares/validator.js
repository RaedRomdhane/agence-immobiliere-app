const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware pour valider les résultats de express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    // Utiliser ApiError pour créer une erreur avec les détails
    const error = ApiError.badRequest('Validation échouée', formattedErrors);
    return next(error);
  }

  next();
};

module.exports = { validate };
