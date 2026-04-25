import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { login_id } = await req.json()

    if (!login_id) {
      return new Response(
        JSON.stringify({ error: 'Identifiant requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } }
      }
    )

    // Try to find user in different tables based on role
    let user = null
    let role = null

    // Check examiners
    const { data: examiner } = await supabaseClient
      .from('examiners')
      .select('*, profiles(email)')
      .eq('login_id', login_id.toLowerCase())
      .eq('is_active', true)
      .single()

    if (examiner) {
      user = examiner
      role = 'examiner'
    }

    // Check faculty
    if (!user) {
      const { data: facultyMember } = await supabaseClient
        .from('faculty')
        .select('*, profiles(email)')
        .eq('login_id', login_id.toLowerCase())
        .eq('is_active', true)
        .single()

      if (facultyMember) {
        user = facultyMember
        role = 'faculty'
      }
    }

    // Check BR members
    if (!user) {
      const { data: brMember } = await supabaseClient
        .from('br_members')
        .select('*, profiles(email)')
        .eq('login_id', login_id.toLowerCase())
        .eq('is_active', true)
        .single()

      if (brMember) {
        user = brMember
        role = 'br'
      }
    }

    // Check admin (profiles table)
    if (!user) {
      const { data: admin } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .eq('is_active', true)
        .single()

      if (admin) {
        user = admin
        role = 'admin'
      }
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Identifiant introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return user data for authentication
    const userData = {
      login_id: login_id.toLowerCase(),
      email: user.email || user.profiles?.email,
      role: role,
      first_name: user.first_name,
      last_name: user.last_name,
      id: user.id
    }

    return new Response(
      JSON.stringify({
        success: true,
        staff: userData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in staff-login:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})