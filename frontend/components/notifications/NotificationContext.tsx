"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNotificationWebSocket } from '@/utils/useNotificationWebSocket';
import apiClient from '@/lib/api/client';

interface Notification {
  _id?: string;
  message: string;
  createdAt: string;
  read?: boolean;
  title?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  lastNotification: Notification | null;
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastNotification, setLastNotification] = useState<Notification | null>(null);
  const [lastSeenNotificationId, setLastSeenNotificationId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  // Get userId from token or localStorage (adjust as needed for your auth)
  const [userId, setUserId] = useState<string | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Adjust this logic if you store user differently
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const token = localStorage.getItem('token');
      setUserId(user?.id || null);
      setCurrentToken(token);
      const lastSeenId = localStorage.getItem('lastSeenNotificationId');
      setLastSeenNotificationId(lastSeenId || null);
    }
  }, []);
  // Real-time WebSocket: update notifications instantly
  useNotificationWebSocket(userId || '', async (notif) => {
    setNotifications((prev) => [notif, ...prev]);
    setUnreadCount((prev) => prev + 1);
    setLastNotification(notif);
    if (notif._id) {
      setLastSeenNotificationId(notif._id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastSeenNotificationId', notif._id);
      }
      // Mark as read in backend
      try {
        await apiClient.patch(`/notifications/${notif._id}/read`);
        setNotifications((prev) => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      } catch (err) {
        // ignore error
      }
    }
  });

  const fetchNotifications = useCallback(async () => {
    // Only fetch if token exists
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      setLastNotification(null);
      return;
    }
    try {
      const res = await apiClient.get('/notifications');
      const notifList = res.data?.data || [];
      setNotifications(notifList);
      setUnreadCount(notifList.filter((n: any) => !n.read).length);
      if (notifList.length > 0) {
        const sorted = notifList.slice().sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLastNotification(sorted[0]);
      } else {
        setLastNotification(null);
      }
    } catch (err) {
      setNotifications([]);
      setUnreadCount(0);
      setLastNotification(null);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    //const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
    //return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Watch for token/user changes and refetch immediately
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkForChanges = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const newUserId = user?.id || null;
      
      // If token or user changed, clear state and refetch
      if (token !== currentToken || newUserId !== userId) {
        setCurrentToken(token);
        setUserId(newUserId);
        
        // Clear old data immediately
        setNotifications([]);
        setUnreadCount(0);
        setLastNotification(null);
        
        // Fetch new data
        fetchNotifications();
      }
    };
    
    // Check immediately on mount
    checkForChanges();
    
    // Listen for storage events (from other tabs)
    window.addEventListener('storage', checkForChanges);
    
    // Poll for changes (in case storage event doesn't fire in same tab)
    const interval = setInterval(checkForChanges, 500);
    
    return () => {
      window.removeEventListener('storage', checkForChanges);
      clearInterval(interval);
    };
  }, [currentToken, userId, fetchNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, lastNotification, unreadCount, refreshNotifications: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used within a NotificationProvider');
  return ctx;
};