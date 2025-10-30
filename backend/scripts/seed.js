#!/usr/bin/env node

/**
 * Script CLI pour gérer le seeding de la base de données
 * Usage: npm run db:seed [seed|clear|reseed]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SeederRunner = require('../src/database/SeederRunner');
const connectDB = require('../src/config/database');

const command = process.argv[2] || 'seed';

const validCommands = ['seed', 'clear', 'reseed'];

if (!validCommands.includes(command)) {
  console.error(`❌ Commande invalide: ${command}`);
  console.log('\nCommandes disponibles:');
  console.log('  seed   - Insérer les données de test');
  console.log('  clear  - Supprimer toutes les données de test');
  console.log('  reseed - Nettoyer puis réinsérer les données');
  console.log('\nUsage: npm run db:seed [seed|clear|reseed]');
  process.exit(1);
}

async function runSeeding() {
  try {
    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB...');
    await connectDB();

    const runner = new SeederRunner();

    // Exécuter la commande
    switch (command) {
      case 'seed':
        await runner.seedAll();
        break;
      case 'clear':
        await runner.clearAll();
        break;
      case 'reseed':
        await runner.reseed();
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
runSeeding();
