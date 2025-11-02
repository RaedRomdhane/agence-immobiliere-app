const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } = require('../validators/authValidator');
const { validate } = require('../middlewares/validator');
const ActivityLogger = require('../middlewares/activityLogger');
const { protect } = require('../middlewares/auth');

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
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
 *               - confirmPassword
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jean
 *               lastName:
 *                 type: string
 *                 example: Dupont
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jean.dupont@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               phone:
 *                 type: string
 *                 example: +33612345678
 *               role:
 *                 type: string
 *                 enum: [client, admin]
 *                 default: client
 *     responses:
 *       201:
 *         description: Inscription réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Inscription réussie ! Un email de bienvenue vous a été envoyé.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 */
router.post(
  '/register',
  registerValidation,
  validate,
  ActivityLogger.logAccountCreation(),
  ActivityLogger.logFailedAttempt('register'),
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jean.dupont@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Connexion réussie
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post(
  '/login',
  loginValidation,
  validate,
  ActivityLogger.logLogin(),
  ActivityLogger.logFailedAttempt('login'),
  authController.login
);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Connexion Google OAuth (Login uniquement)
 *     tags: [Auth]
 *     description: Redirige vers la page de connexion Google pour se connecter avec un compte existant
 *     responses:
 *       302:
 *         description: Redirection vers Google
 */
router.get(
  '/google',
  passport.authenticate('google-login', { 
    scope: ['profile', 'email'],
    state: 'login'
  })
);

/**
 * @swagger
 * /api/auth/google/signup:
 *   get:
 *     summary: Inscription Google OAuth (Signup uniquement)
 *     tags: [Auth]
 *     description: Redirige vers la page de connexion Google pour créer un nouveau compte
 *     responses:
 *       302:
 *         description: Redirection vers Google
 */
router.get(
  '/google/signup',
  passport.authenticate('google-signup', { 
    scope: ['profile', 'email'],
    state: 'signup'
  })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Callback Google OAuth (Login et Signup)
 *     tags: [Auth]
 *     description: Callback après authentification Google - gère login et signup selon le state
 *     responses:
 *       302:
 *         description: Redirection vers le frontend avec le token
 */
router.get(
  '/google/callback',
  (req, res, next) => {
    // Déterminer la stratégie à utiliser selon le state
    const state = req.query.state || 'login';
    const strategy = state === 'signup' ? 'google-signup' : 'google-login';
    const redirectPage = state === 'signup' ? 'register' : 'login';
    
    passport.authenticate(strategy, { 
      session: false,
    }, (err, user, info) => {
      if (err) {
        // Rediriger vers le frontend avec le message d'erreur
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        const errorMessage = encodeURIComponent(err.message || 'Erreur lors de l\'authentification Google');
        return res.redirect(`${frontendURL}/${redirectPage}?error=${errorMessage}`);
      }
      if (!user) {
        const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendURL}/${redirectPage}?error=google_auth_failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  ActivityLogger.logAccountCreation(),
  authController.googleCallback
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtenir le profil de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profil récupéré avec succès
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', protect, authController.getMe);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Déconnexion réussie
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
// Note: Cette route nécessitera un middleware d'authentification (à créer)
// router.post('/logout', protect, authController.logout);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Demande de réinitialisation de mot de passe
 *     tags: [Auth]
 *     description: Envoie un email avec un lien de réinitialisation de mot de passe valable 1 heure
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Email de réinitialisation envoyé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Un email de réinitialisation a été envoyé
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Utilisateur non trouvé
 */
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Réinitialisation du mot de passe
 *     tags: [Auth]
 *     description: Permet de définir un nouveau mot de passe avec un token valide
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de réinitialisation reçu par email
 *                 example: 5f8a3b2c1d9e4f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: NewPass123!@
 *                 description: Doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPass123!@
 *                 description: Doit correspondre au nouveau mot de passe
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Mot de passe réinitialisé avec succès
 *       400:
 *         description: Token invalide ou expiré, ou validation échouée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Token invalide ou expiré
 */
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);

// ============================================
// Routes Google OAuth
// ============================================

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Authentification Google OAuth (Login)
 *     tags: [Auth]
 *     description: Redirige vers la page d'authentification Google pour connexion
 *     responses:
 *       302:
 *         description: Redirection vers Google OAuth
 */
router.get('/google',
  passport.authenticate('google-login', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

/**
 * @swagger
 * /api/auth/google/signup:
 *   get:
 *     summary: Authentification Google OAuth (Inscription)
 *     tags: [Auth]
 *     description: Redirige vers la page d'authentification Google pour inscription
 *     responses:
 *       302:
 *         description: Redirection vers Google OAuth
 */
router.get('/google/signup',
  passport.authenticate('google-signup', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Callback Google OAuth
 *     tags: [Auth]
 *     description: Point de retour après authentification Google
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Code d'autorisation Google
 *     responses:
 *       302:
 *         description: Redirection vers le frontend avec le token
 */
router.get('/google/callback',
  authController.googleCallback
);

module.exports = router;
