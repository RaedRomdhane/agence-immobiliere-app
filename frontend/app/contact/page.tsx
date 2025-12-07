'use client';

import { useState, useEffect } from 'react';
// Type definitions must remain outside the component, but all hooks must be inside.
type ReplyInfo = {
  _id: string;
  text: string;
  repliedAt?: string | Date;
  admin?: string;
  user?: string;
  replies?: ReplyInfo[];
};

type ContactMessage = {
  _id: string;
  subject: string;
  message: string;
  replies?: ReplyInfo[];
  createdAt: string;
};
// All hooks and logic must be inside the component function


import api from '../../utils/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import ThreadedReplies from './ThreadedReplies';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myMessages, setMyMessages] = useState<ContactMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<ContactMessage | null>(null);
  const [userReply, setUserReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replySuccess, setReplySuccess] = useState("");

  // Fetch user's messages
  useEffect(() => {
    api.get('/contact/my-messages').then(res => {
      setMyMessages(res.data.data || []);
    });
  }, []);

  // Handle contact form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle contact form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      await api.post('/contact', formData);
      setSuccess('Votre message a été envoyé avec succès.');
      setFormData({ subject: '', message: '' });
      // Refresh messages
      const res = await api.get('/contact/my-messages');
      setMyMessages(res.data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erreur lors de l\'envoi du message.');
    }
    setLoading(false);
  };
  

  const openMsg = (msg: ContactMessage) => {
    setSelectedMsg(msg);
    setReplySuccess("");
    setUserReply("");
  };

  const handleUserReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMsg) return;
    setReplyLoading(true);
    setReplySuccess("");
    await api.post(`/contact/messages/${selectedMsg._id}/reply`, { text: userReply });
    // Refresh messages
    const res = await api.get('/contact/my-messages');
    setMyMessages(res.data.data || []);
    // Update selected message
    const updated = res.data.data.find((m: ContactMessage) => m._id === selectedMsg._id);
    setSelectedMsg(updated || null);
    setUserReply("");
    setReplyLoading(false);
    setReplySuccess("Réponse envoyée.");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Contactez-nous
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Notre équipe est à votre écoute pour répondre à toutes vos questions
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Info */}
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Informations de contact
                </h2>
                <p className="text-gray-600 mb-8">
                  N&apos;hésitez pas à nous contacter par téléphone, email ou en utilisant 
                  le formulaire ci-contre.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                      <p className="text-gray-600">
                        Avenue Habib Bourguiba<br />
                        Tunis, Tunisie
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                      <p className="text-gray-600">
                        +216 96 25 48 45<br />
                        +216 92 34 56 78
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">
                        contact@immoexpress.fr<br />
                        support@immoexpress.fr
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Horaires</h3>
                      <p className="text-gray-600">
                        Lundi - Vendredi : 9h - 19h<br />
                        Samedi : 10h - 17h<br />
                        Dimanche : Fermé
                      </p>
                    </div>
                  </div>
                </div>

                {/* Google Map embed for Avenue Habib Bourguiba, Tunis */}
                <div className="mt-8 rounded-2xl overflow-hidden h-64 w-full">
                  <iframe
                    title="Carte Avenue Habib Bourguiba Tunis"
                    src="https://www.google.com/maps?q=Avenue+Habib+Bourguiba,+Tunis,+Tunisia&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Envoyez-nous un message
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {success && (
                      <div className="p-4 bg-green-100 text-green-800 rounded-lg text-center">{success}</div>
                    )}
                    {error && (
                      <div className="p-4 bg-red-100 text-red-800 rounded-lg text-center">{error}</div>
                    )}

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Sujet *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
                      >
                        <option value="">Sélectionnez un sujet</option>
                        <option value="achat">Achat de bien</option>
                        <option value="vente">Vente de bien</option>
                        <option value="location">Location</option>
                        <option value="estimation">Estimation</option>
                        <option value="info">Demande d&apos;information</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-gray-900"
                        placeholder="Décrivez votre demande en détail..."
                      />
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="consent"
                        required
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="consent" className="ml-2 text-sm text-gray-600">
                        J&apos;accepte que mes données soient utilisées pour traiter ma demande. 
                        Voir notre{' '}
                        <a href="#" className="text-blue-600 hover:underline">
                          politique de confidentialité
                        </a>
                        .
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-60"
                      disabled={loading}
                    >
                      <Send className="h-5 w-5" />
                      <span>{loading ? 'Envoi en cours...' : 'Envoyer le message'}</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* User Messages & Replies Section */}
        <section className="py-16 bg-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Mes messages et réponses de l'administration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Message list */}
              <div className="col-span-1 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="text-lg font-semibold text-gray-800">Mes messages</h3>
                </div>
                <ul className="divide-y divide-gray-100">
                  {myMessages.length === 0 && (
                    <li className="p-6 text-gray-400 text-center">Aucun message</li>
                  )}
                  {myMessages.map((msg) => (
                    <li
                      key={msg._id}
                      className={`p-6 cursor-pointer transition-colors ${selectedMsg?._id === msg._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      onClick={() => openMsg(msg)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base font-medium">{msg.subject}</span>
                      </div>
                      <div className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Message details and replies */}
              <div className="col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-8 min-h-[350px] flex flex-col">
                {selectedMsg ? (
                  <>
                    <div className="mb-6">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedMsg.subject}</h4>
                      <div className="mb-4 text-gray-800 whitespace-pre-line border-l-4 border-blue-200 pl-4 py-2 bg-blue-50">{selectedMsg.message}</div>
                    </div>
                    {/* Threaded replies: show each message, then its replies, each with a reply button/form */}
                    <ThreadedReplies
                      message={selectedMsg}
                      onReply={async (replyText: string, parentReplyId: string | null) => {
                        setReplyLoading(true);
                        setReplySuccess("");
                        await api.post(`/contact/messages/${selectedMsg._id}/reply`, { text: replyText, parentReplyId });
                        // Refresh messages
                        const res = await api.get('/contact/my-messages');
                        setMyMessages(res.data.data || []);
                        // Update selected message
                        const updated = res.data.data.find((m: ContactMessage) => m._id === selectedMsg._id);
                        setSelectedMsg(updated || null);
                        setReplyLoading(false);
                        setReplySuccess("Réponse envoyée.");
                      }}
                      loading={replyLoading}
                    />
                  </>
                ) : (
                  <div className="text-gray-400 text-center my-auto">Sélectionnez un message pour voir les détails et répondre.</div>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Questions fréquentes
              </h2>
              <p className="text-gray-600">
                Trouvez rapidement des réponses à vos questions
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Comment puis-je publier une annonce ?
                </h3>
                <p className="text-gray-600">
                  Créez un compte gratuit, accédez à votre espace personnel et cliquez sur 
                  &quot;Publier une annonce&quot;. Suivez les étapes pour ajouter photos et détails.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Quels sont vos frais de service ?
                </h3>
                <p className="text-gray-600">
                  Nos frais varient selon le type de transaction. Contactez-nous pour un devis 
                  personnalisé et transparent.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Proposez-vous des visites virtuelles ?
                </h3>
                <p className="text-gray-600">
                  Oui ! Nous offrons des visites virtuelles en 3D pour la plupart de nos biens. 
                  Vous pouvez également planifier des visites physiques.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Combien de temps faut-il pour vendre un bien ?
                </h3>
                <p className="text-gray-600">
                  Le délai moyen est de 3 à 6 mois selon le marché et le type de bien. 
                  Notre équipe optimise chaque étape pour accélérer le processus.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}