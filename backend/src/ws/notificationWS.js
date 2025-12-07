const WebSocket = require('ws');

let wss;
const userSockets = new Map(); // userId -> Set of sockets

function setupWebSocket(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    // Expect userId as a query param: ws://.../ws?userId=xxx
    const url = new URL(req.url, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    if (userId) {
      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId).add(ws);
      ws.on('close', () => {
        userSockets.get(userId).delete(ws);
        if (userSockets.get(userId).size === 0) userSockets.delete(userId);
      });
    }
  });
}

function sendNotificationToUser(userId, notification) {
  const sockets = userSockets.get(String(userId));
  if (sockets) {
    for (const ws of sockets) {
      ws.send(JSON.stringify({ type: 'notification', notification }));
    }
  }
}

function sendNotificationToAdmins(adminIds, notification) {
  for (const adminId of adminIds) {
    sendNotificationToUser(adminId, notification);
  }
}

module.exports = { setupWebSocket, sendNotificationToUser, sendNotificationToAdmins };
