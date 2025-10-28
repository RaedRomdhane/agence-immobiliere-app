const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Middlewares de sécurité
app.use(helmet());
app.use(cors());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      api: '/api/v1'
    }
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

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
