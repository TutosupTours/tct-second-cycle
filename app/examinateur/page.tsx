"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Staff = {
  login_id: string;
  prenom: string;
  nom: string;
  role: string;
};

type Assignment = {
  id: string;
  session_id: string;
  student_login_id: string;
  station_id: string;
  timeslot_id: string;
  examiner_login_id: string | null;
  examiner_name: string | null;
};

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

type Evaluation = {
  score_global: string;
  communication: string;
  raisonnement: string;
  technique: string;
  commentaire: string;
};

export default function ExaminerPage() {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [message, setMessage] = useState("");

  const [evaluation, setEvaluation] = useState<Evaluation>({
    score_global: "",
    communication: "",
    raisonnement: "",
    technique: "",
    commentaire: "",
  });

  useEffect(() => {
    const raw = localStorage.getItem("staff_session");

    if (!raw) {
      window.location.href = "/login?role=examinateur";
      return;
    }

    const parsed = JSON.parse(raw);

    if (parsed.role !== "examinateur") {
      window.location.href = "/";
      return;
    }

    setStaff(parsed);
    loadData(parsed.login_id);
  }, []);

  async function loadData(examinerLoginId: string) {
    const { data: ass } = await supabase
      .from("ecos_assignments")
      .select("*")
      .eq("examiner_login_id", examinerLoginId);

    setAssignments((ass as Assignment[]) || []);

    const sessionIds = Array.from(new Set((ass || []).map((a: any) => a.session_id)));

    if (sessionIds.length === 0) return;

    const { data: st } = await supabase
      .from("ecos_stations")
      .select("*")
      .in("session_id", sessionIds);

    const { data: ts } = await supabase
      .from("ecos_timeslots")
      .select("*")
      .in("session_id", sessionIds);

    const { data: regs } = await supabase
      .from("ecos_session_registrations")
      .select("*")
      .in("session_id", sessionIds);

    setStations((st as Station[]) || []);
    setTimeslots((ts as Timeslot[]) || []);
    setRegistrations((regs as Registration[]) || []);
  }

  function stationName(id: string) {
    return stations.find((s) => s.id === id)?.nom || "Station";
  }

  function timeslotLabel(id: string) {
    const t = timeslots.find((x) => x.id === id);
    return t ? `${t.heure_debut} - ${t.heure_fin}` : "";
  }

  function studentName(loginId: string) {
    const r = registrations.find((x) => x.student_login_id === loginId);
    return r ? `${r.student_prenom || ""} ${r.student_nom || ""}` : loginId;
  }

  async function openEvaluation(a: Assignment) {
    setSelected(a);
    setMessage("");

    const { data } = await supabase
      .from("ecos_evaluations")
      .select("*")
      .eq("session_id", a.session_id)
      .eq("station_id", a.station_id)
      .eq("timeslot_id", a.timeslot_id)
      .eq("student_login_id", a.student_login_id)
      .maybeSingle();

    if (data) {
      setEvaluation({
        score_global: data.score_global?.toString() || "",
        communication: data.communication?.toString() || "",
        raisonnement: data.raisonnement?.toString() || "",
        technique: data.technique?.toString() || "",
        commentaire: data.commentaire || "",
      });
    } else {
      setEvaluation({
        score_global: "",
        communication: "",
        raisonnement: "",
        technique: "",
        commentaire: "",
      });
    }
  }

  async function saveEvaluation() {
    if (!selected || !staff) return;

    const payload = {
      session_id: selected.session_id,
      station_id: selected.station_id,
      timeslot_id: selected.timeslot_id,
      student_login_id: selected.student_login_id,
      examiner_login_id: staff.login_id,
      examiner_name: `${staff.prenom} ${staff.nom}`,
      score_global: evaluation.score_global ? Number(evaluation.score_global) : null,
      communication: evaluation.communication ? Number(evaluation.communication) : null,
      raisonnement: evaluation.raisonnement ? Number(evaluation.raisonnement) : null,
      technique: evaluation.technique ? Number(evaluation.technique) : null,
      commentaire: evaluation.commentaire || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("ecos_evaluations")
      .upsert(payload, {
        onConflict: "session_id,station_id,timeslot_id,student_login_id",
      });

    if (error) {
      setMessage("Erreur sauvegarde : " + error.message);
      return;
    }

    setMessage("Évaluation enregistrée.");
  }

  if (!staff) return null;

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-6 text-[#2f2f2f]">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[28px] bg-white p-6 shadow">
          <h1 className="text-3xl font-bold">Espace examinateur</h1>
          <p className="mt-2 text-sm text-[#666]">
            Bonjour {staff.prenom}, voici tes étudiants à évaluer.
          </p>

          <button
            onClick={() => {
              localStorage.removeItem("staff_session");
              window.location.href = "/";
            }}
            className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-white"
          >
            Déconnexion
          </button>
        </div>

        {message ? (
          <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold shadow">
            {message}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-[28px] bg-white p-6 shadow">
            <h2 className="text-xl font-bold">Mes passages</h2>

            <div className="mt-4 space-y-3">
              {assignments.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aucune affectation pour le moment.
                </p>
              ) : (
                assignments.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => openEvaluation(a)}
                    className="block w-full rounded-2xl border bg-[#faf7f0] p-4 text-left hover:bg-[#edf5e6]"
                  >
                    <p className="font-bold">{studentName(a.student_login_id)}</p>
                    <p className="text-sm text-gray-600">
                      {stationName(a.station_id)} • {timeslotLabel(a.timeslot_id)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-6 shadow">
            <h2 className="text-xl font-bold">Grille d’évaluation</h2>

            {!selected ? (
              <p className="mt-4 text-sm text-gray-500">
                Sélectionne un étudiant à gauche.
              </p>
            ) : (
              <>
                <div className="mt-4 rounded-2xl bg-[#faf7f0] p-4">
                  <p className="font-bold">
                    {studentName(selected.student_login_id)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {stationName(selected.station_id)} •{" "}
                    {timeslotLabel(selected.timeslot_id)}
                  </p>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <ScoreInput
                    label="Score global /20"
                    value={evaluation.score_global}
                    onChange={(v) =>
                      setEvaluation({ ...evaluation, score_global: v })
                    }
                  />

                  <ScoreInput
                    label="Communication /5"
                    value={evaluation.communication}
                    onChange={(v) =>
                      setEvaluation({ ...evaluation, communication: v })
                    }
                  />

                  <ScoreInput
                    label="Raisonnement /5"
                    value={evaluation.raisonnement}
                    onChange={(v) =>
                      setEvaluation({ ...evaluation, raisonnement: v })
                    }
                  />

                  <ScoreInput
                    label="Technique /5"
                    value={evaluation.technique}
                    onChange={(v) =>
                      setEvaluation({ ...evaluation, technique: v })
                    }
                  />
                </div>

                <textarea
                  placeholder="Commentaire"
                  value={evaluation.commentaire}
                  onChange={(e) =>
                    setEvaluation({
                      ...evaluation,
                      commentaire: e.target.value,
                    })
                  }
                  className="mt-4 min-h-[120px] w-full rounded-2xl border bg-[#faf7f0] px-4 py-3"
                />

                <button
                  onClick={saveEvaluation}
                  className="mt-4 rounded-2xl bg-[#6a8f4f] px-6 py-3 font-semibold text-white"
                >
                  Enregistrer l’évaluation
                </button>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        type="number"
        min="0"
        max="20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-2xl border bg-[#faf7f0] px-4 py-3"
      />
    </label>
  );
}
