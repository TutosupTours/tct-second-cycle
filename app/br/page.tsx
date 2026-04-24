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
  RefreshCw,
  Send,
} from "lucide-react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import DashboardShell, {
  DashboardTitle,
  Panel,
  StatCard,
} from "@/components/dashboard-shell";

type RequestItem = {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string;
  telephone: string | null;
  ville: string | null;
  promotion: string | null;
  parcours: string | null;
  statut: string;
  paiement_verifie: boolean;
  created_at: string;
};

type SessionItem = {
  id: string;
  title: string;
  starts_at: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://tct-second-cycle.vercel.app";

export default function BRPage() {
  const { user, profile, loading } = useUser();

  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

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
    setMessage("");

    const [requestsRes, sessionsRes] = await Promise.all([
      supabase
        .from("inscription_requests")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("sessions")
        .select("id, title, starts_at")
        .order("starts_at", { ascending: true }),
    ]);

    if (requestsRes.error) {
      setMessage("Erreur lors du chargement des demandes.");
      setRequests([]);
    } else {
      setRequests((requestsRes.data as RequestItem[]) || []);
    }

    if (!sessionsRes.error) {
      setSessions((sessionsRes.data as SessionItem[]) || []);
    }

    setPageLoading(false);
  }

  async function markPaymentOk(requestId: string) {
    setMessage("");

    const { error } = await supabase
      .from("inscription_requests")
      .update({
        paiement_verifie: true,
        statut: "payment_verified",
      })
      .eq("id", requestId);

    if (error) {
      alert("Erreur paiement : " + error.message);
      setMessage("Erreur lors de la validation du paiement.");
      return;
    }

    alert("Paiement marqué comme vérifié.");
    setMessage("Paiement marqué comme vérifié.");
    loadDashboard();
  }

  async function approveRequest(request: RequestItem) {
    setMessage("");

    if (!request.paiement_verifie) {
      alert("Impossible de valider : paiement non vérifié.");
      setMessage("Impossible de valider : paiement non vérifié.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token || SUPABASE_ANON_KEY;

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/approve-inscription`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: request.id,
          site_base_url: `${SITE_URL}/activation`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Erreur approve-inscription:", data);
        alert("Erreur envoi mail : " + JSON.stringify(data));
        setMessage("Erreur lors de l’envoi du mail d’activation.");
        return;
      }

      alert("Mail d’activation envoyé.");
      setMessage(`Mail d’activation envoyé à ${request.email}.`);
      loadDashboard();
    } catch (error) {
      console.error(error);
      alert("Erreur réseau ou serveur.");
      setMessage("Erreur réseau ou serveur.");
    }
  }

  async function resendActivation(request: RequestItem) {
    await approveRequest(request);
  }

  async function rejectRequest(requestId: string) {
    setMessage("");

    const { error } = await supabase
      .from("inscription_requests")
      .update({
        statut: "rejected",
      })
      .eq("id", requestId);

    if (error) {
      alert("Erreur refus : " + error.message);
      setMessage("Erreur lors du refus de la demande.");
      return;
    }

    alert("Demande refusée.");
    setMessage("Demande refusée.");
    loadDashboard();
  }

  const filteredRequests = useMemo(() => {
    if (filter === "all") return requests;
    return requests.filter((r) => r.statut === filter);
  }, [requests, filter]);

  const pendingCount = requests.filter((r) => r.statut === "pending_review").length;
  const paymentVerifiedCount = requests.filter(
    (r) => r.statut === "payment_verified"
  ).length;
  const activationSentCount = requests.filter(
    (r) => r.statut === "activation_sent"
  ).length;
  const activeCount = requests.filter((r) => r.statut === "active").length;
  const rejectedCount = requests.filter((r) => r.statut === "rejected").length;

  if (loading || pageLoading) return <p>Chargement...</p>;
  if (!user || !profile || profile.role !== "br") return <p>Redirection...</p>;

  return (
    <DashboardShell
      roleLabel="BR"
      userName={profile.full_name || profile.email || "Bureau"}
      topColor="#f7f1e8"
      accentColor="#6a8f4f"
      lightAccent="#eef5e8"
      avatarUrl={profile.photo_url}
      activePath="/br"
      navItems={[
        { label: "Dashboard", href: "/br", icon: LayoutDashboard },
        { label: "Demandes", href: "/br", icon: FileText },
        { label: "Sessions", href: "/br/sessions", icon: Calendar },
        { label: "Étudiants", href: "/br/students", icon: Users },
        { label: "Historique", href: "/br/history", icon: History },
        { label: "Profil", href: "/profile", icon: UserCircle2 },
      ]}
    >
      <DashboardTitle
        title="Interface BR"
        subtitle="Gestion des demandes d’inscription, paiements et activations étudiants."
      />

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard title="En attente" value={String(pendingCount)} subtitle="Demandes à vérifier" />
        <StatCard title="Paiement OK" value={String(paymentVerifiedCount)} subtitle="Prêtes à valider" />
        <StatCard title="Activation envoyée" value={String(activationSentCount)} subtitle="Mail envoyé" />
        <StatCard title="Actifs" value={String(activeCount)} subtitle="Comptes activés" />
        <StatCard title="Refusés" value={String(rejectedCount)} subtitle="Demandes rejetées" />
      </div>

      <Panel title="Demandes d’inscription" rightText={`${filteredRequests.length} demande(s)`}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-[#eadfd2] bg-white px-3 py-2 text-sm text-[#3f3a32]"
          >
            <option value="all">Toutes</option>
            <option value="pending_review">En attente</option>
            <option value="payment_verified">Paiement vérifié</option>
            <option value="activation_sent">Activation envoyée</option>
            <option value="active">Actifs</option>
            <option value="rejected">Refusés</option>
          </select>

          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-2 rounded-xl border border-[#d9cbbb] bg-white px-3 py-2 text-sm font-semibold text-[#6a8f4f]"
          >
            <RefreshCw size={16} />
            Rafraîchir
          </button>
        </div>

        {filteredRequests.length === 0 ? (
          <p className="text-sm text-[#8d8172]">Aucune demande pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-[#eadfd2] bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <h3 className="text-base font-bold text-[#3f3a32]">
                      {r.prenom || ""} {r.nom || ""}
                    </h3>
                    <p className="text-sm text-[#8d8172]">{r.email}</p>
                    {r.telephone ? (
                      <p className="text-sm text-[#8d8172]">{r.telephone}</p>
                    ) : null}
                    <p className="mt-2 text-sm text-[#5f574c]">
                      {r.promotion || "Promotion non renseignée"} ·{" "}
                      {r.parcours || "Parcours non renseigné"}
                    </p>
                    <p className="text-xs text-[#a2978a]">
                      Demande créée le {new Date(r.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 md:items-end">
                    <StatusBadge statut={r.statut} />
                    <span className="text-xs font-semibold text-[#5f574c]">
                      Paiement : {r.paiement_verifie ? "OK" : "non vérifié"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {r.statut === "active" ? (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-[#eef5e8] px-3 py-2 text-xs font-semibold text-[#6a8f4f]">
                      <CheckCircle2 size={16} />
                      Compte activé
                    </span>
                  ) : r.statut === "rejected" ? (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-[#fff5f3] px-3 py-2 text-xs font-semibold text-[#cf5d50]">
                      <XCircle size={16} />
                      Demande refusée
                    </span>
                  ) : (
                    <>
                      {!r.paiement_verifie ? (
                        <button
                          onClick={() => markPaymentOk(r.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#6a8f4f] px-3 py-2 text-xs font-semibold text-white"
                        >
                          <CreditCard size={16} />
                          Paiement OK
                        </button>
                      ) : null}

                      {r.paiement_verifie ? (
                        <>
                          <button
                            onClick={() => approveRequest(r)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#6a8f4f] px-3 py-2 text-xs font-semibold text-white"
                          >
                            <Send size={16} />
                            Valider et envoyer le mail
                          </button>

                          <button
                            onClick={() => resendActivation(r)}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#d9cbbb] bg-white px-3 py-2 text-xs font-semibold text-[#6a8f4f]"
                          >
                            <KeyRound size={16} />
                            Renvoyer le lien
                          </button>
                        </>
                      ) : null}

                      <button
                        onClick={() => rejectRequest(r.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#efc7c1] bg-[#fff5f3] px-3 py-2 text-xs font-semibold text-[#cf5d50]"
                      >
                        <XCircle size={16} />
                        Refuser
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Prochaines sessions">
        {sessions.length === 0 ? (
          <p className="text-sm text-[#8d8172]">Aucune session programmée.</p>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 4).map((s) => (
              <div key={s.id} className="rounded-xl border border-[#eadfd2] bg-white p-3">
                <p className="text-sm font-semibold text-[#3f3a32]">{s.title}</p>
                <p className="text-xs text-[#8d8172]">
                  {new Date(s.starts_at).toLocaleString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {message ? (
        <div className="rounded-2xl border border-[#eadfd2] bg-[#fffaf4] p-4 text-sm font-semibold text-[#5f574c]">
          {message}
        </div>
      ) : null}
    </DashboardShell>
  );
}

function StatusBadge({ statut }: { statut: string }) {
  const label =
    statut === "pending_review"
      ? "En attente"
      : statut === "payment_verified"
      ? "Paiement vérifié"
      : statut === "activation_sent"
      ? "Activation envoyée"
      : statut === "active"
      ? "Actif"
      : statut === "rejected"
      ? "Refusé"
      : statut;

  const className =
    statut === "active"
      ? "bg-[#eef5e8] text-[#6a8f4f]"
      : statut === "rejected"
      ? "bg-[#fff5f3] text-[#cf5d50]"
      : "bg-[#f7f1e8] text-[#7b6d5d]";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}