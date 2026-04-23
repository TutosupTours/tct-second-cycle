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
  Clock3,
} from "lucide-react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import DashboardShell, {
  DashboardTitle,
  MiniAction,
  Panel,
  StatCard,
} from "@/components/dashboard-shell";

type SessionItem = {
  id: string;
  title: string;
  starts_at: string;
  location: string;
  program: string;
  level: string;
};

type StationAssignment = {
  id: string;
  session_id: string;
  examiner_role_code: string;
  planned_hours: number | null;
};

type Attendance = {
  session_id: string;
  student_profile_id: string;
  status: string;
};

type Student = {
  id: string;
  full_name: string;
  email: string;
};

export default function ExaminateurPage() {
  const { user, profile, loading } = useUser();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [assignments, setAssignments] = useState<StationAssignment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
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

  useEffect(() => {
    if (!selectedSessionId) return;

    loadAttendance(selectedSessionId);

    const channel = supabase
      .channel(`examiner-attendance-${selectedSessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_attendance",
          filter: `session_id=eq.${selectedSessionId}`,
        },
        () => loadAttendance(selectedSessionId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSessionId]);

  async function loadDashboard() {
    setPageLoading(true);

    const [assignmentsRes, sessionsRes, studentsRes] = await Promise.all([
      supabase
        .from("station_examiner_assignments")
        .select("*")
        .eq("examiner_profile_id", user.id),
      supabase.from("sessions").select("id, title, starts_at, location, program, level"),
      supabase.from("profiles").select("id, full_name, email").eq("role", "student"),
    ]);

    if (!assignmentsRes.error) {
      const loadedAssignments = (assignmentsRes.data as StationAssignment[]) || [];
      setAssignments(loadedAssignments);

      if (loadedAssignments[0]) {
        setSelectedSessionId(loadedAssignments[0].session_id);
      }
    }

    if (!sessionsRes.error) setSessions((sessionsRes.data as SessionItem[]) || []);
    if (!studentsRes.error) setStudents((studentsRes.data as Student[]) || []);

    setPageLoading(false);
  }

  async function loadAttendance(sessionId: string) {
    const { data } = await supabase
      .from("session_attendance")
      .select("*")
      .eq("session_id", sessionId);

    setAttendance((data as Attendance[]) || []);
  }

  const assignedSessionIds = Array.from(new Set(assignments.map((a) => a.session_id)));

  const assignedSessions = sessions.filter((s) => assignedSessionIds.includes(s.id));

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const presentStudents = useMemo(() => {
    const presentIds = attendance
      .filter((a) => a.status === "present" || a.status === "late")
      .map((a) => a.student_profile_id);

    return students.filter((s) => presentIds.includes(s.id));
  }, [attendance, students]);

  const absentStudents = useMemo(() => {
    const absentIds = attendance
      .filter((a) => a.status === "absent")
      .map((a) => a.student_profile_id);

    return students.filter((s) => absentIds.includes(s.id));
  }, [attendance, students]);

  const totalPlannedHours = assignments.reduce(
    (sum, item) => sum + Number(item.planned_hours || 0),
    0
  );

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
        { label: "Présents", href: "/examinateur", icon: CheckSquare },
        { label: "Évaluations", href: "/examinateur", icon: FileText },
        { label: "Heures", href: "/examinateur", icon: Clock3 },
        { label: "Démarrer", href: "/examinateur", icon: PlayCircle },
        { label: "Profil", href: "/examinateur", icon: UserCircle2 },
      ]}
    >
      <DashboardTitle
        title="Tableau de bord examinateur"
        subtitle="Liste synchronisée avec l’appel réalisé par l’administration"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Sessions" value={String(assignedSessions.length)} subtitle="Affectées" />
        <StatCard title="Présents" value={String(presentStudents.length)} subtitle="À évaluer" />
        <StatCard title="Absents" value={String(absentStudents.length)} subtitle="Non présents" />
        <StatCard title="Heures prévues" value={String(totalPlannedHours)} subtitle="Total" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Choisir une session">
          <div className="space-y-3">
            <select
              className="w-full rounded-2xl border border-[#eadccf] bg-white px-4 py-3"
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
            >
              <option value="">Choisir une session</option>
              {assignedSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>

            {selectedSession ? (
              <div className="rounded-2xl bg-white p-4">
                <p className="font-semibold">{selectedSession.title}</p>
                <p className="text-sm text-[#8d8278]">
                  {new Date(selectedSession.starts_at).toLocaleString("fr-FR")}
                </p>
                <p className="text-sm text-[#8d8278]">{selectedSession.location}</p>
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel title="Étudiants présents / retard">
          <div className="space-y-3">
            {presentStudents.length === 0 ? (
              <p className="text-sm text-[#8d8278]">Aucun étudiant présent pour le moment.</p>
            ) : (
              presentStudents.map((student) => (
                <div key={student.id} className="rounded-2xl bg-white p-4">
                  <p className="font-semibold text-[#2c2f4a]">{student.full_name}</p>
                  <p className="text-sm text-[#8d8278]">{student.email}</p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Accès rapide">
          <div className="grid gap-3 md:grid-cols-3">
            <MiniAction href="/examinateur" label="Démarrer une évaluation" />
            <MiniAction href="/examinateur" label="Voir mes affectations" />
            <MiniAction href="/examinateur" label="Télécharger attestation" />
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}