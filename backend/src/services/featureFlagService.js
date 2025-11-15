const FeatureFlag = require('../models/FeatureFlag');

class FeatureFlagService {
  /**
   * Check if a feature flag is enabled for a specific user
   * @param {string} key - Feature flag key
   * @param {Object} user - User object (optional)
   * @returns {Promise<boolean>}
   */
  static async isEnabled(key, user = null) {
    try {
      return await FeatureFlag.isEnabled(key, user);
    } catch (error) {
      console.error(`Error checking feature flag ${key}:`, error);
      // Fail closed - if there's an error, return false
      return false;
    }
  }
  
  /**
   * Get all feature flags
   * @returns {Promise<Array>}
   */
  static async getAllFlags() {
    return await FeatureFlag.find().sort({ createdAt: -1 });
  }
  
  /**
   * Get a specific feature flag by key
   * @param {string} key - Feature flag key
   * @returns {Promise<Object>}
   */
  static async getFlag(key) {
    return await FeatureFlag.findOne({ key });
  }
  
  /**
   * Create a new feature flag
   * @param {Object} flagData - Feature flag data
   * @param {Object} creator - User creating the flag
   * @returns {Promise<Object>}
   */
  static async createFlag(flagData, creator) {
    const flag = new FeatureFlag({
      ...flagData,
      createdBy: creator._id,
      updatedBy: creator._id,
    });
    
    return await flag.save();
  }
  
  /**
   * Update a feature flag
   * @param {string} key - Feature flag key
   * @param {Object} updates - Updates to apply
   * @param {Object} updater - User updating the flag
   * @returns {Promise<Object>}
   */
  static async updateFlag(key, updates, updater) {
    const flag = await FeatureFlag.findOne({ key });
    
    if (!flag) {
      throw new Error('Feature flag not found');
    }
    
    // Update fields
    Object.keys(updates).forEach(field => {
      if (field !== 'key' && field !== 'createdBy' && updates[field] !== undefined) {
        if (field === 'targeting') {
          flag.targeting = {
            ...flag.targeting,
            ...updates.targeting,
          };
        } else {
          flag[field] = updates[field];
        }
      }
    });
    
    flag.updatedBy = updater._id;
    
    return await flag.save();
  }
  
  /**
   * Toggle a feature flag on/off
   * @param {string} key - Feature flag key
   * @param {Object} updater - User toggling the flag
   * @returns {Promise<Object>}
   */
  static async toggleFlag(key, updater) {
    const flag = await FeatureFlag.findOne({ key });
    
    if (!flag) {
      throw new Error('Feature flag not found');
    }
    
    flag.enabled = !flag.enabled;
    flag.lastToggledAt = new Date();
    flag.updatedBy = updater._id;
    
    return await flag.save();
  }
  
  /**
   * Delete a feature flag
   * @param {string} key - Feature flag key
   * @returns {Promise<Object>}
   */
  static async deleteFlag(key) {
    const flag = await FeatureFlag.findOneAndDelete({ key });
    
    if (!flag) {
      throw new Error('Feature flag not found');
    }
    
    return flag;
  }
  
  /**
   * Add users to whitelist (email or ID)
   * @param {string} key - Feature flag key
   * @param {Array} emails - Email addresses to add
   * @param {Array} userIds - User IDs to add
   * @param {Object} updater - User updating the flag
   * @returns {Promise<Object>}
   */
  static async addToWhitelist(key, emails = [], userIds = [], updater) {
    const flag = await FeatureFlag.findOne({ key });
    
    if (!flag) {
      throw new Error('Feature flag not found');
    }
    
    // Add emails
    emails.forEach(email => {
      const emailLower = email.toLowerCase().trim();
      if (!flag.targeting.emails.includes(emailLower)) {
        flag.targeting.emails.push(emailLower);
      }
    });
    
    // Add user IDs
    userIds.forEach(userId => {
      if (!flag.targeting.userIds.includes(userId)) {
        flag.targeting.userIds.push(userId);
      }
    });
    
    flag.updatedBy = updater._id;
    
    return await flag.save();
  }
  
  /**
   * Remove users from whitelist
   * @param {string} key - Feature flag key
   * @param {Array} emails - Email addresses to remove
   * @param {Array} userIds - User IDs to remove
   * @param {Object} updater - User updating the flag
   * @returns {Promise<Object>}
   */
  static async removeFromWhitelist(key, emails = [], userIds = [], updater) {
    const flag = await FeatureFlag.findOne({ key });
    
    if (!flag) {
      throw new Error('Feature flag not found');
    }
    
    // Remove emails
    flag.targeting.emails = flag.targeting.emails.filter(
      email => !emails.map(e => e.toLowerCase().trim()).includes(email)
    );
    
    // Remove user IDs
    flag.targeting.userIds = flag.targeting.userIds.filter(
      id => !userIds.includes(id.toString())
    );
    
    flag.updatedBy = updater._id;
    
    return await flag.save();
  }
  
  /**
   * Get all flags evaluated for a specific user
   * @param {Object} user - User object
   * @returns {Promise<Object>} - Object with flag keys as keys and boolean values
   */
  static async getAllFlagsForUser(user) {
    const flags = await FeatureFlag.find();
    const result = {};
    
    flags.forEach(flag => {
      result[flag.key] = flag.isEnabledForUser(user);
    });
    
    return result;
  }
}

module.exports = FeatureFlagService;
