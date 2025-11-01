const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Convertit les erreurs Mongoose/JWT en ApiError
 */
const convertToApiError = (err) => {
  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.badRequest('Erreur de validation', errors);
  }

  // Erreur CastError (ID MongoDB invalide)
  if (err.name === 'CastError') {
    return ApiError.badRequest(`Format invalide pour ${err.path}`);
  }

  // Erreur de clé dupliquée (unique constraint)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return ApiError.conflict(`Le champ ${field} existe déjà`);
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return ApiError.unauthorized('Token invalide');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Token expiré');
  }

  return err;
};

/**
 * Middleware de gestion des erreurs
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log pour déboguer le type d'erreur
  console.log('🔍 Type d\'erreur reçue:', {
    isApiError: error instanceof ApiError,
    constructor: error.constructor.name,
    hasErrors: !!error.errors,
    errorsLength: error.errors?.length
  });

  // Si ce n'est pas une ApiError, convertir
  if (!(error instanceof ApiError)) {
    error = convertToApiError(error);
  }

  // Log l'erreur en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
    });
  }

  // Envoyer la réponse
  res.status(error.statusCode || 500).json(
    ApiResponse.error(
      error.message || 'Erreur interne du serveur',
      error.statusCode || 500,
      error.errors || []
    )
  );
};

/**
 * Middleware pour gérer les routes non trouvées (404)
 */
const notFound = (req, res, next) => {
  const error = ApiError.notFound(`Route ${req.originalUrl} non trouvée`);
  next(error);
};

module.exports = {
  errorHandler,
  notFound,
  convertToApiError,
};
