'use client';

import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/components/auth/AuthProvider';
import FeatureFlagsManager from './FeatureFlagsManager';
import { 
  Users, 
  Building2, 
  FileText, 
  Settings,
  TrendingUp,
  Shield,
  AlertCircle,
  BarChart3,
  UserCheck,
  Home,
  MessageSquare,
  Bell,
  Calendar,
  ArrowRight,
  Activity
} from 'lucide-react';


import { useEffect, useState } from 'react';
import { userApi } from '@/lib/api/user';
import { getProperties } from '@/lib/api/properties';

type Stats = {
  totalUsers: number;
  newUsersThisMonth: number;
  totalProperties: number;
  soldProperties: number;
  rentedProperties: number;
  pendingApprovals: number;
  revenueThisMonth: string;
  revenueChangePercent: number;
};

export default function AdminDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalProperties: 0,
    soldProperties: 0,
    rentedProperties: 0,
    pendingApprovals: 0,
    revenueThisMonth: '0 TND',
    revenueChangePercent: 0,
  });
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [alertsCount, setAlertsCount] = useState<number>(0);
  const [planningCount, setPlanningCount] = useState<number>(0);

  // Fetch unread messages count
  useEffect(() => {
    async function fetchUnreadMessages() {
      try {
        let token: string | undefined = undefined;
        if (typeof window !== 'undefined') {
          const rawToken = localStorage.getItem('token');
          token = rawToken !== null ? rawToken : undefined;
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        // Use admin-specific endpoint for unread count
        const res = await axios.get(`${apiUrl}/admin/contact/unread-count`, { headers });
        console.log('[AdminDashboard] Unread messages response:', res.data);
        const count = res.data?.count || 0;
        setUnreadMessages(count);
        console.log('[AdminDashboard] Unread messages count set to:', count);
      } catch (error) {
        console.error('[AdminDashboard] Error fetching unread messages:', error);
        setUnreadMessages(0);
      }
    }
    fetchUnreadMessages();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch alerts count (replace endpoint with your real one if needed)
  useEffect(() => {
    async function fetchAlerts() {
      try {
        let token: string | undefined = undefined;
        if (typeof window !== 'undefined') {
          const rawToken = localStorage.getItem('token');
          token = rawToken !== null ? rawToken : undefined;
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        // Example: /notifications/unread-count or similar
        const res = await axios.get(`${apiUrl}/notifications/unread-count`, { headers });
        setAlertsCount(res.data?.count || 0);
      } catch {
        setAlertsCount(0);
      }
    }
    fetchAlerts();
  }, []);

  // Fetch planning count (replace endpoint with your real one if needed)
  useEffect(() => {
    async function fetchPlanning() {
      try {
        let token: string | undefined = undefined;
        if (typeof window !== 'undefined') {
          const rawToken = localStorage.getItem('token');
          token = rawToken !== null ? rawToken : undefined;
        }
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        // Example: /appointments/upcoming-count or similar
        const res = await axios.get(`${apiUrl}/appointments/upcoming-count`, { headers });
        setPlanningCount(res.data?.count || 0);
      } catch {
        setPlanningCount(0);
      }
    }
    fetchPlanning();
  }, []);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Get token from localStorage
        let token: string | undefined = undefined;
        if (typeof window !== 'undefined') {
          const rawToken = localStorage.getItem('token');
          token = rawToken !== null ? rawToken : undefined;
        }
        // Fetch user stats (with token)
        const userStats = await userApi.getUserStats(token);
        // Fetch property stats (get total count)
        const propertyRes = await getProperties({ page: 1, limit: 1 }, token);
        // Fetch sold properties count
        const soldRes = await getProperties({ status: 'vendu', page: 1, limit: 1 }, token);
        // Fetch rented properties count
        const rentedRes = await getProperties({ status: 'loue', page: 1, limit: 1 }, token);
        // Debug logs
        console.log('userStats', userStats);
        console.log('propertyRes', propertyRes);
        console.log('soldRes', soldRes);
        console.log('rentedRes', rentedRes);
        // Debug: print userStats to verify structure
        console.log('[AdminDashboard] userStats:', userStats);
        
        // Fetch pending appointments count
        let pendingCount = 0;
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const headers: any = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const pendingRes = await axios.get(`${apiUrl}/appointments/pending-count`, { headers });
          pendingCount = pendingRes.data?.count || 0;
        } catch (err) {
          console.error('[AdminDashboard] Failed to fetch pending appointments:', err);
        }

        setStats({
          totalUsers: userStats?.total || 0,
          newUsersThisMonth: 0, // Placeholder, implement if backend provides
          totalProperties: propertyRes?.totalItems || 0,
          soldProperties: soldRes?.totalItems || 0,
          rentedProperties: rentedRes?.totalItems || 0,
          pendingApprovals: pendingCount,
          revenueThisMonth: (userStats?.monthlyRevenue ?? 0).toLocaleString('fr-TN') + ' TND',
          revenueChangePercent: userStats?.revenueChangePercent ?? 0,
        });
      } catch (e) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // --- Real recent activities ---
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  useEffect(() => {
    async function fetchRecentActivities() {
      try {
        let token: string | undefined = undefined;
        if (typeof window !== 'undefined') {
          const rawToken = localStorage.getItem('token');
          token = rawToken !== null ? rawToken : undefined;
        }
        // Fetch last 4 users
        const usersRes = await userApi.getAllUsers({ limit: 4, sort: '-createdAt' }, token);
        // Fetch last 4 properties
        const propertiesRes = await getProperties({ limit: 4, sort: '-createdAt' }, token);
        // Fetch last 4 reports (simulate as alerts)
        // You may need to replace this with your real API endpoint for reports/alerts
        // const reportsRes = await apiClient.get('/reports?limit=4&sort=-createdAt', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        // Fetch last 4 messages (simulate as messages)
        // You may need to replace this with your real API endpoint for messages
        // const messagesRes = await apiClient.get('/messages?limit=4&sort=-createdAt', { headers: token ? { Authorization: `Bearer ${token}` } : {} });

        const activities: any[] = [];
        // Users
        if (Array.isArray(usersRes)) {
          usersRes.forEach((u: any) => {
            activities.push({
              id: 'user-' + u._id,
              type: 'user',
              message: `Nouvel utilisateur inscrit: ${u.firstName || ''} ${u.lastName || ''}`.trim(),
              time: u.createdAt ? timeAgo(u.createdAt) : '',
              icon: UserCheck,
              color: 'blue',
            });
          });
        }
        // Properties
        if (propertiesRes?.data && Array.isArray(propertiesRes.data)) {
          propertiesRes.data.forEach((p: any) => {
            activities.push({
              id: 'property-' + p._id,
              type: 'property',
              message: `Nouvelle propriété ajoutée: ${p.title}`,
              time: p.createdAt ? timeAgo(p.createdAt) : '',
              icon: Building2,
              color: 'green',
            });
          });
        }
        // Optionally, add alerts and messages if you have endpoints
        // Sort by most recent
        activities.sort((a, b) => (b.timeRaw || 0) - (a.timeRaw || 0));
        setRecentActivities(activities.slice(0, 4));
      } catch (e) {
        // fallback to empty
        setRecentActivities([]);
      }
    }
    fetchRecentActivities();
  }, []);

  // Helper: time ago
  function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
    if (diff < 60) return `Il y a ${diff} sec`;
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString('fr-FR');
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      <main className="pt-16">
        {/* Admin Header */}
        <section className="bg-linear-to-r from-blue-700 via-blue-800 to-gray-900 text-white py-12 shadow-2xl">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <Shield className="h-8 w-8" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    Tableau de bord Administrateur
                  </h1>
                </div>
                <p className="text-blue-100 text-lg">
                  Bienvenue, {user?.firstName || 'Admin'} - Gestion de la plateforme
                </p>
              </div>
              <div className="mt-6 md:mt-0 flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/20 flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span className="font-semibold">Système opérationnel</span>
                  </div>
                  {/* Notification Bell */}
                  <div className="ml-4">
                    {typeof window !== 'undefined' && require('../notifications/AdminNotificationBell').default ? require('../notifications/AdminNotificationBell').default() : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Cards */}
        <section className="py-8 -mt-8">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Users */}
              <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-blue-500 hover:shadow-2xl transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Utilisateurs</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalUsers}</h3>
                    <p className="text-green-600 text-sm mt-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +{stats.newUsersThisMonth} ce mois
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Total Properties */}
              <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-green-500 hover:shadow-2xl transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Biens</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.totalProperties}</h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Building2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Properties Sold */}
              <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-yellow-500 hover:shadow-2xl transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Biens Vendus</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.soldProperties}</h3>
                    <p className="text-yellow-600 text-sm mt-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Total vendus
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Properties Rented */}
              <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-cyan-500 hover:shadow-2xl transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Biens Loués</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.rentedProperties}</h3>
                    <p className="text-cyan-600 text-sm mt-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Total loués
                    </p>
                  </div>
                  <div className="bg-cyan-100 p-3 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-cyan-600" />
                  </div>
                </div>
              </div>


              {/* Revenue */}
              <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-purple-500 hover:shadow-2xl transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Revenus ce mois</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.revenueThisMonth}</h3>
                    <p className="text-purple-600 text-sm mt-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {stats.revenueChangePercent > 0 ? '+' : ''}{stats.revenueChangePercent.toFixed(0)}% vs mois dernier
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>



              {/* System Status */}
              <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-green-500 hover:shadow-2xl transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">État du Système</p>
                    <h3 className="text-3xl font-bold text-green-600">100%</h3>
                    <p className="text-gray-600 text-sm mt-2 flex items-center">
                      <Activity className="h-4 w-4 mr-1" />
                      Tous les services OK
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Actions */}
        <section className="py-12">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <h2 className="text-2xl font-bold text-white mb-8">Actions Administrateur</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* User Management */}
              <Link href="/admin/users" className="bg-linear-to-br from-blue-500 to-blue-700 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:bg-white/30 transition-colors">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Gestion Utilisateurs</h3>
                  <p className="text-blue-100 text-sm mb-4">
                    Gérer tous les utilisateurs de la plateforme
                  </p>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>

              {/* Property Management */}
              <Link href="/admin/properties" className="bg-linear-to-br from-green-500 to-green-700 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:bg-white/30 transition-colors">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Gestion Biens</h3>
                  <p className="text-green-100 text-sm mb-4">
                    Approuver et gérer les propriétés
                  </p>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>

              {/* Appointment Management */}
              <Link href="/admin/appointments" className="bg-linear-to-br from-cyan-500 to-cyan-700 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:bg-white/30 transition-colors">
                    <Calendar className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Gestion Rendez-vous</h3>
                  <p className="text-cyan-100 text-sm mb-4">
                    Gérer et approuver les rendez-vous
                  </p>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>

              {/* Reports */}
              <Link href="/admin/rapports" className="bg-linear-to-br from-purple-500 to-purple-700 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:bg-white/30 transition-colors">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Rapports</h3>
                  <p className="text-purple-100 text-sm mb-4">
                    Statistiques et analyses détaillées
                  </p>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>

              {/* Settings */}
              <Link href="/admin/settings" className="bg-linear-to-br from-red-500 to-red-700 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:bg-white/30 transition-colors">
                    <Settings className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Paramètres</h3>
                  <p className="text-red-100 text-sm mb-4">
                    Configuration de la plateforme
                  </p>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Flags Management (disabled for now) */}
        {false && (
          <section className="py-12">
            <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
              <FeatureFlagsManager />
            </div>
          </section>
        )}

        {/* Recent Activities */}
        <section className="py-12 bg-gray-800/50">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Activités Récentes</h2>
              <Link href="/admin/activities" className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1">
                <span>Voir tout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentActivities.map((activity) => {
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
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <h2 className="text-2xl font-bold text-white mb-8">Accès Rapide</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/appointments" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-all group border border-gray-700">
                <UserCheck className="h-8 w-8 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white text-sm font-medium">Validations</p>
                <p className="text-gray-400 text-xs mt-1">{stats.pendingApprovals} en attente</p>
              </Link>

              <Link href="/admin/messages" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-all group border border-gray-700">
                <MessageSquare className="h-8 w-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white text-sm font-medium">Messages</p>
                <p className="text-gray-400 text-xs mt-1">{unreadMessages} non lus</p>
              </Link>

              <Link href="/admin/notifications" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-all group border border-gray-700">
                <Bell className="h-8 w-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white text-sm font-medium">Alertes</p>
                <p className="text-gray-400 text-xs mt-1">{alertsCount} nouvelles</p>
              </Link>

              <Link href="/admin/calendar" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-all group border border-gray-700">
                <Calendar className="h-8 w-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white text-sm font-medium">Planning</p>
                <p className="text-gray-400 text-xs mt-1">{planningCount > 0 ? `${planningCount} à venir` : 'Voir agenda'}</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
