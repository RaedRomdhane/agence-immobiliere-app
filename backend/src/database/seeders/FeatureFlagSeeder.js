const FeatureFlag = require('../../models/FeatureFlag');

/**
 * Seed initial feature flags
 */
async function seedFeatureFlags() {
  try {
    // Check if admin-panel flag already exists
    const existingFlag = await FeatureFlag.findOne({ key: 'admin-panel' });
    
    if (existingFlag) {
      console.log('✅ Admin panel feature flag already exists');
      return;
    }
    
    // Create admin-panel feature flag
    const adminPanelFlag = new FeatureFlag({
      key: 'admin-panel',
      name: 'Admin Panel',
      description: 'Controls access to the admin panel and all admin routes. When disabled, admin routes will return 403 Forbidden.',
      enabled: true, // Start enabled by default
      targeting: {
        userIds: [],
        emails: [],
        roles: ['admin'], // Only admins can access when enabled
        percentage: 0,
      },
    });
    
    await adminPanelFlag.save();
    console.log('✅ Admin panel feature flag created successfully');
    
    // Create additional example flags for future use
    const exampleFlags = [
      {
        key: 'new-property-form',
        name: 'New Property Form',
        description: 'New version of the property creation form with enhanced features',
        enabled: false,
        targeting: {
          userIds: [],
          emails: [],
          roles: [],
          percentage: 0,
        },
      },
      {
        key: 'advanced-search',
        name: 'Advanced Search',
        description: 'Advanced search functionality with filters and sorting',
        enabled: false,
        targeting: {
          userIds: [],
          emails: [],
          roles: [],
          percentage: 0,
        },
      },
    ];
    
    for (const flagData of exampleFlags) {
      const exists = await FeatureFlag.findOne({ key: flagData.key });
      if (!exists) {
        await FeatureFlag.create(flagData);
        console.log(`✅ Created feature flag: ${flagData.key}`);
      }
    }
    
    console.log('✅ Feature flags seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding feature flags:', error);
    throw error;
  }
}

/**
 * Remove all feature flags (for testing/cleanup)
 */
async function clearFeatureFlags() {
  try {
    const result = await FeatureFlag.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} feature flags`);
  } catch (error) {
    console.error('❌ Error clearing feature flags:', error);
    throw error;
  }
}

module.exports = {
  seedFeatureFlags,
  clearFeatureFlags,
};
