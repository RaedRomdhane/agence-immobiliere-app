"use client";


import { Calendar, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/components/auth/AuthProvider";

interface Appointment {
  _id: string;
  property: {
    _id: string;
    title: string;
    type: string;
    location?: {
      address?: string;
      city?: string;
      region?: string;
    };
    price: number;
    status: string;
  };
  status: "pending" | "accepted" | "denied";
  requestedAt: string;
  meetingDate?: string;
  message?: string;
  denialReason?: string;
}

export default function AppointmentsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !isAuthenticated) return;
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('token');
        const res = await axios.get(`${apiUrl}/appointments/user`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });
        if (res.data && res.data.success) {
          setAppointments(res.data.data);
        } else {
          setError("Erreur lors du chargement des rendez-vous.");
        }
      } catch (err: any) {
        setError("Erreur lors du chargement des rendez-vous.");
      }
      setLoading(false);
    };
    fetchAppointments();
  }, [user, isAuthenticated]);

  // Filter accepted and upcoming appointments (meetingDate in future)
  const now = new Date();
  const upcoming = appointments.filter(a => a.status === "accepted" && a.meetingDate && new Date(a.meetingDate) > now);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <div className="bg-green-100 p-4 rounded-full mb-4">
          <Calendar className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes Rendez-vous</h1>
        {loading || isLoading ? (
          <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" /> Chargement...</div>
        ) : error ? (
          <div className="text-red-600 mb-4">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-gray-600 mb-4">Aucun rendez-vous trouvé.</div>
        ) : (
          <>
            <p className="text-gray-600 text-lg mb-4">{appointments.length} rendez-vous au total</p>
            <div className="w-full mb-6">
              <h2 className="font-semibold text-gray-800 mb-2">Tous mes rendez-vous</h2>
              <ul className="space-y-3">
                {appointments.map(app => (
                  <li key={app._id} className="bg-gray-100 rounded-lg p-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {app.status === "pending" && <Clock className="text-yellow-500" />}
                      {app.status === "accepted" && <CheckCircle className="text-green-600" />}
                      {app.status === "denied" && <XCircle className="text-red-500" />}
                      <span className="font-medium text-gray-900">{app.property.title}</span>
                      <span className="ml-auto text-xs text-gray-900">{new Date(app.requestedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-gray-700">Statut : <span className={
                      app.status === "pending" ? "text-yellow-600" :
                      app.status === "accepted" ? "text-green-700" : "text-red-600"
                    }>{app.status === "pending" ? "En attente" : app.status === "accepted" ? "Accepté" : "Refusé"}</span></div>
                    {app.status === "accepted" && app.meetingDate && (
                      <div className="text-sm text-green-700">Date du rendez-vous : {new Date(app.meetingDate).toLocaleString()}</div>
                    )}
                    {app.status === "denied" && app.denialReason && (
                      <div className="text-sm text-red-600">Motif du refus : {app.denialReason}</div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {upcoming.length > 0 && (
              <div className="w-full mb-4">
                <h2 className="font-semibold text-green-800 mb-2">Prochains rendez-vous acceptés</h2>
                <ul className="space-y-3">
                  {upcoming.map(app => (
                    <li key={app._id} className="bg-green-50 rounded-lg p-4 flex flex-col gap-1 border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-600" />
                        <span className="font-semibold text-gray-900">{app.property.title}</span>
                        <span className="ml-auto text-xs text-gray-900">{new Date(app.meetingDate!).toLocaleString()}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">Lieu : {app.property.location?.address || app.property.location?.city || 'Non spécifié'}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
        <Link href="/" className="mt-6 text-blue-700 hover:underline font-medium">&larr; Retour au tableau de bord</Link>
      </div>
    </div>
  );
}
