import React from 'react';

interface ChangedBy {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface PropertyHistoryItem {
  _id?: string;
  changedBy?: ChangedBy;
  changedAt: string;
  changes: any;
}

interface PropertyHistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: PropertyHistoryItem[];
  loading: boolean;
  RetourButton?: React.ReactNode;
  modalClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  emptyStateClassName?: string;
}

export default function PropertyHistoryModal({
  open,
  onClose,
  history,
  loading,
  RetourButton,
  modalClassName = "bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative",
  headerClassName = "text-xl font-bold mb-4",
  contentClassName = "",
  emptyStateClassName = "text-center py-8 text-gray-500"
}: PropertyHistoryModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className={modalClassName}>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Fermer"
        >
          ✕
        </button>
        <h2 className={headerClassName}>
          <span>📝</span> Historique des modifications
        </h2>
        <div className={contentClassName}>
          {loading ? (
            <div className="text-center py-8 text-blue-600 text-lg font-medium">Chargement...</div>
          ) : history.length === 0 ? (
            <div className={emptyStateClassName}>Aucune modification enregistrée.</div>
          ) : (
            <ul className="space-y-4 max-h-96 overflow-y-auto">
              {history.map((item: PropertyHistoryItem, idx: number) => (
                <li key={item._id || idx} className="border-b pb-2">
                  <div className="text-sm text-gray-700 mb-1">
                    <span className="font-semibold">
                      {item.changedBy?.firstName} {item.changedBy?.lastName}
                    </span>{' '}
                    a modifié le bien le{' '}
                    <span className="text-gray-500">{new Date(item.changedAt).toLocaleString()}</span>
                  </div>
                  {item.changes && item.changes.before && item.changes.after ? (
                    <table className="w-full text-xs bg-gray-50 rounded border border-gray-200 mb-2">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-2 py-1 text-left font-semibold">Champ</th>
                          <th className="px-2 py-1 text-left font-semibold">Avant</th>
                          <th className="px-2 py-1 text-left font-semibold">Après</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(item.changes.after).filter(key => {
                          // Only show fields that actually changed
                          const beforeVal = item.changes.before[key];
                          const afterVal = item.changes.after[key];
                          // Compare as JSON for objects/arrays
                          return JSON.stringify(beforeVal) !== JSON.stringify(afterVal);
                        }).map(key => (
                          <tr key={key}>
                            <td className="px-2 py-1 font-medium text-gray-700">{key}</td>
                            <td className="px-2 py-1 text-gray-500 max-w-[180px] truncate" title={typeof item.changes.before[key] === 'object' ? JSON.stringify(item.changes.before[key], null, 2) : String(item.changes.before[key])}>
                              {typeof item.changes.before[key] === 'object' ? JSON.stringify(item.changes.before[key]) : String(item.changes.before[key])}
                            </td>
                            <td className="px-2 py-1 text-blue-700 max-w-[180px] truncate" title={typeof item.changes.after[key] === 'object' ? JSON.stringify(item.changes.after[key], null, 2) : String(item.changes.after[key])}>
                              {typeof item.changes.after[key] === 'object' ? JSON.stringify(item.changes.after[key]) : String(item.changes.after[key])}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-xs text-gray-500 italic">Aucune différence détectée.</div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {RetourButton && <div className="flex justify-center">{RetourButton}</div>}
      </div>
    </div>
  );
}
