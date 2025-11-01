/**
 * Service métier pour la gestion des utilisateurs
 * Contient toute la logique métier liée aux utilisateurs
 */
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

class UserService {
  /**
   * Créer un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise<User>} - Utilisateur créé
   */
  async createUser(userData) {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw ApiError.conflict('Cet email est déjà utilisé');
    }

    // Créer l'utilisateur
    const user = await User.create(userData);

    // Retourner sans le password
    return await User.findById(user._id);
  }

  /**
   * Récupérer tous les utilisateurs avec filtres et pagination
   * @param {Object} filters - Filtres de recherche
   * @param {Object} options - Options de pagination et tri
   * @returns {Promise<Object>} - Utilisateurs et pagination
   */
  async getAllUsers(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      role,
      isActive,
      search,
    } = options;

    // Construction de la query
    const query = {};

    // Filtre par rôle
    if (role) {
      query.role = role;
    }

    // Filtre par statut actif
    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true;
    }

    // Recherche par nom ou email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Exécution de la requête
    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    // Calcul de la pagination
    const totalPages = Math.ceil(total / limit);
    const currentPage = parseInt(page);

    return {
      users,
      pagination: {
        page: currentPage,
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    };
  }

  /**
   * Récupérer un utilisateur par son ID
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<User>} - Utilisateur trouvé
   */
  async getUserById(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('Utilisateur introuvable');
    }

    return user;
  }

  /**
   * Récupérer un utilisateur par son email
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<User>} - Utilisateur trouvé
   */
  async getUserByEmail(email) {
    const user = await User.findByEmail(email);

    if (!user) {
      throw ApiError.notFound('Utilisateur introuvable');
    }

    return user;
  }

  /**
   * Mettre à jour un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<User>} - Utilisateur mis à jour
   */
  async updateUser(userId, updateData) {
    const user = await this.getUserById(userId);

    // Vérifier si l'email est changé et s'il n'est pas déjà utilisé
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findByEmail(updateData.email);
      if (existingUser) {
        throw ApiError.conflict('Cet email est déjà utilisé');
      }
    }

    // Ne pas permettre la modification du password par cette méthode
    delete updateData.password;
    delete updateData.loginAttempts;
    delete updateData.lockUntil;

    // Mettre à jour l'utilisateur
    Object.assign(user, updateData);
    await user.save();

    // Retourner l'utilisateur mis à jour
    return await User.findById(userId);
  }

  /**
   * Supprimer un utilisateur (soft delete)
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    const user = await this.getUserById(userId);

    // Soft delete : désactiver l'utilisateur
    user.isActive = false;
    await user.save();

    return { message: 'Utilisateur supprimé avec succès' };
  }

  /**
   * Supprimer définitivement un utilisateur (hard delete)
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<void>}
   */
  async hardDeleteUser(userId) {
    const user = await this.getUserById(userId);
    await user.deleteOne();

    return { message: 'Utilisateur supprimé définitivement' };
  }

  /**
   * Récupérer les statistiques des utilisateurs
   * @returns {Promise<Object>} - Statistiques
   */
  async getUserStats() {
    return await User.getStats();
  }

  /**
   * Récupérer tous les agents actifs
   * @returns {Promise<Array>} - Liste des agents
   */
  async getActiveAgents() {
    return await User.findActiveAgents();
  }

  /**
   * Activer/Désactiver un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {boolean} isActive - Nouveau statut
   * @returns {Promise<User>} - Utilisateur mis à jour
   */
  async toggleUserStatus(userId, isActive) {
    const user = await this.getUserById(userId);
    user.isActive = isActive;
    await user.save();

    return await User.findById(userId);
  }

  /**
   * Changer le rôle d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {string} newRole - Nouveau rôle (admin ou client)
   * @returns {Promise<User>} - Utilisateur mis à jour
   */
  async changeUserRole(userId, newRole) {
    const user = await this.getUserById(userId);

    if (!['admin', 'client'].includes(newRole)) {
      throw ApiError.badRequest('Rôle invalide. Utilisez "admin" ou "client"');
    }

    user.role = newRole;
    await user.save();

    return await User.findById(userId);
  }
}

module.exports = new UserService();
