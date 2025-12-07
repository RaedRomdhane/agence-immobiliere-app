"use client";



import { useState, useEffect } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import InputField from "../../components/ui/InputField";
import axios from "axios";


import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user: authUser, isLoading, isAuthenticated } = useAuth();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });
  const [editMode, setEditMode] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
    // Auto-hide success message after 3 seconds
    useEffect(() => {
      if (message && message.includes('succès')) {
        const timer = setTimeout(() => setMessage(null), 3000);
        return () => clearTimeout(timer);
      }
    }, [message]);
  const router = useRouter();

  // Load user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authUser) {
        setProfileLoading(false);
        return;
      }
      const token = localStorage.getItem("token");
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${apiUrl}/users/${authUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Debug: log the full API response
        if (process.env.NODE_ENV !== 'production') {
          console.log('Profile API response:', res.data);
        }
        const userData = res.data.message || {};
        setUser({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || ""
        });
      } catch (err) {
        setMessage("Erreur lors du chargement du profil.");
      }
      setProfileLoading(false);
    };
    if (isAuthenticated && !isLoading) fetchProfile();
  }, [authUser, isAuthenticated, isLoading]);

  // Handlers
  const handleSaveProfile = async (e: any) => {
    e.preventDefault();
    setMessage(null);
    setFormError(null);
    // Validation
    if (!user.firstName.trim()) {
  setFormError("Le prénom est requis.");
  return;
}
if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(user.firstName.trim())) {
  setFormError("Le prénom ne doit contenir que des lettres.");
  return;
}
if (!user.lastName.trim()) {
  setFormError("Le nom est requis.");
  return;
}
if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(user.lastName.trim())) {
  setFormError("Le nom ne doit contenir que des lettres.");
  return;
}
    const token = localStorage.getItem("token");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await axios.put(`${apiUrl}/users/${authUser?.id}`, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditMode(false);
      setMessage("Profil mis à jour avec succès.");
    } catch (err) {
      setMessage("Erreur lors de la mise à jour du profil.");
    }
  };

  const handleChangePassword = async (e: any) => {
    e.preventDefault();
    setMessage(null);
    setPasswordError(null);
    // Password validation (same as register page)
    const password = passwords.new;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError("Le mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      await axios.post(`${apiUrl}/users/${authUser?.id}/change-password`, {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Mot de passe changé avec succès.");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      setMessage(err?.response?.data?.message || "Erreur lors du changement de mot de passe.");
    }
  };

  const handleDownloadData = async () => {
    setDownloadLoading(true);
    setMessage(null);
    const token = localStorage.getItem("token");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await axios.get(`${apiUrl}/users/${authUser?.id}/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      // Download as file
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "mes-donnees-rgpd.json");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      setMessage("Erreur lors du téléchargement des données.");
    }
    setDownloadLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 py-10 px-2">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 md:p-12">
        {/* Retour button */}
        <button
          type="button"
          className="mb-6 px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold shadow"
          onClick={() => router.back()}
        >
          &larr; Retour
        </button>
        <h1 className="text-3xl font-extrabold mb-8 text-gray-800 text-center tracking-tight">Mon Profil</h1>
        {profileLoading ? (
          <div className="flex justify-center items-center py-12">
            <span className="text-gray-500 text-lg">Chargement du profil...</span>
          </div>
        ) : (
          <>
            {formError && (
              <div className="mb-4 flex justify-center">
                <div className="px-4 py-2 rounded border border-red-300 bg-red-100 text-red-700 shadow-sm text-center font-medium animate-pulse">
                  {formError}
                </div>
              </div>
            )}
            {message && (
              <div className="mb-8 flex justify-center">
                <div className={`px-4 py-2 rounded border shadow-sm text-center font-medium animate-pulse ${message.includes('succès') ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                  {message}
                </div>
              </div>
            )}
            <form onSubmit={handleSaveProfile} className="space-y-6 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputField
                      label="Prénom"
                      name="firstName"
                      value={user.firstName}
                      onChange={e => setUser(u => ({ ...u, firstName: e.target.value }))}
                      disabled={!editMode}
                      required
                    />
                </div>
                <div>
                    <InputField
                      label="Nom"
                      name="lastName"
                      value={user.lastName}
                      onChange={e => setUser(u => ({ ...u, lastName: e.target.value }))}
                      disabled={!editMode}
                      required
                    />
                </div>
                <div className="md:col-span-2">
                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      value={user.email}
                      onChange={e => setUser(u => ({ ...u, email: e.target.value }))}
                      disabled={!editMode}
                      required
                    />
                </div>
                
              </div>
              <div className="flex justify-end mt-4">
                {editMode ? (
                  <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-lg shadow hover:bg-blue-700 transition font-semibold">Enregistrer</button>
                ) : (
                  <button type="button" className="bg-gray-200 text-gray-700 px-8 py-2 rounded-lg shadow hover:bg-gray-300 transition font-semibold" onClick={e => { e.preventDefault(); setEditMode(true); }}>Modifier</button>
                )}
              </div>
            </form>

          </>
        )}

        <div className="border-t border-gray-200 my-8"></div>

        <form onSubmit={handleChangePassword} className="space-y-6 mb-12">
          {passwordError && (
            <div className="mb-4 flex justify-center">
              <div className="px-4 py-2 rounded border border-red-300 bg-red-100 text-red-700 shadow-sm text-center font-medium animate-pulse">
                {passwordError}
              </div>
            </div>
          )}
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Changer le mot de passe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <InputField
                  label="Mot de passe actuel"
                  name="currentPassword"
                  type="password"
                  value={passwords.current}
                  onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                  required
                />
            </div>
            <div>
                <InputField
                  label="Nouveau mot de passe"
                  name="newPassword"
                  type="password"
                  value={passwords.new}
                  onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                  required
                />
            </div>
            <div>
                <InputField
                  label="Confirmer le nouveau mot de passe"
                  name="confirmPassword"
                  type="password"
                  value={passwords.confirm}
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  required
                />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-lg shadow hover:bg-blue-700 transition font-semibold">Changer le mot de passe</button>
          </div>
        </form>

        <div className="border-t border-gray-200 my-8"></div>

        <div className="flex justify-center">
          <button
            className="bg-green-600 text-white px-8 py-2 rounded-lg shadow hover:bg-green-700 transition font-semibold"
            onClick={handleDownloadData}
            disabled={downloadLoading}
          >
            {downloadLoading ? "Téléchargement..." : "Télécharger mes données (RGPD)"}
          </button>
        </div>
      </div>
    </div>
  );
}
