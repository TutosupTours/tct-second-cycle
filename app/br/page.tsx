"use client";

import { useEffect, useState } from "react";

type Staff = {
  login_id: string;
  prenom: string;
  nom: string;
  role: string;
  fonction?: string;
};

export default function BRPage() {
  const [staff, setStaff] = useState<Staff | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("staff_session");

    if (!raw) {
      window.location.href = "/login?role=br";
      return;
    }

    const parsed = JSON.parse(raw);

    if (parsed.role !== "br") {
      window.location.href = "/";
      return;
    }

    setStaff(parsed);
  }, []);

  if (!staff) return null;

  return (
    <main className="min-h-screen bg-[#f5f0e5] px-4 py-8">
      <div className="mx-auto max-w-4xl rounded-[28px] bg-white p-8 shadow">
        
        <h1 className="text-3xl font-bold text-[#2f2f2f]">
          Interface BR
        </h1>

        <p className="mt-2 text-[#666]">
          Bienvenue {staff.prenom} ({staff.fonction || "BR"})
        </p>

        <div className="mt-6 rounded-2xl bg-[#faf7f0] p-5">
          <p><strong>Identifiant :</strong> {staff.login_id}</p>
          <p><strong>Nom :</strong> {staff.prenom} {staff.nom}</p>
          <p><strong>Rôle :</strong> {staff.role}</p>
        </div>

        <div className="mt-8 space-y-3">
          <button className="w-full rounded-xl bg-[#7c9c56] px-6 py-3 text-white">
            Voir les demandes d’inscription
          </button>

          <button className="w-full rounded-xl bg-[#efc24d] px-6 py-3 text-white">
            Valider paiements
          </button>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("staff_session");
            window.location.href = "/";
          }}
          className="mt-8 rounded-2xl bg-[#cf332b] px-6 py-3 font-semibold text-white"
        >
          Déconnexion
        </button>
      </div>
    </main>
  );
}