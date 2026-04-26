"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Station = {
  id: string;
  nom: string;
  examiner_login_id: string | null;
  examiner_name: string | null;
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
  examiner_login_id: string | null;
  examiner_name: string | null;
};

type Staff = {
  login_id: string;
  prenom: string;
  nom: string;
  role: string;
};

export default function PlanningPage() {
  const params = useParams();
  const sessionId = params?.sessionId as string;

  const [stations, setStations] = useState<Station[]>([]);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [examiners, setExaminers] = useState<Staff[]>([]);

  const [newStation, setNewStation] = useState("");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (sessionId) fetchAll();
  }, [sessionId]);

  async function fetchAll() {
    const { data: stationData } = await supabase
      .from("ecos_stations")
      .select("*")
      .eq("session_id", sessionId)
      .order("ordre", { ascending: true });

    const { data: timeslotData } = await supabase
      .from("ecos_timeslots")
      .select("*")
      .eq("session_id", sessionId)
      .order("heure_debut", { ascending: true });

    const { data: registrationData } = await supabase
      .from("ecos_session_registrations")
      .select("student_login_id, student_prenom, student_nom")
      .eq("session_id", sessionId);

    const { data: assignmentData } = await supabase
      .from("ecos_assignments")
      .select("*")
      .eq("session_id", sessionId);

    const { data: examinerData } = await supabase
      .from("staff_profiles")
      .select("login_id, prenom, nom, role")
      .eq("role", "examinateur")
      .order("nom", { ascending: true });

    setStations((stationData as Station[]) || []);
    setTimeslots((timeslotData as Timeslot[]) || []);
    setRegistrations((registrationData as Registration[]) || []);
    setAssignments((assignmentData as Assignment[]) || []);
    setExaminers((examinerData as Staff[]) || []);
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
    fetchAll();
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
    fetchAll();
  }

  async function updateExaminer(stationId: string, loginId: string) {
    const examiner = examiners.find((e) => e.login_id === loginId);

    const { error } = await supabase
      .from("ecos_stations")
      .update({
        examiner_login_id: loginId || null,
        examiner_name: examiner ? `${examiner.prenom} ${examiner.nom}` : null,
      })
      .eq("id", stationId);

    if (error) {
      setMessage("Erreur examinateur : " + error.message);
      return;
    }

    setMessage("Examinateur affecté à la station.");
    fetchAll();
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

    await supabase.from("ecos_assignments").delete().eq("session_id", sessionId);

    const newAssignments: {
      session_id: string;
      student_login_id: string;
      station_id: string;
      timeslot_id: string;
      examiner_login_id: string | null;
      examiner_name: string | null;
    }[] = [];

    registrations.forEach((student, studentIndex) => {
      timeslots.forEach((timeslot, timeIndex) => {
        const station = stations[(studentIndex + timeIndex) % stations.length];

        newAssignments.push({
          session_id: sessionId,
          student_login_id: student.student_login_id,
          station_id: station.id,
          timeslot_id: timeslot.id,
          examiner_login_id: station.examiner_login_id || null,
          examiner_name: station.examiner_name || null,
        });
      });
    });

    const { error } = await supabase.from("ecos_assignments").insert(newAssignments);

    if (error) {
      setMessage("Erreur génération planning : " + error.message);
      return;
    }

    setMessage("Planning généré avec succès.");
    fetchAll();
  }

  function getStationName(stationId: string) {
    return stations.find((s) => s.id === stationId)?.nom || "-";
  }

  function getAssignment(studentId: string, timeslotId: string) {
    return assignments.find(
      (a) => a.student_login_id === studentId && a.timeslot_id === timeslotId
    );
  }

  function exportPlanningCSV() {
    if (assignments.length === 0) {
      alert("Aucun planning à exporter.");
      return;
    }

    const headers = ["Etudiant", ...timeslots.map((t) => t.heure_debut)];

    const rows = registrations.map((student) => {
      const name = `${student.student_prenom || ""} ${student.student_nom || ""}`.trim();

      return [
        name || student.student_login_id,
        ...timeslots.map((slot) => {
          const assignment = getAssignment(student.student_login_id, slot.id);
          if (!assignment) return "-";

          const station = getStationName(assignment.station_id);
          const examiner = assignment.examiner_name || "-";

          return `${station} (${examiner})`;
        }),
      ];
    });

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "planning-ecos.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-6 text-[#2f2f2f]">
      <div className="mx-auto max-w-6xl">
        <a href="/admin/sessions" className="text-sm font-semibold text-[#6a8f4f]">
          ← Retour sessions
        </a>

        <h1 className="mt-2 text-3xl font-bold">Planning ECOS</h1>

        {message ? (
          <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold shadow">
            {message}
          </div>
        ) : null}

        <section className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">Résumé</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Stat label="Étudiants" value={registrations.length} />
            <Stat label="Stations" value={stations.length} />
            <Stat label="Créneaux" value={timeslots.length} />
            <Stat label="Examinateurs" value={examiners.length} />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={generatePlanning}
              className="rounded-xl bg-purple-700 px-6 py-3 font-semibold text-white"
            >
              Générer planning
            </button>

            <button
              onClick={exportPlanningCSV}
              className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
            >
              Export planning CSV
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Stations & examinateurs</h2>

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
              Ajouter station
            </button>
          </div>

          {stations.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune station.</p>
          ) : (
            <div className="space-y-3">
              {stations.map((station) => (
                <div
                  key={station.id}
                  className="grid gap-3 rounded-xl border p-3 md:grid-cols-[1fr_1fr]"
                >
                  <div>
                    <p className="font-semibold">{station.nom}</p>
                    <p className="text-xs text-gray-500">
                      Examinateur : {station.examiner_name || "non affecté"}
                    </p>
                  </div>

                  <select
                    value={station.examiner_login_id || ""}
                    onChange={(e) => updateExaminer(station.id, e.target.value)}
                    className="rounded-xl border px-4 py-2"
                  >
                    <option value="">-- choisir un examinateur --</option>
                    {examiners.map((examiner) => (
                      <option key={examiner.login_id} value={examiner.login_id}>
                        {examiner.prenom} {examiner.nom}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
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
              Ajouter créneau
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
          <h2 className="mb-4 text-xl font-bold">Tableau du planning</h2>

          {assignments.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucun planning généré pour le moment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-[#faf7f0]">
                    <th className="border p-2">Étudiant</th>
                    {timeslots.map((t) => (
                      <th key={t.id} className="border p-2">
                        {t.heure_debut}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {registrations.map((student) => (
                    <tr key={student.student_login_id}>
                      <td className="border p-2 font-semibold">
                        {student.student_prenom} {student.student_nom}
                      </td>

                      {timeslots.map((slot) => {
                        const assignment = getAssignment(
                          student.student_login_id,
                          slot.id
                        );

                        return (
                          <td key={slot.id} className="border p-2 text-center">
                            {assignment ? (
                              <>
                                <p className="font-semibold">
                                  {getStationName(assignment.station_id)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {assignment.examiner_name || "-"}
                                </p>
                              </>
                            ) : (
                              "-"
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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