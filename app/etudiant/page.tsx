"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/lib/useUser";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LogOut,
  MapPin,
  UserCircle2,
} from "lucide-react";

type SessionItem = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  location: string;
  level: string;
  program: string;
  max_students: number;
  status: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type ResultItem = {
  id: string;
  global_score: number | null;
  comment: string | null;
  status: string;
  evaluated_at: string;
};

export default function EtudiantPage() {
  const { user, profile, loading } = useUser();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login?role=etudiant";
      return;
    }

    if (!loading && user && profile && profile.role !== "student") {
      window.location.href = "/";
      return;
    }

    if (user && profile?.role === "student") {
      loadStudentDashboard();
    }
  }, [user, profile, loading]);

  async function loadStudentDashboard() {
    setPageLoading(true);

    const [sessionsRes, notificationsRes, resultsRes] = await Promise.all([
      supabase
        .from("sessions")
        .select("*")
        .eq("status", "open")
        .order("starts_at", { ascending: true }),
      supabase
        .from("notifications")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("evaluation_results")
        .select("*")
        .eq("student_profile_id", user.id)
        .eq("status", "published")
        .order("evaluated_at", { ascending: false }),
    ]);

    if (!sessionsRes.error) setSessions((sessionsRes.data as SessionItem[]) || []);
    if (!notificationsRes.error) setNotifications((notificationsRes.data as NotificationItem[]) || []);
    if (!resultsRes.error) setResults((resultsRes.data as ResultItem[]) || []);

    setPageLoading(false);
  }

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const nextSession = useMemo(() => {
    if (sessions.length === 0) return null;
    return sessions[0];
  }, [sessions]);

  if (loading || pageLoading) {
    return (
      <main className="min-h-screen bg-[#efe8d7] p-8">
        <div className="mx-auto max-w-6xl rounded-[28px] bg-white/90 p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          Chargement...
        </div>
      </main>
    );
  }

  if (!user || !profile || profile.role !== "student") {
    return <main className="p-10">Redirection...</main>;
  }

  return (
    <main className="min-h-screen bg-[#efe8d7] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[30px] bg-white/90 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f0dd]">
                <UserCircle2 className="h-9 w-9 text-[#7c9c56]" />
              </div>

              <div>
                <h1 className="text-4xl font-bold text-[#2f2f2f]">Espace Étudiant</h1>
                <p className="mt-2 text-lg text-[#444]">{profile.full_name}</p>
                <p className="text-sm text-[#777]">{profile.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#f5f0e5] px-3 py-1 text-sm font-medium text-[#555]">
                    {profile.level || "Niveau à compléter"}
                  </span>
                  <span className="rounded-full bg-[#f5f0e5] px-3 py-1 text-sm font-medium text-[#555]">
                    {profile.program || "Programme à compléter"}
                  </span>
                  <span className="rounded-full bg-[#e7f0dd] px-3 py-1 text-sm font-medium text-[#5c8945]">
                    Compte actif
                  </span>
                </div>
              </div>
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

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Sessions ouvertes" value={String(sessions.length)} icon={<CalendarDays className="h-5 w-5 text-[#7c9c56]" />} />
          <StatCard title="Notifications" value={String(notifications.length)} icon={<Bell className="h-5 w-5 text-[#7c9c56]" />} />
          <StatCard title="Non lues" value={String(unreadCount)} icon={<Clock3 className="h-5 w-5 text-[#7c9c56]" />} />
          <StatCard title="Résultats publiés" value={String(results.length)} icon={<CheckCircle2 className="h-5 w-5 text-[#7c9c56]" />} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[30px] bg-white/90 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
            <div className="mb-5 flex items-center gap-3">
              <CalendarDays className="h-6 w-6 text-[#7c9c56]" />
              <h2 className="text-2xl font-semibold text-[#2f2f2f]">Mes sessions disponibles</h2>
            </div>

            {sessions.length === 0 ? (
              <p className="text-[#666]">Aucune session ouverte pour le moment.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {sessions.map((session) => (
                  <div key={session.id} className="rounded-[24px] bg-[#faf7f0] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-lg font-semibold text-[#2f2f2f]">{session.title}</p>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#666] shadow-sm">
                        {session.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-sm text-[#666]">
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        <span>{new Date(session.starts_at).toLocaleString("fr-FR")}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{session.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>
                          {session.level} · {session.program}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm text-[#666] shadow-sm">
                        {session.max_students} places max
                      </span>

                      <button
                        type="button"
                        className="rounded-xl bg-[#7c9c56] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Voir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-[30px] bg-white/90 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Bell className="h-6 w-6 text-[#7c9c56]" />
                  <h2 className="text-2xl font-semibold text-[#2f2f2f]">Notifications</h2>
                </div>
                <span className="rounded-full bg-[#f5f0e5] px-3 py-1 text-sm font-semibold text-[#555]">
                  {unreadCount} non lues
                </span>
              </div>

              {notifications.length === 0 ? (
                <p className="text-[#666]">Aucune notification pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 4).map((n) => (
                    <div key={n.id} className="rounded-[20px] bg-[#faf7f0] p-4">
                      <p className="font-semibold text-[#2f2f2f]">{n.title}</p>
                      <p className="mt-1 text-sm text-[#666]">{n.message}</p>
                      <p className="mt-2 text-xs text-[#888]">
                        {new Date(n.created_at).toLocaleString("fr-FR")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[30px] bg-white/90 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
              <div className="mb-5 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-[#7c9c56]" />
                <h2 className="text-2xl font-semibold text-[#2f2f2f]">Dernier résultat</h2>
              </div>

              {results.length === 0 ? (
                <p className="text-[#666]">Aucun résultat publié pour le moment.</p>
              ) : (
                <div className="rounded-[20px] bg-[#faf7f0] p-5">
                  <p className="text-sm text-[#888]">
                    {new Date(results[0].evaluated_at).toLocaleString("fr-FR")}
                  </p>
                  <p className="mt-3 text-4xl font-bold text-[#7c9c56]">
                    {results[0].global_score ?? "--"}/20
                  </p>
                  <p className="mt-3 text-sm text-[#666]">
                    {results[0].comment || "Aucun commentaire disponible."}
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>

        <section className="rounded-[30px] bg-white/90 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <div className="mb-5 flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-[#7c9c56]" />
            <h2 className="text-2xl font-semibold text-[#2f2f2f]">Mon prochain passage</h2>
          </div>

          {nextSession ? (
            <div className="rounded-[24px] bg-[#faf7f0] p-5">
              <p className="text-xl font-semibold text-[#2f2f2f]">{nextSession.title}</p>
              <p className="mt-2 text-[#666]">
                {new Date(nextSession.starts_at).toLocaleString("fr-FR")}
              </p>
              <p className="text-[#666]">{nextSession.location}</p>
            </div>
          ) : (
            <p className="text-[#666]">Aucun passage planifié pour le moment.</p>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] bg-white/90 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[#f5f0e5] p-3">{icon}</div>
        <div>
          <p className="text-sm text-[#777]">{title}</p>
          <p className="text-2xl font-bold text-[#2f2f2f]">{value}</p>
        </div>
      </div>
    </div>
  );
}