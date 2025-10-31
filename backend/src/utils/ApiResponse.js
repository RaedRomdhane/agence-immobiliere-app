/**
 * Classe pour formater les réponses API de manière standardisée
 */
class ApiResponse {
  /**
   * Réponse de succès (200)
   * @param {String} message - Message de succès
   * @param {Object} data - Données à retourner
   * @returns {Object} Objet de réponse formaté
   */
  static success(message, data = {}) {
    return {
      success: true,
      statusCode: 200,
      message,
      data,
    };
  }

  /**
   * Réponse de création (201)
   * @param {String} message - Message de succès
   * @param {Object} data - Données créées
   * @returns {Object} Objet de réponse formaté
   */
  static created(message, data = {}) {
    return {
      success: true,
      statusCode: 201,
      message,
      data,
    };
  }

  /**
   * Réponse paginée (200)
   * @param {String} message - Message de succès
   * @param {Array} data - Tableau de données
   * @param {Object} pagination - Informations de pagination
   * @returns {Object} Objet de réponse formaté
   */
  static paginated(message, data, pagination) {
    return {
      success: true,
      statusCode: 200,
      message,
      data,
      pagination,
    };
  }

  /**
   * Réponse d'erreur
   * @param {String} message - Message d'erreur
   * @param {Number} statusCode - Code HTTP
   * @param {Array} errors - Erreurs détaillées
   * @returns {Object} Objet de réponse formaté
   */
  static error(message, statusCode = 500, errors = []) {
    return {
      success: false,
      error: {
        message,
        statusCode,
        ...(errors.length > 0 && { errors }),
      },
    };
  }
}

module.exports = ApiResponse;
