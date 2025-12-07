
const Property = require('../models/Property');
const User = require('../models/User');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

// --- SAVED SEARCHES: GET/POST ---
// GET all saved searches for a user
router.get('/:id/saved-searches', protect, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    res.json({ success: true, data: user.savedSearches || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des recherches sauvegardées', error: err.message });
  }
});

// POST a new saved search for a user
router.post('/:id/saved-searches', protect, async (req, res) => {
  const userId = req.params.id;
  const { name, criteria } = req.body;
  if (!name || !criteria) {
    return res.status(400).json({ success: false, message: 'name et criteria requis' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    // Optionally: prevent duplicate names
    if (user.savedSearches && user.savedSearches.some(s => s.name === name)) {
      return res.status(409).json({ success: false, message: 'Une recherche avec ce nom existe déjà.' });
    }
    user.savedSearches.push({ name, criteria });
    await user.save();
    res.json({ success: true, message: 'Recherche sauvegardée', data: user.savedSearches });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde de la recherche', error: err.message });
  }
});

// GET /api/users/:id/favorites/properties - Get all favorite properties for a user
router.get('/:id/favorites/properties', protect, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    if (!user.favorites || user.favorites.length === 0) {
      return res.json({ success: true, data: [] });
    }
    // Fetch all properties in the user's favorites, preserving order
    const properties = await Property.find({ _id: { $in: user.favorites } });
    // Sort to match the order in user.favorites
    const sorted = user.favorites.map(fid => properties.find(p => String(p._id) === String(fid))).filter(Boolean);
    res.json({ success: true, data: sorted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des favoris', error: err.message });
  }
});
// Update order of favorites
const mongoose = require('mongoose');
router.patch('/:id/favorites/order', protect, async (req, res) => {
  const userId = req.params.id;
  const { favorites } = req.body;
  if (!Array.isArray(favorites)) {
    return res.status(400).json({ success: false, message: 'favorites array requis' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    user.favorites = favorites.map(id => new mongoose.Types.ObjectId(id));
    await user.save();
    res.json({ success: true, message: 'Ordre des favoris mis à jour', favorites: user.favorites });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur mise à jour ordre favoris', error: err.message });
  }
});
// --- FAVORITES: Add/Remove property to/from user favorites ---

// Add property to favorites
router.post('/:id/favorites', protect, async (req, res) => {
  const userId = req.params.id;
  const { propertyId } = req.body;
  if (!propertyId) return res.status(400).json({ success: false, message: 'propertyId requis' });
  try {
    // Update User
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    if (!user.favorites.map(String).includes(propertyId)) {
      user.favorites.push(propertyId);
      await user.save();
    }
    // Update Property
    const property = await Property.findById(propertyId);
    if (property && !property.favorites.map(String).includes(userId)) {
      property.favorites.push(userId);
      await property.save();
    }
    res.json({ success: true, message: 'Ajouté aux favoris' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur ajout favori', error: err.message });
  }
});

// Remove property from favorites
router.delete('/:id/favorites', protect, async (req, res) => {
  const userId = req.params.id;
  const { propertyId } = req.body;
  if (!propertyId) return res.status(400).json({ success: false, message: 'propertyId requis' });
  try {
    // Update User
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    user.favorites = user.favorites.filter(favId => String(favId) !== propertyId);
    await user.save();
    // Update Property
    const property = await Property.findById(propertyId);
    if (property) {
      property.favorites = property.favorites.filter(favId => String(favId) !== userId);
      await property.save();
    }
    res.json({ success: true, message: 'Retiré des favoris' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur suppression favori', error: err.message });
  }
});


// Pour validation d'ObjectId simple
const { param } = require('express-validator');
const { validate } = require('../middlewares/validator');
const {
  createUserValidation,
  updateUserValidation,
  getUserByIdValidation,
  deleteUserValidation,
  getAllUsersValidation,
  toggleStatusValidation,
  changeRoleValidation,
} = require('../validators/userValidator');


/**
 * @swagger
 * /api/users/{id}/change-password:
 *   post:
 *     summary: Changer le mot de passe de l'utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 */
router.post('/:id/change-password', param('id').isMongoId(), validate, userController.changePassword);

/**
 * @swagger
 * /api/users/{id}/export:
 *   get:
 *     summary: Exporter toutes les données personnelles de l'utilisateur (RGPD)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Données exportées avec succès
 */
router.get('/:id/export', param('id').isMongoId(), validate, userController.exportUserData);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API de gestion des utilisateurs
 */

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Récupérer les statistiques des utilisateurs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 */
router.get('/stats', userController.getUserStats);

/**
 * @swagger
 * /api/users/agents:
 *   get:
 *     summary: Récupérer tous les agents actifs
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Agents actifs récupérés avec succès
 */
router.get('/agents', userController.getActiveAgents);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, client]
 *         description: Filtrer par rôle
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrer par statut actif
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Rechercher par nom ou email
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 */
router.get('/', getAllUsersValidation, validate, userController.getAllUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, client]
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 */
router.post('/', createUserValidation, validate, userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur récupéré avec succès
 *       404:
 *         description: Utilisateur introuvable
 */
router.get('/:id', getUserByIdValidation, validate, userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur (complet)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 */
router.put('/:id', updateUserValidation, validate, userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Mettre à jour un utilisateur (partiel)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 */
router.patch('/:id', updateUserValidation, validate, userController.patchUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Utilisateur supprimé avec succès
 */
router.delete('/:id', deleteUserValidation, validate, userController.deleteUser);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Activer/Désactiver un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Statut modifié avec succès
 */
router.patch('/:id/status', toggleStatusValidation, validate, userController.toggleUserStatus);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Changer le rôle d'un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, client]
 *     responses:
 *       200:
 *         description: Rôle modifié avec succès
 */
router.patch('/:id/role', changeRoleValidation, validate, userController.changeUserRole);

// --- Routes pour critères de recherche sauvegardés ---
/**
 * @swagger
 * /api/users/{id}/last-search-criteria:
 *   get:
 *     summary: Récupérer les critères de recherche sauvegardés d'un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Critères récupérés avec succès
 */
router.get(
  '/:id/last-search-criteria',
  param('id').isMongoId(),
  validate,
  userController.getLastPropertySearchCriteria
);

/**
 * @swagger
 * /api/users/{id}/last-search-criteria:
 *   post:
 *     summary: Sauvegarder les critères de recherche d'un utilisateur
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Critères sauvegardés avec succès
 */
router.post(
  '/:id/last-search-criteria',
  param('id').isMongoId(),
  validate,
  userController.setLastPropertySearchCriteria
);

module.exports = router;
