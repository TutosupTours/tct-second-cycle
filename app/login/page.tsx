async function handleLogin() {
  setLoading(true);
  setMessage("");

  const { data: loginData, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error || !loginData.user) {
    setMessage("Erreur de connexion. Vérifie ton email et ton mot de passe.");
    setLoading(false);
    return;
  }

  const { data: profile, error: profileError } = await supabase.rpc(
    "get_current_profile"
  );

  if (profileError || !profile) {
    console.error("Erreur profil:", profileError);
    setMessage("Profil introuvable. Contacte l’administrateur.");
    await supabase.auth.signOut();
    setLoading(false);
    return;
  }

  const expectedRole = normalizeRoleParam(roleParam);

  if (expectedRole && profile.role !== expectedRole) {
    setMessage("Ce compte n’a pas accès à cet espace.");
    await supabase.auth.signOut();
    setLoading(false);
    return;
  }

  window.location.href = getRedirectPath(profile.role);
}