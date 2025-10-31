/**
 * Middleware de gestion centralisée des erreurs
 */
const ApiError = require('../utils/ApiError');

/**
 * Convertir les erreurs en ApiError
 * @param {Error} err - Erreur à convertir
 * @param {Object} req - Requête Express
 * @returns {ApiError}
 */
const convertToApiError = (err, req) => {
  let error = err;

  // Si ce n'est pas déjà une ApiError, la convertir
  if (!(error instanceof ApiError)) {
    // Erreur de validation Mongoose
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(', ');
      error = ApiError.badRequest(message);
    }
    // Erreur de cast Mongoose (ID invalide)
    else if (error.name === 'CastError') {
      error = ApiError.badRequest(`${error.path} invalide: ${error.value}`);
    }
    // Erreur de duplication Mongoose (clé unique)
    else if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      error = ApiError.conflict(`${field} déjà utilisé`);
    }
    // Erreur JWT invalide
    else if (error.name === 'JsonWebTokenError') {
      error = ApiError.unauthorized('Token invalide');
    }
    // Erreur JWT expiré
    else if (error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Token expiré');
    }
    // Erreur générique
    else {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Erreur interne du serveur';
      error = new ApiError(statusCode, message, false, err.stack);
    }
  }

  return error;
};

/**
 * Middleware de gestion d'erreurs (doit être le dernier middleware)
 */
const errorHandler = (err, req, res, next) => {
  const error = convertToApiError(err, req);

  // Log de l'erreur (en production, utiliser un logger comme Winston)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Erreur:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Préparer la réponse d'erreur
  const response = {
    success: false,
    error: {
      message: error.message,
      statusCode: error.statusCode,
    },
  };

  // Ajouter la stack trace en développement
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = error.stack;
  }

  // Envoyer la réponse
  res.status(error.statusCode).json(response);
};

/**
 * Middleware pour gérer les routes non trouvées (404)
 */
const notFound = (req, res, next) => {
  const error = ApiError.notFound(`Route non trouvée: ${req.originalUrl}`);
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
};
