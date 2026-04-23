"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import {
  CheckCircle,
  Clock,
  LogOut,
  Search,
  Users,
  XCircle,
} from "lucide-react";

type Request = {
  id: string;
  full_name: string;
  email: string;
  level: string;
  program: string;
  payment_status: string;
  created_at: string;
};

export default function BRPage() {
  const { user, profile, loading } = useUser();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState("");

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
      loadRequests();
    }
  }, [user, profile, loading]);

  async function loadRequests() {
    setLoadingData(true);

    const { data, error } = await supabase
      .from("student_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setRequests((data as Request[]) || []);
    setLoadingData(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("student_requests")
      .update({ payment_status: status })
      .eq("id", id);

    if (!error) loadRequests();
  }

  const filteredRequests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;

    return requests.filter((r) =>
      `${r.full_name} ${r.email} ${r.level} ${r.program} ${r.payment_status}`
        .toLowerCase()
        .includes(q)
    );
  }, [search, requests]);

  const pendingCount = requests.filter((r) => r.payment_status === "pending").length;
  const validatedCount = requests.filter((r) => r.payment_status === "validated").length;
  const rejectedCount = requests.filter((r) => r.payment_status === "rejected").length;

  if (loading || loadingData) {
    return <main className="p-10">Chargement...</main>;
  }

  if (!user || !profile || profile.role !== "br") {
    return <main className="p-10">Redirection...</main>;
  }

  return (
    <main className="min-h-screen bg-[#efe8d7] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[30px] bg-white p-6 shadow">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2f2f2f]">Interface BR</h1>
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

        <section className="grid gap-6 md:grid-cols-4">
          <StatCard title="Demandes" value={String(requests.length)} />
          <StatCard title="En attente" value={String(pendingCount)} />
          <StatCard title="Validées" value={String(validatedCount)} />
          <StatCard title="Refusées" value={String(rejectedCount)} />
        </section>

        <section className="rounded-[30px] bg-white p-6 shadow">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-[#7c9c56]" />
              <h2 className="text-2xl font-semibold">Demandes d'inscription</h2>
            </div>

            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher"
                className="w-full rounded-2xl border border-[#ddd] bg-[#faf7f0] py-3 pl-10 pr-4 outline-none"
              />
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <p>Aucune demande pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col gap-4 rounded-[24px] bg-[#faf7f0] p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <p className="text-xl font-semibold text-[#2f2f2f]">{req.full_name}</p>
                    <p className="text-sm text-gray-600">{req.email}</p>
                    <p className="mt-1 text-sm text-[#666]">
                      {req.level} · {req.program}
                    </p>
                    <p className="mt-1 text-xs text-[#888]">
                      {new Date(req.created_at).toLocaleString("fr-FR")}
                    </p>
                    <div className="mt-3">
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-[#555] shadow-sm">
                        Statut : {req.payment_status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateStatus(req.id, "validated")}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-white"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Valider
                    </button>

                    <button
                      onClick={() => updateStatus(req.id, "rejected")}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white"
                    >
                      <XCircle className="h-4 w-4" />
                      Refuser
                    </button>

                    <button
                      onClick={() => updateStatus(req.id, "pending")}
                      className="inline-flex items-center gap-2 rounded-xl bg-gray-500 px-4 py-2 text-white"
                    >
                      <Clock className="h-4 w-4" />
                      Reset
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white p-5 shadow">
      <p className="text-sm text-[#777]">{title}</p>
      <p className="mt-2 text-3xl font-bold text-[#2f2f2f]">{value}</p>
    </div>
  );
}