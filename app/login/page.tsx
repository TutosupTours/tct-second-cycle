"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const STAFF_ROLES = ["admin", "br", "examinateur", "faculty"];

export default function LoginPage() {
  const [role, setRole] = useState("student");

  const [loginId, setLoginId] = useState("");
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get("role") || "student";

    if (r === "student" || STAFF_ROLES.includes(r)) {
      setRole(r);
    } else {
      setRole("student");
    }
  }, []);

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

  async function handleStaffLogin() {
    setLoading(true);
    setMessage("");

    const lookupRes = await fetch(`${SUPABASE_URL}/functions/v1/staff-login`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login_id: loginId.trim().toLowerCase(),
      }),
    });

    const lookup = await lookupRes.json();

    if (!lookupRes.ok || !lookup.success) {
      setMessage(lookup.error || "Identifiant introuvable.");
      setLoading(false);
      return;
    }

    if (lookup.staff.role !== role) {
      setMessage("Cet identifiant ne correspond pas à cet espace.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: lookup.staff.email,
      password,
    });

    if (error) {
      setMessage("Mot de passe incorrect.");
      setLoading(false);
      return;
    }

    window.location.href = `/${lookup.staff.role}`;
  }

  const isStudent = role === "student";

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f0e5] px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
        <h1 className="text-3xl font-bold text-[#2f2f2f]">
          {isStudent
            ? "Connexion étudiant"
            : role === "br"
            ? "Connexion BR"
            : role === "admin"
            ? "Connexion admin"
            : role === "examinateur"
            ? "Connexion examinateur"
            : "Connexion faculté"}
        </h1>

        <p className="mt-2 text-sm text-[#666]">
          {isStudent
            ? "Utilise ton identifiant et ton code à 4 chiffres."
            : "Utilise ton identifiant et ton mot de passe."}
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Identifiant"
            className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
          />

          {isStudent ? (
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Code 4 chiffres"
              className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            />
          ) : (
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </div>

        <button
          onClick={isStudent ? handleStudentLogin : handleStaffLogin}
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-lg font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        {message ? (
          <p className="mt-4 text-sm font-medium text-red-600">{message}</p>
        ) : null}
      </div>
    </main>
  );
}