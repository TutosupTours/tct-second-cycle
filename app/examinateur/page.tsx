"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { ClipboardList, LogOut, Send } from "lucide-react";

type Assignment = {
  id: string;
  session_id: string;
  room_id: string | null;
};

type SessionItem = {
  id: string;
  title: string;
  starts_at: string;
  location: string;
};

type RoomItem = {
  id: string;
  name: string;
};

type StudentItem = {
  id: string;
  full_name: string;
  email: string;
};

type FormItem = {
  id: string;
  title: string;
  description: string | null;
};

type FormCriterion = {
  id: string;
  form_id: string;
  label: string;
  item_type: "checkbox" | "score" | "text";
  max_score: number | null;
  sort_order: number;
};

type RotationItem = {
  id: string;
  student_profile_id: string;
};

export default function ExaminateurPage() {
  const { user, profile, loading } = useUser();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [currentForm, setCurrentForm] = useState<FormItem | null>(null);
  const [formCriteria, setFormCriteria] = useState<FormCriterion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [globalComment, setGlobalComment] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login?role=examinateur";
      return;
    }

    if (!loading && user && profile?.role !== "examiner") {
      window.location.href = "/";
      return;
    }

    if (user && profile?.role === "examiner") {
      loadBaseData();
    }
  }, [user, profile, loading]);

  async function loadBaseData() {
    const [assignmentsRes, sessionsRes, roomsRes] = await Promise.all([
      supabase
        .from("examiner_assignments")
        .select("*")
        .eq("examiner_profile_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("sessions").select("id, title, starts_at, location"),
      supabase.from("session_rooms").select("id, name"),
    ]);

    if (!assignmentsRes.error) setAssignments((assignmentsRes.data as Assignment[]) || []);
    if (!sessionsRes.error) setSessions((sessionsRes.data as SessionItem[]) || []);
    if (!roomsRes.error) setRooms((roomsRes.data as RoomItem[]) || []);
  }

  async function loadAssignmentContext(assignmentId: string) {
    setMessage("");
    setSelectedStudentId("");
    setCurrentForm(null);
    setFormCriteria([]);
    setAnswers({});
    setGlobalComment("");

    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment || !assignment.room_id) return;

    const [rotationRes, roomFormRes] = await Promise.all([
      supabase
        .from("room_rotations")
        .select("*")
        .eq("session_id", assignment.session_id)
        .eq("room_id", assignment.room_id)
        .order("scheduled_at", { ascending: true }),
      supabase
        .from("room_form_assignments")
        .select("*")
        .eq("session_id", assignment.session_id)
        .eq("room_id", assignment.room_id)
        .limit(1)
        .maybeSingle(),
    ]);

    if (!rotationRes.error) {
      const rotations = (rotationRes.data as RotationItem[]) || [];
      const ids = rotations.map((r) => r.student_profile_id);

      if (ids.length > 0) {
        const { data: studentData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", ids)
          .order("full_name", { ascending: true });

        setStudents((studentData as StudentItem[]) || []);
      } else {
        setStudents([]);
      }
    }

    if (!roomFormRes.error && roomFormRes.data?.form_id) {
      const formId = roomFormRes.data.form_id;

      const [formRes, criteriaRes] = await Promise.all([
        supabase.from("evaluation_forms").select("*").eq("id", formId).single(),
        supabase
          .from("evaluation_form_items")
          .select("*")
          .eq("form_id", formId)
          .order("sort_order", { ascending: true }),
      ]);

      if (!formRes.error) setCurrentForm(formRes.data as FormItem);
      if (!criteriaRes.error) setFormCriteria((criteriaRes.data as FormCriterion[]) || []);
    }
  }

  function updateAnswer(itemId: string, value: any) {
    setAnswers((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  }

  const computedScore = useMemo(() => {
    let total = 0;

    for (const item of formCriteria) {
      const value = answers[item.id];

      if (item.item_type === "checkbox") {
        if (value === true) total += Number(item.max_score || 0);
      }

      if (item.item_type === "score") {
        total += Number(value || 0);
      }
    }

    return total;
  }, [formCriteria, answers]);

  async function handlePublish() {
    setMessage("");

    const assignment = assignments.find((a) => a.id === selectedAssignmentId);
    if (!assignment || !assignment.room_id || !selectedStudentId || !currentForm) {
      setMessage("Merci de sélectionner une affectation, un étudiant et une grille valide.");
      return;
    }

    const { data: resultData, error: resultError } = await supabase
      .from("evaluation_results")
      .insert({
        session_id: assignment.session_id,
        room_id: assignment.room_id,
        student_profile_id: selectedStudentId,
        examiner_profile_id: user.id,
        form_id: currentForm.id,
        global_score: computedScore,
        comment: globalComment || null,
        status: "published",
        evaluated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (resultError || !resultData) {
      setMessage("Erreur lors de la création du résultat.");
      return;
    }

    const itemsPayload = formCriteria.map((item) => {
      const rawValue = answers[item.id];

      let score: number | null = null;
      let valueText: string | null = null;

      if (item.item_type === "checkbox") {
        valueText = rawValue ? "true" : "false";
        score = rawValue ? Number(item.max_score || 0) : 0;
      } else if (item.item_type === "score") {
        valueText = rawValue?.toString() || "0";
        score = Number(rawValue || 0);
      } else {
        valueText = rawValue?.toString() || "";
        score = null;
      }

      return {
        result_id: resultData.id,
        form_item_id: item.id,
        score,
        checked: item.item_type === "checkbox" ? Boolean(rawValue) : null,
        text_value: valueText,
      };
    });

    const { error: itemsError } = await supabase
      .from("evaluation_result_items")
      .insert(itemsPayload);

    if (itemsError) {
      setMessage("Résultat créé, mais erreur sur le détail de la fiche.");
      return;
    }

    await supabase.from("notifications").insert({
      profile_id: selectedStudentId,
      title: "Nouveau résultat",
      message: "Une nouvelle fiche d'évaluation a été publiée.",
      type: "new_result",
      is_read: false,
    });

    setMessage("Fiche publiée avec succès.");
    setSelectedStudentId("");
    setAnswers({});
    setGlobalComment("");
  }

  if (loading) return <main className="p-10">Chargement...</main>;
  if (!user || !profile || profile.role !== "examiner") return <main className="p-10">Redirection...</main>;

  return (
    <main className="min-h-screen bg-[#efe8d7] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[30px] bg-white/90 p-6 shadow">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2f2f2f]">Interface Examinateur</h1>
              <p className="mt-2 text-[#666]">{profile.full_name}</p>
              <p className="text-sm text-[#777]">{profile.email}</p>
            </div>

            <a
              href="/logout"
              className="inline-flex items-center gap-2 rounded-xl bg-[#d84f4f] px-4 py-2 text-white"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </a>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[30px] bg-white/90 p-6 shadow">
            <div className="mb-5 flex items-center gap-3">
              <ClipboardList className="h-6 w-6 text-[#e0b63b]" />
              <h2 className="text-2xl font-semibold">Choisir une affectation</h2>
            </div>

            <div className="space-y-4">
              <select
                className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
                value={selectedAssignmentId}
                onChange={(e) => {
                  setSelectedAssignmentId(e.target.value);
                  loadAssignmentContext(e.target.value);
                }}
              >
                <option value="">Choisir une affectation</option>
                {assignments.map((a) => {
                  const session = sessions.find((s) => s.id === a.session_id);
                  const room = rooms.find((r) => r.id === a.room_id);

                  return (
                    <option key={a.id} value={a.id}>
                      {(session?.title || "Session")} - {(room?.name || "Salle")}
                    </option>
                  );
                })}
              </select>

              <select
                className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">Choisir un étudiant</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.email})
                  </option>
                ))}
              </select>

              {currentForm ? (
                <div className="rounded-[20px] bg-[#faf7f0] p-4">
                  <p className="font-semibold">{currentForm.title}</p>
                  <p className="mt-1 text-sm text-[#666]">{currentForm.description || "Sans description"}</p>
                </div>
              ) : (
                <p className="text-sm text-[#666]">Aucune grille liée à cette salle pour le moment.</p>
              )}
            </div>
          </section>

          <section className="rounded-[30px] bg-white/90 p-6 shadow">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Send className="h-6 w-6 text-[#7c9c56]" />
                <h2 className="text-2xl font-semibold">Fiche d'évaluation</h2>
              </div>
              <span className="rounded-full bg-[#f5f0e5] px-3 py-1 text-sm font-semibold text-[#555]">
                Score calculé : {computedScore}
              </span>
            </div>

            {!currentForm ? (
              <p className="text-[#666]">Sélectionne une affectation avec une grille assignée.</p>
            ) : (
              <div className="space-y-4">
                {formCriteria.map((item) => (
                  <div key={item.id} className="rounded-[20px] bg-[#faf7f0] p-4">
                    <p className="font-semibold text-[#2f2f2f]">{item.label}</p>
                    <p className="mt-1 text-xs text-[#888]">
                      {item.item_type} {item.max_score !== null ? `· ${item.max_score} pt max` : ""}
                    </p>

                    {item.item_type === "checkbox" ? (
                      <label className="mt-3 flex items-center gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(answers[item.id])}
                          onChange={(e) => updateAnswer(item.id, e.target.checked)}
                        />
                        Critère validé
                      </label>
                    ) : null}

                    {item.item_type === "score" ? (
                      <input
                        type="number"
                        step="0.1"
                        max={item.max_score ?? undefined}
                        className="mt-3 w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 outline-none"
                        value={answers[item.id] ?? ""}
                        onChange={(e) => updateAnswer(item.id, e.target.value)}
                      />
                    ) : null}

                    {item.item_type === "text" ? (
                      <textarea
                        className="mt-3 w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 outline-none min-h-[100px]"
                        value={answers[item.id] ?? ""}
                        onChange={(e) => updateAnswer(item.id, e.target.value)}
                      />
                    ) : null}
                  </div>
                ))}

                <div className="rounded-[20px] bg-[#faf7f0] p-4">
                  <p className="font-semibold text-[#2f2f2f]">Commentaire global</p>
                  <textarea
                    className="mt-3 w-full rounded-xl border border-[#ddd] bg-white px-4 py-3 outline-none min-h-[120px]"
                    value={globalComment}
                    onChange={(e) => setGlobalComment(e.target.value)}
                  />
                </div>

                {message ? <p className="text-sm text-[#5c8945]">{message}</p> : null}

                <button
                  onClick={handlePublish}
                  className="w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-white font-semibold"
                >
                  Publier la fiche
                </button>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}