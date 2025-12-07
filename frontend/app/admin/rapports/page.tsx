"use client";

import { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { userApi } from "@/lib/api/user";
import { getProperties } from "@/lib/api/properties";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);


export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<any>(null);
  const [propertyStats, setPropertyStats] = useState<any>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        let token: string | undefined = undefined;
        if (typeof window !== "undefined") {
          const rawToken = localStorage.getItem("token");
          token = rawToken !== null ? rawToken : undefined;
        }
        // User stats (roles, revenue)
        const stats = await userApi.getUserStats(token);
        setUserStats(stats);

        // Property stats by status
        const statuses = ["disponible", "loue", "vendu", "archive"];
        const statusCounts: Record<string, number> = {};
        for (const status of statuses) {
          const res = await getProperties({ status, page: 1, limit: 1 }, token);
          statusCounts[status] = res?.totalItems || res?.pagination?.total || 0;
        }
        setPropertyStats(statusCounts);

        // Monthly revenue (simulate 6 months for now, real: only current/last month in API)
        // If you want to show only current/last month, use stats.monthlyRevenue, stats.lastMonthRevenue
        setMonthlyRevenue({
          labels: ["Mois dernier", "Ce mois"],
          data: [stats.lastMonthRevenue || 0, stats.monthlyRevenue || 0],
        });
      } catch (e) {
        setUserStats(null);
        setPropertyStats(null);
        setMonthlyRevenue(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-start p-0 w-full h-full">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center py-10 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full flex flex-col items-center py-10 px-6 md:px-12">
          <div className="w-full flex justify-start mb-4">
            <a href="/" className="text-blue-600 hover:underline text-sm font-medium flex items-center">
              <svg className="mr-1" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              Retour au tableau de bord
            </a>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-700 p-6 rounded-full mb-6">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M5 21V10h2v11H5zm6 0V3h2v18h-2zm6 0v-7h2v7h-2z"/></svg>
          </div>
          <h1 className="text-4xl font-extrabold text-center mb-2 text-gray-900 tracking-tight">Rapports</h1>
          <p className="text-gray-600 text-center mb-6 text-lg">
            Statistiques et analyses détaillées
          </p>
          {loading ? (
            <div className="text-gray-400 text-center py-12 text-lg">Chargement des statistiques...</div>
          ) : !userStats || !propertyStats || !monthlyRevenue ? (
            <div className="text-red-400 text-center py-12 text-lg">Erreur lors du chargement des statistiques.</div>
          ) : (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              {/* Utilisateurs par rôle */}
              <div className="bg-gray-50 rounded-xl p-6 shadow flex flex-col items-center">
                <h2 className="text-lg font-bold mb-2 text-gray-800">Utilisateurs par rôle</h2>
                <Pie
                  data={{
                    labels: Object.keys(userStats.byRole || {}),
                    datasets: [
                      {
                        data: Object.values(userStats.byRole || {}),
                        backgroundColor: ["#6366f1", "#a5b4fc", "#818cf8", "#a21caf"],
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{ plugins: { legend: { position: "bottom" } } }}
                />
              </div>
              {/* Biens par statut */}
              <div className="bg-gray-50 rounded-xl p-6 shadow flex flex-col items-center">
                <h2 className="text-lg font-bold mb-2 text-gray-800">Biens par statut</h2>
                <Bar
                  data={{
                    labels: ["Disponible", "Loué", "Vendu", "Archivé"],
                    datasets: [
                      {
                        label: "Nombre de biens",
                        data: [propertyStats.disponible, propertyStats.loue, propertyStats.vendu, propertyStats.archive],
                        backgroundColor: [
                          "#a78bfa",
                          "#818cf8",
                          "#6366f1",
                          "#312e81",
                        ],
                      },
                    ],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    responsive: true,
                  }}
                />
              </div>
              {/* Revenus mensuels */}
              <div className="bg-gray-50 rounded-xl p-6 shadow flex flex-col items-center md:col-span-2">
                <h2 className="text-lg font-bold mb-2 text-gray-800">Revenus mensuels</h2>
                <Line
                  data={{
                    labels: monthlyRevenue.labels,
                    datasets: [
                      {
                        label: "Revenu (€)",
                        data: monthlyRevenue.data,
                        borderColor: "#a21caf",
                        backgroundColor: "#f3e8ff",
                        tension: 0.4,
                        fill: true,
                      },
                    ],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    responsive: true,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
