'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Building2, Menu, X, Bell, User, LogOut, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [userMenuOpen]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U';
    return user.firstName?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <nav className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center h-16">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ImmoExpress
            </span>
          </Link>

          {/* Desktop Navigation - Center (with flex-grow to push auth to right) */}
          <div className="hidden md:flex items-center space-x-8 flex-grow justify-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Accueil
            </Link>
            <Link href="/properties" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Biens
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              À propos
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Contact
            </Link>
          </div>

          {/* Auth Section - Right */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications Icon */}
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {/* Notification Badge */}
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    3
                  </span>
                </button>
                
                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
                      {user.photoURL ? (
                        <Image 
                          src={user.photoURL} 
                          alt={user.firstName || 'User'} 
                          width={36}
                          height={36}
                          className="rounded-full"
                        />
                      ) : (
                        getUserInitials()
                      )}
                    </div>
                    
                    {/* User Name */}
                    <span className="text-sm font-medium text-gray-700">
                      {user.firstName}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Mon Profil</span>
                      </Link>
                      
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Paramètres</span>
                      </Link>
                      
                      <div className="border-t border-gray-100 mt-2"></div>
                      
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                href="/properties"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Biens
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                À propos
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <p className="text-sm text-gray-600">
                      Bonjour, {user.firstName}
                    </p>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block w-full px-4 py-2 text-center text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full px-4 py-2 text-center text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      S&apos;inscrire
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Notifications Dropdown */}
      {notificationsOpen && isAuthenticated && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setNotificationsOpen(false)}
          ></div>
          
          {/* Dropdown */}
          <div className="absolute top-16 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-600">Vous avez 3 nouvelles notifications</p>
            </div>
            
            <div className="overflow-y-auto max-h-[400px]">
              {/* Notification 1 */}
              <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Nouveau bien correspondant à vos critères</p>
                    <p className="text-xs text-gray-600 mt-1">Un appartement à Paris 16ème correspond à votre recherche sauvegardée</p>
                    <p className="text-xs text-gray-400 mt-1">Il y a 2 heures</p>
                  </div>
                  <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                </div>
              </div>

              {/* Notification 2 */}
              <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                    <Bell className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Visite confirmée</p>
                    <p className="text-xs text-gray-600 mt-1">Votre visite pour la maison à Lyon est confirmée pour demain 14h</p>
                    <p className="text-xs text-gray-400 mt-1">Il y a 5 heures</p>
                  </div>
                  <span className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0 mt-1"></span>
                </div>
              </div>

              {/* Notification 3 */}
              <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-start space-x-3">
                  <div className="bg-orange-100 p-2 rounded-full flex-shrink-0">
                    <Bell className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Nouveau message de l&apos;agent</p>
                    <p className="text-xs text-gray-600 mt-1">L&apos;agent a répondu à votre question sur la villa à Marseille</p>
                    <p className="text-xs text-gray-400 mt-1">Hier à 16h30</p>
                  </div>
                  <span className="w-2 h-2 bg-orange-600 rounded-full flex-shrink-0 mt-1"></span>
                </div>
              </div>

              {/* No more notifications */}
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500">Aucune autre notification</p>
              </div>
            </div>

            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700">
                Voir toutes les notifications
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
