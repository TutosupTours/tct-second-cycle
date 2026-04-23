"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "br" | "examiner" | "student";
  level?: string | null;
  program?: string | null;
};

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser();

    const { data } = supabase.auth.onAuthStateChange(() => {
      getCurrentUser();
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function getCurrentUser() {
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

    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      setProfile(null);
    } else {
      setProfile(profileData as Profile | null);
    }

    setLoading(false);
  }

  return { user, profile, loading };
}