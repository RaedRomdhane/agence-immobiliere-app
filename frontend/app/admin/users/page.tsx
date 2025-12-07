"use client";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import Link from "next/link";
import { userApi } from "@/lib/api/user";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  // Filter states
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        let token: string | undefined = undefined;
        if (typeof window !== "undefined") {
          const rawToken = localStorage.getItem("token");
          token = rawToken !== null ? rawToken : undefined;
        }
        const res = await userApi.getAllUsers({}, token);
        setUsers(res || []);
      } catch (e) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Filtering logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      search.trim() === "" ||
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = role === "" || user.role === role;
    const matchesStatus = status === "" || (status === "active" ? user.isActive : !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen min-w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-start p-0 w-full h-full">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center py-10 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full flex flex-col items-center py-10 px-6 md:px-12">
          <div className="bg-blue-100 p-6 rounded-full mb-6">
            <Users className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-center mb-2 text-gray-900 tracking-tight">Gestion Utilisateurs</h1>
          <p className="text-gray-600 text-center mb-6 text-lg">
            Gérer tous les utilisateurs de la plateforme
          </p>
          <Link href="/" className="text-blue-600 hover:underline text-sm mb-6">← Retour au tableau de bord</Link>

          {/* Filters */}
          <div className="w-full flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
            <input
              type="text"
              placeholder="Recherche nom, prénom, email..."
              className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 placeholder-gray-400 text-base font-medium"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 text-base font-medium"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="client">Client</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-900 text-base font-medium"
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>

          <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
            {loading ? (
              <div className="text-gray-400 text-center py-12 text-lg">Chargement...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-gray-400 text-center py-12 text-lg">Aucun utilisateur trouvé.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Nom</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wider">Créé le</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 capitalize">{user.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isActive ? (
                          <span className="inline-block px-3 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">Actif</span>
                        ) : (
                          <span className="inline-block px-3 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">Inactif</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
