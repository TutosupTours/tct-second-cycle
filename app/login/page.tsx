"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FormField, Form } from "@/components/Form";
import Alert from "@/components/Alert";
import { validateEmail, sanitizeInput } from "@/lib/errors";

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
  const [alertType, setAlertType] = useState<'success' | 'error'>('error');

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
    if (!loginId.trim() || !pin.trim()) {
      setMessage("Veuillez remplir tous les champs.");
      setAlertType('error');
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/student-login`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login_id: sanitizeInput(loginId).toLowerCase(),
          pin: sanitizeInput(pin),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Connexion impossible.");
      }

      localStorage.setItem("student_session", JSON.stringify(data.user));
      window.location.href = "/student";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur de connexion");
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  }

  async function handleStaffLogin() {
    if (!loginId.trim() || !password.trim()) {
      setMessage("Veuillez remplir tous les champs.");
      setAlertType('error');
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // 1. récupérer email via login_id
      const lookupRes = await fetch(`${SUPABASE_URL}/functions/v1/staff-login`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login_id: sanitizeInput(loginId).toLowerCase(),
        }),
      });

      const lookup = await lookupRes.json();

      if (!lookupRes.ok || !lookup.success) {
        throw new Error(lookup.error || "Identifiant introuvable.");
      }

      // 2. vérifier rôle cohérent
      if (lookup.staff.role !== role) {
        throw new Error("Cet identifiant ne correspond pas à cet espace.");
      }

      // 3. login Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email: lookup.staff.email,
        password,
      });

      if (error) {
        throw new Error("Mot de passe incorrect.");
      }

      window.location.href = `/${role}`;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur de connexion");
      setAlertType('error');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (data: Record<string, string>) => {
    if (role === "student") {
      handleStudentLogin();
    } else {
      handleStaffLogin();
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbf1df] p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2c2f4a]">
            Connexion {role === "student" ? "Étudiant" : role.charAt(0).toUpperCase() + role.slice(1)}
          </h1>
          <p className="mt-2 text-gray-600">
            Entrez vos identifiants pour accéder à votre compte
          </p>
        </div>

        {message && (
          <Alert
            type={alertType}
            message={message}
            onClose={() => setMessage("")}
          />
        )}

        <Form onSubmit={handleSubmit} submitLabel="Se connecter" loading={loading}>
          <FormField
            label="Identifiant"
            value={loginId}
            onChange={setLoginId}
            placeholder="Votre identifiant"
            required
          />

          {role === "student" ? (
            <FormField
              label="PIN"
              type="password"
              value={pin}
              onChange={setPin}
              placeholder="Votre PIN"
              required
            />
          ) : (
            <FormField
              label="Mot de passe"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Votre mot de passe"
              required
            />
          )}
        </Form>

        <div className="text-center">
          <button
            onClick={() => window.location.href = "/"}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </main>
  );
}