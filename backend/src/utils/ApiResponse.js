/**
 * Classe pour formater les réponses API de manière standardisée
 */
class ApiResponse {
  /**
   * Créer une réponse API standardisée
   * @param {number} statusCode - Code HTTP
   * @param {*} data - Données à retourner
   * @param {string} message - Message de succès
   */
  constructor(statusCode, data, message = 'Succès') {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  /**
   * Réponse 200 OK
   * @param {*} data - Données
   * @param {string} message - Message
   * @returns {ApiResponse}
   */
  static success(data, message = 'Opération réussie') {
    return new ApiResponse(200, data, message);
  }

  /**
   * Réponse 201 Created
   * @param {*} data - Données créées
   * @param {string} message - Message
   * @returns {ApiResponse}
   */
  static created(data, message = 'Ressource créée avec succès') {
    return new ApiResponse(201, data, message);
  }

  /**
   * Réponse 200 OK avec pagination
   * @param {Array} data - Données
   * @param {Object} pagination - Informations de pagination
   * @param {string} message - Message
   * @returns {Object}
   */
  static paginated(data, pagination, message = 'Succès') {
    return {
      success: true,
      statusCode: 200,
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
        hasNextPage: pagination.hasNextPage,
        hasPrevPage: pagination.hasPrevPage,
      },
    };
  }

  /**
   * Envoyer la réponse au client
   * @param {Object} res - Objet Response Express
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
    });
  }
}

module.exports = ApiResponse;
