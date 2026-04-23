"use client";

import { useUser } from "@/lib/useUser";

export const dynamic = "force-dynamic";

export default function ExaminateurPage() {
  const { user, profile, loading } = useUser();

  if (loading) return <main className="p-10">Chargement...</main>;
  if (!user) window.location.href = "/login?role=examinateur";

  return (
    <main className="min-h-screen bg-[#f5f0e5] p-8">
      <h1 className="text-4xl font-bold">Interface Examinateur</h1>
      <p className="mt-4">Email : {user?.email}</p>
      <p>Rôle : {profile?.role}</p>
      <a href="/logout" className="mt-6 inline-block rounded-xl bg-red-600 px-4 py-2 text-white">
        Se déconnecter
      </a>
    </main>
  );
}