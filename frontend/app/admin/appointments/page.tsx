"use client";
type Appointment = {
  _id: string;
  property?: {
    title?: string;
    type?: string;
    city?: string;
  };
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  status: 'pending' | 'accepted' | 'denied';
  requestedAt?: string;
};
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);
  const [meetingDate, setMeetingDate] = useState<string>('');
  const [denialReason, setDenialReason] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${apiUrl}/appointments`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        if (res.data.success) {
          setAppointments(res.data.data);
        } else {
          setError(res.data.message || 'Erreur lors du chargement des rendez-vous.');
        }
      } catch (err) {
        setError('Erreur lors du chargement des rendez-vous.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 py-12 px-2 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center">
          <Link href="/" className="inline-flex items-center px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold shadow mr-4">
            <span className="text-lg">←</span> <span className="ml-2">Retour au tableau de bord</span>
          </Link>
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight drop-shadow">Gestion des rendez-vous</h1>
        </div>
        <ToastContainer />
        {loading ? (
          <div className="text-lg text-blue-700 font-semibold animate-pulse">Chargement...</div>
        ) : error ? (
          <div className="text-red-600 text-lg font-semibold">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-gray-500 text-lg">Aucun rendez-vous trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl shadow-2xl border border-blue-100">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-4 text-lg font-bold text-blue-900">Bien</th>
                  <th className="px-6 py-4 text-lg font-bold text-blue-900">Utilisateur</th>
                  <th className="px-6 py-4 text-lg font-bold text-blue-900">Statut</th>
                  <th className="px-6 py-4 text-lg font-bold text-blue-900">Demandé le</th>
                  <th className="px-6 py-4 text-lg font-bold text-blue-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt._id} className="border-b last:border-b-0 hover:bg-blue-50/40 transition">
                    <td className="px-6 py-4 align-top">
                      <div className="font-bold text-base text-blue-800">{appt.property?.title || <span className='italic text-gray-400'>-</span>}</div>
                      <div className="text-xs text-gray-500">{appt.property?.type} - {appt.property?.city}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-semibold text-gray-800">{appt.user?.firstName} {appt.user?.lastName}</div>
                      <div className="text-xs text-gray-500">{appt.user?.email}</div>
                      <div className="text-xs text-gray-500">{appt.user?.phone}</div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold shadow-sm border ${
                        appt.status === 'pending' ? 'bg-yellow-50 text-yellow-900 border-yellow-300' :
                        appt.status === 'accepted' ? 'bg-green-50 text-green-900 border-green-300' :
                        appt.status === 'denied' ? 'bg-red-50 text-red-900 border-red-300' : ''
                      }`}>
                        {appt.status === 'pending' && 'En attente'}
                        {appt.status === 'accepted' && 'Accepté'}
                        {appt.status === 'denied' && 'Refusé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top text-gray-700 font-medium">
                      {appt.requestedAt ? new Date(appt.requestedAt).toLocaleString() : ''}
                    </td>
                    <td className="px-6 py-4 align-top">
                      {appt.status === 'pending' && (
                        actionId === appt._id ? (
                          <div className="flex flex-col gap-3 bg-blue-50 p-3 rounded-xl shadow-inner">
                            {/* Accept form */}
                            <div className="mb-2">
                              <label className="block text-xs mb-1 font-semibold text-blue-900">Date et heure du rendez-vous</label>
                              <input
                                type="datetime-local"
                                className="border border-blue-200 rounded px-2 py-1 text-sm text-blue-900 focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none placeholder:text-blue-300"
                                value={meetingDate}
                                onChange={e => setMeetingDate(e.target.value)}
                              />
                              <button
                                className="ml-2 bg-green-600 text-white px-4 py-1 rounded font-semibold text-sm shadow hover:bg-green-700 transition"
                                disabled={!meetingDate}
                                onClick={async () => {
                                  // Check if meetingDate is in the past
                                  if (meetingDate) {
                                    const selected = new Date(meetingDate);
                                    const now = new Date();
                                    if (selected < now) {
                                      toast.error('La date du rendez-vous doit être dans le futur.');
                                      return;
                                    }
                                  }
                                  try {
                                    const token = localStorage.getItem('token');
                                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                                    const res = await axios.patch(`${apiUrl}/appointments/${appt._id}/accept`, { meetingDate }, {
                                      headers: { Authorization: token ? `Bearer ${token}` : undefined },
                                    });
                                    if (res.data.success) {
                                      toast.success('Rendez-vous accepté.');
                                      setAppointments(prev => prev.map(a => a._id === appt._id ? { ...a, status: 'accepted', meetingDate } : a));
                                      setActionId(null); setMeetingDate(''); setDenialReason('');
                                    } else {
                                      toast.error(res.data.message || 'Erreur lors de l\'acceptation.');
                                    }
                                  } catch (err: any) {
                                    toast.error('Erreur lors de l\'acceptation.');
                                  }
                                }}
                              >
                                Confirmer
                              </button>
                            </div>
                            {/* Deny form */}
                            <div>
                              <label className="block text-xs mb-1 font-semibold text-blue-900">Raison du refus</label>
                              <input
                                type="text"
                                className="border border-blue-200 rounded px-2 py-1 text-sm text-blue-900 focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none placeholder:text-blue-300"
                                value={denialReason}
                                onChange={e => setDenialReason(e.target.value)}
                                placeholder="Motif du refus"
                              />
                              <button
                                className="ml-2 bg-red-600 text-white px-4 py-1 rounded font-semibold text-sm shadow hover:bg-red-700 transition"
                                disabled={!denialReason}
                                onClick={async () => {
                                  try {
                                    const token = localStorage.getItem('token');
                                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                                    const res = await axios.patch(`${apiUrl}/appointments/${appt._id}/deny`, { denialReason }, {
                                      headers: { Authorization: token ? `Bearer ${token}` : undefined },
                                    });
                                    if (res.data.success) {
                                      toast.success('Rendez-vous refusé.');
                                      setAppointments(prev => prev.map(a => a._id === appt._id ? { ...a, status: 'denied', denialReason } : a));
                                      setActionId(null); setMeetingDate(''); setDenialReason('');
                                    } else {
                                      toast.error(res.data.message || 'Erreur lors du refus.');
                                    }
                                  } catch (err: any) {
                                    toast.error('Erreur lors du refus.');
                                  }
                                }}
                              >
                                Refuser
                              </button>
                            </div>
                            <button
                              className="mt-2 text-xs text-blue-500 underline hover:text-blue-700"
                              onClick={() => { setActionId(null); setMeetingDate(''); setDenialReason(''); }}
                            >Annuler</button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              className="bg-green-600 text-white px-4 py-1 rounded font-semibold text-sm shadow hover:bg-green-700 transition"
                              onClick={() => { setActionId(appt._id); setMeetingDate(''); setDenialReason(''); }}
                            >
                              Accepter
                            </button>
                            <button
                              className="bg-red-600 text-white px-4 py-1 rounded font-semibold text-sm shadow hover:bg-red-700 transition"
                              onClick={() => { setActionId(appt._id); setMeetingDate(''); setDenialReason(''); }}
                            >
                              Refuser
                            </button>
                          </div>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointmentsPage;
