const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Vérifier que MONGODB_URI est défini
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI non défini - Connexion MongoDB ignorée (mode CI/test)');
      return null;
    }

    // Options de connexion
    const options = {
      // Nouvelles options (Mongoose 6+)
      // useNewUrlParser et useUnifiedTopology ne sont plus nécessaires
    };

    // Connexion à MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log('========================================');
    console.log('✅ MongoDB connecté avec succès!');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔌 Port: ${conn.connection.port}`);
    console.log('========================================');

    // Gestion des événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur de connexion MongoDB:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB déconnecté');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnecté');
    });

    // Fermeture gracieuse
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('👋 Connexion MongoDB fermée via SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      console.log('👋 Connexion MongoDB fermée via SIGTERM');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('========================================');
    console.error('❌ Erreur de connexion MongoDB');
    console.error('Message:', error.message);
    console.error('========================================');
    
    // Conseils de dépannage
    console.log('\n💡 Conseils de dépannage:');
    console.log('1. Vérifiez que MongoDB est démarré');
    console.log('2. Vérifiez la chaîne de connexion MONGODB_URI dans .env');
    console.log('3. Vérifiez les credentials si MongoDB nécessite une authentification');
    console.log('4. Essayez: mongosh "' + process.env.MONGODB_URI + '"');
    console.log('');
    
    process.exit(1);
  }
};

module.exports = connectDB;
