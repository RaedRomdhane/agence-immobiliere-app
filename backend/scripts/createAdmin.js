/**
 * Script pour créer un utilisateur administrateur
 * Usage: node backend/scripts/createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const createAdmin = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agence-immobiliere-dev');
    console.log('✅ Connecté à MongoDB');

    // Données de l'admin
    const adminData = {
      firstName: 'Admin',
      lastName: 'Principal',
      email: 'admin@agence.com',
      password: 'Admin123!',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
    };

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('⚠️  Un admin avec cet email existe déjà');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Rôle: ${existingAdmin.role}`);
      
      // Mettre à jour le rôle si ce n'est pas déjà admin
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Rôle mis à jour vers admin');
      }
    } else {
      // Créer le nouvel admin
      const admin = await User.create(adminData);
      console.log('✅ Administrateur créé avec succès!');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Mot de passe: ${adminData.password}`);
      console.log(`   Rôle: ${admin.role}`);
    }

    // Déconnexion
    await mongoose.connection.close();
    console.log('\n✅ Script terminé');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

// Exécuter le script
createAdmin();
