-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users and Authentication
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'br', 'examiner', 'student', 'faculty')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  student_number TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  promotion TEXT NOT NULL,
  niveau TEXT NOT NULL,
  year_label TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Examiners
CREATE TABLE examiners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  category TEXT NOT NULL, -- 'junior', 'senior', 'expert'
  grade TEXT,
  specialty TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faculty Members
CREATE TABLE faculty (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  position TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BR (Bureau Régional) Members
CREATE TABLE br_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  region TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ECOS Sessions
CREATE TABLE ecos_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  promotion TEXT NOT NULL,
  session_date DATE NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'open', 'closed', 'in_progress', 'completed')),
  description TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stations
CREATE TABLE stations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES ecos_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 5,
  station_order INTEGER NOT NULL,
  max_candidates INTEGER NOT NULL DEFAULT 1,
  required_examiners INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time Slots
CREATE TABLE time_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES ecos_sessions(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session Registrations
CREATE TABLE session_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES ecos_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(session_id, student_id)
);

-- Station Assignments (which examiners are assigned to which stations)
CREATE TABLE station_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES ecos_sessions(id) ON DELETE CASCADE,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  examiner_id UUID REFERENCES examiners(id) ON DELETE CASCADE,
  time_slot_id UUID REFERENCES time_slots(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(station_id, time_slot_id, examiner_id)
);

-- Candidate Passes (which students pass through which stations at which times)
CREATE TABLE candidate_passes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES ecos_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  time_slot_id UUID REFERENCES time_slots(id) ON DELETE CASCADE,
  examiner_id UUID REFERENCES examiners(id),
  pass_order INTEGER NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'missed')),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluation Grids
CREATE TABLE evaluation_grids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL, -- Array of evaluation criteria
  max_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluations
CREATE TABLE evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_pass_id UUID REFERENCES candidate_passes(id) ON DELETE CASCADE,
  examiner_id UUID REFERENCES examiners(id) ON DELETE CASCADE,
  evaluation_grid_id UUID REFERENCES evaluation_grids(id),
  scores JSONB NOT NULL, -- Scores for each criterion
  total_score DECIMAL(5,2),
  comments TEXT,
  is_validated BOOLEAN DEFAULT false,
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Results
CREATE TABLE results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES ecos_sessions(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  total_score DECIMAL(5,2),
  average_score DECIMAL(5,2),
  station_scores JSONB, -- Scores per station
  global_grade TEXT, -- 'A', 'B', 'C', 'D', 'F'
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- Indexes for performance
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_promotion ON students(promotion);
CREATE INDEX idx_examiners_email ON examiners(email);
CREATE INDEX idx_ecos_sessions_date ON ecos_sessions(session_date);
CREATE INDEX idx_ecos_sessions_status ON ecos_sessions(status);
CREATE INDEX idx_session_registrations_status ON session_registrations(status);
CREATE INDEX idx_candidate_passes_status ON candidate_passes(status);
CREATE INDEX idx_evaluations_validated ON evaluations(is_validated);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE examiners ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE br_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_grids ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (will be expanded based on roles)
-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Students: Students can view their own data
CREATE POLICY "Students can view own data" ON students
  FOR SELECT USING (profile_id = auth.uid());

-- Sessions: All authenticated users can view sessions
CREATE POLICY "Authenticated users can view sessions" ON ecos_sessions
  FOR SELECT TO authenticated USING (true);

-- Registrations: Students can view their own registrations
CREATE POLICY "Students can view own registrations" ON session_registrations
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM students WHERE profile_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ecos_sessions_updated_at BEFORE UPDATE ON ecos_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();