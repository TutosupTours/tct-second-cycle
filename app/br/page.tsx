"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);

    const { data, error } = await supabase
      .from("student_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setRequests([]);
      setLoading(false);
      return;
    }

    setRequests(data || []);
    setLoading(false);
  }

  async function validateRequest(id: string) {
    const { error } = await supabase
      .from("student_requests")
      .update({ payment_status: "validated" })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    fetchRequests();
  }

  async function rejectRequest(id: string) {
    const { error } = await supabase
      .from("student_requests")
      .update({ payment_status: "rejected" })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    fetchRequests();
  }

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-8">
      <h1 className="text-4xl font-bold text-[#2f2f2f] mb-6">
        Interface BR – Demandes d'inscription
      </h1>

      {loading ? (
        <p>Chargement...</p>
      ) : requests.length === 0 ? (
        <p>Aucune demande pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl bg-white p-6 shadow flex justify-between items-center"
            >
              <div>
                <p className="text-xl font-semibold">{req.full_name}</p>
                <p className="text-sm text-gray-600">{req.email}</p>
                <p className="text-sm mt-1">
                  {req.level} · {req.program}
                </p>
                <p className="text-sm mt-1 text-gray-500">
                  {new Date(req.created_at).toLocaleString("fr-FR")}
                </p>
                <p className="mt-2 text-sm font-medium">
                  Statut : {req.payment_status}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => validateRequest(req.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl"
                >
                  Valider
                </button>

                <button
                  onClick={() => rejectRequest(req.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl"
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}