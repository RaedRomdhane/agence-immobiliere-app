const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const configurePassport = require('./config/passport');
const routes = require('./routes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

// Configuration de Passport (OAuth)
configurePassport();

// Middlewares de sécurité
app.use(helmet({
  contentSecurityPolicy: false, // Désactiver pour Swagger UI
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Session (requis pour Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'votre-secret-session-super-securise',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en production
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
  },
}));

// Initialisation de Passport
app.use(passport.initialize());
app.use(passport.session());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Agence Immobilière API Documentation',
}));

// JSON Swagger spec
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Route de santé (health check)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route de base
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Bienvenue sur l\'API Agence Immobilière',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api-docs',
    }
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', routes);

// Gestion des routes non trouvées
app.use(notFound);

// Middleware de gestion des erreurs (doit être le dernier)
app.use(errorHandler);

// Gestion globale des erreurs
app.use((err, req, res, _next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
