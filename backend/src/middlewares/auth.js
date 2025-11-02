const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware de protection des routes
 * Vérifie le token JWT dans le header Authorization
 */
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Vérifier si le token est présent dans le header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Vérifier si le token existe
  if (!token) {
    throw ApiError.unauthorized('Non autorisé - Token manquant');
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur depuis la DB (sans le password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw ApiError.unauthorized('Non autorisé - Utilisateur non trouvé');
    }

    // Vérifier si le compte est actif
    if (!req.user.isActive) {
      throw ApiError.forbidden('Compte désactivé');
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Non autorisé - Token invalide');
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Non autorisé - Token expiré');
    }
    throw error;
  }
});

/**
 * Middleware de restriction par rôle
 * @param  {...string} roles - Liste des rôles autorisés
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden("Vous n'avez pas la permission d'effectuer cette action");
    }
    next();
  };
};
