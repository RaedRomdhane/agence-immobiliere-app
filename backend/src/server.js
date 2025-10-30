require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

// Variable pour stocker l'instance du serveur
let server = null;

// Fonction de démarrage asynchrone
const startServer = async () => {
  try {
    // Connexion à la base de données (optionnelle en mode CI/test)
    const dbConnection = await connectDB();
    
    if (dbConnection) {
      console.log('✅ Base de données connectée');
    } else {
      console.log('⚠️  Démarrage sans connexion MongoDB (mode CI/test)');
    }

    // Démarrage du serveur
    server = app.listen(PORT, () => {
      console.log('========================================');
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log('========================================');
    });

    return server;
  } catch (error) {
    console.error('❌ Échec du démarrage du serveur:', error.message);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal reçu: fermeture du serveur HTTP');
  if (server) {
    server.close(() => {
      console.log('🔒 Processus HTTP fermé');
    });
  }
});

// Gestion des rejections de promesses non gérées
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
});

module.exports = server;
