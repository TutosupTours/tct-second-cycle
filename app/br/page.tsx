"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CreditCard,
  FileText,
  History,
  KeyRound,
  LayoutDashboard,
  UserCircle2,
  Users,
  CheckCircle2,
  XCircle,
  BadgeCheck,
} from "lucide-react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import DashboardShell, {
  DashboardTitle,
  MiniAction,
  Panel,
  StatCard,
} from "@/components/dashboard-shell";

type RequestItem = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  level: string | null;
  program: string | null;
  motivation: string | null;
  status: string;
  reviewed_by_profile_id: string | null;
  reviewed_at: string | null;
  created_at: string;
};

type ActivationCodeItem = {
  id: string;
  request_id: string | null;
  email: string;
  student_login_id: string;
  activation_code: string;
  is_used: boolean;
  expires_at: string | null;
  created_at: string;
};

type SessionItem = {
  id: string;
  title: string;
  starts_at: string;
};

export default function BRPage() {
  const { user, profile, loading } = useUser();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [activationCodes, setActivationCodes] = useState<ActivationCodeItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login?role=br";
      return;
    }
    if (!loading && user && profile?.role !== "br") {
      window.location.href = "/";
      return;
    }
    if (user && profile?.role === "br") {
      loadDashboard();
    }
  }, [user, profile, loading]);

  async function loadDashboard() {
    setPageLoading(true);

    const [requestsRes, activationRes, sessionsRes] = await Promise.all([
      supabase
        .from("student_registration_requests")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("student_activation_codes")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("sessions")
        .select("id, title, starts_at")
        .order("starts_at", { ascending: true }),
    ]);

    if (!requestsRes.error) setRequests((requestsRes.data as RequestItem[]) || []);
    if (!activationRes.error) setActivationCodes((activationRes.data as ActivationCodeItem[]) || []);
    if (!sessionsRes.error) setSessions((sessionsRes.data as SessionItem[]) || []);

    setPageLoading(false);
  }

  function makeStudentLoginId(fullName: string, level?: string | null) {
    const normalized = fullName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 10);

    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${level?.toLowerCase() || "etu"}-${normalized}-${suffix}`;
  }

  function makeActivationCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 8; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  async function approveRequest(request: RequestItem) {
    if (!user) return;

    setMessage("");

    const studentLoginId = makeStudentLoginId(request.full_name, request.level);
    const activationCode = makeActivationCode();

    const reviewedRes = await supabase
      .from("student_registration_requests")
      .update({
        status: "approved",
        reviewed_by_profile_id: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", request.id);

    if (reviewedRes.error) {
      setMessage("Erreur lors de la validation de la demande.");
      return;
    }

    const activationRes = await supabase.from("student_activation_codes").insert({
      request_id: request.id,
      email: request.email,
      student_login_id: studentLoginId,
      activation_code: activationCode,
      is_used: false,
      expires_at: null,
      created_by_profile_id: user.id,
    });

    if (activationRes.error) {
      setMessage("Demande validée, mais erreur lors de la génération de l’identifiant.");
      await loadDashboard();
      return;
    }

    const notificationRes = await supabase.from("notifications").insert({
      profile_id: user.id,
      title: "Demande validée",
      message: `Accès généré pour ${request.full_name} (${studentLoginId}).`,
      type: "request_approved",
      is_read: false,
    });

    if (notificationRes.error) {
      console.error("Notification BR non créée:", notificationRes.error);
    }

    setMessage(
      `Demande validée. ID étudiant : ${studentLoginId} · Code d’activation : ${activationCode}`
    );
    loadDashboard();
  }

  async function rejectRequest(requestId: string) {
    if (!user) return;

    setMessage("");

    const { error } = await supabase
      .from("student_registration_requests")
      .update({
        status: "rejected",
        reviewed_by_profile_id: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (error) {
      setMessage("Erreur lors du refus de la demande.");
      return;
    }

    setMessage("Demande refusée.");
    loadDashboard();
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;
  const generatedCount = activationCodes.length;

  const recentGenerated = useMemo(() => activationCodes.slice(0, 5), [activationCodes]);

  if (loading || pageLoading) return <main className="p-10">Chargement...</main>;
  if (!user || !profile || profile.role !== "br") return <main className="p-10">Redirection...</main>;

  return (
    <DashboardShell
      roleLabel="BR"
      userName={profile.full_name || "BR"}
      topColor="#5f7f44"
      accentColor="#6a8f4f"
      lightAccent="#eaf1df"
      avatarUrl={profile.photo_url || null}
      activePath="/br"
      navItems={[
        { label: "Tableau de bord", href: "/br", icon: LayoutDashboard },
        { label: "Demandes", href: "/br", icon: FileText },
        { label: "Accès générés", href: "/br", icon: KeyRound },
        { label: "Sessions", href: "/br", icon: Calendar },
        { label: "Étudiants", href: "/br", icon: Users },
        { label: "Historique", href: "/br", icon: History },
        { label: "Profil", href: "/br", icon: UserCircle2 },
      ]}
    >
      <DashboardTitle
        title="Bureau du tutorat"
        subtitle="Validation des demandes et génération des accès étudiants"
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Demandes" value={String(requests.length)} subtitle="Total" />
        <StatCard title="En attente" value={String(pendingCount)} subtitle="À traiter" />
        <StatCard title="Validées" value={String(approvedCount)} subtitle="Approuvées" />
        <StatCard title="Accès générés" value={String(generatedCount)} subtitle="ID créés" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Demandes d’inscription">
          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-sm text-[#8d8278]">Aucune demande pour le moment.</p>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="rounded-2xl bg-white p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#2c2f4a]">{r.full_name}</p>
                      <p className="text-sm text-[#8d8278]">{r.email}</p>
                      {r.phone ? <p className="text-sm text-[#8d8278]">{r.phone}</p> : null}
                      <p className="mt-1 text-sm text-[#8d8278]">
                        {r.level || "Niveau non renseigné"} · {r.program || "Programme non renseigné"}
                      </p>
                      {r.motivation ? (
                        <p className="mt-2 text-sm text-[#6f665e]">{r.motivation}</p>
                      ) : null}
                      <p className="mt-2 text-xs text-[#9b9086]">
                        {new Date(r.created_at).toLocaleString("fr-FR")}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-2 lg:items-end">
                      {r.status === "pending" ? (
                        <>
                          <span className="rounded-full bg-[#fff3dd] px-3 py-1 text-xs font-semibold text-[#b8860b]">
                            En attente
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => rejectRequest(r.id)}
                              className="inline-flex items-center gap-2 rounded-xl border border-[#efc7c1] bg-[#fff5f3] px-3 py-2 text-xs font-semibold text-[#cf5d50]"
                            >
                              <XCircle className="h-4 w-4" />
                              Refuser
                            </button>
                            <button
                              onClick={() => approveRequest(r)}
                              className="inline-flex items-center gap-2 rounded-xl bg-[#6a8f4f] px-3 py-2 text-xs font-semibold text-white"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Valider
                            </button>
                          </div>
                        </>
                      ) : r.status === "approved" ? (
                        <span className="rounded-full bg-[#e8f2db] px-3 py-1 text-xs font-semibold text-[#5f7f44]">
                          Validée
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#fde8e5] px-3 py-1 text-xs font-semibold text-[#c65a50]">
                          Refusée
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Accès étudiants générés">
          <div className="space-y-3">
            {recentGenerated.length === 0 ? (
              <p className="text-sm text-[#8d8278]">Aucun accès généré pour le moment.</p>
            ) : (
              recentGenerated.map((a) => (
                <div key={a.id} className="rounded-2xl bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#2c2f4a]">{a.email}</p>
                      <p className="mt-1 text-sm text-[#8d8278]">
                        ID : <span className="font-medium text-[#2c2f4a]">{a.student_login_id}</span>
                      </p>
                      <p className="text-sm text-[#8d8278]">
                        Code : <span className="font-medium text-[#2c2f4a]">{a.activation_code}</span>
                      </p>
                      <p className="mt-2 text-xs text-[#9b9086]">
                        {new Date(a.created_at).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        a.is_used
                          ? "bg-[#e8f2db] text-[#5f7f44]"
                          : "bg-[#eef4e7] text-[#6a8f4f]"
                      }`}
                    >
                      {a.is_used ? "Utilisé" : "Actif"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel title="Vue rapide">
          <div className="space-y-3 text-sm text-[#655d57]">
            <div className="rounded-2xl bg-white p-4">
              • {pendingCount} demandes restent à traiter
            </div>
            <div className="rounded-2xl bg-white p-4">
              • {approvedCount} étudiants ont reçu un accès
            </div>
            <div className="rounded-2xl bg-white p-4">
              • {rejectedCount} demandes ont été refusées
            </div>
          </div>
        </Panel>

        <Panel title="Sessions à venir">
          <div className="space-y-3">
            {sessions.slice(0, 4).map((s) => (
              <div key={s.id} className="rounded-2xl bg-white p-4">
                <p className="font-semibold text-[#2c2f4a]">{s.title}</p>
                <p className="mt-1 text-sm text-[#8d8278]">
                  {new Date(s.starts_at).toLocaleString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Accès rapide">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MiniAction href="/br" label="Voir les demandes" />
            <MiniAction href="/br" label="Voir les accès générés" />
            <MiniAction href="/br" label="Voir les sessions" />
            <MiniAction href="/br" label="Suivi des étudiants" />
          </div>
        </Panel>
      </div>

      {message ? (
        <div className="mt-5 rounded-2xl border border-[#dfead0] bg-white px-4 py-3 text-sm text-[#4f6c38]">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4" />
            <span>{message}</span>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}