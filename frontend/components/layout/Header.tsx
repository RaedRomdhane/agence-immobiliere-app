'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Building2, Menu, X, Bell, User, LogOut, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNotificationWebSocket } from '@/utils/useNotificationWebSocket';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiClient from '@/lib/api/client';
import Image from 'next/image';
import NotificationsModal from '../notifications/NotificationsModal';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  // Helper function to check if link is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  // Real-time notification WebSocket
  useNotificationWebSocket(user?.id || '', (notif) => {
    setNotifications((prev) => [notif, ...prev]);
    setUnreadCount((prev) => prev + 1);
    toast.info(notif.message || 'Nouvelle notification');
  });
  // Fetch unread count on mount and when authenticated
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (isAuthenticated) {
        try {
          const res = await apiClient.get('/notifications');
          const notifList = res.data?.data || [];
          setUnreadCount(notifList.filter((n:any) => !n.read).length);
        } catch (err) {
          setUnreadCount(0);
        }
      } else {
        setUnreadCount(0);
      }
    };
    fetchUnreadCount();
  }, [isAuthenticated]);

  // Fetch notifications list when dropdown opens or closes
  useEffect(() => {
    const fetchNotifications = async () => {
      if ((notificationsOpen || !notificationsOpen) && isAuthenticated) {
        setLoadingNotifications(true);
        try {
          const res = await apiClient.get('/notifications');
          const notifList = res.data?.data || [];
          setNotifications(notifList);
        } catch (err) {
          setNotifications([]);
        } finally {
          setLoadingNotifications(false);
        }
      }
    };
    fetchNotifications();
  }, [notificationsOpen, isAuthenticated]);

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
    <>
    <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
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
            <Link 
              href="/" 
              className={`font-medium transition-colors ${
                isActive('/') 
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Accueil
            </Link>
            <Link 
              href="/properties" 
              className={`font-medium transition-colors ${
                isActive('/properties') 
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Biens
            </Link>
            <Link 
              href="/about" 
              className={`font-medium transition-colors ${
                isActive('/about') 
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              À propos
            </Link>
            {user && user.role === 'admin' ? (
              <Link 
                href="/admin/contact" 
                className={`font-medium transition-colors ${
                  isActive('/admin/contact') || isActive('/contact')
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Contact
              </Link>
            ) : (
              <Link 
                href="/contact" 
                className={`font-medium transition-colors ${
                  isActive('/contact') 
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Contact
              </Link>
            )}
            {user && user.role === 'admin' ? (
              <Link 
                href="/admin/reviews" 
                className={`font-medium transition-colors ${
                  isActive('/admin/reviews') || isActive('/reviews')
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Avis
              </Link>
            ) : (
              <Link 
                href="/reviews" 
                className={`font-medium transition-colors ${
                  isActive('/reviews') 
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Avis
              </Link>
            )}
          </div>

          {/* Auth Section - Right */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                {/* Notifications Icon */}
                <button 
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                  }}
                  className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
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
                        href="/admin/settings"
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
                className={`font-medium transition-colors ${
                  isActive('/') 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                href="/properties"
                className={`font-medium transition-colors ${
                  isActive('/properties') 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Biens
              </Link>
              <Link
                href="/about"
                className={`font-medium transition-colors ${
                  isActive('/about') 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                À propos
              </Link>
              {user && user.role === 'admin' ? (
                <Link
                  href="/admin/contact"
                  className={`font-medium transition-colors ${
                    isActive('/admin/contact') || isActive('/contact')
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              ) : (
                <Link
                  href="/contact"
                  className={`font-medium transition-colors ${
                    isActive('/contact') 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              )}
              {user && user.role === 'admin' ? (
                <Link
                  href="/admin/reviews"
                  className={`font-medium transition-colors ${
                    isActive('/admin/reviews') || isActive('/reviews')
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Avis
                </Link>
              ) : (
                <Link
                  href="/reviews"
                  className={`font-medium transition-colors ${
                    isActive('/reviews') 
                      ? 'text-blue-600 font-semibold' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Avis
                </Link>
              )}
              
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
            onClick={async () => {
              setNotificationsOpen(false);
              if (isAuthenticated) {
                try {
                  await apiClient.patch('/notifications/mark-all-read');
                  setUnreadCount(0);
                  setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
                } catch (err) {}
              }
            }}
          ></div>
          {/* Dropdown */}
          <div className="absolute top-16 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-600">
                {unreadCount > 0
                  ? `Vous avez ${unreadCount} nouvelle${unreadCount > 1 ? 's' : ''} notification${unreadCount > 1 ? 's' : ''}`
                  : 'Aucune nouvelle notification'}
              </p>
            </div>
            <div className="overflow-y-auto max-h-[400px]">
              {loadingNotifications ? (
                <div className="p-4 text-center text-gray-500">Chargement...</div>
              ) : notifications.filter(n => !n.read).length === 0 ? (
                <div className="p-4 text-center text-gray-500">Aucune notification</div>
              ) : (
                notifications.filter(n => !n.read).map((notif, idx) => (
                  <div
                    key={notif._id || idx}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer flex items-start space-x-3`}
                  >
                    <div className={`p-2 rounded-full flex-shrink-0 bg-blue-100`}>
                      <Bell className={`h-4 w-4 text-blue-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{notif.title || 'Notification'}</p>
                      <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-center">
              <button
                className="text-blue-600 hover:underline font-semibold text-sm cursor-pointer"
                type="button"
                onClick={() => setShowAllNotifications(true)}
              >
                Voir tout
              </button>
            </div>
        {/* Modal rendered at root for proper overlay */}
        {showAllNotifications && (
          <NotificationsModal
            open={showAllNotifications}
            onClose={() => setShowAllNotifications(false)}
            notifications={notifications}
          />
        )}
          </div>
        </>
      )}
    </header>
    </>
  );
}
