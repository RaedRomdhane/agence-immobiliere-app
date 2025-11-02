const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middlewares/auth');

/**
 * Routes Admin
 * Toutes les routes nécessitent une authentification et un rôle admin
 */

// @route   GET /api/admin/stats
// @desc    Obtenir les statistiques de la plateforme
// @access  Private/Admin
router.get('/stats', protect, adminController.getStats);

// @route   GET /api/admin/users
// @desc    Obtenir la liste de tous les utilisateurs
// @access  Private/Admin
router.get('/users', protect, adminController.getAllUsers);

// @route   PUT /api/admin/users/:id
// @desc    Mettre à jour un utilisateur
// @access  Private/Admin
router.put('/users/:id', protect, adminController.updateUser);

// @route   DELETE /api/admin/users/:id
// @desc    Supprimer un utilisateur
// @access  Private/Admin
router.delete('/users/:id', protect, adminController.deleteUser);

module.exports = router;
