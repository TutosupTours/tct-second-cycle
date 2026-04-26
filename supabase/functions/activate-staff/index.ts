import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface ActivationRequest {
  token: string;
  pin: string;
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

    const { token, pin }: ActivationRequest = await req.json();

    // Validation
    if (!token || !pin || !/^[0-9]{4}$/.test(pin)) {
      throw new Error('Données invalides');
    }

    // Pour l'instant, on simule la validation du token
    // TODO: Implémenter une vraie validation de token depuis une table dédiée
    // Ici on suppose que le token est valide et on active le compte

    // Trouver le profil par email ou autre identifiant
    // Pour l'instant, on utilise un système simplifié
    // En production, il faudrait stocker le token avec l'email et le récupérer

    // Simulation: on suppose que le token contient l'email encodé ou on utilise une table temporaire
    // Pour le développement, on va chercher un profil inactif récent

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, email, role')
      .eq('is_active', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (profileError || !profile) {
      throw new Error('Token invalide ou compte déjà activé');
    }

    // Générer un ID de connexion unique selon le rôle
    let loginId: string;
    let tableName: string;
    let updateData: any = { is_active: true };

    switch (profile.role) {
      case 'examiner':
        tableName = 'examiners';
        // Générer un ID d'examinateur (par exemple EXA + numéro)
        const { data: examiners } = await supabaseClient
          .from('examiners')
          .select('id')
          .order('id', { ascending: false })
          .limit(1);

        const nextExaminerId = examiners && examiners.length > 0 ? examiners[0].id + 1 : 1;
        loginId = `EXA${nextExaminerId.toString().padStart(4, '0')}`;
        updateData.login_id = loginId;
        updateData.pin = pin;
        break;

      case 'br':
        tableName = 'br_members';
        const { data: brMembers } = await supabaseClient
          .from('br_members')
          .select('id')
          .order('id', { ascending: false })
          .limit(1);

        const nextBrId = brMembers && brMembers.length > 0 ? brMembers[0].id + 1 : 1;
        loginId = `BR${nextBrId.toString().padStart(4, '0')}`;
        updateData.login_id = loginId;
        updateData.pin = pin;
        break;

      case 'faculty':
        tableName = 'faculty';
        const { data: facultyMembers } = await supabaseClient
          .from('faculty')
          .select('id')
          .order('id', { ascending: false })
          .limit(1);

        const nextFacultyId = facultyMembers && facultyMembers.length > 0 ? facultyMembers[0].id + 1 : 1;
        loginId = `FAC${nextFacultyId.toString().padStart(4, '0')}`;
        updateData.login_id = loginId;
        updateData.pin = pin;
        break;

      case 'admin':
        tableName = 'br_members'; // Les admins sont dans br_members
        const { data: admins } = await supabaseClient
          .from('br_members')
          .select('id')
          .eq('region', 'ADMIN')
          .order('id', { ascending: false })
          .limit(1);

        const nextAdminId = admins && admins.length > 0 ? admins[0].id + 1 : 1;
        loginId = `ADM${nextAdminId.toString().padStart(4, '0')}`;
        updateData.login_id = loginId;
        updateData.pin = pin;
        break;

      default:
        throw new Error('Rôle invalide');
    }

    // Mettre à jour le profil comme actif
    const { error: updateProfileError } = await supabaseClient
      .from('profiles')
      .update({ is_active: true })
      .eq('id', profile.id);

    if (updateProfileError) {
      throw updateProfileError;
    }

    // Mettre à jour la table spécifique avec l'ID de connexion et le PIN
    const { error: updateStaffError } = await supabaseClient
      .from(tableName)
      .update(updateData)
      .eq('profile_id', profile.id);

    if (updateStaffError) {
      throw updateStaffError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        login_id: loginId,
        message: 'Compte activé avec succès',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Staff activation error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Erreur lors de l\'activation',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});