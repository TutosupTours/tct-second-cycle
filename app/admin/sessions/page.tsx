"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Session = {
  id: string;
  titre: string;
  promotion: string;
  date_session: string;
  lieu: string | null;
  statut: string;
};

type Registration = {
  session_id: string;
  student_login_id: string;
  student_prenom: string;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
    fetchRegistrations();
  }, []);

  async function fetchSessions() {
    const { data } = await supabase
      .from("ecos_sessions")
      .select("*")
      .order("date_session");

    setSessions(data || []);
  }

  async function fetchRegistrations() {
    const { data } = await supabase
      .from("ecos_session_registrations")
      .select("*");

    setRegistrations(data || []);
  }

  function getCount(sessionId: string) {
    return registrations.filter((r) => r.session_id === sessionId).length;
  }

  function getStudents(sessionId: string) {
    return registrations.filter((r) => r.session_id === sessionId);
  }

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">Sessions ECOS</h1>

        {/* LISTE */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="space-y-4">
            {sessions.map((s) => (
              <div key={s.id} className="border p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{s.titre}</p>
                    <p className="text-sm text-gray-600">
                      {s.promotion} • {s.date_session} • {s.lieu}
                    </p>
                    <p className="text-xs">
                      {getCount(s.id)} inscrit(s)
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedSession(
                        selectedSession === s.id ? null : s.id
                      )
                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl"
                  >
                    Voir inscrits
                  </button>
                </div>

                {/* LISTE ETUDIANTS */}
                {selectedSession === s.id && (
                  <div className="mt-4 bg-[#faf7f0] p-4 rounded-xl">
                    {getStudents(s.id).length === 0 ? (
                      <p className="text-sm text-gray-500">
                        Aucun inscrit
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {getStudents(s.id).map((r, i) => (
                          <div
                            key={i}
                            className="flex justify-between text-sm"
                          >
                            <span>{r.student_prenom}</span>
                            <span className="text-gray-500">
                              {r.student_login_id}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}