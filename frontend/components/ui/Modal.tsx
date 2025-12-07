import React, { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl drop-shadow-2xl border-4 border-white max-w-2xl w-full mx-4 relative mt-20">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
