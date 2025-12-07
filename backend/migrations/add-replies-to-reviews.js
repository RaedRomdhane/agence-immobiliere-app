/**
 * Migration: Add replies array to existing reviews
 * This migration initializes the replies array for all existing reviews
 * and optionally migrates existing adminReply to the new conversation format
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import Review model
const Review = require('../src/models/Review');

const migrateReviews = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agence-immobiliere', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Find all reviews without replies array or with adminReply but no replies
    const reviewsToUpdate = await Review.find({
      $or: [
        { replies: { $exists: false } },
        { replies: { $size: 0 }, adminReply: { $exists: true, $ne: null } }
      ]
    });

    console.log(`📊 Found ${reviewsToUpdate.length} reviews to migrate`);

    let migratedCount = 0;
    let repliesCreated = 0;

    for (const review of reviewsToUpdate) {
      // Initialize replies array if it doesn't exist
      if (!review.replies) {
        review.replies = [];
      }

      // Migrate existing adminReply to replies array if present
      if (review.adminReply && review.adminReply.trim().length > 0) {
        // Check if this reply was already migrated
        const adminRepliesExist = review.replies.some(r => r.authorRole === 'admin');
        
        if (!adminRepliesExist) {
          // Find an admin user to attribute the reply to
          const User = require('../src/models/User');
          const adminUser = await User.findOne({ role: 'admin' }).sort('createdAt');

          if (adminUser) {
            review.replies.push({
              author: adminUser._id,
              authorRole: 'admin',
              message: review.adminReply,
              createdAt: review.adminRepliedAt || review.updatedAt || new Date(),
              updatedAt: review.adminRepliedAt || review.updatedAt || new Date()
            });
            repliesCreated++;
          }
        }
      }

      await review.save();
      migratedCount++;
    }

    console.log(`✅ Migration completed successfully`);
    console.log(`   - Reviews updated: ${migratedCount}`);
    console.log(`   - Replies created: ${repliesCreated}`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run migration
migrateReviews();
