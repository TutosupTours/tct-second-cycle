"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function getRoleLabel(role: string | null) {
  if (role === "admin") return "Admin";
  if (role === "br") return "BR";
  if (role === "examinateur") return "Examinateur";
  if (role === "etudiant") return "Étudiant";
  return "Plateforme";
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  const roleLabel = useMemo(() => getRoleLabel(role), [role]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Erreur de connexion. Vérifie ton email et ton mot de passe.");
      setLoading(false);
      return;
    }

    if (role === "admin") window.location.href = "/admin";
    else if (role === "br") window.location.href = "/br";
    else if (role === "examinateur") window.location.href = "/examinateur";
    else if (role === "etudiant") window.location.href = "/etudiant";
    else window.location.href = "/";
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f0e5] px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
        <h1 className="text-3xl font-bold text-[#2f2f2f]">Connexion {roleLabel}</h1>
        <p className="mt-2 text-sm text-[#666]">
          Accède à ton espace sur la plateforme Second Cycle TCT.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {message ? (
          <p className="mt-4 text-sm font-medium text-red-600">{message}</p>
        ) : null}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-lg font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </div>
    </main>
  );
}