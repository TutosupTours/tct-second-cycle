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
    const {
      first_name,
      last_name,
      email,
      phone,
      promotion,
      niveau
    } = await req.json()

    // Validation
    if (!first_name || !last_name || !email || !promotion || !niveau) {
      return new Response(
        JSON.stringify({ error: 'Tous les champs obligatoires doivent être remplis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Adresse email invalide' }),
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

    // Check if email already exists
    const { data: existingStudent } = await supabaseClient
      .from('students')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingStudent) {
      return new Response(
        JSON.stringify({ error: 'Un étudiant avec cette adresse email existe déjà' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate student number (you might want to customize this logic)
    const year = new Date().getFullYear()
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const studentNumber = `${promotion}${year}${randomNum}`

    // Generate temporary PIN (6 digits)
    const pin = Math.floor(Math.random() * 900000 + 100000).toString()

    // Create student record
    const { data: student, error: insertError } = await supabaseClient
      .from('students')
      .insert({
        student_number: studentNumber,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim(),
        promotion: promotion.trim(),
        niveau: niveau.trim(),
        pin: pin, // TODO: Hash this in production
        is_active: false // Will be activated after BR validation
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création du compte' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // TODO: Send activation email with student number and PIN
    // For now, we'll return the credentials (in production, send via email)
    const registrationData = {
      student_number: studentNumber,
      pin: pin,
      message: 'Inscription réussie. Vos identifiants ont été envoyés par email.'
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: registrationData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in student-registration:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})