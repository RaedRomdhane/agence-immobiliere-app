/**
 * Configuration des variables d'environnement
 * Ce fichier centralise et valide toutes les variables d'environnement utilisées par l'application
 */

require('dotenv').config();

// Validation des variables d'environnement requises
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
];

// Vérifier que toutes les variables requises sont définies
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('========================================');
  console.error('❌ Variables d\'environnement manquantes:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('');
  console.error('💡 Assurez-vous d\'avoir un fichier .env avec toutes les variables requises');
  console.error('   Vous pouvez copier .env.example vers .env comme point de départ');
  console.error('========================================');
  process.exit(1);
}

// Configuration de l'application
const config = {
  // Environnement
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',

  // Serveur
  port: parseInt(process.env.PORT, 10) || 5000,
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  // Base de données
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      // Options Mongoose 6+
      // useNewUrlParser et useUnifiedTopology ne sont plus nécessaires
    }
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '7d',
  },

  // OAuth Google
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  },

  // Email
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
    from: process.env.EMAIL_FROM || 'noreply@agence-immobiliere.com',
  },

  // Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB par défaut
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedDocumentTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },

  // Logs
  logs: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    },
  },
};

// Afficher la configuration au démarrage (en mode développement uniquement)
if (config.isDevelopment) {
  console.log('========================================');
  console.log('📋 Configuration chargée');
  console.log(`   Environnement: ${config.env}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   MongoDB: ${config.mongodb.uri.replace(/\/\/.*:.*@/, '//***:***@')}`); // Masquer les credentials
  console.log(`   JWT Expire: ${config.jwt.expire}`);
  console.log(`   CORS Origin: ${config.cors.origin}`);
  console.log('========================================');
}

module.exports = config;
