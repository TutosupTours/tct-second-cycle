"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import { ClipboardList, LogOut, Send } from "lucide-react";

type Assignment = {
  id: string;
  session_id: string;
  room_id: string | null;
  sessions?: {
    title: string;
    starts_at: string;
    location: string;
  };
};

type StudentItem = {
  id: string;
  full_name: string;
  email: string;
};

export default function ExaminateurPage() {
  const { user, profile, loading } = useUser();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
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
      loadData();
    }
  }, [user, profile, loading]);

  async function loadData() {
    const [assignmentsRes, studentsRes] = await Promise.all([
      supabase
        .from("examiner_assignments")
        .select(`
          *,
          sessions (
            title,
            starts_at,
            location
          )
        `)
        .eq("examiner_profile_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "student")
        .order("full_name", { ascending: true }),
    ]);

    if (!assignmentsRes.error) setAssignments((assignmentsRes.data as Assignment[]) || []);
    if (!studentsRes.error) setStudents((studentsRes.data as StudentItem[]) || []);
  }

  async function handlePublishResult() {
    setMessage("");

    const assignment = assignments.find((a) => a.id === selectedAssignment);
    if (!assignment || !selectedStudent || !score) {
      setMessage("Merci de remplir tous les champs.");
      return;
    }

    const { error } = await supabase.from("evaluation_results").insert({
      session_id: assignment.session_id,
      room_id: assignment.room_id,
      student_profile_id: selectedStudent,
      examiner_profile_id: user.id,
      form_id: null,
      global_score: Number(score),
      comment,
      status: "published",
      evaluated_at: new Date().toISOString(),
    });

    if (error) {
      setMessage("Erreur lors de la publication du résultat.");
      return;
    }

    await supabase.from("notifications").insert({
      profile_id: selectedStudent,
      title: "Nouveau résultat",
      message: "Un nouveau résultat a été publié sur ton espace étudiant.",
      type: "new_result",
      is_read: false,
    });

    setScore("");
    setComment("");
    setMessage("Résultat publié avec succès.");
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
              <h2 className="text-2xl font-semibold">Mes affectations</h2>
            </div>

            {assignments.length === 0 ? (
              <p className="text-[#666]">Aucune affectation pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {assignments.map((a) => (
                  <div key={a.id} className="rounded-[20px] bg-[#faf7f0] p-4">
                    <p className="text-lg font-semibold">{a.sessions?.title || "Session"}</p>
                    <p className="mt-1 text-sm text-[#666]">
                      {a.sessions?.starts_at
                        ? new Date(a.sessions.starts_at).toLocaleString("fr-FR")
                        : ""}
                    </p>
                    <p className="text-sm text-[#666]">{a.sessions?.location}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[30px] bg-white/90 p-6 shadow">
            <div className="mb-5 flex items-center gap-3">
              <Send className="h-6 w-6 text-[#7c9c56]" />
              <h2 className="text-2xl font-semibold">Publier une évaluation</h2>
            </div>

            <div className="space-y-4">
              <select
                className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
              >
                <option value="">Choisir une affectation</option>
                {assignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.sessions?.title || "Session"} - {a.sessions?.location || ""}
                  </option>
                ))}
              </select>

              <select
                className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">Choisir un étudiant</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.email})
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="0.1"
                placeholder="Note /20"
                className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />

              <textarea
                placeholder="Commentaire"
                className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none min-h-[120px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              {message ? <p className="text-sm text-[#5c8945]">{message}</p> : null}

              <button
                onClick={handlePublishResult}
                className="w-full rounded-2xl bg-[#7c9c56] px-6 py-4 text-white font-semibold"
              >
                Publier le résultat
              </button>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}