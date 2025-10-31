/**
 * Classe d'erreur API personnalisée
 * Permet de créer des erreurs avec des codes HTTP appropriés
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Erreur 400 - Bad Request
   */
  static badRequest(message = 'Requête invalide') {
    return new ApiError(400, message);
  }

  /**
   * Erreur 401 - Unauthorized
   */
  static unauthorized(message = 'Non autorisé') {
    return new ApiError(401, message);
  }

  /**
   * Erreur 403 - Forbidden
   */
  static forbidden(message = 'Accès interdit') {
    return new ApiError(403, message);
  }

  /**
   * Erreur 404 - Not Found
   */
  static notFound(message = 'Ressource introuvable') {
    return new ApiError(404, message);
  }

  /**
   * Erreur 409 - Conflict
   */
  static conflict(message = 'Conflit') {
    return new ApiError(409, message);
  }

  /**
   * Erreur 422 - Unprocessable Entity
   */
  static unprocessableEntity(message = 'Entité non traitable') {
    return new ApiError(422, message);
  }

  /**
   * Erreur 500 - Internal Server Error
   */
  static internal(message = 'Erreur interne du serveur') {
    return new ApiError(500, message, false);
  }
}

module.exports = ApiError;
