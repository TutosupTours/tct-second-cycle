import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude Supabase functions from build
  serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;
