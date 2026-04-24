"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function getRoleLabel(role: string | null) {
  if (role === "admin") return "Admin";
  if (role === "br") return "BR";
  if (role === "examinateur") return "Examinateur";
  if (role === "etudiant") return "Étudiant";
  if (role === "faculty") return "Faculté";
  return "Plateforme";
}

function normalizeRoleParam(role: string | null) {
  if (role === "admin") return "admin";
  if (role === "br") return "br";
  if (role === "examinateur") return "examiner";
  if (role === "etudiant") return "student";
  if (role === "faculty") return "faculty";
  return null;
}

function getRedirectPath(role: string | null) {
  if (role === "admin") return "/admin";
  if (role === "br") return "/br";
  if (role === "examiner") return "/examinateur";
  if (role === "student") return "/etudiant";
  if (role === "faculty") return "/faculty";
  return "/";
}

function getColor(role: string | null) {
  if (role === "admin") return "#cf332b";
  if (role === "br") return "#668b4e";
  if (role === "examinateur") return "#efc24d";
  if (role === "etudiant") return "#ef9faa";
  if (role === "faculty") return "#243b63";
  return "#668b4e";
}

export default function LoginPage() {
  const [roleParam, setRoleParam] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRoleParam(params.get("role"));
  }, []);

  async function handleLogin() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setMessage("Erreur de connexion. Vérifie ton email et ton mot de passe.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .single();

    if (profileError || !profile) {
      setMessage("Profil introuvable. Contacte l’administrateur.");
      setLoading(false);
      return;
    }

    const expectedRole = normalizeRoleParam(roleParam);

    if (expectedRole && profile.role !== expectedRole) {
      setMessage("Ce compte n’a pas accès à cet espace.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    window.location.href = getRedirectPath(profile.role);
  }

  const color = getColor(roleParam);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbf1df] px-4 text-[#2c2f4a]">
      <div className="w-full max-w-md rounded-[30px] bg-white p-8 shadow-[0_18px_45px_rgba(0,0,0,0.12)]">
        <h1 className="text-4xl font-bold" style={{ color }}>
          Connexion {getRoleLabel(roleParam)}
        </h1>

        <p className="mt-3 text-[#6f665e]">
          Accède à ton espace Second Cycle TCT.
        </p>

        <div className="mt-7 space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border border-[#e8ded2] bg-white px-4 py-4 text-[#2c2f4a] outline-none placeholder:text-[#9a8f85]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full rounded-2xl border border-[#e8ded2] bg-white px-4 py-4 text-[#2c2f4a] outline-none placeholder:text-[#9a8f85]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {message ? <p className="mt-4 text-sm font-medium text-red-600">{message}</p> : null}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-2xl px-6 py-4 text-lg font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: color }}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm font-medium text-[#2c2f4a] underline">
            Retour accueil
          </a>
        </div>
      </div>
    </main>
  );
}