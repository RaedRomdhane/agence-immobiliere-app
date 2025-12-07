"use client";

import { useEffect, useState } from "react";
import { useAuth } from '@/components/auth/AuthProvider';
import apiClient from '@/lib/api/client';
import Link from "next/link";

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const handleRetour = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id) return;
      try {
        const res = await apiClient.get('/contact/my-messages');
        setMessages(res.data?.data || []);
      } catch {
        setMessages([]);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-8 max-w-3xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <button
            onClick={handleRetour}
            className="text-blue-700 hover:underline font-medium text-base px-2 py-1 rounded focus:outline-none"
          >
            &larr; Retour
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-gray-200">Messagerie</h1>
        {loading ? (
          <div className="text-center text-gray-500 py-12">Chargement...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-12">Aucun message</div>
        ) : (
          <ul className="space-y-4">
            {messages.map((msg: any) => (
              <li key={msg._id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-800 text-lg">{msg.subject || 'Sans sujet'}</span>
                  <span className={`text-xs px-2 py-1 rounded ${msg.read ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>{msg.read ? 'Lu' : 'Non lu'}</span>
                </div>
                <div className="text-gray-600 mb-2">{msg.message}</div>
                <div className="text-xs text-gray-500 mb-1">{new Date(msg.createdAt).toLocaleString()}</div>
                <Link href={`/messages/${msg._id}`} className="text-blue-700 text-sm mt-2 hover:underline font-medium">Voir la conversation</Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
