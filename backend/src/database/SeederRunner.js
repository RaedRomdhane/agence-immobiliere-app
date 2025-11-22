const mongoose = require('mongoose');
const UserSeeder = require('./seeders/UserSeeder');
const { seedFeatureFlags, clearFeatureFlags } = require('./seeders/FeatureFlagSeeder');

/**
 * Gestionnaire principal de seeding
 * Exécute tous les seeders dans l'ordre
 */
class SeederRunner {
  constructor() {
    this.seeders = [
      new UserSeeder(),
      // Ajouter d'autres seeders ici
    ];
  }

  /**
   * Vérifier la connexion MongoDB
   */
  checkConnection() {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB n\'est pas connecté. Appelez connectDB() d\'abord.');
    }
  }

  /**
   * Exécuter tous les seeders
   */
  async seedAll() {
    try {
      this.checkConnection();

      console.log('\n╔════════════════════════════════════════╗');
      console.log('║   🌱 SEEDING BASE DE DONNÉES          ║');
      console.log('╚════════════════════════════════════════╝\n');

      const startTime = Date.now();

      for (const seeder of this.seeders) {
        console.log(`\n▶️  Exécution: ${seeder.name}`);
        console.log('─'.repeat(50));
        await seeder.seed();
      }
      
      // Seed feature flags
      console.log(`\n▶️  Exécution: Feature Flags Seeder`);
      console.log('─'.repeat(50));
      await seedFeatureFlags();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log('\n╔════════════════════════════════════════╗');
      console.log('║   ✅ SEEDING TERMINÉ AVEC SUCCÈS      ║');
      console.log('╚════════════════════════════════════════╝');
      console.log(`⏱️  Durée totale: ${duration}s\n`);
    } catch (error) {
      console.error('\n╔════════════════════════════════════════╗');
      console.error('║   ❌ ERREUR LORS DU SEEDING           ║');
      console.error('╚════════════════════════════════════════╝');
      console.error(`\n${error.message}\n`);
      throw error;
    }
  }

  /**
   * Nettoyer toutes les données
   */
  async clearAll() {
    try {
      this.checkConnection();

      console.log('\n╔════════════════════════════════════════╗');
      console.log('║   🧹 NETTOYAGE BASE DE DONNÉES        ║');
      console.log('╚════════════════════════════════════════╝\n');

      for (const seeder of this.seeders) {
        console.log(`\n▶️  Nettoyage: ${seeder.name}`);
        console.log('─'.repeat(50));
        await seeder.clear();
      }
      
      // Clear feature flags
      console.log(`\n▶️  Nettoyage: Feature Flags`);
      console.log('─'.repeat(50));
      await clearFeatureFlags();

      console.log('\n╔════════════════════════════════════════╗');
      console.log('║   ✅ NETTOYAGE TERMINÉ                ║');
      console.log('╚════════════════════════════════════════╝\n');
    } catch (error) {
      console.error('\n❌ Erreur lors du nettoyage:', error.message);
      throw error;
    }
  }

  /**
   * Re-seed : nettoyer puis seeder
   */
  async reseed() {
    await this.clearAll();
    await this.seedAll();
  }
}

module.exports = SeederRunner;
