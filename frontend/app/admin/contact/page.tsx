"use client";

import { useEffect, useState } from "react";
import api from "../../../utils/api";
import Header from '@/components/layout/Header';
import ThreadedReplies from './ThreadedReplies';

type UserInfo = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};


type ReplyInfo = {
  _id: string;
  text: string;
  repliedAt?: string | Date;
  admin?: string;
  user?: string;
  replies?: ReplyInfo[];
};

type ContactMessage = {
  _id: string;
  user?: UserInfo;
  name?: string;
  email?: string;
  phone?: string;
  subject: string;
  message: string;
  isRead?: boolean;
  replies?: ReplyInfo[];
  createdAt: string;
};


export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [replyLoading, setReplyLoading] = useState(false);
  const [replySuccess, setReplySuccess] = useState("");

  useEffect(() => {
    api.get("/admin/contact/messages").then(res => setMessages(res.data));
  }, []);

  const openMessage = async (msg: ContactMessage) => {
    const res = await api.get<ContactMessage>(`/admin/contact/messages/${msg._id}`);
    setSelected(res.data);
  };


  // Threaded reply handler for admin
  const handleThreadedReply = async (replyText: string, parentReplyId: string | null) => {
    if (!selected) return;
    setReplyLoading(true);
    setReplySuccess("");
    await api.post(`/admin/contact/messages/${selected._id}/reply`, { text: replyText, parentReplyId });
    // Refresh selected message
    const res = await api.get<ContactMessage>(`/admin/contact/messages/${selected._id}`);
    setSelected(res.data);
    setReplyLoading(false);
    setReplySuccess("Réponse envoyée.");
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100 pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-10 text-center text-gray-900 tracking-tight">Gestion des messages de contact</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Message list */}
            <div className="col-span-1 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b bg-linear-to-r from-blue-50 to-indigo-50">
                <h2 className="text-lg font-semibold text-gray-800">Messages reçus</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {messages.length === 0 && (
                  <li className="p-6 text-gray-400 text-center">Aucun message</li>
                )}
                {messages.map((msg: ContactMessage) => (
                  <li
                    key={msg._id}
                    className={`p-6 cursor-pointer transition-colors ${selected?._id === msg._id ? 'bg-blue-50' : 'hover:bg-gray-50'} ${msg.isRead ? 'text-gray-500' : 'font-semibold text-gray-900'}`}
                    onClick={() => openMessage(msg)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base font-medium">{msg.subject}</span>
                      {msg.isRead ? <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">lu</span> : <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">non lu</span>}
                    </div>
                    <div className="text-sm text-gray-700">{msg.user ? `${msg.user.firstName} ${msg.user.lastName}` : msg.name}</div>
                    <div className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Message details and reply */}
            <div className="col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-8 min-h-[350px] flex flex-col">
              {selected ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selected.subject}</h2>
                    <div className="mb-1 text-gray-700">De : <span className="font-medium">{selected.user ? `${selected.user.firstName} ${selected.user.lastName} (${selected.user.email})` : selected.name}</span></div>
                    <div className="mb-4 text-gray-800 whitespace-pre-line border-l-4 border-blue-200 pl-4 py-2 bg-blue-50">{selected.message}</div>
                  </div>
                  {/* Threaded replies for admin and user, with reply buttons */}
                  <ThreadedReplies
                    message={selected}
                    onReply={handleThreadedReply}
                    loading={replyLoading}
                  />
                  {replySuccess && <div className="text-green-600 font-medium text-center mt-4">{replySuccess}</div>}
                </>
              ) : (
                <div className="text-gray-400 text-center my-auto">Sélectionnez un message pour voir les détails et répondre.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
