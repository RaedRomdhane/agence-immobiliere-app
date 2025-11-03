/**
 * MongoDB Atlas Connection Test Script
 * Run this to verify your staging connection string works
 * 
 * Usage: node test-mongodb-connection.js
 */

const mongoose = require('mongoose');

// Replace with your actual MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://agence-staging-user:<password>@agence-staging-cluster.xxxxx.mongodb.net/agence-immobiliere-staging?retryWrites=true&w=majority';

console.log('🔄 Testing MongoDB Atlas connection...\n');

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ SUCCESS! MongoDB Atlas connection established successfully!\n');
  console.log('📊 Connection details:');
  console.log(`   - Host: ${mongoose.connection.host}`);
  console.log(`   - Database: ${mongoose.connection.name}`);
  console.log(`   - Port: ${mongoose.connection.port}`);
  console.log(`   - Ready State: ${mongoose.connection.readyState} (1 = connected)\n`);
  
  console.log('✨ Your MongoDB Atlas staging cluster is ready to use!\n');
  
  // Close connection
  mongoose.connection.close();
  process.exit(0);
})
.catch((error) => {
  console.error('❌ ERROR! Failed to connect to MongoDB Atlas\n');
  console.error('Error details:', error.message);
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Check your connection string format');
  console.error('   2. Verify password is correct (no < > brackets)');
  console.error('   3. Ensure Network Access allows 0.0.0.0/0');
  console.error('   4. Check database user has Read/Write permissions');
  console.error('   5. Wait 1-2 minutes if cluster was just created\n');
  
  process.exit(1);
});

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 MongoDB disconnected');
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('⏱️  Connection timeout (10s). Check your network and connection string.');
  process.exit(1);
}, 10000);
