"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Erreur connexion");
    } else {
      window.location.href = "/";
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5efe6]">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Connexion
        </h1>

        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded-xl border"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="p-3 rounded-xl border"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="bg-[#2c2f4a] text-white p-3 rounded-xl font-semibold"
          >
            Se connecter
          </button>
        </div>

        {message && (
          <p className="text-red-500 mt-4 text-sm text-center">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}