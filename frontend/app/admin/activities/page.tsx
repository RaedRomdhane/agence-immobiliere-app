"use client";
import { useEffect, useState } from 'react';
import { getRecentAdminActivities } from '../../../lib/api/admin';
import { useRouter } from 'next/navigation';
import { UserCheck, Building2, FileText, MessageSquare } from 'lucide-react';

function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
  if (diff < 60) return `Il y a ${diff} sec`;
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  return date.toLocaleDateString('fr-FR');
}

export default function AdminActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchActivities() {
      setLoading(true);
      try {
        let token: string | undefined = undefined;
        if (typeof window !== 'undefined') {
          const rawToken = localStorage.getItem('token');
          token = rawToken !== null ? rawToken : undefined;
        }
        const data = await getRecentAdminActivities(token);
        // Debug: log the raw data received from backend
        // eslint-disable-next-line no-console
        console.log('[AdminActivitiesPage] Raw activities data:', data);
        const acts: any[] = [];
        if (data) {
          (data.users || []).forEach((u: any) => {
            acts.push({
              id: 'user-' + u._id,
              type: 'user',
              message: `Nouvel utilisateur inscrit: ${u.firstName || ''} ${u.lastName || ''}`.trim(),
              time: u.createdAt ? timeAgo(u.createdAt) : '',
              icon: UserCheck,
              color: 'blue',
            });
          });
          (data.properties || []).forEach((p: any) => {
            acts.push({
              id: 'property-' + p._id,
              type: 'property',
              message: `Nouvelle propriété ajoutée: ${p.title}`,
              time: p.createdAt ? timeAgo(p.createdAt) : '',
              icon: Building2,
              color: 'green',
            });
          });
          (data.propertyChanges || []).forEach((c: any) => {
            acts.push({
              id: 'change-' + c._id,
              type: 'propertyChange',
              message: `Modification du bien: ${c.propertyId?.title || ''} par ${c.changedBy?.firstName || ''} ${c.changedBy?.lastName || ''}`.trim(),
              time: c.changedAt ? timeAgo(c.changedAt) : '',
              icon: FileText,
              color: 'purple',
            });
          });
          (data.messages || []).forEach((m: any) => {
            acts.push({
              id: 'msg-' + m._id,
              type: 'message',
              message: `Nouveau message: ${m.subject}`,
              time: m.createdAt ? timeAgo(m.createdAt) : '',
              icon: MessageSquare,
              color: 'red',
            });
          });
        }
        if (acts.length === 0) {
          // eslint-disable-next-line no-console
          console.warn('[AdminActivitiesPage] No activities found in backend response:', data);
        }
        acts.sort((a, b) => {
          const ta = new Date(a.timeRaw || a.time || 0).getTime();
          const tb = new Date(b.timeRaw || b.time || 0).getTime();
          return tb - ta;
        });
        setActivities(acts);
      } catch (e) {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        onClick={() => router.push('/')}
      >
        Retour
      </button>
      <h1 className="text-3xl font-bold text-white mb-8">Toutes les Activités Récentes</h1>
      {loading ? (
        <div className="text-blue-200 text-lg">Chargement...</div>
      ) : activities.length === 0 ? (
        <div className="text-gray-400 text-lg">Aucune activité trouvée.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((activity) => {
            const Icon = activity.icon;
            const colors = {
              blue: 'bg-blue-100 text-blue-600',
              green: 'bg-green-100 text-green-600',
              red: 'bg-red-100 text-red-600',
              purple: 'bg-purple-100 text-purple-600',
            };
            return (
              <div key={activity.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${colors[activity.color as keyof typeof colors]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium mb-1">{activity.message}</p>
                    <p className="text-gray-500 text-sm">{activity.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
