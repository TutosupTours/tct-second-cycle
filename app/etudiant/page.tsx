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
  lieu: string;
  statut: string;
};

export default function StudentPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [registrations, setRegistrations] = useState<string[]>([]);

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
    const { data } = await supabase
      .from("ecos_sessions")
      .select("*")
      .eq("statut", "published")
      .order("date_session");

    setSessions(data || []);
  }

  async function fetchRegistrations(login_id: string) {
    const { data } = await supabase
      .from("ecos_session_registrations")
      .select("session_id")
      .eq("student_login_id", login_id);

    setRegistrations(data?.map((r) => r.session_id) || []);
  }

  async function register(session_id: string) {
    if (!student) return;

    await supabase.from("ecos_session_registrations").insert({
      session_id,
      student_login_id: student.login_id,
      student_prenom: student.prenom,
    });

    fetchRegistrations(student.login_id);
  }

  async function unregister(session_id: string) {
    if (!student) return;

    await supabase
      .from("ecos_session_registrations")
      .delete()
      .eq("session_id", session_id)
      .eq("student_login_id", student.login_id);

    fetchRegistrations(student.login_id);
  }

  if (!student) return null;

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold">
          Bonjour {student.prenom}
        </h1>

        <h2 className="mt-6 text-xl font-semibold">
          Sessions disponibles
        </h2>

        <div className="mt-4 space-y-3">
          {sessions.map((s) => {
            const isRegistered = registrations.includes(s.id);

            return (
              <div
                key={s.id}
                className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-bold">{s.titre}</p>
                  <p className="text-sm text-gray-600">
                    {s.date_session} • {s.lieu}
                  </p>
                </div>

                {isRegistered ? (
                  <button
                    onClick={() => unregister(s.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl"
                  >
                    Se désinscrire
                  </button>
                ) : (
                  <button
                    onClick={() => register(s.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl"
                  >
                    S’inscrire
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("student_session");
            window.location.href = "/";
          }}
          className="mt-6 bg-red-500 text-white px-6 py-3 rounded-xl"
        >
          Déconnexion
        </button>

      </div>
    </main>
  );
}