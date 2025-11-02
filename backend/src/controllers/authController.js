const AuthService = require('../services/authService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Contrôleur d'authentification
 */

/**
 * @desc    Inscription d'un nouvel utilisateur
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, role } = req.body;

  // Enregistrer l'utilisateur via le service
  const user = await AuthService.register({
    firstName,
    lastName,
    email,
    password,
    phone,
    role,
  });

  // Générer un token JWT
  const token = AuthService.generateToken(user);

  res
    .status(201)
    .json(
      ApiResponse.created('Inscription réussie ! Un email de bienvenue vous a été envoyé.', {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      })
    );
});

/**
 * @desc    Connexion d'un utilisateur
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Trouver l'utilisateur avec le mot de passe (select: false par défaut)
  const User = require('../models/User');
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json(
      ApiResponse.error('Email ou mot de passe incorrect', 401)
    );
  }

  // Vérifier le mot de passe
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json(
      ApiResponse.error('Email ou mot de passe incorrect', 401)
    );
  }

  // Vérifier si le compte est actif
  if (!user.isActive) {
    return res.status(403).json(
      ApiResponse.error('Votre compte a été désactivé. Contactez l\'administrateur.', 403)
    );
  }

  // Générer un token JWT
  const token = AuthService.generateToken(user);

  res.json(
    ApiResponse.success('Connexion réussie', {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    })
  );
});

/**
 * @desc    Callback Google OAuth
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
exports.googleCallback = asyncHandler(async (req, res) => {
  // L'utilisateur est déjà authentifié par Passport
  const user = req.user;

  // Générer un token JWT
  const token = AuthService.generateToken(user);

  // Rediriger vers le frontend avec le token
  const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendURL}/auth/callback?token=${token}`);
});

/**
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  res.json(
    ApiResponse.success('Profil récupéré avec succès', {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    })
  );
});

/**
 * @desc    Déconnexion (côté client, suppression du token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res) => {
  // Note: Avec JWT, la déconnexion est gérée côté client en supprimant le token
  // Ici, on peut logger l'activité si nécessaire

  res.json(
    ApiResponse.success('Déconnexion réussie')
  );
});

/**
 * @desc    Demande de réinitialisation de mot de passe
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const result = await AuthService.forgotPassword(email);

  res.json(
    ApiResponse.success(result.message)
  );
});

/**
 * @desc    Réinitialisation du mot de passe
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const result = await AuthService.resetPassword(token, newPassword);

  res.json(
    ApiResponse.success(result.message)
  );
});

module.exports = exports;
