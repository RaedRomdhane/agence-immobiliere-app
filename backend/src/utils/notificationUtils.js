const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendNotificationToAdmins } = require('../ws/notificationWS');
const { notifyUserAndWS } = require('./notificationWSUtils');

// Utility to notify all admins (DB + WebSocket)
dispatchAdminNotification = async (message, type = 'contact', relatedId = null) => {
  const admins = await User.find({ role: 'admin', isActive: true });
  const adminIds = admins.map(a => a._id);
  const createdNotifs = [];
  for (const admin of admins) {
    const notif = await Notification.create({
      user: admin._id,
      type,
      message,
      relatedId,
      read: false
    });
    createdNotifs.push({ adminId: admin._id, notif });
  }

  // Send via WebSocket to all admins
  try {
    // sendNotificationToAdmins will send the notification object to each admin id
    // We send the DB notification created for admins; if multiple, we can send each
    for (const item of createdNotifs) {
      sendNotificationToAdmins([String(item.adminId)], item.notif);
    }
  } catch (e) {
    console.error('Error sending admin notifications via WS:', e);
  }
};


// Utility to notify a user (DB + WebSocket)
notifyUser = async (userId, message, type = 'contact', relatedId = null) => {
  await notifyUserAndWS(userId, message, type, relatedId);
};

module.exports = { dispatchAdminNotification, notifyUser };
