const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');

// GET /api/admin/contact/messages - List all messages
exports.getAllMessages = async (req, res) => {
  const messages = await ContactMessage.find()
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 });
  res.json(messages);
};

// GET /api/admin/contact/messages/:id - Get one message and mark as read
exports.getMessageById = async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true }
  )
    .populate('user', 'firstName lastName email');
  if (!message) return res.status(404).json({ message: 'Message not found' });
  res.json(message);
};

// POST /api/admin/contact/messages/:id/reply - Admin replies to a message or to a reply (threaded)
// Accepts optional parentReplyId in body to reply to a specific reply
exports.replyToMessage = async (req, res) => {
  const { text, parentReplyId } = req.body;
  if (!text) return res.status(400).json({ message: 'Reply text is required' });
  const message = await ContactMessage.findById(req.params.id);
  if (!message) return res.status(404).json({ message: 'Message not found' });

  // Helper to find a reply by ID recursively
  function findReplyById(replies, id) {
    for (let reply of replies) {
      if (reply && reply._id && reply._id.toString() === id) return reply;
      if (reply && reply.replies && reply.replies.length) {
        const found = findReplyById(reply.replies, id);
        if (found) return found;
      }
    }
    return null;
  }

  const newReply = {
    text,
    repliedAt: new Date(),
    admin: req.user._id,
    replies: []
  };

  if (parentReplyId) {
    if (!message.replies) message.replies = [];
    const parent = findReplyById(message.replies, parentReplyId);
    if (!parent) return res.status(404).json({ message: 'Parent reply not found' });
    parent.replies.push(newReply);
  } else {
    if (!message.replies) message.replies = [];
    message.replies.push(newReply);
  }
  message.isRead = true;
  await message.save();
  // Notify the user if message.user exists (DB + WebSocket)
  if (message.user) {
    const { notifyUserAndWS } = require('../utils/notificationWSUtils');
    await notifyUserAndWS(message.user, `Nouvelle réponse de l'administration à votre message: ${message.subject}`);
  }
  res.json({ success: true, message: 'Reply sent', data: message });
};

// GET /api/admin/contact/unread-count - Get count of unread messages for admin
exports.getUnreadMessagesCount = async (req, res) => {
  try {
    // Count messages where isRead is false (admin hasn't read them yet)
    const unreadCount = await ContactMessage.countDocuments({ isRead: false });
    const totalCount = await ContactMessage.countDocuments();
    
    res.json({ 
      success: true, 
      count: unreadCount,
      totalCount: totalCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors du comptage des messages non lus." });
  }
};
