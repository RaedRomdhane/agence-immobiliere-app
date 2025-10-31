/**
 * Point d'entrée centralisé pour toutes les routes de l'API
 */
const express = require('express');
const router = express.Router();

// Import des routes
const userRoutes = require('./userRoutes');

/**
 * @swagger
 * /:
 *   get:
 *     summary: Route de bienvenue de l'API
 *     responses:
 *       200:
 *         description: Message de bienvenue
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur l\'API Agence Immobilière',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      docs: '/api-docs',
      health: '/health',
    },
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Vérifier l'état de santé de l'API
 *     responses:
 *       200:
 *         description: API opérationnelle
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API opérationnelle',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Monter les routes
router.use('/users', userRoutes);

module.exports = router;
