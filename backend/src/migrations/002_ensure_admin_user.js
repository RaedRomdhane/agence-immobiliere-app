/**
 * Migration 002: Add default admin user (if not exists)
 * 
 * This migration ensures there's at least one admin user in the database
 * for initial system access.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const up = async () => {
  console.log('Running migration 002: Ensure admin user exists...');
  
  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');

  try {
    // Check if admin already exists
    const adminExists = await usersCollection.findOne({ 
      email: 'admin@agence.com' 
    });

    if (adminExists) {
      console.log('ℹ️  Admin user already exists, skipping creation');
      return;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);

    const adminUser = {
      firstName: 'Admin',
      lastName: 'Système',
      email: 'admin@agence.com',
      password: hashedPassword,
      phone: '+33612345678',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await usersCollection.insertOne(adminUser);
    console.log('✅ Admin user created successfully');
    console.log('   Email: admin@agence.com');
    console.log('   Password: Admin123!');
    console.log('Migration 002 completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration 002 failed:', error.message);
    throw error;
  }
};

const down = async () => {
  console.log('Rolling back migration 002: Remove admin user...');
  
  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');

  try {
    await usersCollection.deleteOne({ email: 'admin@agence.com' });
    console.log('✅ Migration 002 rolled back successfully!\n');
  } catch (error) {
    console.error('❌ Rollback 002 failed:', error.message);
    throw error;
  }
};

module.exports = { up, down };
