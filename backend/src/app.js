const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import des routes et middlewares
const routes = require('./routes');
const { swaggerUi, swaggerSpec, swaggerUiOptions } = require('./config/swagger');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

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

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Route pour obtenir le JSON Swagger
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Monter toutes les routes API sous /api
app.use('/api', routes);

// Gestion des routes non trouvées (404)
app.use(notFound);

// Middleware de gestion d'erreurs (doit être le dernier)
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
