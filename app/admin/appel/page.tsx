"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/lib/useUser";
import { PresenceBadge, PlanningCard } from "@/components/premium-widgets";

type Student = {
  id: string;
  full_name: string;
  email: string;
};

type Session = {
  id: string;
  title: string;
  starts_at: string;
  location?: string | null;
  program?: string | null;
};

type Attendance = {
  id?: string;
  session_id: string;
  student_profile_id: string;
  status: "present" | "absent" | "late" | "excused";
};

export default function AppelPage() {
  const { user, profile, loading } = useUser();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedSession, setSelectedSession] = useState("");

  useEffect(() => {
    if (!loading && (!user || profile?.role !== "admin")) {
      window.location.href = "/login?role=admin";
      return;
    }

    if (user && profile?.role === "admin") {
      loadBaseData();
    }
  }, [user, profile, loading]);

  useEffect(() => {
    if (!selectedSession) return;

    loadAttendance();

    const channel = supabase
      .channel(`attendance-${selectedSession}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_attendance",
          filter: `session_id=eq.${selectedSession}`,
        },
        () => loadAttendance()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSession]);

  async function loadBaseData() {
    const [sessionsRes, studentsRes] = await Promise.all([
      supabase
        .from("sessions")
        .select("id, title, starts_at, location, program")
        .order("starts_at"),
      supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "student")
        .order("full_name"),
    ]);

    if (!sessionsRes.error) setSessions(sessionsRes.data || []);
    if (!studentsRes.error) setStudents(studentsRes.data || []);
  }

  async function loadAttendance() {
    const { data } = await supabase
      .from("session_attendance")
      .select("*")
      .eq("session_id", selectedSession);

    setAttendance((data as Attendance[]) || []);
  }

  function getStatus(studentId: string) {
    return attendance.find((a) => a.student_profile_id === studentId)?.status || "absent";
  }

  async function setStatus(studentId: string, status: Attendance["status"]) {
    if (!selectedSession || !user) return;

    await supabase.from("session_attendance").upsert(
      {
        session_id: selectedSession,
        student_profile_id: studentId,
        status,
        checked_by_profile_id: user.id,
        checked_at: new Date().toISOString(),
      },
      { onConflict: "session_id,student_profile_id" }
    );

    loadAttendance();
  }

  const selected = sessions.find((s) => s.id === selectedSession);

  const stats = useMemo(() => {
    return {
      present: attendance.filter((a) => a.status === "present").length,
      absent: attendance.filter((a) => a.status === "absent").length,
      late: attendance.filter((a) => a.status === "late").length,
      excused: attendance.filter((a) => a.status === "excused").length,
    };
  }, [attendance]);

  if (loading) return <main className="p-10">Chargement...</main>;

  return (
    <main className="min-h-screen bg-[#f5efe6] p-6 text-[#2c2f4a]">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[30px] bg-white p-6 shadow-sm border border-[#eee3d7]">
          <h1 className="text-3xl font-bold">Appel des étudiants</h1>
          <p className="mt-2 text-sm text-[#7c736a]">
            Présence synchronisée en temps réel avec les examinateurs.
          </p>

          <select
            className="mt-6 w-full rounded-2xl border border-[#eadccf] bg-white px-4 py-3"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            <option value="">Choisir une session</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} — {new Date(s.starts_at).toLocaleString("fr-FR")}
              </option>
            ))}
          </select>
        </section>

        {selected ? (
          <PlanningCard
            title={selected.title}
            date={selected.starts_at}
            subtitle={selected.location || "Lieu non renseigné"}
            tag={selected.program || "Session"}
          />
        ) : null}

        <section className="grid gap-4 md:grid-cols-4">
          <Stat title="Présents" value={stats.present} tone="green" />
          <Stat title="Absents" value={stats.absent} tone="red" />
          <Stat title="Retards" value={stats.late} tone="orange" />
          <Stat title="Excusés" value={stats.excused} tone="blue" />
        </section>

        <section className="rounded-[30px] bg-white p-6 shadow-sm border border-[#eee3d7]">
          <div className="space-y-3">
            {students.map((student) => {
              const status = getStatus(student.id);

              return (
                <div
                  key={student.id}
                  className="flex flex-col gap-4 rounded-2xl bg-[#fbf7f0] p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold">{student.full_name || "Étudiant"}</p>
                    <p className="text-sm text-[#7b746d]">{student.email}</p>
                    <div className="mt-2">
                      <PresenceBadge status={status} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setStatus(student.id, "present")} className="rounded-xl bg-green-100 px-3 py-2 text-sm font-semibold text-green-700">
                      Présent
                    </button>
                    <button onClick={() => setStatus(student.id, "absent")} className="rounded-xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
                      Absent
                    </button>
                    <button onClick={() => setStatus(student.id, "late")} className="rounded-xl bg-orange-100 px-3 py-2 text-sm font-semibold text-orange-700">
                      Retard
                    </button>
                    <button onClick={() => setStatus(student.id, "excused")} className="rounded-xl bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700">
                      Excusé
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({
  title,
  value,
  tone,
}: {
  title: string;
  value: number;
  tone: "green" | "red" | "orange" | "blue";
}) {
  const tones = {
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    orange: "bg-orange-50 text-orange-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className={`rounded-2xl p-5 shadow-sm border border-white ${tones[tone]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-2 text-4xl font-bold">{value}</p>
    </div>
  );
}