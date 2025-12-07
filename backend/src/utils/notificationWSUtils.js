const { sendNotificationToUser } = require('../ws/notificationWS');
const Notification = require('../models/Notification');

// Wrap Notification.create to also send via WebSocket
async function notifyUserAndWS(userId, message, type = 'contact', relatedId = null) {
  // Create in DB
  const notif = await Notification.create({
    user: userId,
    type,
    message,
    relatedId,
    read: false
  });
  // Send via WebSocket
  sendNotificationToUser(userId, notif);
  return notif;
}

module.exports = { notifyUserAndWS };