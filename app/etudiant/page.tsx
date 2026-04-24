"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Student = {
  prenom: string;
  login_id: string;
};

type Session = {
  id: string;
  titre: string;
  date_session: string;
  lieu: string | null;
  statut: string;
  capacite: number | null;
};

type Registration = {
  session_id: string;
  student_login_id: string;
};

export default function StudentPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<string[]>([]);
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("student_session");

    if (!raw) {
      window.location.href = "/login?role=student";
      return;
    }

    const parsed = JSON.parse(raw);
    setStudent(parsed);

    fetchSessions();
    fetchRegistrations(parsed.login_id);
  }, []);

  async function fetchSessions() {
    const { data, error } = await supabase
      .from("ecos_sessions")
      .select("*")
      .eq("statut", "published")
      .order("date_session");

    if (error) {
      setMessage("Erreur chargement sessions : " + error.message);
      return;
    }

    setSessions((data as Session[]) || []);
  }

  async function fetchRegistrations(loginId: string) {
    const { data, error } = await supabase
      .from("ecos_session_registrations")
      .select("session_id, student_login_id");

    if (error) {
      setMessage("Erreur chargement inscriptions : " + error.message);
      return;
    }

    const rows = (data as Registration[]) || [];
    setAllRegistrations(rows);
    setMyRegistrations(
      rows.filter((r) => r.student_login_id === loginId).map((r) => r.session_id)
    );
  }

  async function register(sessionId: string) {
    if (!student) return;

    setMessage("");

    const session = sessions.find((s) => s.id === sessionId);
    const count = allRegistrations.filter((r) => r.session_id === sessionId).length;
    const capacite = session?.capacite || 0;

    if (capacite > 0 && count >= capacite) {
      setMessage("Cette session est complète.");
      return;
    }

    const { error } = await supabase.from("ecos_session_registrations").insert({
      session_id: sessionId,
      student_login_id: student.login_id,
      student_prenom: student.prenom,
    });

    if (error) {
      setMessage("Erreur inscription : " + error.message);
      return;
    }

    setMessage("Inscription confirmée.");
    fetchRegistrations(student.login_id);
  }

  async function unregister(sessionId: string) {
    if (!student) return;

    setMessage("");

    const { error } = await supabase
      .from("ecos_session_registrations")
      .delete()
      .eq("session_id", sessionId)
      .eq("student_login_id", student.login_id);

    if (error) {
      setMessage("Erreur désinscription : " + error.message);
      return;
    }

    setMessage("Désinscription confirmée.");
    fetchRegistrations(student.login_id);
  }

  if (!student) return null;

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-6 text-[#2f2f2f]">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[28px] bg-white p-6 shadow">
          <h1 className="text-3xl font-bold">Bonjour {student.prenom}</h1>
          <p className="mt-2 text-sm text-[#666]">
            Bienvenue dans ton espace étudiant ECOS Tours.
          </p>
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold shadow">
            {message}
          </div>
        ) : null}

        <section className="mt-6 rounded-[28px] bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Sessions disponibles</h2>

          <div className="mt-4 space-y-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-[#666]">Aucune session disponible.</p>
            ) : (
              sessions.map((s) => {
                const isRegistered = myRegistrations.includes(s.id);
                const count = allRegistrations.filter(
                  (r) => r.session_id === s.id
                ).length;
                const capacite = s.capacite || 0;
                const isFull = capacite > 0 && count >= capacite;

                return (
                  <div
                    key={s.id}
                    className="flex flex-col justify-between gap-3 rounded-2xl border border-[#eadfd2] bg-[#faf7f0] p-4 md:flex-row md:items-center"
                  >
                    <div>
                      <p className="font-bold">{s.titre}</p>
                      <p className="text-sm text-gray-600">
                        {s.date_session} • {s.lieu || "Lieu non renseigné"}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#6f6a63]">
                        {capacite > 0
                          ? `${count}/${capacite} inscrits`
                          : `${count} inscrit(s)`}
                      </p>
                    </div>

                    {isRegistered ? (
                      <button
                        onClick={() => unregister(s.id)}
                        className="rounded-xl bg-red-500 px-4 py-2 text-white"
                      >
                        Se désinscrire
                      </button>
                    ) : isFull ? (
                      <button
                        disabled
                        className="rounded-xl bg-gray-400 px-4 py-2 text-white"
                      >
                        Complet
                      </button>
                    ) : (
                      <button
                        onClick={() => register(s.id)}
                        className="rounded-xl bg-green-600 px-4 py-2 text-white"
                      >
                        S’inscrire
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        <button
          onClick={() => {
            localStorage.removeItem("student_session");
            window.location.href = "/";
          }}
          className="mt-6 rounded-xl bg-red-500 px-6 py-3 text-white"
        >
          Déconnexion
        </button>
      </div>
    </main>
  );
}