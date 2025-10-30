#!/usr/bin/env node

/**
 * Script CLI pour gérer les migrations de base de données
 * Usage: npm run db:migrate [up|down|status]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const MigrationRunner = require('../src/database/MigrationRunner');
const connectDB = require('../src/config/database');

const command = process.argv[2] || 'up';

const validCommands = ['up', 'down', 'status'];

if (!validCommands.includes(command)) {
  console.error(`❌ Commande invalide: ${command}`);
  console.log('\nCommandes disponibles:');
  console.log('  up     - Exécuter les migrations en attente');
  console.log('  down   - Annuler la dernière migration');
  console.log('  status - Voir le statut des migrations');
  console.log('\nUsage: npm run db:migrate [up|down|status]');
  process.exit(1);
}

async function runMigrations() {
  try {
    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB...');
    await connectDB();

    const runner = new MigrationRunner();

    // Exécuter la commande
    switch (command) {
      case 'up':
        await runner.up();
        break;
      case 'down':
        await runner.down();
        break;
      case 'status':
        await runner.status();
        break;
    }

    // Fermer la connexion
    await mongoose.connection.close();
    console.log('👋 Connexion fermée\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

// Exécuter le script
runMigrations();
