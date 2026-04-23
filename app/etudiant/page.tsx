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
  session_id: string;
  room_id: string | null;
  form_id: string;
  global_score: number | null;
  comment: string | null;
  status: string;
  evaluated_at: string;
};

type RotationItem = {
  id: string;
  session_id: string;
  room_id: string;
  scheduled_at: string;
  order_index: number;
};

type ResultDetailItem = {
  id: string;
  form_item_id: string;
  score: number | null;
  checked: boolean | null;
  text_value: string | null;
};

type FormCriterion = {
  id: string;
  label: string;
  item_type: "checkbox" | "score" | "text";
  max_score: number | null;
  sort_order: number;
};

export default function EtudiantPage() {
  const { user, profile, loading } = useUser();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [rotations, setRotations] = useState<RotationItem[]>([]);
  const [selectedResult, setSelectedResult] = useState<ResultItem | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<ResultDetailItem[]>([]);
  const [selectedCriteria, setSelectedCriteria] = useState<FormCriterion[]>([]);
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

    const [sessionsRes, notificationsRes, resultsRes, rotationsRes] = await Promise.all([
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
      supabase
        .from("room_rotations")
        .select("*")
        .eq("student_profile_id", user.id)
        .order("scheduled_at", { ascending: true }),
    ]);

    if (!sessionsRes.error) setSessions((sessionsRes.data as SessionItem[]) || []);
    if (!notificationsRes.error) setNotifications((notificationsRes.data as NotificationItem[]) || []);
    if (!resultsRes.error) {
      const loadedResults = (resultsRes.data as ResultItem[]) || [];
      setResults(loadedResults);
      if (loadedResults.length > 0) {
        loadResultDetails(loadedResults[0]);
      }
    }
    if (!rotationsRes.error) setRotations((rotationsRes.data as RotationItem[]) || []);

    setPageLoading(false);
  }

  async function loadResultDetails(result: ResultItem) {
    setSelectedResult(result);

    const detailsRes = await supabase
      .from("evaluation_result_items")
      .select("*")
      .eq("result_id", result.id);

    if (detailsRes.error) {
      setSelectedDetails([]);
      setSelectedCriteria([]);
      return;
    }

    const details = (detailsRes.data as ResultDetailItem[]) || [];
    setSelectedDetails(details);

    const itemIds = details.map((d) => d.form_item_id);
    if (itemIds.length === 0) {
      setSelectedCriteria([]);
      return;
    }

    const criteriaRes = await supabase
      .from("evaluation_form_items")
      .select("*")
      .in("id", itemIds)
      .order("sort_order", { ascending: true });

    if (!criteriaRes.error) {
      setSelectedCriteria((criteriaRes.data as FormCriterion[]) || []);
    }
  }

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const nextRotation = useMemo(() => {
    if (rotations.length === 0) return null;
    return rotations[0];
  }, [rotations]);

  if (loading || pageLoading) {
    return (
      <main className="min-h-screen bg-[#efe8d7] p-8">
        <div className="mx-auto max-w-6xl rounded-[28px] bg-white/90 p-8 shadow">
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
        <section className="rounded-[30px] bg-white/90 p-6 shadow">
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
          <StatCard title="Résultats" value={String(results.length)} icon={<CheckCircle2 className="h-5 w-5 text-[#7c9c56]" />} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <section className="rounded-[30px] bg-white/90 p-6 shadow">
              <div className="mb-5 flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-[#7c9c56]" />
                <h2 className="text-2xl font-semibold text-[#2f2f2f]">Sessions disponibles</h2>
              </div>

              {sessions.length === 0 ? (
                <p className="text-[#666]">Aucune session ouverte pour le moment.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {sessions.map((session) => (
                    <div key={session.id} className="rounded-[24px] bg-[#faf7f0] p-5">
                      <p className="text-lg font-semibold text-[#2f2f2f]">{session.title}</p>

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

                      <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-sm text-[#666] shadow-sm">
                        {session.max_students} places max
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[30px] bg-white/90 p-6 shadow">
              <div className="mb-5 flex items-center gap-3">
                <Clock3 className="h-6 w-6 text-[#7c9c56]" />
                <h2 className="text-2xl font-semibold text-[#2f2f2f]">Mon prochain passage</h2>
              </div>

              {nextRotation ? (
                <div className="rounded-[20px] bg-[#faf7f0] p-5">
                  <p className="text-sm text-[#888]">
                    {new Date(nextRotation.scheduled_at).toLocaleString("fr-FR")}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-[#2f2f2f]">
                    Ordre de passage : {nextRotation.order_index}
                  </p>
                  <p className="mt-2 text-sm text-[#666]">Session ID : {nextRotation.session_id}</p>
                </div>
              ) : (
                <p className="text-[#666]">Aucun passage planifié pour le moment.</p>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[30px] bg-white/90 p-6 shadow">
              <div className="mb-5 flex items-center gap-3">
                <Bell className="h-6 w-6 text-[#7c9c56]" />
                <h2 className="text-2xl font-semibold text-[#2f2f2f]">Notifications</h2>
              </div>

              {notifications.length === 0 ? (
                <p className="text-[#666]">Aucune notification pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 4).map((n) => (
                    <div key={n.id} className="rounded-[20px] bg-[#faf7f0] p-4">
                      <p className="font-semibold text-[#2f2f2f]">{n.title}</p>
                      <p className="mt-1 text-sm text-[#666]">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-[30px] bg-white/90 p-6 shadow">
              <div className="mb-5 flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-[#7c9c56]" />
                <h2 className="text-2xl font-semibold text-[#2f2f2f]">Mes fiches publiées</h2>
              </div>

              {results.length === 0 ? (
                <p className="text-[#666]">Aucun résultat publié pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {results.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => loadResultDetails(r)}
                      className={`w-full rounded-[20px] p-4 text-left ${
                        selectedResult?.id === r.id ? "bg-[#e7f0dd]" : "bg-[#faf7f0]"
                      }`}
                    >
                      <p className="font-semibold text-[#2f2f2f]">
                        {new Date(r.evaluated_at).toLocaleString("fr-FR")}
                      </p>
                      <p className="mt-1 text-sm text-[#666]">
                        Score : {r.global_score ?? "--"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>

        <section className="rounded-[30px] bg-white/90 p-6 shadow">
          <div className="mb-5 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-[#7c9c56]" />
            <h2 className="text-2xl font-semibold text-[#2f2f2f]">Fiche récapitulative</h2>
          </div>

          {!selectedResult ? (
            <p className="text-[#666]">Sélectionne une fiche pour voir le détail.</p>
          ) : (
            <div className="space-y-4">
              <div className="rounded-[20px] bg-[#faf7f0] p-5">
                <p className="text-sm text-[#888]">
                  {new Date(selectedResult.evaluated_at).toLocaleString("fr-FR")}
                </p>
                <p className="mt-3 text-4xl font-bold text-[#7c9c56]">
                  {selectedResult.global_score ?? "--"}/20
                </p>
                <p className="mt-3 text-sm text-[#666]">
                  {selectedResult.comment || "Aucun commentaire global."}
                </p>
              </div>

              <div className="space-y-3">
                {selectedCriteria.map((criterion) => {
                  const detail = selectedDetails.find((d) => d.form_item_id === criterion.id);

                  return (
                    <div key={criterion.id} className="rounded-[20px] bg-[#faf7f0] p-4">
                      <p className="font-semibold text-[#2f2f2f]">{criterion.label}</p>
                      <p className="mt-1 text-xs text-[#888]">
                        {criterion.item_type} {criterion.max_score !== null ? `· ${criterion.max_score} pt max` : ""}
                      </p>

                      <div className="mt-3 text-sm text-[#666]">
                        {criterion.item_type === "checkbox" ? (
                          <p>Validation : {detail?.checked ? "Oui" : "Non"}</p>
                        ) : null}

                        {criterion.item_type === "score" ? (
                          <p>Score : {detail?.score ?? 0}</p>
                        ) : null}

                        {criterion.item_type === "text" ? (
                          <p>Commentaire : {detail?.text_value || "Aucun texte"}</p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
    <div className="rounded-[24px] bg-white/90 p-5 shadow">
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