require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../src/models/Property');

async function regenerateQRCodes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📍 FRONTEND_URL:', process.env.FRONTEND_URL);

    // Get all properties
    const properties = await Property.find({});
    console.log(`\n📊 Found ${properties.length} properties`);

    let updated = 0;
    for (const property of properties) {
      try {
        // Regenerate QR code
        await property.generateQRCode();
        await property.save();
        updated++;
        console.log(`✅ Updated QR code for: ${property.title}`);
      } catch (error) {
        console.error(`❌ Error updating ${property.title}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully regenerated ${updated}/${properties.length} QR codes`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

regenerateQRCodes();
