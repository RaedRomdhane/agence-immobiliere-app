const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
/**
 * @desc    Changer le mot de passe de l'utilisateur
 * @route   POST /api/users/:id/change-password
 * @access  Private (user or admin)
 */
const changePassword = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }
  const user = await User.findById(userId).select('+password');
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  }
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Mot de passe changé avec succès.' });
});

/**
 * @desc    Exporter toutes les données personnelles de l'utilisateur (RGPD)
 * @route   GET /api/users/:id/export
 * @access  Private (user or admin)
 */
const exportUserData = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).lean();
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  }
  // Exclure les champs sensibles
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.__v;
  res.setHeader('Content-Disposition', `attachment; filename="user_${userId}_data.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(user, null, 2));
});
/**
 * Contrôleur pour la gestion des utilisateurs
 * Gère les requêtes HTTP et appelle les services appropriés
 */
const userService = require('../services/userService');
const { ApiResponse } = require('../utils');

/**
 * @desc    Créer un nouvel utilisateur
 * @route   POST /api/users
 * @access  Public (sera Private/Admin plus tard)
 */
const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);

  const response = ApiResponse.created(user, 'Utilisateur créé avec succès');
  response.send(res);
});

/**
 * @desc    Récupérer tous les utilisateurs
 * @route   GET /api/users
 * @access  Public (sera Private/Admin plus tard)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { users, pagination } = await userService.getAllUsers({}, req.query);

  const response = ApiResponse.paginated(
    users,
    pagination,
    'Utilisateurs récupérés avec succès'
  );

  res.status(200).json(response);
});

/**
 * @desc    Récupérer un utilisateur par ID
 * @route   GET /api/users/:id
 * @access  Public (sera Private plus tard)
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  const response = ApiResponse.success(user, 'Utilisateur récupéré avec succès');
  res.json(response);
});

/**
 * @desc    Mettre à jour un utilisateur
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  const response = ApiResponse.success(user, 'Utilisateur mis à jour avec succès');
  res.json(response);
});

/**
 * @desc    Récupérer les critères de recherche sauvegardés d'un utilisateur
 * @route   GET /api/users/:id/last-search-criteria
 * @access  Private (user or admin)
 */
const getLastPropertySearchCriteria = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.id;
    const criteria = await userService.getLastPropertySearchCriteria(userId);
    // Always return the criteria object directly (never a string or wrapper)
    res.json(criteria || {});
  } catch (error) {
    console.error('[getLastPropertySearchCriteria] error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

/**
 * @desc    Sauvegarder les critères de recherche d'un utilisateur
 * @route   POST /api/users/:id/last-search-criteria
 * @access  Private (user or admin)
 */
const setLastPropertySearchCriteria = asyncHandler(async (req, res) => {
  const criteria = await userService.setLastPropertySearchCriteria(req.params.id, req.body);
  const response = ApiResponse.success(criteria, 'Critères de recherche sauvegardés avec succès');
  res.json(response);
});

/**
 * @desc    Mise à jour partielle d'un utilisateur
 * @route   PATCH /api/users/:id
 * @access  Private/Admin
 */
const patchUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  const response = ApiResponse.success(user, 'Utilisateur mis à jour avec succès');
  res.json(response);
});

/**
 * @desc    Supprimer un utilisateur (soft delete)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id);

  res.status(204).send();
});

/**
 * @desc    Récupérer les statistiques des utilisateurs
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats();

  // Debug: print total and a sample user

  const User = require('../models/User');
  const totalUsers = await User.countDocuments();
  console.log("[DEBUG] user stats:", stats);
  console.log("[DEBUG] monthlyRevenue:", stats.monthlyRevenue);
  console.log('[DEBUG /api/users/stats] Total users:', totalUsers);

  const response = ApiResponse.success(stats, 'Statistiques récupérées avec succès');
  res.json(response);
});

/**
 * @desc    Récupérer tous les agents actifs
 * @route   GET /api/users/agents
 * @access  Public
 */
const getActiveAgents = asyncHandler(async (req, res) => {
  const agents = await userService.getActiveAgents();

  const response = ApiResponse.success(agents, 'Agents actifs récupérés avec succès');
  res.json(response);
});

/**
 * @desc    Activer/Désactiver un utilisateur
 * @route   PATCH /api/users/:id/status
 * @access  Private/Admin
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await userService.toggleUserStatus(req.params.id, isActive);

  const response = ApiResponse.success(
    user,
    `Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès`
  );
  res.json(response);
});

/**
 * @desc    Changer le rôle d'un utilisateur
 * @route   PATCH /api/users/:id/role
 * @access  Private/Admin
 */
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await userService.changeUserRole(req.params.id, role);

  const response = ApiResponse.success(user, 'Rôle modifié avec succès');
  res.json(response);
});

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  patchUser,
  deleteUser,
  getUserStats,
  getActiveAgents,
  toggleUserStatus,
  changeUserRole,
  getLastPropertySearchCriteria,
  setLastPropertySearchCriteria,
  changePassword,
  exportUserData,
};
