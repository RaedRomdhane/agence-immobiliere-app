'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  MessageCircle, 
  Users, 
  TrendingUp, 
  FileText,
  Home,
  DollarSign,
  CheckCircle2,
  Send,
  Phone,
  Mail,
  Shield,
  Clock,
  Award
} from 'lucide-react';

export default function ConseilPage() {
  const [formData, setFormData] = useState({
    service: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send conseil request to backend
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const services = [
    {
      icon: Home,
      title: "Conseil achat",
      description: "Accompagnement personnalisé pour l'achat de votre bien immobilier",
      features: [
        "Analyse de vos besoins",
        "Recherche ciblée",
        "Négociation du prix",
        "Accompagnement juridique"
      ]
    },
    {
      icon: DollarSign,
      title: "Conseil vente",
      description: "Maximisez la valeur de votre bien avec nos experts",
      features: [
        "Estimation précise",
        "Stratégie de vente",
        "Home staging conseils",
        "Optimisation fiscale"
      ]
    },
    {
      icon: TrendingUp,
      title: "Investissement locatif",
      description: "Développez votre patrimoine immobilier avec notre expertise",
      features: [
        "Étude de rentabilité",
        "Zones à fort potentiel",
        "Optimisation fiscale",
        "Gestion locative"
      ]
    },
    {
      icon: FileText,
      title: "Conseil juridique",
      description: "Sécurisez vos transactions immobilières",
      features: [
        "Vérification des documents",
        "Analyse des contrats",
        "Conformité légale",
        "Protection juridique"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-6">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Conseil immobilier personnalisé
              </h1>
              <p className="text-xl text-blue-100">
                Bénéficiez de l'expertise de nos conseillers pour tous vos projets immobiliers
              </p>
            </div>
          </div>
        </section>

        {/* Success Message */}
        {submitted && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start space-x-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-1">
                  Demande envoyée avec succès !
                </h3>
                <p className="text-green-700">
                  Un conseiller vous contactera dans les plus brefs délais pour discuter de votre projet.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Pourquoi faire appel à nos conseillers ?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Une expertise reconnue pour vous accompagner dans tous vos projets
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Experts certifiés
                </h3>
                <p className="text-gray-600">
                  Des conseillers qualifiés et expérimentés à votre service
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Accompagnement complet
                </h3>
                <p className="text-gray-600">
                  De la recherche à la signature, nous sommes avec vous à chaque étape
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Disponibilité 7j/7
                </h3>
                <p className="text-gray-600">
                  Une équipe disponible quand vous en avez besoin
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Nos services de conseil
              </h2>
              <p className="text-lg text-gray-600">
                Des solutions adaptées à chaque projet immobilier
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                      <service.icon className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Demandez un conseil personnalisé
                </h2>
                <p className="text-lg text-gray-600">
                  Remplissez ce formulaire et un conseiller vous contactera rapidement
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de conseil souhaité *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionnez un service</option>
                    <option value="achat">Conseil achat</option>
                    <option value="vente">Conseil vente</option>
                    <option value="investissement">Investissement locatif</option>
                    <option value="juridique">Conseil juridique</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Décrivez votre projet *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Parlez-nous de votre projet immobilier..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>Envoyer ma demande</span>
                </button>

                <p className="text-sm text-gray-500 text-center">
                  En soumettant ce formulaire, vous acceptez d'être contacté par notre équipe
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* Direct Contact */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-12 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">
                Besoin d'un conseil urgent ?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Contactez-nous directement par téléphone ou email
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <a
                  href="tel:+21696254845"
                  className="flex items-center space-x-3 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg"
                >
                  <Phone className="h-6 w-6" />
                  <span>+216 96 25 48 45</span>
                </a>
                <a
                  href="mailto:contact@immoexpress.fr"
                  className="flex items-center space-x-3 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg"
                >
                  <Mail className="h-6 w-6" />
                  <span>contact@immoexpress.fr</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ce que disent nos clients
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-orange-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Les conseils de l'équipe m'ont permis de vendre mon appartement 10% au-dessus du prix initial. Professionnalisme et expertise remarquables."
                </p>
                <p className="text-gray-900 font-semibold">— Marc D., Vendeur</p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-orange-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Grâce à leur accompagnement, j'ai trouvé l'investissement locatif idéal. Leur analyse du marché est très précise."
                </p>
                <p className="text-gray-900 font-semibold">— Sophie L., Investisseuse</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
