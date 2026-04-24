"use client";

import { useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/student-login`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login_id: loginId,
        pin,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error);
      return;
    }

    setMessage("Connexion réussie !");
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-[#f5f0e5]">
      <div className="bg-white p-6 rounded-xl text-center">
        <h1 className="text-xl font-bold mb-4">Connexion étudiant</h1>

        <input
          placeholder="Identifiant"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          className="border p-2 mb-3"
        />

        <input
          placeholder="Code 4 chiffres"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="border p-2 mb-3"
        />

        <button onClick={handleLogin} className="bg-green-600 text-white px-4 py-2 rounded">
          Se connecter
        </button>

        <p className="mt-3">{message}</p>
      </div>
    </main>
  );
}