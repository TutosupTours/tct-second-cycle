"use client";

import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function ActivationPage() {
  const [token, setToken] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");
  const [loginId, setLoginId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  async function handleActivation() {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/activate-student`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, pin }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage("Erreur : " + JSON.stringify(data));
      return;
    }

    setLoginId(data.login_id);
    setMessage("Compte activé !");
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#f5f0e5]">
      <div className="bg-white p-6 rounded-xl text-center">
        <h1 className="text-xl font-bold mb-4">Activation</h1>

        {!loginId && (
          <>
            <input
              placeholder="Code 4 chiffres"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="border p-2 mb-3"
            />
            <button onClick={handleActivation} className="bg-green-600 text-white px-4 py-2 rounded">
              Activer
            </button>
          </>
        )}

        {loginId && (
          <div>
            <p className="mt-4">Ton identifiant :</p>
            <strong>{loginId}</strong>
          </div>
        )}

        <p className="mt-4">{message}</p>
      </div>
    </main>
  );
}