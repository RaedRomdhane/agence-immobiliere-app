'use client';

import Link from 'next/link';
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

export default function AdminDashboard() {
  const { user } = useAuth();

  // Statistiques administrateur (placeholder data)
  const stats = {
    totalUsers: 1247,
    newUsersThisMonth: 89,
    totalProperties: 456,
    pendingApprovals: 12,
    activeAgents: 34,
    revenueThisMonth: '45 230 €',
  };

  // Activités récentes (placeholder)
  const recentActivities = [
    { id: 1, type: 'user', message: 'Nouvel utilisateur inscrit: Marie Dupont', time: 'Il y a 5 min', icon: UserCheck, color: 'blue' },
    { id: 2, type: 'property', message: 'Nouvelle propriété ajoutée: Villa Marseille', time: 'Il y a 15 min', icon: Building2, color: 'green' },
    { id: 3, type: 'alert', message: 'Signalement: Contenu inapproprié', time: 'Il y a 1h', icon: AlertCircle, color: 'red' },
    { id: 4, type: 'message', message: '5 nouveaux messages non lus', time: 'Il y a 2h', icon: MessageSquare, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <main className="pt-16">
        {/* Admin Header */}
        <section className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white py-12 shadow-2xl">
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
                <p className="text-red-100 text-lg">
                  Bienvenue, {user?.firstName || 'Admin'} - Gestion de la plateforme
                </p>
              </div>
              <div className="mt-6 md:mt-0 flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/20">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span className="font-semibold">Système opérationnel</span>
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
                    <p className="text-blue-600 text-sm mt-2 flex items-center">
                      <Activity className="h-4 w-4 mr-1" />
                      {stats.activeAgents} agents actifs
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Building2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-orange-500 hover:shadow-2xl transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">En attente</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</h3>
                    <p className="text-orange-600 text-sm mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Nécessite validation
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <FileText className="h-8 w-8 text-orange-600" />
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
                      +12% vs mois dernier
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Active Agents */}
              <div className="bg-white rounded-xl shadow-xl p-6 border-l-4 border-indigo-500 hover:shadow-2xl transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Agents Actifs</p>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.activeAgents}</h3>
                    <p className="text-indigo-600 text-sm mt-2 flex items-center">
                      <UserCheck className="h-4 w-4 mr-1" />
                      Sur {Math.floor(stats.activeAgents * 1.2)} total
                    </p>
                  </div>
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <UserCheck className="h-8 w-8 text-indigo-600" />
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
              <Link href="/admin/users" className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group text-white">
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
              <Link href="/admin/properties" className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group text-white">
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

              {/* Reports */}
              <Link href="/admin/reports" className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group text-white">
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
              <Link href="/admin/settings" className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group text-white">
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

        {/* Feature Flags Management */}
        <section className="py-12">
          <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
            <FeatureFlagsManager />
          </div>
        </section>

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
              <Link href="/admin/users/pending" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-all group border border-gray-700">
                <UserCheck className="h-8 w-8 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white text-sm font-medium">Validations</p>
                <p className="text-gray-400 text-xs mt-1">{stats.pendingApprovals} en attente</p>
              </Link>

              <Link href="/admin/messages" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-all group border border-gray-700">
                <MessageSquare className="h-8 w-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white text-sm font-medium">Messages</p>
                <p className="text-gray-400 text-xs mt-1">5 non lus</p>
              </Link>

              <Link href="/admin/notifications" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-all group border border-gray-700">
                <Bell className="h-8 w-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white text-sm font-medium">Alertes</p>
                <p className="text-gray-400 text-xs mt-1">3 nouvelles</p>
              </Link>

              <Link href="/admin/calendar" className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-all group border border-gray-700">
                <Calendar className="h-8 w-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-white text-sm font-medium">Planning</p>
                <p className="text-gray-400 text-xs mt-1">Voir agenda</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
