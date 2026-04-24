"use client";

import { useEffect, useState } from "react";

type StudentSession = {
  id: string;
  login_id: string;
  prenom: string;
  nom: string;
  email: string;
  promotion?: string;
  parcours?: string;
};

export default function StudentPage() {
  const [student, setStudent] = useState<StudentSession | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("student_session");

    if (!raw) {
      window.location.href = "/login?role=student";
      return;
    }

    setStudent(JSON.parse(raw));
  }, []);

  if (!student) return <p>Chargement...</p>;

  return (
    <main className="min-h-screen bg-[#f5f0e5] px-4 py-8">
      <div className="mx-auto max-w-3xl rounded-[28px] bg-white p-8 shadow">
        <h1 className="text-3xl font-bold text-[#2f2f2f]">
          Bonjour {student.prenom}
        </h1>

        <p className="mt-2 text-[#666]">
          Bienvenue dans ton espace étudiant ECOS Tours.
        </p>

        <div className="mt-6 rounded-2xl bg-[#faf7f0] p-5">
          <p><strong>Identifiant :</strong> {student.login_id}</p>
          <p><strong>Email :</strong> {student.email}</p>
          <p><strong>Promotion :</strong> {student.promotion || "Non renseignée"}</p>
          <p><strong>Parcours :</strong> {student.parcours || "Non renseigné"}</p>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("student_session");
            window.location.href = "/";
          }}
          className="mt-6 rounded-2xl bg-[#cf332b] px-6 py-3 font-semibold text-white"
        >
          Déconnexion
        </button>
      </div>
    </main>
  );
}
