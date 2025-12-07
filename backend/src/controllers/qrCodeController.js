/**
 * Admin endpoint to regenerate QR codes for all properties
 * Call this once after deploying to production to update QR codes with production URL
 * 
 * Usage: GET /api/admin/regenerate-qrcodes
 * Requires admin authentication
 */

const Property = require('../models/Property');

exports.regenerateAllQRCodes = async (req, res) => {
  try {
    console.log('🔄 Starting QR code regeneration...');
    console.log('📍 FRONTEND_URL:', process.env.FRONTEND_URL);

    // Get all properties
    const properties = await Property.find({});
    console.log(`📊 Found ${properties.length} properties`);

    let successCount = 0;
    let errorCount = 0;

    // Regenerate QR code for each property
    for (const property of properties) {
      try {
        await property.generateQRCode();
        await property.save();
        console.log(`✅ Updated QR code for: ${property.title}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error updating ${property.title}:`, error.message);
        errorCount++;
      }
    }

    res.json({
      success: true,
      message: 'QR codes regeneration completed',
      stats: {
        total: properties.length,
        succeeded: successCount,
        failed: errorCount
      },
      frontendUrl: process.env.FRONTEND_URL
    });

  } catch (error) {
    console.error('❌ QR code regeneration failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate QR codes',
      error: error.message
    });
  }
};
