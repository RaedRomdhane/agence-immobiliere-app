const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const configurePassport = require('./config/passport');
const routes = require('./routes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const featureFlagRoutes = require('./routes/featureFlagRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const propertyHistoryRoutes = require('./routes/propertyHistoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const logger = require('./config/logger');
const { metricsMiddleware, register } = require('../metrics');
const { requireFeatureFlag } = require('./middlewares/featureFlag');

const app = express();

// Configuration de Passport (OAuth)
configurePassport();

// Middlewares de sécurité
app.use(helmet({
  contentSecurityPolicy: false, // Désactiver pour Swagger UI
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Autoriser les ressources cross-origin
  crossOriginEmbedderPolicy: false, // Désactiver pour permettre les images
}));

// CORS configuration - Allow Vercel preview URLs and production URL
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  /^https:\/\/agence-immobiliere-app.*\.vercel\.app$/, // Allow all Vercel preview URLs
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or matches regex
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Session (requis pour Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'votre-secret-session-super-securise',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI, // Use your MongoDB connection string
    collectionName: 'sessions',
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en production
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
  },
}));

// Initialisation de Passport
app.use(passport.initialize());
app.use(passport.session());

// Logging: use morgan but stream into winston so logs can be centralized
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined', { stream: logger.stream }));

// Metrics middleware (Prometheus)
app.use(metricsMiddleware);

// Expose Prometheus metrics
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.send(await register.metrics());
  } catch (err) {
    logger.error('Failed to collect metrics: %o', err);
    res.status(500).send('Error collecting metrics');
  }
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static('uploads'));

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

// Routes API - L'ordre est important !
// Routes spécifiques en premier
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/properties', propertyHistoryRoutes);
app.use('/api/feature-flags', featureFlagRoutes);
app.use('/api/notifications', notificationRoutes);
// Admin routes protected by feature flag (can be toggled on/off)
app.use('/api/admin', requireFeatureFlag('admin-panel'), adminRoutes);
// Route générale en dernier (ne pas mettre /api car déjà dans les routes ci-dessus)
app.use('/', routes);

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


if (require.main === module) {
  app.listen(5000, '0.0.0.0', () => {
    console.log('Server is running on http://0.0.0.0:5000');
  });
}

module.exports = app;
