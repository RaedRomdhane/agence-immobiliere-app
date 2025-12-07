"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, Moon, Sun, Globe, Monitor } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  useEffect(() => {
    // Load settings from localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      const savedLanguage = localStorage.getItem('language') as 'fr' | 'en' | null;
      const savedNotifications = localStorage.getItem('notifications');
      
      if (savedTheme) setTheme(savedTheme);
      if (savedLanguage) setLanguage(savedLanguage);
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleLanguageChange = (newLanguage: 'fr' | 'en') => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    // You can add i18n logic here
  };

  const handleNotificationToggle = (type: 'email' | 'push' | 'sms') => {
    const newNotifications = {
      ...notifications,
      [type]: !notifications[type],
    };
    setNotifications(newNotifications);
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <button
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2"
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Paramètres</h1>

        {/* Theme Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-6 w-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Thème de l'interface</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Choisissez le mode d'affichage qui vous convient le mieux
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Sun className="h-8 w-8 text-yellow-500" />
              <span className="font-medium text-gray-900">Clair</span>
            </button>

            <button
              onClick={() => handleThemeChange('dark')}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Moon className="h-8 w-8 text-indigo-500" />
              <span className="font-medium text-gray-900">Sombre</span>
            </button>

            <button
              onClick={() => handleThemeChange('system')}
              className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                theme === 'system'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Monitor className="h-8 w-8 text-gray-600" />
              <span className="font-medium text-gray-900">Système</span>
            </button>
          </div>
        </div>

        {/* Language Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-6 w-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Langue</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Sélectionnez la langue de l'interface
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleLanguageChange('fr')}
              className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                language === 'fr'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">🇫🇷</span>
              <span className="font-medium text-gray-900">Français</span>
            </button>

            <button
              onClick={() => handleLanguageChange('en')}
              className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                language === 'en'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">🇬🇧</span>
              <span className="font-medium text-gray-900">English</span>
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
          <p className="text-gray-600 text-sm mb-4">
            Gérez vos préférences de notifications
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Notifications par email</h3>
                <p className="text-sm text-gray-600">Recevoir des notifications par email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() => handleNotificationToggle('email')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Notifications push</h3>
                <p className="text-sm text-gray-600">Recevoir des notifications push sur votre navigateur</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={() => handleNotificationToggle('push')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900">Notifications SMS</h3>
                <p className="text-sm text-gray-600">Recevoir des notifications par SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={() => handleNotificationToggle('sms')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            onClick={() => {
              alert('Paramètres sauvegardés avec succès!');
            }}
          >
            Sauvegarder les modifications
          </button>
        </div>
      </div>
    </div>
  );
}
