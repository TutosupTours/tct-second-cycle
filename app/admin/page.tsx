"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import {
  Calendar,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  ShieldCheck,
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

type SessionItem = {
  id: string;
  title: string;
  starts_at: string;
  level: string;
  program: string;
  location: string;
  status: string;
};

type RequestItem = {
  id: string;
  full_name: string;
  email: string;
  payment_status: string;
  created_at: string;
};

type ProfileLite = {
  id: string;
  role: string;
};

export default function AdminPage() {
  const { user, profile, loading } = useUser();

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileLite[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login?role=admin";
      return;
    }
    if (!loading && user && profile?.role !== "admin") {
      window.location.href = "/";
      return;
    }
    if (user && profile?.role === "admin") {
      loadDashboard();
    }
  }, [user, profile, loading]);

  async function loadDashboard() {
    setPageLoading(true);

    const [sessionsRes, requestsRes, profilesRes] = await Promise.all([
      supabase.from("sessions").select("*").order("starts_at", { ascending: true }),
      supabase.from("student_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, role"),
    ]);

    if (!sessionsRes.error) setSessions((sessionsRes.data as SessionItem[]) || []);
    if (!requestsRes.error) setRequests((requestsRes.data as RequestItem[]) || []);
    if (!profilesRes.error) setProfiles((profilesRes.data as ProfileLite[]) || []);

    setPageLoading(false);
  }

  const activeSessions = sessions.filter((s) => s.status === "open").length;
  const totalRequests = requests.length;
  const studentCount = profiles.filter((p) => p.role === "student").length;
  const examinerCount = profiles.filter((p) => p.role === "examiner").length;
  const pendingRequests = requests.filter((r) => r.payment_status === "pending").length;
  const validatedRequests = requests.filter((r) => r.payment_status === "validated").length;

  if (loading || pageLoading) return <main className="p-10">Chargement...</main>;
  if (!user || !profile || profile.role !== "admin") return <main className="p-10">Redirection...</main>;

  return (
    <DashboardShell
      roleLabel="Admin"
      userName={profile.full_name || "Admin"}
      topColor="#cc3128"
      accentColor="#d74d45"
      lightAccent="#fae3e1"
      avatarUrl={profile.photo_url || null}
      activePath="/admin"
      navItems={[
        { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
        { label: "Sessions", href: "/admin", icon: Calendar },
        { label: "Stations", href: "/admin", icon: ClipboardCheck },
        { label: "Examinateurs", href: "/admin", icon: ShieldCheck },
        { label: "Inscriptions", href: "/admin", icon: FileText },
        { label: "Étudiants", href: "/admin", icon: GraduationCap },
        { label: "Évaluations", href: "/admin", icon: ClipboardCheck },
        { label: "Utilisateurs", href: "/admin", icon: Users },
        { label: "Paramètres", href: "/admin", icon: Settings },
      ]}
    >
      <DashboardTitle title="Tableau de bord" color="#cc3128" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Sessions" value={String(activeSessions)} subtitle="Actives" color="#cc3128" />
        <StatCard title="Inscriptions" value={String(totalRequests)} subtitle="Total" color="#cc3128" />
        <StatCard title="Étudiants" value={String(studentCount)} subtitle="Inscrits" color="#cc3128" />
        <StatCard title="Examinateurs" value={String(examinerCount)} subtitle="Actifs" color="#cc3128" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        <Panel title="Sessions à venir">
          <div className="space-y-3">
            {sessions.slice(0, 4).map((s) => (
              <div key={s.id} className="rounded-2xl bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#3f3732]">{s.title}</p>
                    <p className="mt-1 text-sm text-[#8d8278]">
                      {new Date(s.starts_at).toLocaleString("fr-FR")}
                    </p>
                    <p className="text-sm text-[#8d8278]">
                      {s.level} · {s.program} · {s.location}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#fae3e1] px-3 py-1 text-xs font-semibold text-[#cc3128]">
                    Voir
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Inscriptions récentes">
          <div className="space-y-3">
            {requests.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-start gap-3 rounded-2xl bg-white p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fae3e1] text-sm font-bold text-[#cc3128]">
                  {r.full_name?.slice(0, 1) || "E"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[#3f3732]">{r.full_name}</p>
                  <p className="text-sm text-[#8d8278]">{r.email}</p>
                  <p className="text-xs text-[#9d9187]">
                    {new Date(r.created_at).toLocaleDateString("fr-FR")} · {r.payment_status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Panel title="Alertes">
          <div className="space-y-3 text-sm text-[#655d57]">
            <div className="rounded-2xl bg-white p-4">• {pendingRequests} paiements en attente de validation</div>
            <div className="rounded-2xl bg-white p-4">• {validatedRequests} inscriptions validées</div>
            <div className="rounded-2xl bg-white p-4">• Pense à vérifier les affectations examinateurs / salles</div>
          </div>
        </Panel>

        <Panel title="Répartition des inscriptions">
          <div className="space-y-4">
            {[
              { label: "En attente", value: pendingRequests, color: "#d98a7f" },
              { label: "Validées", value: validatedRequests, color: "#e7bf51" },
              { label: "Autres", value: Math.max(totalRequests - pendingRequests - validatedRequests, 0), color: "#d1544d" },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm text-[#746a61]">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-3 rounded-full bg-[#f0e6dc]">
                  <div
                    className="h-3 rounded-full"
                    style={{
                      width: `${totalRequests ? (item.value / totalRequests) * 100 : 0}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Accès rapide">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MiniAction href="/admin" label="Créer une session" />
            <MiniAction href="/admin" label="Créer une station" />
            <MiniAction href="/admin" label="Assigner un examinateur" />
            <MiniAction href="/admin" label="Gérer les grilles" />
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}