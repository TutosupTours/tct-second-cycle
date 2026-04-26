"use client";

import { useEffect, useState } from "react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function BRPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [link, setLink] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/inscription_requests?statut=eq.pending`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    const data = await res.json();
    setRequests(data);
  }

  async function approve(id: string) {
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

    if (result.activation_link) {
      setLink(result.activation_link);
      fetchRequests();
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Demandes d'inscription</h1>

      {requests.map((r) => (
        <div key={r.id} className="border p-4 mb-2">
          <p>
            {r.prenom} {r.nom} - {r.email}
          </p>

          <button
            onClick={() => approve(r.id)}
            className="bg-green-600 text-white px-3 py-1 mt-2"
          >
            Valider
          </button>
        </div>
      ))}

      {link && (
        <div className="mt-4 p-4 bg-green-100">
          🔗 Lien d'activation :
          <br />
          <a href={link}>{link}</a>
        </div>
      )}
    </div>
  );
}
