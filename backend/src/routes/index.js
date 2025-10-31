const express = require('express');

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Page d'accueil de l'API
 *     tags: [General]
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
      auth: '/api/auth',
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
 *     summary: Vérification de l'état du serveur
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Serveur en fonctionnement
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

module.exports = router;
