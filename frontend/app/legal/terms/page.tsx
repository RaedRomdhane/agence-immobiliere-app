'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { FileText, UserCheck, AlertCircle, Scale, Shield, XCircle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
                <FileText className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
              Conditions d'utilisation
            </h1>
            <p className="text-xl text-blue-100 text-center">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Introduction */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-lg text-gray-700 leading-relaxed">
                Les présentes conditions générales d'utilisation (CGU) régissent l'utilisation de la plateforme ImmoExpress. 
                En accédant ou en utilisant nos services, vous acceptez d'être lié par ces conditions.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-12">
              
              {/* Section 1 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      1. Objet de la plateforme
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p>
                        ImmoExpress est une plateforme en ligne qui met en relation les utilisateurs avec des biens immobiliers 
                        à la vente ou à la location. Notre service permet de :
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Rechercher des biens immobiliers selon vos critères</li>
                        <li>Consulter des annonces détaillées avec photos et descriptions</li>
                        <li>Sauvegarder vos recherches et vos biens favoris</li>
                        <li>Contacter les propriétaires ou agents immobiliers</li>
                        <li>Recevoir des alertes personnalisées</li>
                        <li>Publier des avis et évaluations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      2. Inscription et compte utilisateur
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p><strong>2.1. Création de compte</strong></p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Vous devez créer un compte pour accéder à certains services</li>
                        <li>Vous devez être majeur(e) pour créer un compte</li>
                        <li>Les informations fournies doivent être exactes et à jour</li>
                        <li>Vous êtes responsable de la confidentialité de votre mot de passe</li>
                      </ul>
                      
                      <p className="mt-4"><strong>2.2. Sécurité du compte</strong></p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Ne partagez jamais vos identifiants de connexion</li>
                        <li>Informez-nous immédiatement de tout accès non autorisé</li>
                        <li>Vous êtes responsable de toutes les activités effectuées depuis votre compte</li>
                      </ul>

                      <p className="mt-4"><strong>2.3. Résiliation</strong></p>
                      <p>
                        Vous pouvez supprimer votre compte à tout moment depuis vos paramètres. Nous nous réservons le droit 
                        de suspendre ou supprimer votre compte en cas de violation des présentes conditions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      3. Utilisation de la plateforme
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p><strong>3.1. Utilisation autorisée</strong></p>
                      <p>Vous vous engagez à utiliser la plateforme uniquement à des fins licites et conformément aux présentes CGU.</p>
                      
                      <p className="mt-4"><strong>3.2. Interdictions</strong></p>
                      <p>Il est strictement interdit de :</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Publier des informations fausses ou trompeuses</li>
                        <li>Usurper l'identité d'une autre personne</li>
                        <li>Diffuser des contenus illégaux, offensants ou diffamatoires</li>
                        <li>Tenter d'accéder aux systèmes de manière non autorisée</li>
                        <li>Utiliser des robots ou scripts automatisés sans autorisation</li>
                        <li>Collecter des données personnelles d'autres utilisateurs</li>
                        <li>Perturber le fonctionnement de la plateforme</li>
                        <li>Utiliser la plateforme à des fins commerciales sans autorisation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Scale className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      4. Annonces et contenu
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p><strong>4.1. Contenu des utilisateurs</strong></p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Vous conservez la propriété du contenu que vous publiez</li>
                        <li>Vous accordez à ImmoExpress une licence pour utiliser, afficher et promouvoir votre contenu</li>
                        <li>Vous garantissez avoir les droits sur le contenu publié</li>
                        <li>Vous êtes responsable du contenu que vous publiez</li>
                      </ul>
                      
                      <p className="mt-4"><strong>4.2. Exactitude des annonces</strong></p>
                      <p>
                        Les annonces doivent être exactes et à jour. ImmoExpress ne garantit pas l'exactitude des informations 
                        fournies par les annonceurs et ne peut être tenu responsable d'erreurs ou omissions.
                      </p>

                      <p className="mt-4"><strong>4.3. Modération</strong></p>
                      <p>
                        Nous nous réservons le droit de modérer, modifier ou supprimer tout contenu qui viole nos règles 
                        ou les lois applicables, sans préavis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      5. Propriété intellectuelle
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p>
                        Tous les éléments de la plateforme ImmoExpress (design, logo, textes, images, code source, etc.) 
                        sont protégés par les droits de propriété intellectuelle.
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Vous ne pouvez pas reproduire, distribuer ou modifier ces éléments sans autorisation</li>
                        <li>La marque "ImmoExpress" et son logo sont des marques déposées</li>
                        <li>Toute utilisation non autorisée peut donner lieu à des poursuites</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 6 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      6. Limitation de responsabilité
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p><strong>6.1. Nature du service</strong></p>
                      <p>
                        ImmoExpress est une plateforme de mise en relation. Nous ne sommes pas partie aux transactions 
                        entre utilisateurs et n'agissons pas en tant qu'agent immobilier.
                      </p>
                      
                      <p className="mt-4"><strong>6.2. Exclusion de garanties</strong></p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>La plateforme est fournie "en l'état" sans garantie d'aucune sorte</li>
                        <li>Nous ne garantissons pas l'absence d'erreurs ou d'interruptions</li>
                        <li>Nous ne garantissons pas la disponibilité permanente du service</li>
                        <li>Nous ne sommes pas responsables des pertes ou dommages résultant de l'utilisation de la plateforme</li>
                      </ul>

                      <p className="mt-4"><strong>6.3. Vérification</strong></p>
                      <p>
                        Il vous incombe de vérifier toutes les informations avant toute transaction. Nous vous recommandons 
                        vivement de visiter les biens et de consulter des professionnels qualifiés.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 7 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="space-y-4 text-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    7. Protection des données personnelles
                  </h2>
                  <p>
                    Le traitement de vos données personnelles est régi par notre <a href="/legal/privacy" className="text-blue-600 hover:underline">Politique de confidentialité</a>.
                  </p>
                </div>
              </div>

              {/* Section 8 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="space-y-4 text-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    8. Modifications des conditions
                  </h2>
                  <p>
                    Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications importantes 
                    vous seront notifiées par email ou via un message sur la plateforme. La poursuite de l'utilisation 
                    après notification vaut acceptation des nouvelles conditions.
                  </p>
                </div>
              </div>

              {/* Section 9 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="space-y-4 text-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    9. Loi applicable et juridiction
                  </h2>
                  <p>
                    Les présentes conditions sont régies par le droit tunisien. En cas de litige, les tribunaux de Tunis 
                    seront seuls compétents, sauf disposition légale contraire.
                  </p>
                </div>
              </div>

              {/* Section 10 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="space-y-4 text-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    10. Contact
                  </h2>
                  <p>
                    Pour toute question concernant ces conditions d'utilisation :
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <p><strong>ImmoExpress</strong></p>
                    <p>Avenue Habib Bourguiba, Tunis, Tunisie</p>
                    <p>Email : <a href="mailto:legal@immoexpress.fr" className="text-blue-600 hover:underline">legal@immoexpress.fr</a></p>
                    <p>Téléphone : <a href="tel:+21696254845" className="text-blue-600 hover:underline">+216 96 25 48 45</a></p>
                  </div>
                </div>
              </div>

            </div>

            {/* Acceptance Notice */}
            <div className="mt-12 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
              <p className="text-gray-800">
                <strong>Important :</strong> En utilisant ImmoExpress, vous reconnaissez avoir lu, compris et accepté 
                les présentes conditions d'utilisation ainsi que notre politique de confidentialité.
              </p>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
