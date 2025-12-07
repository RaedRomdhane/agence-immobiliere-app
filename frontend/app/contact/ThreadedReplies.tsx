import React, { useState } from 'react';

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
  subject: string;
  message: string;
  replies?: ReplyInfo[];
  createdAt: string;
};

interface ThreadedRepliesProps {
  message: ContactMessage;
  onReply: (replyText: string, parentReplyId: string | null) => Promise<void>;
  loading: boolean;
}


// Recursive threaded reply rendering

function ThreadedReplyNode({
  rep,
  level,
  onReply,
  loading,
  replyFormId,
  setReplyFormId,
  replyText,
  setReplyText
}: {
  rep: ReplyInfo;
  level: number;
  onReply: (replyText: string, parentReplyId: string) => Promise<void>;
  loading: boolean;
  replyFormId: string | null;
  setReplyFormId: React.Dispatch<React.SetStateAction<string | null>>;
  replyText: string;
  setReplyText: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <div
      className={`my-2 p-4 rounded-xl border ${rep.admin ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}
      style={{ marginLeft: `${level * 24}px` }}
    >
      <div className="text-gray-800 mb-1">{rep.text}</div>
      <div className="text-xs text-gray-500">{rep.repliedAt && new Date(rep.repliedAt).toLocaleString()}</div>
      <button
        className="mt-2 text-xs text-blue-600 hover:underline"
        onClick={() => {
          setReplyFormId(rep._id);
          setReplyText('');
        }}
      >Répondre</button>
      {replyFormId === rep._id && (
        <form
          className="mt-2 flex flex-col gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await onReply(replyText, rep._id);
            setReplyFormId(null);
            setReplyText('');
          }}
        >
          <textarea
            className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900"
            rows={2}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder="Votre réponse..."
            required
          />
          <button
            type="submit"
            className="self-end bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded text-xs font-semibold"
            disabled={loading}
          >{loading ? 'Envoi...' : 'Envoyer'}</button>
        </form>
      )}
      {/* Render nested replies recursively */}
      {rep.replies && rep.replies.map((child) => (
        <ThreadedReplyNode
          key={child._id}
          rep={child}
          level={level + 1}
          onReply={onReply}
          loading={loading}
          replyFormId={replyFormId}
          setReplyFormId={setReplyFormId}
          replyText={replyText}
          setReplyText={setReplyText}
        />
      ))}
    </div>
  );
}

export default function ThreadedReplies({ message, onReply, loading }: ThreadedRepliesProps) {
  const [replyFormId, setReplyFormId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  return (
    <div>
      {/* Root message */}
      <div className="mb-2 p-4 rounded-xl border border-gray-300 bg-gray-50">
        <div className="text-gray-900 font-semibold mb-1">{message.message}</div>
        <div className="text-xs text-gray-500 mb-2">{new Date(message.createdAt).toLocaleString()}</div>
        <button
          className="text-xs text-blue-600 hover:underline"
          onClick={() => {
            setReplyFormId('root');
            setReplyText('');
          }}
        >Répondre</button>
        {replyFormId === 'root' && (
          <form
            className="mt-2 flex flex-col gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              await onReply(replyText, null);
              setReplyFormId(null);
              setReplyText('');
            }}
          >
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 text-sm text-gray-900"
              rows={2}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Votre réponse..."
              required
            />
            <button
              type="submit"
              className="self-end bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded text-xs font-semibold"
              disabled={loading}
            >{loading ? 'Envoi...' : 'Envoyer'}</button>
          </form>
        )}
      </div>
      {/* All replies (threaded) */}
      {message.replies && message.replies.map((rep) => (
        <ThreadedReplyNode
          key={rep._id}
          rep={rep}
          level={1}
          onReply={onReply}
          loading={loading}
          replyFormId={replyFormId}
          setReplyFormId={setReplyFormId}
          replyText={replyText}
          setReplyText={setReplyText}
        />
      ))}
    </div>
  );
}