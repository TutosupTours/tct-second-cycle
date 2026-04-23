"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ActivationPage() {
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleActivate() {
    setMessage("");

    // 1. vérifier le code
    const { data: activation, error } = await supabase
      .from("student_activation_codes")
      .select("*")
      .eq("email", email)
      .eq("student_login_id", studentId)
      .eq("activation_code", code)
      .eq("is_used", false)
      .single();

    if (error || !activation) {
      setMessage("Code invalide ou déjà utilisé.");
      return;
    }

    // 2. créer le compte auth
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (signUpError || !signUpData.user) {
      setMessage("Erreur lors de la création du compte.");
      return;
    }

    const userId = signUpData.user.id;

    // 3. créer le profil
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      email,
      full_name: "",
      role: "student",
      student_number: studentId,
    });

    if (profileError) {
      setMessage("Erreur lors de la création du profil.");
      return;
    }

    // 4. marquer le code comme utilisé
    await supabase
      .from("student_activation_codes")
      .update({ is_used: true })
      .eq("id", activation.id);

    setMessage("Compte créé avec succès. Tu peux maintenant te connecter.");

    setEmail("");
    setStudentId("");
    setCode("");
    setPassword("");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5efe6]">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#2c2f4a] mb-4">
          Activation du compte étudiant
        </h1>

        <input
          className="w-full mb-3 p-3 border rounded-xl"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-3 p-3 border rounded-xl"
          placeholder="ID étudiant"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <input
          className="w-full mb-3 p-3 border rounded-xl"
          placeholder="Code d’activation"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-4 p-3 border rounded-xl"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleActivate}
          className="w-full bg-[#d74d45] text-white py-3 rounded-xl font-semibold"
        >
          Activer mon compte
        </button>

        {message && (
          <p className="mt-4 text-sm text-center text-[#2c2f4a]">{message}</p>
        )}
      </div>
    </main>
  );
}