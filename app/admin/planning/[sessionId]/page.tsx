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

type Registration = {
  student_login_id: string;
  student_prenom: string | null;
  student_nom: string | null;
};

export default function PlanningPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [stations, setStations] = useState<Station[]>([]);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const [newStation, setNewStation] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (sessionId) {
      fetchAll();
    }
  }, [sessionId]);

  async function fetchAll() {
    fetchStations();
    fetchTimeslots();
    fetchRegistrations();
  }

  async function fetchStations() {
    const { data } = await supabase
      .from("ecos_stations")
      .select("*")
      .eq("session_id", sessionId)
      .order("ordre", { ascending: true });

    setStations(data || []);
  }

  async function fetchTimeslots() {
    const { data } = await supabase
      .from("ecos_timeslots")
      .select("*")
      .eq("session_id", sessionId)
      .order("heure_debut", { ascending: true });

    setTimeslots(data || []);
  }

  async function fetchRegistrations() {
    const { data } = await supabase
      .from("ecos_session_registrations")
      .select("student_login_id, student_prenom, student_nom")
      .eq("session_id", sessionId);

    setRegistrations(data || []);
  }

  async function addStation() {
    if (!newStation.trim()) return;

    const { error } = await supabase.from("ecos_stations").insert({
      session_id: sessionId,
      nom: newStation.trim(),
      ordre: stations.length + 1,
    });

    if (error) {
      setMessage("Erreur station : " + error.message);
      return;
    }

    setNewStation("");
    setMessage("Station ajoutée.");
    fetchStations();
  }

  async function addTimeslot() {
    if (!heureDebut || !heureFin) return;

    const { error } = await supabase.from("ecos_timeslots").insert({
      session_id: sessionId,
      heure_debut: heureDebut,
      heure_fin: heureFin,
    });

    if (error) {
      setMessage("Erreur créneau : " + error.message);
      return;
    }

    setHeureDebut("");
    setHeureFin("");
    setMessage("Créneau ajouté.");
    fetchTimeslots();
  }

  async function generatePlanning() {
    setMessage("");

    if (registrations.length === 0) {
      setMessage("Aucun étudiant inscrit.");
      return;
    }

    if (stations.length === 0) {
      setMessage("Ajoute au moins une station.");
      return;
    }

    if (timeslots.length === 0) {
      setMessage("Ajoute au moins un créneau.");
      return;
    }

    await supabase
      .from("ecos_assignments")
      .delete()
      .eq("session_id", sessionId);

    const assignments: {
      session_id: string;
      student_login_id: string;
      station_id: string;
      timeslot_id: string;
    }[] = [];

    registrations.forEach((student, studentIndex) => {
      timeslots.forEach((timeslot, timeIndex) => {
        const station = stations[(studentIndex + timeIndex) % stations.length];

        assignments.push({
          session_id: sessionId,
          student_login_id: student.student_login_id,
          station_id: station.id,
          timeslot_id: timeslot.id,
        });
      });
    });

    const { error } = await supabase.from("ecos_assignments").insert(assignments);

    if (error) {
      setMessage("Erreur génération planning : " + error.message);
      return;
    }

    setMessage("Planning généré avec succès.");
  }

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-6 text-[#2f2f2f]">
      <div className="mx-auto max-w-5xl">
        <a href="/admin/sessions" className="text-sm font-semibold text-[#6a8f4f]">
          ← Retour sessions
        </a>

        <h1 className="mt-2 text-3xl font-bold">Planning ECOS</h1>

        {message ? (
          <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold shadow">
            {message}
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">Résumé</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Stat label="Étudiants inscrits" value={registrations.length} />
            <Stat label="Stations" value={stations.length} />
            <Stat label="Créneaux" value={timeslots.length} />
          </div>

          <button
            onClick={generatePlanning}
            className="mt-5 rounded-xl bg-purple-700 px-6 py-3 font-semibold text-white"
          >
            Générer planning
          </button>
        </div>

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

        <section className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Étudiants inscrits</h2>

          {registrations.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun étudiant inscrit.</p>
          ) : (
            registrations.map((r) => (
              <div key={r.student_login_id} className="mb-2 rounded-xl border p-3">
                {r.student_prenom || ""} {r.student_nom || ""} —{" "}
                <span className="text-gray-500">{r.student_login_id}</span>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[#faf7f0] p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}