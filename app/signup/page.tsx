"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [password, setPassword] = useState("");
  const [promotion, setPromotion] = useState("D2");
  const [parcours, setParcours] = useState("ECOS P");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePromotionChange(value: string) {
    setPromotion(value);
    setParcours(value === "D2" ? "ECOS P" : "ECOS procéduraux simple");
  }

  async function handleSignup() {
    setLoading(true);
    setMessage("");

    const cleanPrenom = prenom.trim();
    const cleanNom = nom.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanPrenom || !cleanNom || !cleanEmail || !password) {
      setMessage("Merci de remplir tous les champs obligatoires.");
      setLoading(false);
      return;
    }

    const signupRes = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: `${cleanPrenom} ${cleanNom}`,
          role: "student",
        },
      },
    });

    if (signupRes.error) {
      setMessage(signupRes.error.message);
      setLoading(false);
      return;
    }

    const authUserId = signupRes.data.user?.id;

    const { error } = await supabase.from("inscription_requests").insert({
      auth_user_id: authUserId,
      prenom: cleanPrenom,
      nom: cleanNom,
      email: cleanEmail,
      telephone: telephone.trim() || null,
      ville: "Tours",
      promotion,
      parcours,
      statut: "pending_review",
      paiement_verifie: false,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Demande envoyée. Le BR vérifiera ton paiement puis activera ton accès.");
    setPrenom("");
    setNom("");
    setEmail("");
    setTelephone("");
    setPassword("");
    setPromotion("D2");
    setParcours("ECOS P");
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f0e5] px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-[#2f2f2f]">Demande d’inscription</h1>

        <div className="mt-6 space-y-4">
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="Nom" value={nom} onChange={(e) => setNom(e.target.value)} />
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-2xl border px-4 py-3" placeholder="Téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          <input type="password" className="w-full rounded-2xl border px-4 py-3" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />

          <select className="w-full rounded-2xl border px-4 py-3" value={promotion} onChange={(e) => handlePromotionChange(e.target.value)}>
            <option value="D2">D2</option>
            <option value="D4">D4</option>
          </select>

          <select className="w-full rounded-2xl border px-4 py-3" value={parcours} onChange={(e) => setParcours(e.target.value)}>
            {promotion === "D2" ? (
              <option value="ECOS P">ECOS P</option>
            ) : (
              <>
                <option value="ECOS procéduraux simple">ECOS procéduraux simple</option>
                <option value="Projet ESEE">Projet ESEE</option>
              </>
            )}
          </select>
        </div>

        {message ? <p className="mt-4 text-sm font-medium text-[#5c8945]">{message}</p> : null}

        <button onClick={handleSignup} disabled={loading} className="mt-6 w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-lg font-semibold text-white">
          {loading ? "Envoi..." : "Envoyer ma demande"}
        </button>
      </div>
    </main>
  );
}