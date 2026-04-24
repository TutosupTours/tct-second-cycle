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

    // 1. récupérer email via login_id
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

    // 2. vérifier rôle cohérent
    if (lookup.staff.role !== role) {
      setMessage("Cet identifiant ne correspond pas à cet espace.");
      setLoading(false);
      return;
    }

    // 3. login Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: lookup.staff.email,
      password,
    });

    if (error) {
      setMessage("Mot de passe incorrect.");
      setLoading(false);
      return;
    }

    // 🔥 4. STOCKAGE SESSION (CRUCIAL)
    localStorage.setItem("staff_session", JSON.stringify(lookup.staff));

    // 5. redirection
    window.location.href = `/${lookup.staff.role}`;
  }

  const isStudent = role === "student";

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f0e5] px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow">

        <h1 className="text-3xl font-bold text-[#2f2f2f]">
          {isStudent ? "Connexion étudiant" : `Connexion ${role}`}
        </h1>

        <div className="mt-6 space-y-4">

          <input
            type="text"
            placeholder="Identifiant"
            className="w-full rounded-2xl border px-4 py-3"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
          />

          {isStudent ? (
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Code 4 chiffres"
              className="w-full rounded-2xl border px-4 py-3"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            />
          ) : (
            <input
              type="password"
              placeholder="Mot de passe"
              className="w-full rounded-2xl border px-4 py-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}

        </div>

        <button
          onClick={isStudent ? handleStudentLogin : handleStaffLogin}
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-white"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        {message && (
          <p className="mt-4 text-red-600 text-sm">{message}</p>
        )}

      </div>
    </main>
  );
}