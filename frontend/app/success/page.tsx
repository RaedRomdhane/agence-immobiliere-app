"use client";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md w-full border border-green-300">
        <h1 className="text-3xl font-extrabold mb-6 text-green-700">✅ Paiement réussi !</h1>
        <p className="text-lg text-gray-700 mb-8">Merci pour votre paiement.<br/>Votre transaction a été complétée avec succès.</p>
        <button
          onClick={() => router.push('/properties')}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold shadow hover:bg-green-700 transition"
        >
          Retour à la liste des biens
        </button>
      </div>
    </div>
  );
}
