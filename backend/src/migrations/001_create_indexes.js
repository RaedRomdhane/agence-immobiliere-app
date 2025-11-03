/**
 * Migration 001: Create database indexes
 * 
 * This migration creates essential indexes for the User model to improve query performance
 * and ensure data integrity.
 */

const mongoose = require('mongoose');

const up = async () => {
  console.log('Running migration 001: Create indexes...');
  
  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');

  try {
    // Create unique index on email
    await usersCollection.createIndex(
      { email: 1 },
      { 
        unique: true,
        name: 'email_unique_index',
        background: true 
      }
    );
    console.log('✅ Created unique index on email');

    // Create index on role for faster role-based queries
    await usersCollection.createIndex(
      { role: 1 },
      {
        name: 'role_index',
        background: true
      }
    );
    console.log('✅ Created index on role');

    // Create index on isActive for filtering active users
    await usersCollection.createIndex(
      { isActive: 1 },
      {
        name: 'isActive_index',
        background: true
      }
    );
    console.log('✅ Created index on isActive');

    // Create compound index on createdAt for sorting
    await usersCollection.createIndex(
      { createdAt: -1 },
      {
        name: 'createdAt_index',
        background: true
      }
    );
    console.log('✅ Created index on createdAt');

    console.log('Migration 001 completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration 001 failed:', error.message);
    throw error;
  }
};

const down = async () => {
  console.log('Rolling back migration 001: Drop indexes...');
  
  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');

  try {
    // Drop indexes (keep _id index)
    await usersCollection.dropIndex('email_unique_index').catch(() => {});
    await usersCollection.dropIndex('role_index').catch(() => {});
    await usersCollection.dropIndex('isActive_index').catch(() => {});
    await usersCollection.dropIndex('createdAt_index').catch(() => {});
    
    console.log('✅ Migration 001 rolled back successfully!\n');
  } catch (error) {
    console.error('❌ Rollback 001 failed:', error.message);
    throw error;
  }
};

module.exports = { up, down };
