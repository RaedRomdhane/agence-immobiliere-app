'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Cookie, Settings, Eye, BarChart, Shield, CheckCircle2 } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
                <Cookie className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
              Politique de cookies
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
                Cette politique explique comment ImmoExpress utilise les cookies et technologies similaires sur notre plateforme. 
                En utilisant notre site, vous acceptez l'utilisation de cookies conformément à cette politique.
              </p>
            </div>

            {/* What are cookies */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-12 border border-blue-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Cookie className="h-6 w-6 mr-3 text-blue-600" />
                Qu'est-ce qu'un cookie ?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette) lorsque vous 
                visitez un site web. Les cookies permettent au site de mémoriser vos actions et préférences (connexion, langue, 
                taille de police, etc.) pendant une certaine période, afin que vous n'ayez pas à les saisir à nouveau chaque 
                fois que vous revenez sur le site.
              </p>
            </div>

            {/* Sections */}
            <div className="space-y-12">
              
              {/* Section 1 - Types de cookies */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Types de cookies que nous utilisons
                </h2>

                <div className="space-y-6">
                  
                  {/* Essential Cookies */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          1. Cookies essentiels (obligatoires)
                        </h3>
                        <span className="text-xs font-semibold px-3 py-1 bg-red-100 text-red-700 rounded-full">
                          Nécessaires
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        Ces cookies sont indispensables au fonctionnement du site. Ils ne peuvent pas être désactivés.
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-gray-600 text-sm">
                        <li><strong>Authentification :</strong> Maintien de votre session connectée</li>
                        <li><strong>Sécurité :</strong> Protection CSRF et prévention des attaques</li>
                        <li><strong>Équilibrage de charge :</strong> Distribution du trafic sur nos serveurs</li>
                        <li><strong>Préférences essentielles :</strong> Langue sélectionnée, devise</li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">Durée : Session ou 30 jours</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Functional Cookies */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Settings className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          2. Cookies fonctionnels
                        </h3>
                        <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                          Optionnels
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        Ces cookies permettent d'améliorer les fonctionnalités et la personnalisation du site.
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-gray-600 text-sm">
                        <li><strong>Préférences utilisateur :</strong> Thème, disposition, filtres sauvegardés</li>
                        <li><strong>Recherches récentes :</strong> Historique de vos recherches</li>
                        <li><strong>Biens consultés :</strong> Mémorisation des biens que vous avez vus</li>
                        <li><strong>Panier/Favoris :</strong> Sauvegarde temporaire de vos sélections</li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">Durée : 6 à 12 mois</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Analytics Cookies */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <BarChart className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          3. Cookies analytiques
                        </h3>
                        <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
                          Optionnels
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site.
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-gray-600 text-sm">
                        <li><strong>Google Analytics :</strong> Statistiques de visites et comportement des utilisateurs</li>
                        <li><strong>Métriques de performance :</strong> Temps de chargement, erreurs techniques</li>
                        <li><strong>Parcours utilisateur :</strong> Pages visitées, durée des sessions</li>
                        <li><strong>A/B Testing :</strong> Tests de nouvelles fonctionnalités</li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">Durée : 13 à 26 mois</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* Marketing Cookies */}
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Eye className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          4. Cookies publicitaires
                        </h3>
                        <span className="text-xs font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                          Optionnels
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        Ces cookies sont utilisés pour vous proposer des publicités pertinentes.
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-gray-600 text-sm">
                        <li><strong>Publicité ciblée :</strong> Annonces basées sur vos intérêts</li>
                        <li><strong>Retargeting :</strong> Rappel de biens que vous avez consultés</li>
                        <li><strong>Réseaux sociaux :</strong> Intégration Facebook, LinkedIn, etc.</li>
                        <li><strong>Mesure de campagnes :</strong> Efficacité de nos publicités</li>
                      </ul>
                      <p className="text-xs text-gray-500 mt-2">Durée : 3 à 12 mois</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Section 2 - Third Party Cookies */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Cookies tiers
                </h2>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Certains cookies sont placés par des services tiers que nous utilisons :
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="font-semibold text-gray-900">Google Analytics</p>
                      <p className="text-sm text-gray-600">Analyse du trafic et du comportement des utilisateurs</p>
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                        Politique de confidentialité de Google
                      </a>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Google OAuth</p>
                      <p className="text-sm text-gray-600">Connexion via votre compte Google</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Réseaux sociaux</p>
                      <p className="text-sm text-gray-600">Boutons de partage Facebook, Twitter, LinkedIn</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3 - Managing Cookies */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Settings className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      Gérer vos préférences de cookies
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p>Vous pouvez contrôler et gérer les cookies de plusieurs manières :</p>
                      
                      <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
                        <p className="font-semibold text-blue-900 mb-2">Via notre bannière de cookies</p>
                        <p className="text-sm text-blue-800">
                          Lors de votre première visite, une bannière vous permet d'accepter ou de refuser les cookies non essentiels.
                        </p>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-600">
                        <p className="font-semibold text-green-900 mb-2">Paramètres de votre navigateur</p>
                        <p className="text-sm text-green-800 mb-2">
                          Tous les navigateurs permettent de gérer les cookies. Consultez l'aide de votre navigateur :
                        </p>
                        <ul className="text-xs text-green-700 space-y-1 pl-4">
                          <li>• <strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
                          <li>• <strong>Firefox :</strong> Options → Vie privée et sécurité → Cookies</li>
                          <li>• <strong>Safari :</strong> Préférences → Confidentialité</li>
                          <li>• <strong>Edge :</strong> Paramètres → Cookies et autorisations</li>
                        </ul>
                      </div>

                      <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-600">
                        <p className="font-semibold text-orange-900 mb-2">⚠️ Conséquences du refus</p>
                        <p className="text-sm text-orange-800">
                          Le refus de certains cookies peut affecter votre expérience : perte de préférences, 
                          fonctionnalités limitées, contenu moins personnalisé.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4 - Cookie List */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Liste détaillée des cookies
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Nom</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Durée</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs">auth_token</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Essentiel</span></td>
                        <td className="px-4 py-3 text-gray-600">Session</td>
                        <td className="px-4 py-3 text-gray-600">Token d'authentification</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs">user_preferences</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Fonctionnel</span></td>
                        <td className="px-4 py-3 text-gray-600">1 an</td>
                        <td className="px-4 py-3 text-gray-600">Préférences utilisateur</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs">_ga</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Analytique</span></td>
                        <td className="px-4 py-3 text-gray-600">2 ans</td>
                        <td className="px-4 py-3 text-gray-600">Google Analytics - ID visiteur</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs">_gid</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Analytique</span></td>
                        <td className="px-4 py-3 text-gray-600">24 heures</td>
                        <td className="px-4 py-3 text-gray-600">Google Analytics - Session</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs">recent_searches</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Fonctionnel</span></td>
                        <td className="px-4 py-3 text-gray-600">30 jours</td>
                        <td className="px-4 py-3 text-gray-600">Historique des recherches</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 5 - Updates */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Modifications de cette politique
                </h2>
                <p className="text-gray-700">
                  Nous pouvons mettre à jour cette politique de cookies. Toute modification sera publiée sur cette page 
                  avec une nouvelle date de mise à jour. Nous vous encourageons à consulter régulièrement cette page.
                </p>
              </div>

              {/* Contact */}
              <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Questions sur les cookies ?
                </h2>
                <p className="text-gray-700 mb-4">
                  Si vous avez des questions concernant notre utilisation des cookies :
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p><strong>ImmoExpress</strong></p>
                  <p className="text-gray-600">Email : <a href="mailto:privacy@immoexpress.fr" className="text-blue-600 hover:underline">privacy@immoexpress.fr</a></p>
                  <p className="text-gray-600">Téléphone : <a href="tel:+21696254845" className="text-blue-600 hover:underline">+216 96 25 48 45</a></p>
                </div>
              </div>

            </div>

            {/* Summary Box */}
            <div className="mt-12 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
              <div className="flex items-start space-x-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    En résumé
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Les cookies essentiels sont nécessaires au fonctionnement du site</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Vous pouvez refuser les cookies non essentiels</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Vos préférences sont respectées et peuvent être modifiées à tout moment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Nous utilisons les cookies pour améliorer votre expérience</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
