/**
 * Routes pour la gestion des utilisateurs
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
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

module.exports = router;
