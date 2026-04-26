"use client";

import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type RequestItem = {
  id: string;
  account_type: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  niveau_etudes: string | null;
  formule: string | null;
  br_role: string | null;
  examiner_session_type: string | null;
  examiner_category: string | null;
  statut: string;
  created_at: string;
};

export default function BRPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activationLink, setActivationLink] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/inscription_requests?statut=eq.pending&select=*&order=created_at.desc`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(JSON.stringify(data));
      }

      setRequests(data || []);
    } catch (error: any) {
      setMessage("Erreur chargement demandes : " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function approveRequest(id: string) {
    setMessage("");
    setActivationLink("");

    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/approve-registration-request`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ request_id: id }),
        }
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Erreur validation.");
      }

      const fullLink = `${window.location.origin}${result.activation_link}`;

      setActivationLink(fullLink);
      setMessage(`Demande validée. Identifiant : ${result.login_id}`);
      fetchRequests();
    } catch (error: any) {
      setMessage("Erreur validation : " + error.message);
    }
  }

  function accountLabel(type: string) {
    if (type === "student") return "Étudiant";
    if (type === "examiner") return "Examinateur";
    if (type === "br") return "BR";
    if (type === "faculty") return "Faculté";
    if (type === "admin") return "Admin";
    return type;
  }

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-6 text-[#2f2f2f]">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[28px] bg-white p-6 shadow">
          <h1 className="text-3xl font-bold">Interface BR</h1>
          <p className="mt-2 text-sm text-[#666]">
            Validation des demandes d’inscription.
          </p>
        </section>

        {message ? (
          <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold shadow">
            {message}
          </div>
        ) : null}

        {activationLink ? (
          <div className="mt-4 rounded-2xl bg-[#edf5e6] p-4 shadow">
            <p className="font-bold text-[#2f4d1f]">Lien d’activation :</p>
            <a
              href={activationLink}
              className="mt-2 block break-all text-sm font-semibold text-blue-700 underline"
            >
              {activationLink}
            </a>
          </div>
        ) : null}

        <section className="mt-6 rounded-[28px] bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Demandes en attente</h2>

            <button
              onClick={fetchRequests}
              className="rounded-xl bg-[#6a8f4f] px-4 py-2 text-sm font-semibold text-white"
            >
              Actualiser
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Chargement...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-gray-500">
              Aucune demande en attente.
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-[#eadfd2] bg-[#faf7f0] p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-bold">
                        {request.prenom} {request.nom}
                      </p>

                      <p className="text-sm text-gray-600">
                        {request.email}
                      </p>

                      <p className="mt-2 text-sm">
                        <strong>Type :</strong>{" "}
                        {accountLabel(request.account_type)}
                      </p>

                      {request.telephone ? (
                        <p className="text-sm">
                          <strong>Téléphone :</strong> {request.telephone}
                        </p>
                      ) : null}

                      {request.niveau_etudes ? (
                        <p className="text-sm">
                          <strong>Niveau :</strong> {request.niveau_etudes}
                        </p>
                      ) : null}

                      {request.formule ? (
                        <p className="text-sm">
                          <strong>Formule :</strong> {request.formule}
                        </p>
                      ) : null}

                      {request.br_role ? (
                        <p className="text-sm">
                          <strong>Rôle BR :</strong> {request.br_role}
                        </p>
                      ) : null}

                      {request.examiner_session_type ? (
                        <p className="text-sm">
                          <strong>Session examinateur :</strong>{" "}
                          {request.examiner_session_type}
                        </p>
                      ) : null}

                      {request.examiner_category ? (
                        <p className="text-sm">
                          <strong>Catégorie :</strong>{" "}
                          {request.examiner_category}
                        </p>
                      ) : null}
                    </div>

                    <button
                      onClick={() => approveRequest(request.id)}
                      className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white"
                    >
                      Valider
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
