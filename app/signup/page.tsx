"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [promotion, setPromotion] = useState("D2");
  const [parcours, setParcours] = useState("ECOS P");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handlePromotionChange(value: string) {
    setPromotion(value);

    if (value === "D2") {
      setParcours("ECOS P");
    } else {
      setParcours("ECOS procéduraux simple");
    }
  }

  async function handleSignup() {
    setLoading(true);
    setMessage("");

    const cleanPrenom = prenom.trim();
    const cleanNom = nom.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanTelephone = telephone.trim();

    if (!cleanPrenom || !cleanNom || !cleanEmail) {
      setMessage("Merci de remplir prénom, nom et email.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("inscription_requests").insert({
      prenom: cleanPrenom,
      nom: cleanNom,
      email: cleanEmail,
      telephone: cleanTelephone || null,
      ville: "Tours",
      promotion,
      parcours,
      statut: "pending_review",
      paiement_verifie: false,
    });

    if (error) {
      setMessage(error.message || "Erreur lors de l’envoi de la demande.");
      setLoading(false);
      return;
    }

    setMessage(
      "Demande envoyée avec succès. Le BR vérifiera ton inscription et ton paiement."
    );
    setPrenom("");
    setNom("");
    setEmail("");
    setTelephone("");
    setPromotion("D2");
    setParcours("ECOS P");
    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f0e5] px-4">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
        <h1 className="text-3xl font-bold text-[#2f2f2f]">
          Demande d’inscription
        </h1>

        <p className="mt-2 text-sm text-[#666]">
          Remplis ce formulaire. Le BR validera ton inscription après
          vérification du paiement.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Prénom"
            className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />

          <input
            type="text"
            placeholder="Nom"
            className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="tel"
            placeholder="Téléphone"
            className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />

          <select
            className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            value={promotion}
            onChange={(e) => handlePromotionChange(e.target.value)}
          >
            <option value="D2">D2</option>
            <option value="D4">D4</option>
          </select>

          <select
            className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            value={parcours}
            onChange={(e) => setParcours(e.target.value)}
          >
            {promotion === "D2" ? (
              <option value="ECOS P">ECOS P</option>
            ) : (
              <>
                <option value="ECOS procéduraux simple">
                  ECOS procéduraux simple
                </option>
                <option value="Projet ESEE">Projet ESEE</option>
              </>
            )}
          </select>
        </div>

        {message ? (
          <p className="mt-4 text-sm font-medium text-[#5c8945]">{message}</p>
        ) : null}

        <button
          type="button"
          onClick={handleSignup}
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-lg font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
        >
          {loading ? "Envoi..." : "Envoyer ma demande"}
        </button>
      </div>
    </main>
  );
}