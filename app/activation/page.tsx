"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function ActivationPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [loginId, setLoginId] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    const type = params.get("type") || "student";

    if (!t) {
      setMessage("Lien invalide : token manquant.");
      return;
    }

    setToken(t);
    setAccountType(type);
  }, []);

  async function handleActivation() {
    setMessage("");
    setLoginId("");

    if (!token) {
      setMessage("Lien invalide : token manquant.");
      return;
    }

    if (!/^[0-9]{4}$/.test(pin)) {
      setMessage("Le code PIN doit contenir exactement 4 chiffres.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = accountType === 'student' ? 'activate-student' : 'activate-staff';
      const res = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          pin,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage("Erreur activation : " + JSON.stringify(data));
        setLoading(false);
        return;
      }

      setLoginId(data.login_id);
      setMessage("Compte activé avec succès.");
    } catch (error) {
      setMessage("Erreur serveur pendant l’activation.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f0e5] px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow">
        <h1 className="text-3xl font-bold text-[#2f2f2f]">Activation</h1>

        {!loginId ? (
          <>
            <p className="mt-4 text-sm text-[#666]">
              Choisis ton code personnel à 4 chiffres.
            </p>

            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Code 4 chiffres"
              className="mt-6 w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 text-center outline-none"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            />

            <button
              onClick={handleActivation}
              disabled={loading}
              className="mt-4 w-full rounded-2xl bg-[#7c9c56] px-6 py-4 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Activation..." : "Activer"}
            </button>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm text-[#666]">
              Votre identifiant de connexion est :
            </p>

            <p className="mt-3 rounded-2xl bg-[#edf5e6] px-4 py-3 text-xl font-bold text-[#2f4d1f]">
              {loginId}
            </p>

            <a
              href="/login"
              className="mt-6 inline-block rounded-2xl bg-[#7c9c56] px-6 py-3 font-semibold text-white"
            >
              Se connecter
            </a>
          </>
        )}

        {message ? (
          <p className="mt-5 text-sm font-medium text-[#5f574c]">{message}</p>
        ) : null}
      </div>
    </main>
  );
}