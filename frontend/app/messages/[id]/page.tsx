"use client";


import { useEffect, useState } from "react";
import { useAuth } from '@/components/auth/AuthProvider';
import apiClient from '@/lib/api/client';
import Link from "next/link";
import { useParams } from 'next/navigation';

export default function MessageDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessage = async () => {
      if (!user?.id || !id) return;
      try {
        const res = await apiClient.get(`/contact/my-messages`);
        const found = (res.data?.data || []).find((m: any) => m._id === id);
        if (!found) setError("Message introuvable");
        setMessage(found);
      } catch {
        setError("Erreur lors du chargement du message.");
      }
      setLoading(false);
    };
    fetchMessage();
  }, [user, id]);

  if (loading) return <div className="text-center text-gray-500 py-12">Chargement...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!message) return <div className="text-center text-gray-400 py-12">Message introuvable</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-8 max-w-2xl mx-auto px-4">
        <div className="flex items-center mb-6">
          <Link href="/messages" className="text-blue-700 hover:underline font-medium text-base">&larr; Retour à la messagerie</Link>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-blue-700">{message.subject}</h1>
          <div className="mb-4 text-sm text-gray-500">{new Date(message.createdAt).toLocaleString()}</div>
          <div className="mb-6 text-lg text-gray-800 whitespace-pre-line">{message.message}</div>
        </div>
        {message.replies && message.replies.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="font-semibold mb-4 text-blue-600 text-lg">Réponses</h2>
            <RepliesTree replies={message.replies} />
          </div>
        )}
      </main>
    </div>
  );
}

function RepliesTree({ replies }: { replies: any[] }) {
  return (
    <ul className="ml-4 border-l-2 border-blue-200 pl-4">
      {replies.map((reply) => (
        <li key={reply._id} className="mb-6">
          <div className="flex items-start">
            <div className="flex-1">
              <div className="text-gray-800 text-base mb-1 font-medium">{reply.text}</div>
              <div className="text-xs text-gray-400 mb-1">{new Date(reply.repliedAt).toLocaleString()}</div>
            </div>
          </div>
          {reply.replies && reply.replies.length > 0 && (
            <div className="ml-4 border-l-2 border-blue-100 pl-4 mt-2">
              <RepliesTree replies={reply.replies} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
