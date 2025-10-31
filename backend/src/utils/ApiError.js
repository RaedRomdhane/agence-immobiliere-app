/**
 * Classe d'erreur API personnalisée
 * Permet de créer des erreurs avec codes HTTP et messages standardisés
 */
class ApiError extends Error {
  /**
   * Créer une erreur API
   * @param {number} statusCode - Code HTTP de l'erreur
   * @param {string} message - Message d'erreur
   * @param {boolean} isOperational - Si true, erreur opérationnelle (pas un bug)
   * @param {string} stack - Stack trace (optionnel)
   */
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
   * Créer une erreur 400 Bad Request
   * @param {string} message - Message d'erreur
   * @returns {ApiError}
   */
  static badRequest(message = 'Requête invalide') {
    return new ApiError(400, message);
  }

  /**
   * Créer une erreur 401 Unauthorized
   * @param {string} message - Message d'erreur
   * @returns {ApiError}
   */
  static unauthorized(message = 'Non authentifié') {
    return new ApiError(401, message);
  }

  /**
   * Créer une erreur 403 Forbidden
   * @param {string} message - Message d'erreur
   * @returns {ApiError}
   */
  static forbidden(message = 'Accès interdit') {
    return new ApiError(403, message);
  }

  /**
   * Créer une erreur 404 Not Found
   * @param {string} message - Message d'erreur
   * @returns {ApiError}
   */
  static notFound(message = 'Ressource introuvable') {
    return new ApiError(404, message);
  }

  /**
   * Créer une erreur 409 Conflict
   * @param {string} message - Message d'erreur
   * @returns {ApiError}
   */
  static conflict(message = 'Conflit de données') {
    return new ApiError(409, message);
  }

  /**
   * Créer une erreur 422 Unprocessable Entity
   * @param {string} message - Message d'erreur
   * @returns {ApiError}
   */
  static unprocessableEntity(message = 'Données non traitables') {
    return new ApiError(422, message);
  }

  /**
   * Créer une erreur 500 Internal Server Error
   * @param {string} message - Message d'erreur
   * @returns {ApiError}
   */
  static internal(message = 'Erreur interne du serveur') {
    return new ApiError(500, message, false);
  }
}

module.exports = ApiError;
