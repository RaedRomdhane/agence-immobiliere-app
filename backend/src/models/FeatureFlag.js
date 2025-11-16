const mongoose = require('mongoose');

const featureFlagSchema = new mongoose.Schema({
  // Unique identifier for the flag
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9-_]+$/,
  },
  
  // Human-readable name
  name: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Description of what this flag controls
  description: {
    type: String,
    required: true,
  },
  
  // Global on/off switch
  enabled: {
    type: Boolean,
    default: false,
  },
  
  // Targeting strategy
  targeting: {
    // Enable for specific user IDs
    userIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    
    // Enable for specific emails (useful for testing)
    emails: [{
      type: String,
      lowercase: true,
      trim: true,
    }],
    
    // Enable for specific roles
    roles: [{
      type: String,
      enum: ['user', 'admin', 'moderator'],
    }],
    
    // Percentage rollout (0-100)
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  lastToggledAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for faster lookups
featureFlagSchema.index({ key: 1 });
featureFlagSchema.index({ enabled: 1 });

// Method to check if flag is enabled for a specific user
featureFlagSchema.methods.isEnabledForUser = function(user) {
  // If flag is globally disabled, return false
  if (!this.enabled) {
    return false;
  }
  
  // If no targeting rules, return true (enabled for everyone)
  if (!this.targeting || 
      (this.targeting.userIds.length === 0 && 
       this.targeting.emails.length === 0 && 
       this.targeting.roles.length === 0 &&
       this.targeting.percentage === 0)) {
    return true;
  }
  
  // Check if user is not provided
  if (!user) {
    return false;
  }
  
  // Check user ID targeting
  if (this.targeting.userIds && this.targeting.userIds.length > 0) {
    const hasUserId = this.targeting.userIds.some(id => 
      id.toString() === user._id.toString()
    );
    if (hasUserId) return true;
  }
  
  // Check email targeting
  if (this.targeting.emails && this.targeting.emails.length > 0) {
    const hasEmail = this.targeting.emails.includes(user.email?.toLowerCase());
    if (hasEmail) return true;
  }
  
  // Check role targeting
  if (this.targeting.roles && this.targeting.roles.length > 0) {
    const hasRole = this.targeting.roles.includes(user.role);
    if (hasRole) return true;
  }
  
  // Check percentage rollout (deterministic based on user ID)
  if (this.targeting.percentage > 0) {
    const userHash = parseInt(user._id.toString().slice(-8), 16);
    const bucket = userHash % 100;
    if (bucket < this.targeting.percentage) return true;
  }
  
  return false;
};

// Static method to check if a flag is enabled for a user
featureFlagSchema.statics.isEnabled = async function(key, user) {
  const flag = await this.findOne({ key });
  
  if (!flag) {
    // Flag doesn't exist - default to disabled
    return false;
  }
  
  return flag.isEnabledForUser(user);
};

const FeatureFlag = mongoose.model('FeatureFlag', featureFlagSchema);

module.exports = FeatureFlag;
