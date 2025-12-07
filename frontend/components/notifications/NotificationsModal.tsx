import { useState } from 'react';
import Modal from '../ui/Modal';
import { ReactNode } from 'react';

interface Notification {
  _id?: string;
  message: string;
  createdAt: string;
  read?: boolean;
  title?: string;
  type?: string;
}

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
}

export default function NotificationsModal({ open, onClose, notifications }: NotificationsModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Toutes les notifications">
      <div className="max-h-[70vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Aucune notification</div>
        ) : (
          notifications.map((notif: Notification, idx: number) => {
            // Choose icon and label based on notification type
            let icon, label, iconBg, iconColor, labelColor;
            switch (notif.type) {
              case 'appointment_accepted':
                icon = (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" /></svg>
                );
                label = 'Rendez-vous accepté';
                iconBg = 'bg-green-100';
                iconColor = 'text-green-600';
                labelColor = 'text-green-700';
                break;
              case 'appointment_denied':
                icon = (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /><circle cx="12" cy="12" r="10" /></svg>
                );
                label = 'Rendez-vous refusé';
                iconBg = 'bg-red-100';
                iconColor = 'text-red-600';
                labelColor = 'text-red-700';
                break;
              case 'appointment_request':
                icon = (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                );
                label = 'Demande de rendez-vous';
                iconBg = 'bg-blue-100';
                iconColor = 'text-blue-600';
                labelColor = 'text-blue-700';
                break;
              default:
                icon = (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                );
                label = 'Notification';
                iconBg = notif.read ? 'bg-gray-200' : 'bg-blue-100';
                iconColor = notif.read ? 'text-gray-400' : 'text-blue-600';
                labelColor = 'text-gray-700';
            }
            return (
              <div
                key={notif._id || idx}
                className={`p-4 border-b border-gray-100 flex items-start space-x-3 bg-white ${!notif.read ? '' : 'opacity-70'}`}
              >
                <div className={`p-2 rounded-full shrink-0 ${iconBg} ${iconColor}`}>{icon}</div>
                <div className="flex-1">
                  <div className={`font-semibold ${labelColor}`}>{label}</div>
                  <div className="text-sm text-gray-700 whitespace-pre-line">{notif.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
