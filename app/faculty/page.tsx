"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  Calendar,
  ClipboardList,
  FileText,
  LayoutDashboard,
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
import { PlanningCard } from "@/components/premium-widgets";

type SessionItem = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  location: string;
  level: string;
  program: string;
  status: string;
};

type StationItem = {
  id: string;
  session_id: string;
  name: string;
  station_type: string;
  program: string;
  order_index: number;
};

type AssignmentItem = {
  id: string;
  session_id: string;
  station_id: string | null;
  examiner_profile_id: string;
  examiner_role_code: string;
  planned_hours: number | null;
};

type ProfileLite = {
  id: string;
  full_name: string;
  email: string;
  role: string;
};

type AttendanceLog = {
  id: string;
  examiner_profile_id: string;
  session_id: string;
  hours_done: number | null;
  validated: boolean;
};

type SatisfactionResponse = {
  id: string;
  form_id: string;
  session_id: string | null;
  submitted_at: string;
};

export default function FacultyPage() {
  const { user, profile, loading } = useUser();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [stations, setStations] = useState<StationItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [satisfactionResponses, setSatisfactionResponses] = useState<
    SatisfactionResponse[]
  >([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login?role=faculty";
      return;
    }

    if (
      !loading &&
      user &&
      profile?.role !== "faculty" &&
      profile?.role !== "admin"
    ) {
      window.location.href = "/";
      return;
    }

    if (user && (profile?.role === "faculty" || profile?.role === "admin")) {
      loadDashboard();
    }
  }, [user, profile, loading]);

  async function loadDashboard() {
    setPageLoading(true);

    const [
      sessionsRes,
      stationsRes,
      assignmentsRes,
      profilesRes,
      attendanceRes,
      satisfactionRes,
    ] = await Promise.all([
      supabase
        .from("sessions")
        .select("*")
        .order("starts_at", { ascending: true }),
      supabase
        .from("session_stations")
        .select("*")
        .order("order_index", { ascending: true }),
      supabase
        .from("station_examiner_assignments")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .order("full_name", { ascending: true }),
      supabase
        .from("examiner_attendance_logs")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("satisfaction_responses")
        .select("*")
        .order("submitted_at", { ascending: false }),
    ]);

    if (!sessionsRes.error) setSessions((sessionsRes.data as SessionItem[]) || []);
    if (!stationsRes.error) setStations((stationsRes.data as StationItem[]) || []);
    if (!assignmentsRes.error)
      setAssignments((assignmentsRes.data as AssignmentItem[]) || []);
    if (!profilesRes.error) setProfiles((profilesRes.data as ProfileLite[]) || []);
    if (!attendanceRes.error)
      setAttendanceLogs((attendanceRes.data as AttendanceLog[]) || []);
    if (!satisfactionRes.error)
      setSatisfactionResponses(
        (satisfactionRes.data as SatisfactionResponse[]) || []
      );

    setPageLoading(false);
  }

  const examinerCount = profiles.filter((p) => p.role === "examiner").length;
  const studentCount = profiles.filter((p) => p.role === "student").length;

  const totalHours = attendanceLogs.reduce(
    (sum, log) => sum + Number(log.hours_done || 0),
    0
  );

  const validatedHours = attendanceLogs
    .filter((log) => log.validated)
    .reduce((sum, log) => sum + Number(log.hours_done || 0), 0);

  const upcomingSessions = sessions.slice(0, 6);

  const enrichedAssignments = useMemo(() => {
    return assignments.slice(0, 8).map((a) => {
      const session = sessions.find((s) => s.id === a.session_id);
      const station = stations.find((s) => s.id === a.station_id);
      const examiner = profiles.find((p) => p.id === a.examiner_profile_id);

      return {
        ...a,
        sessionTitle: session?.title || "Session",
        sessionDate: session?.starts_at || "",
        stationName: station?.name || "Station",
        examinerName: examiner?.full_name || "Examinateur",
        examinerEmail: examiner?.email || "",
      };
    });
  }, [assignments, sessions, stations, profiles]);

  if (loading || pageLoading) {
    return <main className="p-10">Chargement...</main>;
  }

  if (
    !user ||
    !profile ||
    (profile.role !== "faculty" && profile.role !== "admin")
  ) {
    return <main className="p-10">Redirection...</main>;
  }

  return (
    <DashboardShell
      roleLabel="Faculté"
      userName={profile.full_name || "Faculté"}
      topColor="#243b63"
      accentColor="#2f4f7f"
      lightAccent="#e3ebf7"
      avatarUrl={profile.photo_url || null}
      activePath="/faculty"
      navItems={[
        { label: "Tableau de bord", href: "/faculty", icon: LayoutDashboard },
        { label: "Planning sessions", href: "/faculty", icon: Calendar },
        { label: "Examinateurs", href: "/faculty", icon: Users },
        { label: "Stations", href: "/faculty", icon: ClipboardList },
        { label: "Satisfaction", href: "/faculty", icon: BarChart3 },
        { label: "Attestations", href: "/faculty", icon: Award },
        { label: "Documents", href: "/faculty", icon: FileText },
      ]}
    >
      <DashboardTitle
        title="Espace Faculté"
        subtitle="Vue institutionnelle : sessions, examinateurs, attestations et satisfaction"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Sessions" value={String(sessions.length)} subtitle="Créées" />
        <StatCard
          title="Étudiants"
          value={String(studentCount)}
          subtitle="Comptes actifs"
        />
        <StatCard
          title="Examinateurs"
          value={String(examinerCount)}
          subtitle="Participants"
        />
        <StatCard
          title="Heures validées"
          value={String(validatedHours)}
          subtitle={`Total : ${totalHours}`}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Planning des sessions">
          <div className="space-y-3">
            {upcomingSessions.length === 0 ? (
              <p className="text-sm text-[#8d8278]">Aucune session créée.</p>
            ) : (
              upcomingSessions.map((s) => (
                <PlanningCard
                  key={s.id}
                  title={s.title}
                  date={s.starts_at}
                  subtitle={`${s.location || "Lieu non renseigné"} · ${
                    s.level || "Niveau non renseigné"
                  }`}
                  tag={s.program || "Session"}
                />
              ))
            )}
          </div>
        </Panel>

        <Panel title="Répartition générale">
          <div className="space-y-3">
            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm text-[#8d8278]">Sessions ESEE</p>
              <p className="text-3xl font-bold text-[#2c2f4a]">
                {sessions.filter((s) => s.program === "ESEE").length}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm text-[#8d8278]">Sessions procédurales</p>
              <p className="text-3xl font-bold text-[#2c2f4a]">
                {sessions.filter((s) => s.program === "Procedural").length}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4">
              <p className="text-sm text-[#8d8278]">
                Formulaires satisfaction reçus
              </p>
              <p className="text-3xl font-bold text-[#2c2f4a]">
                {satisfactionResponses.length}
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel title="Planning examinateurs">
          <div className="space-y-3">
            {enrichedAssignments.length === 0 ? (
              <p className="text-sm text-[#8d8278]">
                Aucune affectation pour le moment.
              </p>
            ) : (
              enrichedAssignments.map((a) => (
                <div key={a.id} className="rounded-2xl bg-white p-4">
                  <p className="font-semibold text-[#2c2f4a]">
                    {a.examinerName}
                  </p>
                  <p className="text-sm text-[#8d8278]">{a.examinerEmail}</p>
                  <p className="mt-1 text-sm text-[#8d8278]">
                    {a.sessionTitle} · {a.stationName}
                  </p>
                  <p className="text-sm text-[#8d8278]">
                    Rôle : {a.examiner_role_code} · Heures prévues :{" "}
                    {a.planned_hours || 0}
                  </p>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Attestations / parcours">
          <div className="space-y-3">
            {profiles
              .filter((p) => p.role === "examiner")
              .slice(0, 6)
              .map((examiner) => {
                const logs = attendanceLogs.filter(
                  (l) => l.examiner_profile_id === examiner.id
                );

                const hours = logs.reduce(
                  (sum, l) => sum + Number(l.hours_done || 0),
                  0
                );

                const sessionsCount = new Set(logs.map((l) => l.session_id))
                  .size;

                const pdfUrl = `/api/examiner-certificate?name=${encodeURIComponent(
                  examiner.full_name
                )}&year=2025-2026&sessions=${sessionsCount}&hours=${hours}`;

                return (
                  <div key={examiner.id} className="rounded-2xl bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#2c2f4a]">
                          {examiner.full_name}
                        </p>
                        <p className="text-sm text-[#8d8278]">
                          {examiner.email}
                        </p>
                        <p className="mt-1 text-sm text-[#8d8278]">
                          {sessionsCount} session(s) · {hours} heure(s)
                        </p>
                      </div>

                      <a
                        href={pdfUrl}
                        target="_blank"
                        className="rounded-xl bg-[#243b63] px-3 py-2 text-xs font-semibold text-white"
                      >
                        PDF
                      </a>
                    </div>
                  </div>
                );
              })}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel title="Satisfaction">
          <div className="space-y-3">
            <div className="rounded-2xl bg-white p-4">
              <p className="font-semibold text-[#2c2f4a]">Retours reçus</p>
              <p className="mt-2 text-3xl font-bold text-[#243b63]">
                {satisfactionResponses.length}
              </p>
              <p className="mt-1 text-sm text-[#8d8278]">
                Les formulaires de satisfaction permettront le suivi qualité du
                projet.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4">
              <p className="font-semibold text-[#2c2f4a]">Objectif</p>
              <p className="mt-1 text-sm text-[#8d8278]">
                Amélioration continue des ECOS procéduraux et du projet ESEE.
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Accès rapide">
          <div className="grid gap-3">
            <MiniAction href="/faculty" label="Voir le planning des sessions" />
            <MiniAction href="/faculty" label="Voir les examinateurs" />
            <MiniAction
              href="/faculty"
              label="Consulter les attestations PDF"
            />
            <MiniAction href="/faculty" label="Consulter la satisfaction" />
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}