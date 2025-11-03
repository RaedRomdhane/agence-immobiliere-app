/**
 * Script pour créer un utilisateur admin dans la base de données staging
 * Usage: node scripts/seed-admin-staging.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.staging' });

// Modèle User simplifié pour le seeding
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'agent', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

async function seedAdminUser() {
  try {
    // Connexion à MongoDB Atlas staging
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI non trouvé dans .env.staging');
      process.exit(1);
    }

    console.log('🔄 Connexion à MongoDB Atlas staging...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connecté à MongoDB Atlas\n');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'admin@agence.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  L\'utilisateur admin existe déjà');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Nom:', existingAdmin.firstName, existingAdmin.lastName);
      console.log('🔑 Role:', existingAdmin.role);
      console.log('\n💡 Vous pouvez vous connecter avec:');
      console.log('   Email: admin@agence.com');
      console.log('   Password: Admin123!');
      
      await mongoose.connection.close();
      return;
    }

    // Créer le mot de passe hashé
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);

    // Créer l'utilisateur admin
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'Système',
      email: 'admin@agence.com',
      password: hashedPassword,
      phone: '+33612345678',
      role: 'admin',
      isActive: true,
    });

    await adminUser.save();

    console.log('✅ Utilisateur admin créé avec succès!\n');
    console.log('📧 Email: admin@agence.com');
    console.log('🔒 Password: Admin123!');
    console.log('👤 Nom: Admin Système');
    console.log('🔑 Role: admin');
    console.log('📱 Phone: +33612345678');
    console.log('\n🎉 Vous pouvez maintenant vous connecter sur votre application staging!');
    console.log('🌐 URL: https://agence-immobiliere-app-4naj-hopf62eis.vercel.app/login');

    await mongoose.connection.close();
    console.log('\n✅ Déconnexion de MongoDB');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
seedAdminUser();
