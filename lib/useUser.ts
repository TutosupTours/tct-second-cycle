"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export type AppProfile = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "br" | "examiner" | "student" | "faculty";
  level?: string | null;
  program?: string | null;
  is_active?: boolean | null;
  photo_url?: string | null;
  phone?: string | null;
  student_number?: string | null;
  year_label?: string | null;
  examiner_category?: string | null;
  examiner_grade?: string | null;
};

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function getUser() {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setUser(session.user);

    const { data, error } = await supabase.rpc("get_current_profile");

    if (error || !data) {
      console.error("Erreur récupération profil:", error);
      setProfile(null);
      setLoading(false);
      return;
    }

    setProfile(data as AppProfile);
    setLoading(false);
  }

  return {
    user,
    profile,
    loading,
  };
}