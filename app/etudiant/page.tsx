"use client";

export const dynamic = "force-dynamic";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Calendar,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MapPinned,
  Upload,
  UserCircle2,
} from "lucide-react";
import { useUser } from "@/lib/useUser";
import { supabase } from "@/lib/supabaseClient";
import DashboardShell, {
  DashboardTitle,
  MiniAction,
  Panel,
  StatCard,
} from "@/components/dashboard-shell";

type RotationItem = {
  id: string;
  scheduled_at: string;
  order_index: number;
  session_id: string;
};

type SessionItem = {
  id: string;
  title: string;
  starts_at: string;
  location: string;
};

type ResultItem = {
  id: string;
  global_score: number | null;
  evaluated_at: string;
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

  const [rotations, setRotations] = useState<RotationItem[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [details, setDetails] = useState<ResultDetailItem[]>([]);
  const [criteria, setCriteria] = useState<FormCriterion[]>([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login?role=etudiant";
      return;
    }
    if (!loading && user && profile?.role !== "student") {
      window.location.href = "/";
      return;
    }
    if (user && profile?.role === "student") {
      loadDashboard();
    }
  }, [user, profile, loading]);

  async function loadDashboard() {
    setPageLoading(true);

    const [rotationsRes, sessionsRes, resultsRes, notificationsRes] = await Promise.all([
      supabase
        .from("room_rotations")
        .select("*")
        .eq("student_profile_id", user.id)
        .order("scheduled_at", { ascending: true }),
      supabase.from("sessions").select("id, title, starts_at, location"),
      supabase
        .from("evaluation_results")
        .select("id, global_score, evaluated_at")
        .eq("student_profile_id", user.id)
        .eq("status", "published")
        .order("evaluated_at", { ascending: false }),
      supabase
        .from("notifications")
        .select("id")
        .eq("profile_id", user.id)
        .eq("is_read", false),
    ]);

    if (!rotationsRes.error) setRotations((rotationsRes.data as RotationItem[]) || []);
    if (!sessionsRes.error) setSessions((sessionsRes.data as SessionItem[]) || []);
    if (!resultsRes.error) {
      const loaded = (resultsRes.data as ResultItem[]) || [];
      setResults(loaded);
      if (loaded[0]) {
        loadResultDetails(loaded[0].id);
      }
    }
    if (!notificationsRes.error) {
      setNotificationsCount(notificationsRes.data?.length || 0);
    }

    setPageLoading(false);
  }

  async function loadResultDetails(resultId: string) {
    setSelectedResultId(resultId);

    const detailsRes = await supabase
      .from("evaluation_result_items")
      .select("*")
      .eq("result_id", resultId);

    if (detailsRes.error) {
      setDetails([]);
      setCriteria([]);
      return;
    }

    const loadedDetails = (detailsRes.data as ResultDetailItem[]) || [];
    setDetails(loadedDetails);

    const ids = loadedDetails.map((d) => d.form_item_id);
    if (ids.length === 0) {
      setCriteria([]);
      return;
    }

    const criteriaRes = await supabase
      .from("evaluation_form_items")
      .select("*")
      .in("id", ids)
      .order("sort_order", { ascending: true });

    if (!criteriaRes.error) {
      setCriteria((criteriaRes.data as FormCriterion[]) || []);
    }
  }

  async function handlePhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setPhotoUploading(true);
    setPhotoMessage("");

    const fileExt = file.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/avatar.${fileExt}`;

    const uploadRes = await supabase.storage
      .from("profile-photos")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadRes.error) {
      setPhotoMessage("Erreur lors de l’envoi de la photo.");
      setPhotoUploading(false);
      return;
    }

    const publicUrlRes = supabase.storage
      .from("profile-photos")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlRes.data.publicUrl;

    const updateRes = await supabase
      .from("profiles")
      .update({ photo_url: publicUrl })
      .eq("id", user.id);

    if (updateRes.error) {
      setPhotoMessage("Photo envoyée, mais profil non mis à jour.");
      setPhotoUploading(false);
      return;
    }

    setPhotoMessage("Photo mise à jour avec succès.");
    setPhotoUploading(false);
    window.location.reload();
  }

  const nextSessions = useMemo(() => {
    return rotations.slice(0, 3).map((r) => {
      const session = sessions.find((s) => s.id === r.session_id);
      return {
        ...r,
        title: session?.title || "Session",
      };
    });
  }, [rotations, sessions]);

  if (loading || pageLoading) return <main className="p-10">Chargement...</main>;
  if (!user || !profile || profile.role !== "student") return <main className="p-10">Redirection...</main>;

  return (
    <DashboardShell
      roleLabel="Étudiant"
      userName={profile.full_name || "Étudiant"}
      topColor="#de9aa0"
      accentColor="#e7a9ae"
      lightAccent="#f8dce0"
      avatarUrl={profile.photo_url || null}
      activePath="/etudiant"
      navItems={[
        { label: "Tableau de bord", href: "/etudiant", icon: LayoutDashboard },
        { label: "Mes inscriptions", href: "/etudiant", icon: Calendar },
        { label: "Mes évaluations", href: "/etudiant", icon: FileText },
        { label: "Résultats", href: "/etudiant", icon: GraduationCap },
        { label: "Mon parcours", href: "/etudiant", icon: MapPinned },
        { label: "Profil", href: "/etudiant", icon: UserCircle2 },
      ]}
    >
      <DashboardTitle title="Tableau de bord" color="#d88088" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Inscriptions" value={String(rotations.length)} subtitle="Actives" color="#d88088" />
        <StatCard title="Évaluations" value={String(results.length)} subtitle="Reçues" color="#d88088" />
        <StatCard title="Notifications" value={String(notificationsCount)} subtitle="Non lues" color="#d88088" />
        <StatCard title="Sessions" value={String(nextSessions.length)} subtitle="À venir" color="#d88088" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Mon profil">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-[#f0d0d4] bg-white">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[#d88088]">
                  {profile.full_name?.slice(0, 1)?.toUpperCase() || "E"}
                </div>
              )}
            </div>

            <div>
              <p className="text-lg font-semibold text-[#3f3732]">{profile.full_name}</p>
              <p className="text-sm text-[#8d8278]">{profile.email}</p>
              <p className="mt-1 text-sm text-[#8d8278]">
                {profile.level || "Niveau à compléter"} · {profile.program || "Programme à compléter"}
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[#7d7369] shadow-sm">
              <Upload className="h-4 w-4" />
              {photoUploading ? "Envoi..." : "Ajouter / changer ma photo"}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>

            {photoMessage ? <p className="text-sm text-[#8b8177]">{photoMessage}</p> : null}
          </div>
        </Panel>

        <Panel title="Mes prochaines sessions">
          <div className="space-y-3">
            {nextSessions.length === 0 ? (
              <p className="text-sm text-[#8d8278]">Aucune session à venir.</p>
            ) : (
              nextSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4">
                  <div>
                    <p className="font-semibold text-[#3f3732]">{s.title}</p>
                    <p className="text-sm text-[#8d8278]">
                      {new Date(s.scheduled_at).toLocaleString("fr-FR")}
                    </p>
                    <p className="text-sm text-[#8d8278]">Ordre de passage : {s.order_index}</p>
                  </div>
                  <span className="rounded-full bg-[#f8dce0] px-3 py-1 text-xs font-semibold text-[#d88088]">
                    Détails
                  </span>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Mes évaluations">
          <div className="space-y-3">
            {results.length === 0 ? (
              <p className="text-sm text-[#8d8278]">Aucun résultat publié pour le moment.</p>
            ) : (
              results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => loadResultDetails(r.id)}
                  className={`w-full rounded-2xl p-4 text-left ${
                    selectedResultId === r.id ? "bg-[#f8dce0]" : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#3f3732]">
                        {new Date(r.evaluated_at).toLocaleDateString("fr-FR")}
                      </p>
                      <p className="text-sm text-[#8d8278]">Fiche publiée</p>
                    </div>
                    <span className="text-lg font-bold text-[#d88088]">
                      {r.global_score ?? "--"}/20
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Fiche récapitulative">
          {details.length === 0 ? (
            <p className="text-sm text-[#8d8278]">Sélectionne une évaluation pour voir le détail.</p>
          ) : (
            <div className="space-y-3">
              {criteria.map((criterion) => {
                const detail = details.find((d) => d.form_item_id === criterion.id);
                return (
                  <div key={criterion.id} className="rounded-2xl bg-white p-4">
                    <p className="font-semibold text-[#3f3732]">{criterion.label}</p>
                    <p className="mt-1 text-xs text-[#998e84]">
                      {criterion.item_type} {criterion.max_score !== null ? `· ${criterion.max_score} pt max` : ""}
                    </p>
                    <div className="mt-3 text-sm text-[#6e655d]">
                      {criterion.item_type === "checkbox" ? (
                        <p>Validation : {detail?.checked ? "Oui" : "Non"}</p>
                      ) : null}
                      {criterion.item_type === "score" ? (
                        <p>Score : {detail?.score ?? 0}</p>
                      ) : null}
                      {criterion.item_type === "text" ? (
                        <p>Commentaire : {detail?.text_value || "Aucun commentaire"}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Accès rapide">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MiniAction href="/etudiant" label="Mes résultats" />
            <MiniAction href="/etudiant" label="Calendrier des sessions" />
            <MiniAction href="/etudiant" label="Mon profil" />
            <MiniAction href="/etudiant" label="Mes ressources" />
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}