import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface StaffRegistrationRequest {
  account_type: 'examiner' | 'br' | 'faculty' | 'admin';
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  category?: string;
  specialty?: string;
  grade?: string;
  region?: string;
  department?: string;
  position?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { account_type, first_name, last_name, email, phone, ...additionalData }: StaffRegistrationRequest = await req.json();

    // Validation de base
    if (!first_name || !last_name || !email || !account_type) {
      throw new Error('Données manquantes');
    }

    // Vérifier si l'email existe déjà
    const { data: existingUser } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      throw new Error('Un compte avec cet email existe déjà');
    }

    // Générer un token d'activation unique
    const activationToken = crypto.randomUUID();

    // Créer le profil utilisateur
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        email: email.toLowerCase(),
        full_name: `${first_name.trim()} ${last_name.trim()}`,
        role: account_type,
        is_active: false, // Sera activé après validation du token
      })
      .select()
      .single();

    if (profileError) {
      throw profileError;
    }

    // Insérer dans la table appropriée selon le type de compte
    let staffData: any = {
      profile_id: profile.id,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.toLowerCase(),
      phone: phone || null,
      is_active: false,
    };

    let tableName: string;
    switch (account_type) {
      case 'examiner':
        tableName = 'examiners';
        staffData = {
          ...staffData,
          category: additionalData.category || 'junior',
          specialty: additionalData.specialty || null,
          grade: additionalData.grade || null,
        };
        break;
      case 'br':
        tableName = 'br_members';
        staffData = {
          ...staffData,
          region: additionalData.region,
        };
        break;
      case 'faculty':
        tableName = 'faculty';
        staffData = {
          ...staffData,
          department: additionalData.department,
          position: additionalData.position || null,
        };
        break;
      case 'admin':
        tableName = 'br_members'; // Les admins sont aussi dans br_members avec un rôle spécial
        staffData = {
          ...staffData,
          region: 'ADMIN',
        };
        break;
      default:
        throw new Error('Type de compte invalide');
    }

    const { error: staffError } = await supabaseClient
      .from(tableName)
      .insert(staffData);

    if (staffError) {
      // Supprimer le profil si l'insertion du staff échoue
      await supabaseClient.from('profiles').delete().eq('id', profile.id);
      throw staffError;
    }

    // Stocker le token d'activation (on pourrait utiliser une table dédiée ou les metadata)
    // Pour l'instant, on envoie juste un email avec le token

    // TODO: Envoyer l'email d'activation avec le token
    console.log(`Activation token for ${email}: ${activationToken}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demande d\'inscription envoyée. Vérifiez votre email pour l\'activation.',
        activation_token: activationToken, // À supprimer en production
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Staff registration error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Erreur lors de l\'inscription',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});