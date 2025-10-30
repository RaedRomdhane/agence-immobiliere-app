const mongoose = require('mongoose');

/**
 * Classe de base pour les migrations
 * Fournit une structure commune pour toutes les migrations
 */
class Migration {
  constructor(name, version) {
    this.name = name;
    this.version = version;
    this.db = mongoose.connection.db;
  }

  /**
   * Méthode à implémenter : Appliquer la migration
   */
  async up() {
    throw new Error('La méthode up() doit être implémentée');
  }

  /**
   * Méthode à implémenter : Annuler la migration
   */
  async down() {
    throw new Error('La méthode down() doit être implémentée');
  }

  /**
   * Logger une information
   */
  log(message) {
    console.log(`[Migration ${this.version}] ${message}`);
  }

  /**
   * Logger une erreur
   */
  error(message) {
    console.error(`[Migration ${this.version}] ❌ ${message}`);
  }
}

module.exports = Migration;
