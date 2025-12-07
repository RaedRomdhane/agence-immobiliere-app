"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import axios from 'axios';

export default function CalendarPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
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
        
        const response = await axios.get(`${apiUrl}/appointments`, { headers });
        setAppointments(response.data?.data || []);
      } catch (e) {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-600';
      case 'pending':
        return 'bg-orange-100 text-orange-600';
      case 'rejected':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'accepted':
        return 'Accepté';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Refusé';
      default:
        return status;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>
      <h1 className="text-3xl font-bold text-white mb-8">Planning & Agenda</h1>
      {loading ? (
        <div className="text-blue-200 text-lg">Chargement...</div>
      ) : appointments.length === 0 ? (
        <div className="text-gray-400 text-lg">Aucun rendez-vous planifié.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-green-100 text-green-600">
                  <CalendarIcon className="h-6 w-6" />
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(appointment.status)}`}>
                  {getStatusText(appointment.status)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {appointment.property?.title || 'Propriété'}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(appointment.meetingDate || appointment.requestedAt)}</span>
                </div>
                {appointment.meetingDate && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(appointment.meetingDate)}</span>
                  </div>
                )}
                {appointment.property?.city && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{appointment.property.city}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
