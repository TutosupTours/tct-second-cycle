"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Session = {
  id: string;
  titre: string;
  promotion: string;
  date_session: string;
  lieu: string | null;
  capacite: number | null;
  statut: string;
};

type Registration = {
  session_id: string;
  student_login_id: string;
  student_prenom: string | null;
  student_nom: string | null;
  student_email: string | null;
  student_phone: string | null;
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

    setSessions((data as Session[]) || []);
  }

  async function fetchRegistrations() {
    const { data } = await supabase
      .from("ecos_session_registrations")
      .select("*");

    setRegistrations((data as Registration[]) || []);
  }

  function getStudents(sessionId: string) {
    return registrations.filter((r) => r.session_id === sessionId);
  }

  function exportCSV(sessionId: string, titre: string) {
    const students = getStudents(sessionId);

    if (students.length === 0) {
      alert("Aucun inscrit à exporter.");
      return;
    }

    const headers = ["Prenom", "Nom", "Identifiant", "Email", "Telephone"];
    const rows = students.map((s) => [
      s.student_prenom || "",
      s.student_nom || "",
      s.student_login_id || "",
      s.student_email || "",
      s.student_phone || "",
    ]);

    const csv =
      [headers, ...rows]
        .map((row) =>
          row
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(",")
        )
        .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `inscrits-${titre}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-6 text-[#2f2f2f]">
      <div className="mx-auto max-w-5xl">
        <a href="/admin" className="text-sm font-semibold text-[#6a8f4f]">
          ← Retour admin
        </a>

        <h1 className="mt-2 text-3xl font-bold">Sessions ECOS</h1>

        <div className="mt-6 rounded-[28px] bg-white p-6 shadow">
          <div className="space-y-4">
            {sessions.map((s) => {
              const students = getStudents(s.id);
              const count = students.length;
              const capacite = s.capacite || 0;

              return (
                <div key={s.id} className="rounded-2xl border p-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <p className="font-bold">{s.titre}</p>
                      <p className="text-sm text-gray-600">
                        {s.promotion} • {s.date_session} •{" "}
                        {s.lieu || "Lieu non renseigné"}
                      </p>
                      <p className="text-xs font-semibold text-[#6f6a63]">
                        {capacite > 0
                          ? `${count}/${capacite} inscrit(s)`
                          : `${count} inscrit(s)`}
                      </p>
                      <p className="text-xs text-[#6f6a63]">
                        Statut : {s.statut}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          setSelectedSession(
                            selectedSession === s.id ? null : s.id
                          )
                        }
                        className="rounded-xl bg-blue-500 px-4 py-2 text-white"
                      >
                        Voir inscrits
                      </button>

                      <button
                        onClick={() => exportCSV(s.id, s.titre)}
                        className="rounded-xl bg-green-600 px-4 py-2 text-white"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>

                  {selectedSession === s.id ? (
                    <div className="mt-4 rounded-xl bg-[#faf7f0] p-4">
                      {students.length === 0 ? (
                        <p className="text-sm text-gray-500">Aucun inscrit</p>
                      ) : (
                        <div className="space-y-2">
                          {students.map((r, i) => (
                            <div
                              key={i}
                              className="grid gap-2 rounded-xl bg-white p-3 text-sm md:grid-cols-4"
                            >
                              <span>
                                {r.student_prenom || ""} {r.student_nom || ""}
                              </span>
                              <span className="text-gray-500">
                                {r.student_login_id}
                              </span>
                              <span className="text-gray-500">
                                {r.student_email || "-"}
                              </span>
                              <span className="text-gray-500">
                                {r.student_phone || "-"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}