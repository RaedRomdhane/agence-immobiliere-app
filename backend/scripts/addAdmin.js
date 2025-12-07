const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function addAdmin() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const admin = {
    firstName: 'Admin',
    lastName: 'Principal',
    email: 'admin@agence.com',
    password: 'Admin123!',
    role: 'admin',
    phone: '95292324',
    address: {
      street: '123 Avenue des Champs-Élysées',
      city: 'Paris',
      postalCode: '75008',
      country: 'France',
    },
    isActive: true,
    isEmailVerified: true,
  };
  try {
    await User.deleteMany({ email: admin.email });
    await User.create(admin);
    console.log('✅ Admin user created:', admin.email);
  } catch (e) {
    console.error('❌ Error creating admin:', e.message);
  } finally {
    await mongoose.disconnect();
  }
}

addAdmin();
