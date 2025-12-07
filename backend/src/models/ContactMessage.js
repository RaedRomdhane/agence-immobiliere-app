const mongoose = require('mongoose');



// Recursive reply schema for both admin and user replies
const replySchema = new mongoose.Schema({
  text: { type: String, required: true },
  repliedAt: { type: Date, default: Date.now },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // for admin replies
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // for user replies
  replies: [this], // recursive: replies to this reply
}, { _id: true });

const contactMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  userReadAt: { type: Date }, // last time user read the message
  replies: [replySchema], // all replies (admin/user) as a tree
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
