const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

/**
 * Gestionnaire de migrations pour MongoDB
 * Permet d'exécuter et de suivre les migrations de base de données
 */
class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, 'migrations');
    this.db = null;
    this.migrationsCollection = 'migrations';
  }

  /**
   * Initialiser la connexion
   */
  async init() {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB n\'est pas connecté. Appelez connectDB() d\'abord.');
    }
    this.db = mongoose.connection.db;
  }

  /**
   * Récupérer toutes les migrations disponibles
   */
  async getAvailableMigrations() {
    try {
      const files = await fs.readdir(this.migrationsPath);
      const migrationFiles = files
        .filter(file => file.endsWith('.js'))
        .sort(); // Tri alphabétique (001, 002, etc.)

      return migrationFiles.map(file => {
        const MigrationClass = require(path.join(this.migrationsPath, file));
        return new MigrationClass();
      });
    } catch (error) {
      console.error('Erreur lors de la lecture des migrations:', error.message);
      return [];
    }
  }

  /**
   * Récupérer les migrations déjà exécutées
   */
  async getExecutedMigrations() {
    try {
      const collection = this.db.collection(this.migrationsCollection);
      const executed = await collection
        .find({})
        .sort({ executedAt: 1 })
        .toArray();
      
      return executed.map(m => m.version);
    } catch (error) {
      console.error('Erreur lors de la récupération des migrations exécutées:', error.message);
      return [];
    }
  }

  /**
   * Marquer une migration comme exécutée
   */
  async markAsExecuted(migration) {
    const collection = this.db.collection(this.migrationsCollection);
    await collection.insertOne({
      version: migration.version,
      name: migration.name,
      executedAt: new Date(),
    });
  }

  /**
   * Retirer une migration de l'historique
   */
  async unmarkAsExecuted(migration) {
    const collection = this.db.collection(this.migrationsCollection);
    await collection.deleteOne({ version: migration.version });
  }

  /**
   * Exécuter toutes les migrations en attente
   */
  async up() {
    try {
      await this.init();

      console.log('========================================');
      console.log('🔄 Démarrage des migrations...');
      console.log('========================================\n');

      const available = await this.getAvailableMigrations();
      const executed = await this.getExecutedMigrations();

      const pending = available.filter(
        migration => !executed.includes(migration.version)
      );

      if (pending.length === 0) {
        console.log('✅ Aucune migration en attente');
        console.log('========================================\n');
        return;
      }

      console.log(`📋 ${pending.length} migration(s) en attente:\n`);
      pending.forEach(m => console.log(`   - [${m.version}] ${m.name}`));
      console.log('');

      for (const migration of pending) {
        console.log(`\n▶️  Exécution: [${migration.version}] ${migration.name}`);
        console.log('----------------------------------------');
        
        try {
          await migration.up();
          await this.markAsExecuted(migration);
          console.log(`✅ Migration ${migration.version} terminée\n`);
        } catch (error) {
          console.error(`❌ Échec de la migration ${migration.version}:`, error.message);
          throw error;
        }
      }

      console.log('========================================');
      console.log('✅ Toutes les migrations sont terminées!');
      console.log('========================================\n');
    } catch (error) {
      console.error('\n❌ Erreur lors des migrations:', error.message);
      throw error;
    }
  }

  /**
   * Annuler la dernière migration
   */
  async down() {
    try {
      await this.init();

      console.log('========================================');
      console.log('🔄 Rollback de la dernière migration...');
      console.log('========================================\n');

      const executed = await this.getExecutedMigrations();

      if (executed.length === 0) {
        console.log('✅ Aucune migration à annuler');
        console.log('========================================\n');
        return;
      }

      const lastVersion = executed[executed.length - 1];
      const available = await this.getAvailableMigrations();
      const migration = available.find(m => m.version === lastVersion);

      if (!migration) {
        throw new Error(`Migration ${lastVersion} introuvable`);
      }

      console.log(`▶️  Rollback: [${migration.version}] ${migration.name}`);
      console.log('----------------------------------------\n');

      await migration.down();
      await this.unmarkAsExecuted(migration);

      console.log('\n========================================');
      console.log('✅ Rollback terminé avec succès!');
      console.log('========================================\n');
    } catch (error) {
      console.error('\n❌ Erreur lors du rollback:', error.message);
      throw error;
    }
  }

  /**
   * Afficher le statut des migrations
   */
  async status() {
    try {
      await this.init();

      console.log('========================================');
      console.log('📊 Statut des migrations');
      console.log('========================================\n');

      const available = await this.getAvailableMigrations();
      const executed = await this.getExecutedMigrations();

      if (available.length === 0) {
        console.log('⚠️  Aucune migration trouvée\n');
        return;
      }

      console.log(`Total: ${available.length} migration(s)\n`);

      available.forEach(migration => {
        const isExecuted = executed.includes(migration.version);
        const status = isExecuted ? '✅ Exécutée' : '⏳ En attente';
        console.log(`[${migration.version}] ${migration.name}`);
        console.log(`   └─ ${status}\n`);
      });

      console.log('========================================\n');
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du statut:', error.message);
      throw error;
    }
  }
}

module.exports = MigrationRunner;
