import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

function generateLoginId(prenom: string, nom: string) {
  return (prenom + nom.slice(0, 2)).toLowerCase();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { request_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // récupérer la demande
    const { data: request, error } = await supabase
      .from("inscription_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (error || !request) {
      throw new Error("Demande introuvable");
    }

    // générer login_id
    const login_id = generateLoginId(request.prenom, request.nom);

    // générer token
    const token = crypto.randomUUID();

    // stocker token
    await supabase.from("activation_tokens").insert({
      inscription_request_id: request.id,
      token,
      account_type: request.account_type,
    });

    // update demande
    await supabase
      .from("inscription_requests")
      .update({
        statut: "approved",
        approved_at: new Date().toISOString(),
        login_id,
      })
      .eq("id", request.id);

    return new Response(
      JSON.stringify({
        success: true,
        activation_link: `/activation?token=${token}`,
        login_id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

