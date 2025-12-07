"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserCheck, X } from 'lucide-react';

export default function PendingValidationsPage() {
  const router = useRouter();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPendingUsers() {
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
        
        // Fetch users with isActive=false or similar pending logic
        const response = await fetch(`${apiUrl}/users?isActive=false`, { headers });
        const data = await response.json();
        setPendingUsers(data?.message || []);
      } catch (e) {
        setPendingUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPendingUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>
      <h1 className="text-3xl font-bold text-white mb-8">Validations en Attente</h1>
      {loading ? (
        <div className="text-blue-200 text-lg">Chargement...</div>
      ) : pendingUsers.length === 0 ? (
        <div className="text-gray-400 text-lg">Aucune validation en attente.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingUsers.map((user) => (
            <div key={user._id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <UserCheck className="h-8 w-8 text-orange-400" />
                <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">En attente</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-600 text-sm mb-1">{user.email}</p>
              <p className="text-gray-500 text-xs">Rôle: {user.role}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
