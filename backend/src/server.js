require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

// Variable pour stocker l'instance du serveur
let serverInstance = null;

// Fonction de démarrage du serveur
const startServer = async () => {
  try {
    // Connexion à la base de données
    await connectDB();

    // Démarrage du serveur
    serverInstance = app.listen(PORT, () => {
      console.log('========================================');
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: ${process.env.API_URL || `http://localhost:${PORT}`}`);
      console.log('========================================');
    });

    // Gestion de l'arrêt gracieux
    process.on('SIGTERM', async () => {
      console.log('\n👋 SIGTERM reçu, arrêt gracieux du serveur...');
      if (serverInstance) {
        serverInstance.close(() => {
          console.log('✅ Serveur HTTP arrêté');
          process.exit(0);
        });
      }
    });

    process.on('SIGINT', async () => {
      console.log('\n👋 SIGINT reçu, arrêt gracieux du serveur...');
      if (serverInstance) {
        serverInstance.close(() => {
          console.log('✅ Serveur HTTP arrêté');
          process.exit(0);
        });
      }
    });

    return serverInstance;
  } catch (error) {
    console.error('========================================');
    console.error('❌ Erreur lors du démarrage du serveur');
    console.error('Message:', error.message);
    console.error('========================================');
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();

module.exports = { startServer };
