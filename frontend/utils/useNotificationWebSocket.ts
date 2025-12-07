import { useEffect } from 'react';

export function useNotificationWebSocket(userId: string, onNotification: (notif: any) => void) {
  useEffect(() => {
    if (!userId) return;
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws?userId=${userId}`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          onNotification(data.notification);
        }
      } catch {}
    };
    return () => ws.close();
  }, [userId, onNotification]);
}
