"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Station = {
  id: string;
  nom: string;
};

type Timeslot = {
  id: string;
  heure_debut: string;
  heure_fin: string;
};

export default function PlanningPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [stations, setStations] = useState<Station[]>([]);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [newStation, setNewStation] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");

  useEffect(() => {
    if (sessionId) {
      fetchStations();
      fetchTimeslots();
    }
  }, [sessionId]);

  async function fetchStations() {
    const { data } = await supabase
      .from("ecos_stations")
      .select("*")
      .eq("session_id", sessionId);

    setStations(data || []);
  }

  async function fetchTimeslots() {
    const { data } = await supabase
      .from("ecos_timeslots")
      .select("*")
      .eq("session_id", sessionId);

    setTimeslots(data || []);
  }

  async function addStation() {
    if (!newStation.trim()) return;

    await supabase.from("ecos_stations").insert({
      session_id: sessionId,
      nom: newStation.trim(),
    });

    setNewStation("");
    fetchStations();
  }

  async function addTimeslot() {
    if (!heureDebut || !heureFin) return;

    await supabase.from("ecos_timeslots").insert({
      session_id: sessionId,
      heure_debut: heureDebut,
      heure_fin: heureFin,
    });

    setHeureDebut("");
    setHeureFin("");
    fetchTimeslots();
  }

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-6 text-[#2f2f2f]">
      <div className="mx-auto max-w-5xl">
        <a href="/admin/sessions" className="text-sm font-semibold text-[#6a8f4f]">
          ← Retour sessions
        </a>

        <h1 className="mt-2 text-3xl font-bold">Planning ECOS</h1>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Stations</h2>

          <div className="mb-4 flex flex-wrap gap-2">
            <input
              placeholder="Nom station"
              value={newStation}
              onChange={(e) => setNewStation(e.target.value)}
              className="rounded-xl border px-4 py-2"
            />
            <button
              onClick={addStation}
              className="rounded-xl bg-green-600 px-4 py-2 text-white"
            >
              Ajouter
            </button>
          </div>

          {stations.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune station.</p>
          ) : (
            stations.map((s) => (
              <div key={s.id} className="mb-2 rounded-xl border p-3">
                {s.nom}
              </div>
            ))
          )}
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Créneaux</h2>

          <div className="mb-4 flex flex-wrap gap-2">
            <input
              type="time"
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              className="rounded-xl border px-4 py-2"
            />

            <input
              type="time"
              value={heureFin}
              onChange={(e) => setHeureFin(e.target.value)}
              className="rounded-xl border px-4 py-2"
            />

            <button
              onClick={addTimeslot}
              className="rounded-xl bg-green-600 px-4 py-2 text-white"
            >
              Ajouter
            </button>
          </div>

          {timeslots.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun créneau.</p>
          ) : (
            timeslots.map((t) => (
              <div key={t.id} className="mb-2 rounded-xl border p-3">
                {t.heure_debut} → {t.heure_fin}
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
