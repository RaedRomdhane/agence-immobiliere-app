const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AuthService = require('../services/authService');

/**
 * Configuration de Passport pour Google OAuth 2.0
 */
const configurePassport = () => {
  // Sérialisation de l'utilisateur pour la session
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Désérialisation de l'utilisateur depuis la session
  passport.deserializeUser(async (id, done) => {
    try {
      const User = require('../models/User');
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Configuration de la stratégie Google OAuth (seulement si les credentials sont disponibles)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Enregistrer ou récupérer l'utilisateur via le service
            const user = await AuthService.registerWithGoogle(profile);
            done(null, user);
          } catch (error) {
            done(error, null);
          }
        }
      )
    );
  } else if (process.env.NODE_ENV !== 'test') {
    console.warn('⚠️  Google OAuth credentials not configured. Google login will not be available.');
  }
};

module.exports = configurePassport;
