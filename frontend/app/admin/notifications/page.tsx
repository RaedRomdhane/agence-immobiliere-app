"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';
import axios from 'axios';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      try {
        let token: string | undefined = undefined;
        if (typeof window !== 'undefined') {
          const rawToken = localStorage.getItem('token');
          token = rawToken !== null ? rawToken : undefined;
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const response = await axios.get(`${apiUrl}/notifications`, { headers });
        const allNotifications = response.data?.data || [];
        
        // Mark all notifications as read when viewing this page
        const unreadIds = allNotifications
          .filter((n: any) => !n.read)
          .map((n: any) => n._id);
        
        if (unreadIds.length > 0) {
          // Mark all as read
          await axios.patch(`${apiUrl}/notifications/mark-all-read`, {}, { headers });
        }
        
        // Filter to show only unread notifications (before marking as read)
        const unreadNotifications = allNotifications.filter((n: any) => !n.read);
        setNotifications(unreadNotifications);
      } catch (e) {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `Il y a ${diff} sec`;
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString('fr-FR');
  }

  function getIcon(type: string) {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6" />;
      case 'error':
        return <AlertCircle className="h-6 w-6" />;
      case 'info':
      default:
        return <Info className="h-6 w-6" />;
    }
  }

  function getColor(type: string) {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      case 'info':
      default:
        return 'bg-purple-100 text-purple-600';
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>
      <h1 className="text-3xl font-bold text-white mb-8">Alertes & Notifications</h1>
      {loading ? (
        <div className="text-blue-200 text-lg">Chargement...</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-400 text-lg">Aucune alerte trouvée.</div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${getColor(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                    <span className="text-gray-500 text-sm">{timeAgo(notification.createdAt)}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{notification.message}</p>
                  {!notification.read && (
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                      Non lu
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
