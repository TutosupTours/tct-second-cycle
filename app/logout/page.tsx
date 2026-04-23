"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutPage() {
  useEffect(() => {
    async function doLogout() {
      await supabase.auth.signOut();
      window.location.href = "/";
    }

    doLogout();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f0e5] px-4">
      <div className="rounded-[28px] bg-white p-8 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
        <p className="text-lg text-[#2f2f2f]">Déconnexion...</p>
      </div>
    </main>
  );
}
