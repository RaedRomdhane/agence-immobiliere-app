'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Shield, Eye, Lock, Database, UserCheck, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
                <Shield className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
              Politique de confidentialité
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
                ImmoExpress s'engage à protéger la vie privée de ses utilisateurs. Cette politique de confidentialité 
                explique comment nous collectons, utilisons, partageons et protégeons vos informations personnelles.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-12">
              
              {/* Section 1 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      1. Données collectées
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p>Nous collectons les types d'informations suivants :</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Informations d'identification :</strong> Nom, prénom, adresse email, numéro de téléphone</li>
                        <li><strong>Informations de compte :</strong> Identifiant, mot de passe crypté, préférences</li>
                        <li><strong>Données de navigation :</strong> Adresse IP, type de navigateur, pages visitées, durée de visite</li>
                        <li><strong>Cookies et technologies similaires :</strong> Voir notre politique de cookies</li>
                        <li><strong>Informations sur vos recherches :</strong> Critères de recherche, biens consultés, favoris</li>
                        <li><strong>Communications :</strong> Messages envoyés via notre plateforme, évaluations et avis</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      2. Utilisation des données
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p>Vos données personnelles sont utilisées pour :</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Créer et gérer votre compte utilisateur</li>
                        <li>Vous fournir les services demandés (recherche de biens, alertes, etc.)</li>
                        <li>Personnaliser votre expérience sur notre plateforme</li>
                        <li>Vous envoyer des notifications importantes concernant votre compte</li>
                        <li>Améliorer nos services et développer de nouvelles fonctionnalités</li>
                        <li>Prévenir la fraude et garantir la sécurité de la plateforme</li>
                        <li>Respecter nos obligations légales et réglementaires</li>
                        <li>Vous envoyer des communications marketing (avec votre consentement)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      3. Partage des données
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p>Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement dans les cas suivants :</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Prestataires de services :</strong> Hébergement, analyse, paiement (avec des garanties contractuelles)</li>
                        <li><strong>Agents immobiliers :</strong> Uniquement pour les biens que vous avez consultés ou contactés</li>
                        <li><strong>Obligations légales :</strong> Si requis par la loi ou une autorité compétente</li>
                        <li><strong>Protection des droits :</strong> Pour protéger nos droits, notre propriété ou votre sécurité</li>
                        <li><strong>Avec votre consentement :</strong> Dans tout autre cas avec votre autorisation explicite</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      4. Sécurité des données
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées :</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Cryptage SSL/TLS pour toutes les transmissions de données</li>
                        <li>Hachage sécurisé des mots de passe (bcrypt)</li>
                        <li>Pare-feu et systèmes de détection d'intrusion</li>
                        <li>Sauvegardes régulières et chiffrées</li>
                        <li>Accès limité aux données personnelles (principe du moindre privilège)</li>
                        <li>Formation régulière de nos équipes sur la protection des données</li>
                        <li>Audits de sécurité périodiques</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UserCheck className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      5. Vos droits
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p>Conformément au RGPD et à la loi tunisienne sur la protection des données personnelles, vous disposez des droits suivants :</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données personnelles</li>
                        <li><strong>Droit de rectification :</strong> Corriger les données inexactes ou incomplètes</li>
                        <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
                        <li><strong>Droit à la limitation :</strong> Limiter le traitement de vos données</li>
                        <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                        <li><strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données</li>
                        <li><strong>Droit de retrait du consentement :</strong> Retirer votre consentement à tout moment</li>
                      </ul>
                      <p className="mt-4">
                        Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@immoexpress.fr" className="text-blue-600 hover:underline">privacy@immoexpress.fr</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 6 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      6. Conservation des données
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p>Nous conservons vos données personnelles aussi longtemps que nécessaire pour :</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Fournir nos services (durée de votre compte actif)</li>
                        <li>Respecter nos obligations légales (délais légaux de conservation)</li>
                        <li>Résoudre les litiges et faire appliquer nos accords</li>
                      </ul>
                      <p className="mt-4">
                        Après suppression de votre compte, vos données sont anonymisées ou supprimées dans un délai de 30 jours, 
                        sauf obligation légale de conservation plus longue.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 7 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="space-y-4 text-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    7. Cookies et technologies similaires
                  </h2>
                  <p>
                    Nous utilisons des cookies et des technologies similaires pour améliorer votre expérience. 
                    Pour plus d'informations, consultez notre <a href="/legal/cookies" className="text-blue-600 hover:underline">Politique de cookies</a>.
                  </p>
                </div>
              </div>

              {/* Section 8 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="space-y-4 text-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    8. Modifications de cette politique
                  </h2>
                  <p>
                    Nous pouvons modifier cette politique de confidentialité à tout moment. Les modifications importantes 
                    vous seront notifiées par email ou via un message sur notre plateforme. Nous vous encourageons à consulter 
                    régulièrement cette page.
                  </p>
                </div>
              </div>

              {/* Section 9 */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="space-y-4 text-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    9. Contact
                  </h2>
                  <p>
                    Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits :
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <p><strong>ImmoExpress</strong></p>
                    <p>Avenue Habib Bourguiba, Tunis, Tunisie</p>
                    <p>Email : <a href="mailto:privacy@immoexpress.fr" className="text-blue-600 hover:underline">privacy@immoexpress.fr</a></p>
                    <p>Téléphone : <a href="tel:+21696254845" className="text-blue-600 hover:underline">+216 96 25 48 45</a></p>
                  </div>
                </div>
              </div>

            </div>

            {/* CTA */}
            <div className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border border-blue-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Des questions sur la confidentialité ?
              </h3>
              <p className="text-gray-700 mb-6">
                Notre équipe est à votre disposition pour répondre à toutes vos questions
              </p>
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                Nous contacter
              </a>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
