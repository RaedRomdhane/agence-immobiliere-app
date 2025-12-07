"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Mail, MailOpen } from 'lucide-react';
import axios from 'axios';

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessages() {
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
        
        const response = await axios.get(`${apiUrl}/admin/contact/messages`, { headers });
        setMessages(response.data || []);
      } catch (e) {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
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

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>
      <h1 className="text-3xl font-bold text-white mb-8">Messages</h1>
      {loading ? (
        <div className="text-blue-200 text-lg">Chargement...</div>
      ) : messages.length === 0 ? (
        <div className="text-gray-400 text-lg">Aucun message trouvé.</div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                  {message.read ? <MailOpen className="h-6 w-6" /> : <Mail className="h-6 w-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{message.subject}</h3>
                    <span className="text-gray-500 text-sm">{timeAgo(message.createdAt)}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{message.message}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>De: {message.user?.email || 'Anonyme'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
