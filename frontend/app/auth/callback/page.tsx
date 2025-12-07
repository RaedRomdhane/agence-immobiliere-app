'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams?.get('token');
      const error = searchParams?.get('error');

      if (error) {
        // Erreur d'authentification Google
        router.push('/login?error=google_auth_failed');
        return;
      }

      if (token) {
        try {
          // Sauvegarder le token
          localStorage.setItem('token', token);
          
          // Récupérer les informations utilisateur
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          console.log('📍 Callback: Récupération infos utilisateur depuis:', `${apiUrl}/auth/me`);
          console.log('📍 Token:', token.substring(0, 20) + '...');
          
          const response = await axios.get(`${apiUrl}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log('📍 Réponse API:', response.data);

          if (response.data.success) {
            // Sauvegarder les infos utilisateur
            const userData = response.data.data.user;
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Rediriger vers la page d'accueil (qui affiche le dashboard selon le rôle)
            const redirectUrl = '/';
            
            // Forcer le rechargement complet pour que l'AuthProvider détecte le changement
            window.location.href = redirectUrl;
          } else {
            // Token invalide
            localStorage.removeItem('token');
            router.push('/login?error=invalid_token');
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des infos utilisateur:', error);
          localStorage.removeItem('token');
          router.push('/login?error=auth_failed');
        }
      } else {
        // Pas de token, rediriger vers login
        router.push('/login');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Authentification en cours...
        </h2>
        <p className="text-gray-600">
          Veuillez patienter pendant que nous finalisons votre connexion
        </p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
