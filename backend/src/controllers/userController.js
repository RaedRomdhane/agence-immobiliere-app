/**
 * Contrôleur pour la gestion des utilisateurs
 * Gère les requêtes HTTP et appelle les services appropriés
 */
const userService = require('../services/userService');
const { ApiResponse } = require('../utils');
const asyncHandler = require('../utils/asyncHandler');

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
  response.send(res);
});

/**
 * @desc    Mettre à jour un utilisateur
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  const response = ApiResponse.success(user, 'Utilisateur mis à jour avec succès');
  response.send(res);
});

/**
 * @desc    Mise à jour partielle d'un utilisateur
 * @route   PATCH /api/users/:id
 * @access  Private/Admin
 */
const patchUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  const response = ApiResponse.success(user, 'Utilisateur mis à jour avec succès');
  response.send(res);
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

  const response = ApiResponse.success(stats, 'Statistiques récupérées avec succès');
  response.send(res);
});

/**
 * @desc    Récupérer tous les agents actifs
 * @route   GET /api/users/agents
 * @access  Public
 */
const getActiveAgents = asyncHandler(async (req, res) => {
  const agents = await userService.getActiveAgents();

  const response = ApiResponse.success(agents, 'Agents actifs récupérés avec succès');
  response.send(res);
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
  response.send(res);
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
  response.send(res);
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
};
