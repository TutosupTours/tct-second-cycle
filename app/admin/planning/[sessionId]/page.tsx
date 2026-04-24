"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Station = {
  id: string;
  nom: string;
  examiner_name: string | null;
};

type Timeslot = {
  id: string;
  heure_debut: string;
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
  examiner_name: string | null;
};

export default function PlanningPage() {
  const { sessionId } = useParams();

  const [stations, setStations] = useState<Station[]>([]);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [students, setStudents] = useState<Registration[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [newStation, setNewStation] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const { data: s } = await supabase.from("ecos_stations").select("*").eq("session_id", sessionId);
    const { data: t } = await supabase.from("ecos_timeslots").select("*").eq("session_id", sessionId);
    const { data: r } = await supabase.from("ecos_session_registrations").select("*").eq("session_id", sessionId);
    const { data: a } = await supabase.from("ecos_assignments").select("*").eq("session_id", sessionId);

    setStations(s || []);
    setTimeslots(t || []);
    setStudents(r || []);
    setAssignments(a || []);
  }

  async function addStation() {
    if (!newStation) return;

    await supabase.from("ecos_stations").insert({
      session_id: sessionId,
      nom: newStation,
    });

    setNewStation("");
    fetchAll();
  }

  async function updateExaminer(stationId: string, name: string) {
    await supabase
      .from("ecos_stations")
      .update({ examiner_name: name })
      .eq("id", stationId);

    fetchAll();
  }

  async function generatePlanning() {
    if (!students.length || !stations.length || !timeslots.length) {
      setMessage("Données manquantes");
      return;
    }

    await supabase.from("ecos_assignments").delete().eq("session_id", sessionId);

    const data: any[] = [];

    students.forEach((student, i) => {
      timeslots.forEach((slot, t) => {
        const station = stations[(i + t) % stations.length];

        data.push({
          session_id: sessionId,
          student_login_id: student.student_login_id,
          station_id: station.id,
          timeslot_id: slot.id,
          examiner_name: station.examiner_name || null,
        });
      });
    });

    await supabase.from("ecos_assignments").insert(data);

    setMessage("Planning généré !");
    fetchAll();
  }

  function getStationName(id: string) {
    return stations.find((s) => s.id === id)?.nom || "";
  }

  function getExaminer(id: string) {
    return stations.find((s) => s.id === id)?.examiner_name || "-";
  }

  function getCell(studentId: string, timeslotId: string) {
    const a = assignments.find(
      (x) => x.student_login_id === studentId && x.timeslot_id === timeslotId
    );
    return a ? getStationName(a.station_id) : "-";
  }

  function exportCSV() {
    let csv = "Etudiant,";

    timeslots.forEach((t) => (csv += t.heure_debut + ","));
    csv += "\n";

    students.forEach((s) => {
      csv += `${s.student_prenom} ${s.student_nom},`;

      timeslots.forEach((t) => {
        csv += getCell(s.student_login_id, t.id) + ",";
      });

      csv += "\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "planning.csv";
    a.click();
  }

  return (
    <main className="p-6 bg-[#f5f0e5] min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Planning ECOS</h1>

      {message && <p className="mb-4 text-green-600">{message}</p>}

      <div className="mb-6 flex gap-2">
        <input
          value={newStation}
          onChange={(e) => setNewStation(e.target.value)}
          placeholder="Nouvelle station"
          className="border p-2 rounded"
        />
        <button onClick={addStation} className="bg-green-600 text-white px-4 rounded">
          Ajouter
        </button>
      </div>

      <div className="mb-6 space-y-2">
        {stations.map((s) => (
          <div key={s.id} className="flex gap-2 items-center">
            <span className="w-40">{s.nom}</span>
            <input
              value={s.examiner_name || ""}
              onChange={(e) => updateExaminer(s.id, e.target.value)}
              placeholder="Examinateur"
              className="border p-2 rounded"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-6">
        <button onClick={generatePlanning} className="bg-purple-700 text-white px-6 py-3 rounded">
          Générer planning
        </button>

        <button onClick={exportCSV} className="bg-blue-600 text-white px-6 py-3 rounded">
          Export CSV
        </button>
      </div>

      <div className="overflow-auto bg-white p-4 rounded shadow">
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">Étudiant</th>
              {timeslots.map((t) => (
                <th key={t.id} className="border p-2">
                  {t.heure_debut}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <tr key={s.student_login_id}>
                <td className="border p-2">
                  {s.student_prenom} {s.student_nom}
                </td>

                {timeslots.map((t) => (
                  <td key={t.id} className="border p-2 text-center">
                    {getCell(s.student_login_id, t.id)}
                    <br />
                    <span className="text-xs text-gray-500">
                      {getExaminer(
                        assignments.find(
                          (a) =>
                            a.student_login_id === s.student_login_id &&
                            a.timeslot_id === t.id
                        )?.station_id || ""
                      )}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}