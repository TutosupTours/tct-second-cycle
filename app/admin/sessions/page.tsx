"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Session = {
  id: string;
  titre: string;
  description: string | null;
  promotion: string;
  parcours: string | null;
  date_session: string;
  heure_debut: string;
  heure_fin: string;
  lieu: string | null;
  capacite: number | null;
  statut: string;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    titre: "",
    description: "",
    promotion: "D2",
    parcours: "ECOS P",
    date_session: "",
    heure_debut: "",
    heure_fin: "",
    lieu: "",
    capacite: "0",
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  function handlePromotionChange(value: string) {
    setForm({
      ...form,
      promotion: value,
      parcours: value === "D2" ? "ECOS P" : "ECOS procéduraux simple",
    });
  }

  async function fetchSessions() {
    const { data, error } = await supabase
      .from("ecos_sessions")
      .select("*")
      .order("date_session", { ascending: true });

    if (error) {
      setMessage("Erreur chargement sessions : " + error.message);
      return;
    }

    setSessions((data as Session[]) || []);
  }

  async function createSession() {
    setLoading(true);
    setMessage("");

    if (!form.titre || !form.date_session || !form.heure_debut || !form.heure_fin) {
      setMessage("Merci de remplir titre, date, heure début et heure fin.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("ecos_sessions").insert({
      titre: form.titre,
      description: form.description || null,
      promotion: form.promotion,
      parcours: form.parcours,
      date_session: form.date_session,
      heure_debut: form.heure_debut,
      heure_fin: form.heure_fin,
      lieu: form.lieu || null,
      capacite: Number(form.capacite || 0),
      statut: "draft",
    });

    if (error) {
      setMessage("Erreur création session : " + error.message);
      setLoading(false);
      return;
    }

    setForm({
      titre: "",
      description: "",
      promotion: "D2",
      parcours: "ECOS P",
      date_session: "",
      heure_debut: "",
      heure_fin: "",
      lieu: "",
      capacite: "0",
    });

    setMessage("Session créée.");
    await fetchSessions();
    setLoading(false);
  }

  async function publishSession(id: string) {
    const { error } = await supabase
      .from("ecos_sessions")
      .update({ statut: "published" })
      .eq("id", id);

    if (error) {
      setMessage("Erreur publication : " + error.message);
      return;
    }

    setMessage("Session publiée.");
    fetchSessions();
  }

  async function unpublishSession(id: string) {
    const { error } = await supabase
      .from("ecos_sessions")
      .update({ statut: "draft" })
      .eq("id", id);

    if (error) {
      setMessage("Erreur dépublication : " + error.message);
      return;
    }

    setMessage("Session repassée en brouillon.");
    fetchSessions();
  }

  async function deleteSession(id: string) {
    const ok = confirm("Supprimer cette session ?");
    if (!ok) return;

    const { error } = await supabase
      .from("ecos_sessions")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage("Erreur suppression : " + error.message);
      return;
    }

    setMessage("Session supprimée.");
    fetchSessions();
  }

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-6 text-[#2f2f2f]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <a href="/admin" className="text-sm font-semibold text-[#6a8f4f]">
              ← Retour admin
            </a>
            <h1 className="mt-2 text-3xl font-bold">Sessions ECOS</h1>
            <p className="text-sm text-[#6f6a63]">
              Création, publication et gestion des sessions.
            </p>
          </div>
        </div>

        {message ? (
          <div className="mb-5 rounded-2xl bg-white p-4 text-sm font-semibold shadow">
            {message}
          </div>
        ) : null}

        <section className="mb-8 rounded-[28px] bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Créer une session</h2>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              placeholder="Titre de la session"
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              className="rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            />

            <input
              placeholder="Lieu"
              value={form.lieu}
              onChange={(e) => setForm({ ...form, lieu: e.target.value })}
              className="rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            />

            <select
              value={form.promotion}
              onChange={(e) => handlePromotionChange(e.target.value)}
              className="rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            >
              <option value="D2">D2</option>
              <option value="D4">D4</option>
            </select>

            <select
              value={form.parcours}
              onChange={(e) => setForm({ ...form, parcours: e.target.value })}
              className="rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            >
              {form.promotion === "D2" ? (
                <option value="ECOS P">ECOS P</option>
              ) : (
                <>
                  <option value="ECOS procéduraux simple">
                    ECOS procéduraux simple
                  </option>
                  <option value="Projet ESEE">Projet ESEE</option>
                </>
              )}
            </select>

            <input
              type="date"
              value={form.date_session}
              onChange={(e) => setForm({ ...form, date_session: e.target.value })}
              className="rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            />

            <input
              type="number"
              min="0"
              placeholder="Capacité"
              value={form.capacite}
              onChange={(e) => setForm({ ...form, capacite: e.target.value })}
              className="rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            />

            <input
              type="time"
              value={form.heure_debut}
              onChange={(e) => setForm({ ...form, heure_debut: e.target.value })}
              className="rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            />

            <input
              type="time"
              value={form.heure_fin}
              onChange={(e) => setForm({ ...form, heure_fin: e.target.value })}
              className="rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none"
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="min-h-[100px] rounded-2xl border border-[#ddd] bg-[#faf7f0] px-4 py-3 outline-none md:col-span-2"
            />
          </div>

          <button
            onClick={createSession}
            disabled={loading}
            className="mt-5 rounded-2xl bg-[#6a8f4f] px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Création..." : "Créer la session"}
          </button>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Sessions existantes</h2>

          {sessions.length === 0 ? (
            <p className="text-sm text-[#6f6a63]">Aucune session créée.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-[#eadfd2] bg-[#faf7f0] p-4"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <p className="text-lg font-bold">{s.titre}</p>
                      <p className="text-sm text-[#6f6a63]">
                        {s.promotion} · {s.parcours || "-"} · {s.date_session} ·{" "}
                        {s.heure_debut} - {s.heure_fin}
                      </p>
                      <p className="text-sm text-[#6f6a63]">
                        Lieu : {s.lieu || "-"} · Capacité : {s.capacite ?? 0}
                      </p>
                      <p className="mt-1 text-xs font-semibold">
                        Statut : {s.statut}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {s.statut === "draft" ? (
                        <button
                          onClick={() => publishSession(s.id)}
                          className="rounded-xl bg-[#6a8f4f] px-4 py-2 text-sm font-semibold text-white"
                        >
                          Publier
                        </button>
                      ) : (
                        <button
                          onClick={() => unpublishSession(s.id)}
                          className="rounded-xl bg-[#efc24d] px-4 py-2 text-sm font-semibold text-white"
                        >
                          Brouillon
                        </button>
                      )}

                      <button
                        onClick={() => deleteSession(s.id)}
                        className="rounded-xl bg-[#cf332b] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {s.description ? (
                    <p className="mt-3 text-sm text-[#4b463f]">{s.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}