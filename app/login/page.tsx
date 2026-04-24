"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function LoginPage() {
  const [role, setRole] = useState("student");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loginId, setLoginId] = useState("");
  const [pin, setPin] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("role") || "student";

    if (["br", "student"].includes(r)) {
      setRole(r);
    } else {
      setRole("coming");
    }
  }, []);

  async function handleBRLogin() {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Identifiants BR incorrects.");
      setLoading(false);
      return;
    }

    window.location.href = "/br";
  }

  async function handleStudentLogin() {
    setLoading(true);
    setMessage("");

    const res = await fetch(`${SUPABASE_URL}/functions/v1/student-login`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login_id: loginId.trim().toLowerCase(),
        pin,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      setMessage(data.error || "Connexion impossible.");
      setLoading(false);
      return;
    }

    localStorage.setItem("student_session", JSON.stringify(data.user));
    window.location.href = "/student";
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f0e5] px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
        {role === "br" ? (
          <>
            <h1 className="text-3xl font-bold text-[#2f2f2f]">
              Connexion BR
            </h1>

            <p className="mt-2 text-sm text-[#666]">
              Accès réservé au bureau.
            </p>

            <div className="mt-6 space-y-4">
              <input
                type="email"
                placeholder="Email BR"
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

            <button
              onClick={handleBRLogin}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-lg font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </>
        ) : role === "student" ? (
          <>
            <h1 className="text-3xl font-bold text-[#2f2f2f]">
              Connexion étudiant
            </h1>

            <p className="mt-2 text-sm text-[#666]">
              Utilise ton identifiant reçu après activation et ton code à 4 chiffres.
            </p>

            <div className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Identifiant"
                className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />

              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Code 4 chiffres"
                className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <button
              onClick={handleStudentLogin}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-lg font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            <button
              type="button"
              onClick={() => setMessage("Le reset code sera ajouté à l’étape suivante.")}
              className="mt-4 text-sm font-semibold underline text-[#6a8f4f]"
            >
              Code oublié ?
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-[#2f2f2f]">
              Bientôt disponible
            </h1>

            <p className="mt-4 text-sm text-[#666]">
              Cet espace sera disponible prochainement.
            </p>

            <a
              href="/"
              className="mt-6 inline-block rounded-2xl bg-[#7c9c56] px-6 py-3 text-white"
            >
              Retour accueil
            </a>
          </>
        )}

        {message ? (
          <p className="mt-4 text-sm font-medium text-red-600">{message}</p>
        ) : null}
      </div>
    </main>
  );
}