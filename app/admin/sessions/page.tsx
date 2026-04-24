"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Session = {
  id: string;
  titre: string;
  promotion: string;
  date_session: string;
  lieu: string;
  statut: string;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    titre: "",
    promotion: "D2",
    date_session: "",
    heure_debut: "",
    heure_fin: "",
    lieu: "",
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    const { data } = await supabase
      .from("ecos_sessions")
      .select("*")
      .order("date_session", { ascending: true });

    setSessions(data || []);
  }

  async function createSession() {
    setLoading(true);

    const { error } = await supabase.from("ecos_sessions").insert({
      ...form,
      statut: "draft",
    });

    if (error) {
      alert("Erreur création session");
      setLoading(false);
      return;
    }

    setForm({
      titre: "",
      promotion: "D2",
      date_session: "",
      heure_debut: "",
      heure_fin: "",
      lieu: "",
    });

    await fetchSessions();
    setLoading(false);
  }

  async function publishSession(id: string) {
    await supabase
      .from("ecos_sessions")
      .update({ statut: "published" })
      .eq("id", id);

    fetchSessions();
  }

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">Sessions ECOS</h1>

        {/* FORMULAIRE */}
        <div className="bg-white p-6 rounded-2xl shadow mb-8">
          <h2 className="font-semibold mb-4">Créer une session</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Titre"
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              className="border p-3 rounded-xl"
            />

            <select
              value={form.promotion}
              onChange={(e) => setForm({ ...form, promotion: e.target.value })}
              className="border p-3 rounded-xl"
            >
              <option>D2</option>
              <option>D4</option>
            </select>

            <input
              type="date"
              value={form.date_session}
              onChange={(e) => setForm({ ...form, date_session: e.target.value })}
              className="border p-3 rounded-xl"
            />

            <input
              type="text"
              placeholder="Lieu"
              value={form.lieu}
              onChange={(e) => setForm({ ...form, lieu: e.target.value })}
              className="border p-3 rounded-xl"
            />

            <input
              type="time"
              value={form.heure_debut}
              onChange={(e) => setForm({ ...form, heure_debut: e.target.value })}
              className="border p-3 rounded-xl"
            />

            <input
              type="time"
              value={form.heure_fin}
              onChange={(e) => setForm({ ...form, heure_fin: e.target.value })}
              className="border p-3 rounded-xl"
            />
          </div>

          <button
            onClick={createSession}
            disabled={loading}
            className="mt-4 bg-green-600 text-white px-6 py-3 rounded-xl"
          >
            {loading ? "Création..." : "Créer"}
          </button>
        </div>

        {/* LISTE */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="font-semibold mb-4">Sessions existantes</h2>

          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center border p-4 rounded-xl"
              >
                <div>
                  <p className="font-bold">{s.titre}</p>
                  <p className="text-sm text-gray-600">
                    {s.promotion} • {s.date_session} • {s.lieu}
                  </p>
                  <p className="text-xs">
                    Statut : {s.statut}
                  </p>
                </div>

                {s.statut === "draft" && (
                  <button
                    onClick={() => publishSession(s.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl"
                  >
                    Publier
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
