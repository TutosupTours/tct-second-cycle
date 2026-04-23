"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@/lib/useUser";

export const dynamic = "force-dynamic";

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
  const { user, profile, loading: userLoading } = useUser();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = "/login?role=br";
      return;
    }

    if (user) fetchRequests();
  }, [user, userLoading]);

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

    if (!error) fetchRequests();
  }

  async function rejectRequest(id: string) {
    const { error } = await supabase
      .from("student_requests")
      .update({ payment_status: "rejected" })
      .eq("id", id);

    if (!error) fetchRequests();
  }

  if (userLoading) return <main className="p-10">Chargement...</main>;

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#2f2f2f]">Interface BR</h1>
          <p className="mt-2 text-sm text-[#666]">
            {user?.email} · rôle : {profile?.role}
          </p>
        </div>
        <a href="/logout" className="rounded-xl bg-red-600 px-4 py-2 text-white">
          Se déconnecter
        </a>
      </div>

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