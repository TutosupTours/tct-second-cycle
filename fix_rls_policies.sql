-- Corriger les politiques RLS pour permettre l'accès aux sessions
-- À exécuter dans le SQL Editor de Supabase

-- Désactiver temporairement RLS pour les sessions (pour les tests)
-- ATTENTION: À remplacer par des politiques appropriées en production
ALTER TABLE ecos_sessions DISABLE ROW LEVEL SECURITY;

-- Permettre temporairement la lecture publique des sessions
DROP POLICY IF EXISTS "Public sessions access" ON ecos_sessions;
CREATE POLICY "Public sessions access" ON ecos_sessions FOR SELECT USING (true);

-- Pour les autres tables, garder RLS mais ajouter des politiques de base
-- Profiles: permettre aux utilisateurs de créer leur propre profil
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Students: permettre aux étudiants de créer leur propre profil étudiant
DROP POLICY IF EXISTS "Students can insert own data" ON students;
CREATE POLICY "Students can insert own data" ON students
  FOR INSERT WITH CHECK (profile_id = auth.uid());

-- Sessions: permettre aux admins de créer et modifier les sessions
DROP POLICY IF EXISTS "Admins can manage sessions" ON ecos_sessions;
CREATE POLICY "Admins can manage sessions" ON ecos_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Stations: permettre aux admins de gérer les stations
DROP POLICY IF EXISTS "Admins can manage stations" ON stations;
CREATE POLICY "Admins can manage stations" ON stations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Time slots: permettre aux admins de gérer les créneaux
DROP POLICY IF EXISTS "Admins can manage time slots" ON time_slots;
CREATE POLICY "Admins can manage time slots" ON time_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Message de confirmation
SELECT '✅ Politiques RLS corrigées pour les tests. Pensez à sécuriser en production !' as status;