"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useUser } from "@/lib/useUser";

export default function ExaminateurPage() {
  const { user, profile, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login?role=examinateur";
      return;
    }

    if (!loading && user && profile && profile.role !== "examiner") {
      window.location.href = "/";
    }
  }, [user, profile, loading]);

  if (loading) {
    return <main className="p-10">Chargement...</main>;
  }

  if (!user || !profile || profile.role !== "examiner") {
    return <main className="p-10">Redirection...</main>;
  }

  return (
    <main className="min-h-screen bg-[#efe8d7] p-8">
      <h1 className="text-4xl font-bold">Interface Examinateur</h1>
      <p className="mt-4">{profile.full_name}</p>
      <p>{profile.email}</p>
      <p>Rôle : {profile.role}</p>
      <a href="/logout" className="mt-6 inline-block rounded-xl bg-red-600 px-4 py-2 text-white">
        Se déconnecter
      </a>
    </main>
  );
}