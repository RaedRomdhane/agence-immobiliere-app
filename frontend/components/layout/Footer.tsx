'use client';

import Link from 'next/link';
import { Building2, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ImmoExpress</span>
            </div>
            <p className="text-sm text-gray-400">
              Votre partenaire de confiance pour trouver le bien immobilier de vos rêves.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-blue-500 transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-blue-500 transition-colors">
                  Biens immobiliers
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-500 transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Nos services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/properties?type=vente" className="hover:text-blue-500 transition-colors">
                  Achat de biens
                </Link>
              </li>
              <li>
                <Link href="/properties?type=location" className="hover:text-blue-500 transition-colors">
                  Location
                </Link>
              </li>
              <li>
                <Link href="/services/estimation" className="hover:text-blue-500 transition-colors">
                  Estimation gratuite
                </Link>
              </li>
              <li>
                <Link href="/services/conseil" className="hover:text-blue-500 transition-colors">
                  Conseil immobilier
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>123 Avenue de la République<br />75001 Paris, France</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <a href="tel:+33123456789" className="hover:text-blue-500 transition-colors">
                  +33 1 23 45 67 89
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <a href="mailto:contact@immoexpress.fr" className="hover:text-blue-500 transition-colors">
                  contact@immoexpress.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-gray-400">
            © {new Date().getFullYear()} ImmoExpress. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/legal/privacy" className="hover:text-blue-500 transition-colors">
              Politique de confidentialité
            </Link>
            <Link href="/legal/terms" className="hover:text-blue-500 transition-colors">
              Conditions d&apos;utilisation
            </Link>
            <Link href="/legal/cookies" className="hover:text-blue-500 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
