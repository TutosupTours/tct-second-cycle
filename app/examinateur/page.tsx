"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import {
  CheckSquare,
  ClipboardList,
  FileText,
  LayoutDashboard,
  PlayCircle,
  UserCircle2,
  Users,
} from "lucide-react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import DashboardShell, {
  DashboardTitle,
  MiniAction,
  Panel,
  StatCard,
} from "@/components/dashboard-shell";

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

type ResultItem = {
  id: string;
  evaluated_at: string;
  global_score: number | null;
  student_profile_id: string;
};

type StudentItem = {
  id: string;
  full_name: string;
};

export default function ExaminateurPage() {
  const { user, profile, loading } = useUser();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

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
      loadDashboard();
    }
  }, [user, profile, loading]);

  async function loadDashboard() {
    setPageLoading(true);

    const [assignmentsRes, sessionsRes, roomsRes, resultsRes, studentsRes] =
      await Promise.all([
        supabase
          .from("examiner_assignments")
          .select("*")
          .eq("examiner_profile_id", user.id),
        supabase.from("sessions").select("id, title, starts_at, location"),
        supabase.from("session_rooms").select("id, name"),
        supabase
          .from("evaluation_results")
          .select("id, evaluated_at, global_score, student_profile_id")
          .eq("examiner_profile_id", user.id)
          .order("evaluated_at", { ascending: false }),
        supabase.from("profiles").select("id, full_name").eq("role", "student"),
      ]);

    if (!assignmentsRes.error) setAssignments((assignmentsRes.data as Assignment[]) || []);
    if (!sessionsRes.error) setSessions((sessionsRes.data as SessionItem[]) || []);
    if (!roomsRes.error) setRooms((roomsRes.data as RoomItem[]) || []);
    if (!resultsRes.error) setResults((resultsRes.data as ResultItem[]) || []);
    if (!studentsRes.error) setStudents((studentsRes.data as StudentItem[]) || []);

    setPageLoading(false);
  }

  const upcomingSessions = assignments.map((a) => {
    const session = sessions.find((s) => s.id === a.session_id);
    const room = rooms.find((r) => r.id === a.room_id);
    return {
      id: a.id,
      title: session?.title || "Session",
      starts_at: session?.starts_at || "",
      location: session?.location || "",
      room: room?.name || "Salle",
    };
  });

  const totalStudentsToEvaluate = upcomingSessions.length * 6;
  const evaluationsDone = results.length;

  const recentResults = useMemo(() => {
    return results.slice(0, 4).map((r) => ({
      ...r,
      studentName:
        students.find((s) => s.id === r.student_profile_id)?.full_name || "Étudiant",
    }));
  }, [results, students]);

  if (loading || pageLoading) return <main className="p-10">Chargement...</main>;
  if (!user || !profile || profile.role !== "examiner") return <main className="p-10">Redirection...</main>;

  return (
    <DashboardShell
      roleLabel="Examinateur"
      userName={profile.full_name || "Examinateur"}
      topColor="#e7b644"
      accentColor="#efc352"
      lightAccent="#fff0c8"
      avatarUrl={profile.photo_url || null}
      activePath="/examinateur"
      navItems={[
        { label: "Tableau de bord", href: "/examinateur", icon: LayoutDashboard },
        { label: "Mes sessions", href: "/examinateur", icon: ClipboardList },
        { label: "Mes stations", href: "/examinateur", icon: FileText },
        { label: "Évaluations", href: "/examinateur", icon: CheckSquare },
        { label: "Étudiants évalués", href: "/examinateur", icon: Users },
        { label: "Démarrer", href: "/examinateur", icon: PlayCircle },
        { label: "Profil", href: "/examinateur", icon: UserCircle2 },
      ]}
    >
      <DashboardTitle title="Tableau de bord" color="#d5a528" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Sessions à venir" value={String(upcomingSessions.length)} subtitle="Affectées" color="#d5a528" />
        <StatCard title="Stations" value={String(assignments.length)} subtitle="Assignées" color="#d5a528" />
        <StatCard title="Étudiants" value={String(totalStudentsToEvaluate)} subtitle="À évaluer" color="#d5a528" />
        <StatCard title="Évaluations" value={String(evaluationsDone)} subtitle="Déjà faites" color="#d5a528" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel title="Mes prochaines sessions">
          <div className="space-y-3">
            {upcomingSessions.slice(0, 4).map((s) => (
              <div key={s.id} className="rounded-2xl bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#3f3732]">{s.title}</p>
                    <p className="mt-1 text-sm text-[#8d8278]">
                      {s.starts_at ? new Date(s.starts_at).toLocaleString("fr-FR") : ""}
                    </p>
                    <p className="text-sm text-[#8d8278]">
                      {s.location} · {s.room}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#fff0c8] px-3 py-1 text-xs font-semibold text-[#d5a528]">
                    Détails
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="À faire aujourd'hui">
          <div className="space-y-3">
            {upcomingSessions.slice(0, 3).map((s) => (
              <div key={s.id} className="rounded-2xl bg-white p-4">
                <p className="font-semibold text-[#3f3732]">Évaluer 12 étudiants</p>
                <p className="mt-1 text-sm text-[#8d8278]">
                  {s.title} · {s.room}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Mes dernières évaluations">
          <div className="space-y-3">
            {recentResults.length === 0 ? (
              <p className="text-sm text-[#8d8278]">Aucune évaluation publiée pour le moment.</p>
            ) : (
              recentResults.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
                  <div>
                    <p className="font-semibold text-[#3f3732]">{r.studentName}</p>
                    <p className="text-sm text-[#8d8278]">
                      {new Date(r.evaluated_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#edf6df] px-3 py-1 text-xs font-semibold text-[#7a9a45]">
                    Validée
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Accès rapide">
          <div className="grid gap-3">
            <MiniAction href="/examinateur" label="Commencer une évaluation" />
            <MiniAction href="/examinateur" label="Liste des étudiants" />
            <MiniAction href="/examinateur" label="Grilles d’évaluation" />
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}