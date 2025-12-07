// GET /api/contact/unread-count - Get count of unread messages for the logged-in user
exports.getUnreadMessagesCount = async (req, res) => {
  try {
    // Find all messages for this user
    const messages = await ContactMessage.find({ user: req.user._id });
    let unreadCount = 0;
    for (const msg of messages) {
      // Find latest admin reply (recursive)
      function findLatestAdminReply(replies) {
        let latest = null;
        for (const r of replies || []) {
          if (r.admin && (!latest || r.repliedAt > latest)) latest = r.repliedAt;
          const child = findLatestAdminReply(r.replies || []);
          if (child && (!latest || child > latest)) latest = child;
        }
        return latest;
      }
      const latestAdminReply = findLatestAdminReply(msg.replies || []);
      if (latestAdminReply && (!msg.userReadAt || latestAdminReply > msg.userReadAt)) {
        unreadCount++;
      }
    }
    res.json({ 
      success: true, 
      count: unreadCount,
      totalCount: messages.length  // Total messages count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors du comptage des messages non lus." });
  }
};
const ContactMessage = require('../models/ContactMessage');
const { dispatchAdminNotification, notifyUser } = require('../utils/notificationUtils');
// GET /api/contact/my-messages - Get all messages for the logged-in user
exports.getMyMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Helper to find latest admin reply recursively
    function findLatestAdminReply(replies) {
      let latest = null;
      for (const r of replies || []) {
        if (r.admin && (!latest || r.repliedAt > latest)) latest = r.repliedAt;
        const child = findLatestAdminReply(r.replies || []);
        if (child && (!latest || child > latest)) latest = child;
      }
      return latest;
    }

    // Add 'read' property to each message
    const messagesWithRead = messages.map(msg => {
      const latestAdminReply = findLatestAdminReply(msg.replies || []);
      let read = true;
      if (latestAdminReply && (!msg.userReadAt || latestAdminReply > msg.userReadAt)) {
        read = false;
      }
      return { ...msg, read };
    });

    // Mark all as read (update userReadAt to now)
    await ContactMessage.updateMany({ user: req.user._id }, { $set: { userReadAt: new Date() } });
    res.json({ success: true, data: messagesWithRead });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de la récupération des messages." });
  }
};

// POST /api/contact/messages/:id/reply - User replies to a message or to a reply (threaded)
// Accepts optional parentReplyId in body to reply to a specific reply
exports.replyToMessage = async (req, res) => {
  try {
    const { text, parentReplyId } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Le texte de la réponse est requis.' });
    const message = await ContactMessage.findOne({ _id: req.params.id, user: req.user._id });
    if (!message) return res.status(404).json({ success: false, message: 'Message non trouvé.' });

    // Helper to find a reply by ID recursively
    function findReplyById(replies, id) {
      for (let reply of replies) {
        if (reply._id.toString() === id) return reply;
        if (reply.replies && reply.replies.length) {
          const found = findReplyById(reply.replies, id);
          if (found) return found;
        }
      }
      return null;
    }

    const newReply = {
      text,
      repliedAt: new Date(),
      user: req.user._id,
      replies: []
    };

    if (parentReplyId) {
      // Find the parent reply and add as a child
      if (!message.replies) message.replies = [];
      const parent = findReplyById(message.replies, parentReplyId);
      if (!parent) return res.status(404).json({ success: false, message: 'Parent reply non trouvée.' });
      parent.replies.push(newReply);
    } else {
      // Add as a root reply
      if (!message.replies) message.replies = [];
      message.replies.push(newReply);
    }
    await message.save();
    // Notify all admins
    await dispatchAdminNotification(`Nouvelle réponse utilisateur sur le message: ${message.subject}`);
    res.json({ success: true, message: 'Réponse envoyée.', data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur lors de l'envoi de la réponse." });
  }
};

// POST /api/contact
exports.sendContactMessage = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Sujet et message sont requis.' });
    }

    // If user is authenticated, get info from req.user
    let userInfo = {};
    if (req.user) {
      userInfo = {
        user: req.user._id,
        name: req.user.firstName + ' ' + req.user.lastName,
        email: req.user.email,
        phone: req.user.phone || '',
      };
    }

    const contactMessage = new ContactMessage({
      ...userInfo,
      subject,
      message
    });
    await contactMessage.save();
    // Notify all admins
    await dispatchAdminNotification(`Nouveau message de contact: ${userInfo.name || 'Utilisateur'} - Sujet: ${subject}`);
    res.status(201).json({ success: true, message: 'Message envoyé avec succès.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi du message.' });
  }
};
