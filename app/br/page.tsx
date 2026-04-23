"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CreditCard,
  FileText,
  History,
  LayoutDashboard,
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

type RequestItem = {
  id: string;
  full_name: string;
  email: string;
  payment_status: string;
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
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

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

    const [requestsRes, sessionsRes] = await Promise.all([
      supabase.from("student_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("sessions").select("id, title, starts_at").order("starts_at", { ascending: true }),
    ]);

    if (!requestsRes.error) setRequests((requestsRes.data as RequestItem[]) || []);
    if (!sessionsRes.error) setSessions((sessionsRes.data as SessionItem[]) || []);

    setPageLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("student_requests")
      .update({ payment_status: status })
      .eq("id", id);

    if (!error) loadDashboard();
  }

  const pendingCount = requests.filter((r) => r.payment_status === "pending").length;
  const validatedCount = requests.filter((r) => r.payment_status === "validated").length;
  const activeRegistrations = validatedCount;
  const openSessions = sessions.length;

  const monthlyBars = useMemo(() => {
    return [
      { label: "Fév.", a: 6, b: 4 },
      { label: "Mars", a: 8, b: 5 },
      { label: "Avr.", a: 7, b: 3 },
      { label: "Mai", a: 12, b: 4 },
      { label: "Juin", a: 9, b: 5 },
    ];
  }, []);

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
        { label: "Demandes de paiement", href: "/br", icon: CreditCard },
        { label: "Inscriptions", href: "/br", icon: FileText },
        { label: "Sessions", href: "/br", icon: Calendar },
        { label: "Étudiants", href: "/br", icon: Users },
        { label: "Historique", href: "/br", icon: History },
        { label: "Profil", href: "/br", icon: UserCircle2 },
      ]}
    >
      <DashboardTitle title="Tableau de bord" color="#5f7f44" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Paiements" value={String(pendingCount)} subtitle="En attente" color="#5f7f44" />
        <StatCard title="Validations" value={String(validatedCount)} subtitle="Paiements validés" color="#5f7f44" />
        <StatCard title="Inscriptions" value={String(activeRegistrations)} subtitle="Actives" color="#5f7f44" />
        <StatCard title="Sessions" value={String(openSessions)} subtitle="Ouvertes" color="#5f7f44" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Demandes de paiement">
          <div className="space-y-3">
            {requests.slice(0, 5).map((r) => (
              <div key={r.id} className="rounded-2xl bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[#3f3732]">{r.full_name}</p>
                    <p className="text-sm text-[#8d8278]">{r.email}</p>
                    <p className="text-xs text-[#9b9086]">
                      {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(r.id, "rejected")}
                      className="rounded-xl border border-[#efc7c1] bg-[#fff5f3] px-3 py-2 text-xs font-semibold text-[#cf5d50]"
                    >
                      Refuser
                    </button>
                    <button
                      onClick={() => updateStatus(r.id, "validated")}
                      className="rounded-xl bg-[#6a8f4f] px-3 py-2 text-xs font-semibold text-white"
                    >
                      Valider
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Sessions ouvertes">
          <div className="space-y-3">
            {sessions.slice(0, 4).map((s) => (
              <div key={s.id} className="rounded-2xl bg-white p-4">
                <p className="font-semibold text-[#3f3732]">{s.title}</p>
                <p className="mt-1 text-sm text-[#8d8278]">
                  {new Date(s.starts_at).toLocaleString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Panel title="Statistiques">
          <div className="flex items-end gap-4">
            {monthlyBars.map((bar) => (
              <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-40 items-end gap-1">
                  <div
                    className="w-5 rounded-t-md"
                    style={{ height: `${bar.a * 10}px`, backgroundColor: "#6a8f4f" }}
                  />
                  <div
                    className="w-5 rounded-t-md"
                    style={{ height: `${bar.b * 10}px`, backgroundColor: "#b6c8a0" }}
                  />
                </div>
                <span className="text-xs text-[#8f857b]">{bar.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-5 text-xs text-[#70675f]">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#6a8f4f]" />
              Validés
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#b6c8a0]" />
              En attente
            </span>
          </div>
        </Panel>

        <Panel title="Raccourcis">
          <div className="grid gap-3">
            <MiniAction href="/br" label="Voir les inscriptions" />
            <MiniAction href="/br" label="Voir les étudiants" />
            <MiniAction href="/br" label="Exporter les données" />
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}