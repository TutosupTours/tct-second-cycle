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

type Assignment = {
  student_login_id: string;
  station_id: string;
  timeslot_id: string;
};

export default function PlanningPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [stations, setStations] = useState<Station[]>([]);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [newStation, setNewStation] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (sessionId) fetchAll();
  }, [sessionId]);

  async function fetchAll() {
    fetchStations();
    fetchTimeslots();
    fetchRegistrations();
    fetchAssignments();
  }

  async function fetchStations() {
    const { data } = await supabase
      .from("ecos_stations")
      .select("*")
      .eq("session_id", sessionId)
      .order("ordre");

    setStations(data || []);
  }

  async function fetchTimeslots() {
    const { data } = await supabase
      .from("ecos_timeslots")
      .select("*")
      .eq("session_id", sessionId)
      .order("heure_debut");

    setTimeslots(data || []);
  }

  async function fetchRegistrations() {
    const { data } = await supabase
      .from("ecos_session_registrations")
      .select("student_login_id, student_prenom, student_nom")
      .eq("session_id", sessionId);

    setRegistrations(data || []);
  }

  async function fetchAssignments() {
    const { data } = await supabase
      .from("ecos_assignments")
      .select("*")
      .eq("session_id", sessionId);

    setAssignments(data || []);
  }

  async function addStation() {
    if (!newStation.trim()) return;

    await supabase.from("ecos_stations").insert({
      session_id: sessionId,
      nom: newStation,
      ordre: stations.length + 1,
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

  async function generatePlanning() {
    if (!registrations.length || !stations.length || !timeslots.length) {
      setMessage("Données insuffisantes.");
      return;
    }

    await supabase
      .from("ecos_assignments")
      .delete()
      .eq("session_id", sessionId);

    const newAssignments: any[] = [];

    registrations.forEach((student, i) => {
      timeslots.forEach((slot, t) => {
        const station = stations[(i + t) % stations.length];

        newAssignments.push({
          session_id: sessionId,
          student_login_id: student.student_login_id,
          station_id: station.id,
          timeslot_id: slot.id,
        });
      });
    });

    await supabase.from("ecos_assignments").insert(newAssignments);

    setMessage("Planning généré !");
    fetchAssignments();
  }

  function getStationName(stationId: string) {
    return stations.find((s) => s.id === stationId)?.nom || "";
  }

  function getAssignment(studentId: string, timeslotId: string) {
    const a = assignments.find(
      (x) =>
        x.student_login_id === studentId &&
        x.timeslot_id === timeslotId
    );

    return a ? getStationName(a.station_id) : "-";
  }

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-4">Planning ECOS</h1>

        {message && <p className="mb-4 text-green-600">{message}</p>}

        <button
          onClick={generatePlanning}
          className="bg-purple-700 text-white px-6 py-3 rounded-xl mb-6"
        >
          Générer planning
        </button>

        {/* TABLEAU PLANNING */}
        <div className="bg-white p-6 rounded-2xl shadow overflow-x-auto">
          <table className="w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Étudiant</th>
                {timeslots.map((t) => (
                  <th key={t.id} className="p-2 border">
                    {t.heure_debut}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {registrations.map((r) => (
                <tr key={r.student_login_id}>
                  <td className="p-2 border font-semibold">
                    {r.student_prenom} {r.student_nom}
                  </td>

                  {timeslots.map((t) => (
                    <td key={t.id} className="p-2 border text-center">
                      {getAssignment(r.student_login_id, t.id)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}