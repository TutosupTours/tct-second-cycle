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
    const { login_id, pin } = await req.json()

    if (!login_id || !pin) {
      return new Response(
        JSON.stringify({ error: 'Identifiant et PIN requis' }),
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

    // Find student by login_id
    const { data: student, error: studentError } = await supabaseClient
      .from('students')
      .select('*')
      .eq('student_number', login_id.toLowerCase())
      .eq('is_active', true)
      .single()

    if (studentError || !student) {
      return new Response(
        JSON.stringify({ error: 'Identifiant invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify PIN (in production, this should be hashed)
    // For now, we'll assume PIN is stored as plain text for simplicity
    // TODO: Implement proper PIN hashing
    if (student.pin !== pin) {
      return new Response(
        JSON.stringify({ error: 'PIN incorrect' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return student data (excluding sensitive information)
    const studentData = {
      id: student.id,
      student_number: student.student_number,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      promotion: student.promotion,
      niveau: student.niveau,
      year_label: student.year_label
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: studentData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in student-login:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})