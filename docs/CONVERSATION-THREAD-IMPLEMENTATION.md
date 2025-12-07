# Conversation Thread Implementation for Reviews

## Overview
This document describes the implementation of a bidirectional conversation thread system for reviews, replacing the single admin reply with a full conversation capability between users and admins.

## Changes Made

### 1. Backend Changes

#### A. Model Updates (`backend/src/models/Review.js`)
- **Added `replies` array** with conversation thread structure:
  ```javascript
  replies: [{
    author: ObjectId (ref: 'User'),
    authorRole: { type: String, enum: ['admin', 'client'] },
    message: { type: String, required: true, maxlength: 1000 },
    createdAt: Date,
    updatedAt: Date
  }]
  ```
- **Kept legacy fields** for backward compatibility:
  - `adminReply` (String)
  - `adminRepliedAt` (Date)

#### B. Controller Updates (`backend/src/controllers/reviewController.js`)

**New Functions:**
1. **`addReplyToReview`** (POST `/api/reviews/:id/reply`)
   - Allows both admin and review owner to add replies
   - Adds new message to `replies` array
   - Updates legacy `adminReply` field when admin replies
   - Sends appropriate notifications:
     - Admin reply → notifies review owner: "L'équipe ImmoExpress a répondu à votre avis"
     - User reply → notifies admins: "{firstName} {lastName} a répondu à votre message sur son avis"

2. **`updateReplyInReview`** (PUT `/api/reviews/:reviewId/reply/:replyId`)
   - Allows reply author to edit their message
   - Updates `message` and `updatedAt` timestamp
   - Maintains legacy field sync for admin replies
   - Sends modification notifications:
     - Admin modified → notifies user: "L'équipe ImmoExpress a modifié sa réponse à votre avis"
     - User modified → notifies admins: "{firstName} {lastName} a modifié sa réponse sur son avis"

3. **`replyToReview`** (PUT `/api/reviews/admin/:id/reply`) - Legacy
   - Redirects to `addReplyToReview` for backward compatibility

**Updated Functions:**
- `getReviews` - Added `.populate('replies.author', 'firstName lastName avatar role')`
- `getMyReview` - Added replies population
- `getAllReviewsAdmin` - Added replies population

#### C. Route Updates (`backend/src/routes/reviewRoutes.js`)
```javascript
// New conversation thread routes
router.post('/:id/reply', protect, addReplyToReview);
router.put('/:reviewId/reply/:replyId', protect, updateReplyInReview);

// Legacy route (backward compatible)
router.put('/admin/:id/reply', protect, restrictTo('admin'), replyToReview);
```

#### D. Notification Model (`backend/src/models/Notification.js`)
- Already updated with 'review' enum type
- Already includes `relatedId` field for linking to review

### 2. Frontend Changes

#### A. Admin Reviews Page (`frontend/app/admin/reviews/page.tsx`)

**New Interface:**
```typescript
interface Reply {
  _id: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
  authorRole: 'admin' | 'client';
  message: string;
  createdAt: string;
  updatedAt: string;
}
```

**New State:**
- `editingReplyId` - Tracks which reply is being edited

**New Functions:**
- `handleReply()` - Uses new POST endpoint
- `handleEditReply()` - Handles reply modifications

**UI Changes:**
- Replaced single admin reply display with conversation thread
- Shows all replies with author info and timestamps
- Displays "(modifié)" badge when `createdAt !== updatedAt`
- Edit button for admin's own replies
- Form supports both create and edit modes

#### B. Public Reviews Page (`frontend/app/reviews/page.tsx`)

**New State:**
- `replyingToReview` - Tracks which review user is replying to
- `replyText` - Reply message text
- `editingReplyId` - Tracks which reply is being edited

**New Functions:**
- `handleReplyToReview()` - User responds to admin
- `handleEditReply()` - User edits their reply

**UI Changes:**
- Conversation thread display for all reviews
- Reply form only visible to review owner (myReview check)
- "Répondre à l'équipe" button for review owners
- Edit capability for user's own replies
- Visual distinction between admin and user messages

### 3. Migration Script

**Created:** `backend/migrations/add-replies-to-reviews.js`
- Initializes `replies` array for existing reviews
- Migrates existing `adminReply` to new format
- Preserves timestamps

**Usage:**
```bash
cd backend
node migrations/add-replies-to-reviews.js
```

## Notification Behavior

### User Actions → Admin Notifications
1. **User creates review**
   - Message: "{firstName} {lastName} a laissé un avis avec {rating} étoiles"
   - Type: 'review'

2. **User modifies review**
   - Message: "{firstName} {lastName} a modifié son avis"
   - Type: 'review'

3. **User replies to admin**
   - Message: "{firstName} {lastName} a répondu à votre message sur son avis"
   - Type: 'review'

4. **User modifies their reply**
   - Message: "{firstName} {lastName} a modifié sa réponse sur son avis"
   - Type: 'review'

### Admin Actions → User Notifications
1. **Admin replies to review**
   - Message: "L'équipe ImmoExpress a répondu à votre avis"
   - Type: 'review'

2. **Admin modifies their reply**
   - Message: "L'équipe ImmoExpress a modifié sa réponse à votre avis"
   - Type: 'review'

## API Endpoints

### New Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/reviews/:id/reply` | Authenticated | Add reply to conversation (admin or review owner) |
| PUT | `/api/reviews/:reviewId/reply/:replyId` | Authenticated | Edit own reply in conversation |

### Updated Endpoints
| Method | Endpoint | Changes |
|--------|----------|---------|
| GET | `/api/reviews` | Now populates `replies.author` |
| GET | `/api/reviews/my-review` | Now populates `replies.author` |
| GET | `/api/reviews/admin/all` | Now populates `replies.author` |

## Testing Checklist

### Backend Testing
- [ ] Admin can add reply to any review
- [ ] Review owner can reply to admin's message
- [ ] Admin receives notification when user replies
- [ ] User receives notification when admin replies
- [ ] Reply author can edit their own reply
- [ ] Notifications show "new" vs "modified" correctly
- [ ] Legacy `adminReply` field stays synced
- [ ] Replies are populated with author info

### Frontend Testing
- [ ] Admin sees conversation thread on reviews page
- [ ] Admin can reply to reviews
- [ ] Admin can edit their own replies
- [ ] User sees conversation thread on their review
- [ ] User can reply to admin messages
- [ ] User can edit their own replies
- [ ] "(modifié)" badge shows when reply is edited
- [ ] Reply button only shows for review owner
- [ ] Real-time notifications work for both parties

## Backward Compatibility
- Legacy `adminReply` and `adminRepliedAt` fields maintained
- Old admin reply endpoint (`PUT /api/reviews/admin/:id/reply`) still works
- Existing reviews without `replies` array will display correctly
- Migration script ensures data consistency

## Next Steps (Optional Enhancements)
1. Add delete reply functionality
2. Add reply pagination for long conversations
3. Add rich text formatting for replies
4. Add file attachments to replies
5. Add "mark as resolved" for review threads
6. Add email notifications alongside WebSocket
