"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export default function ActivationPage() {
  const [message, setMessage] = useState("Activation en cours...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function activate() {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setMessage("Lien d’activation invalide : token manquant.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/activate-student`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          setMessage("Erreur activation : " + JSON.stringify(data));
          setLoading(false);
          return;
        }

        setMessage("Compte activé avec succès. Tu peux maintenant te connecter.");
      } catch {
        setMessage("Erreur serveur pendant l’activation.");
      }

      setLoading(false);
    }

    activate();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f0e5] px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow">
        <h1 className="text-3xl font-bold text-[#2f2f2f]">
          Activation du compte
        </h1>

        <p className="mt-6 text-sm text-[#666]">{message}</p>

        {!loading && message.includes("succès") ? (
          <a
            href="/login?role=student"
            className="mt-6 inline-block rounded-2xl bg-[#7c9c56] px-6 py-3 font-semibold text-white"
          >
            Se connecter
          </a>
        ) : null}
      </div>
    </main>
  );
}