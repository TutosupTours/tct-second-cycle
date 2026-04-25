// Database Types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'br' | 'examiner' | 'student' | 'faculty';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  profile_id?: string;
  student_number?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  promotion: string;
  niveau: string;
  year_label?: string;
  is_active: boolean;
  created_at: string;
}

export interface Examiner {
  id: string;
  profile_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  category: 'junior' | 'senior' | 'expert';
  grade?: string;
  specialty?: string;
  is_active: boolean;
  created_at: string;
}

export interface Faculty {
  id: string;
  profile_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  is_active: boolean;
  created_at: string;
}

export interface BRMember {
  id: string;
  profile_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  region: string;
  is_active: boolean;
  created_at: string;
}

export interface ECOSSession {
  id: string;
  title: string;
  promotion: string;
  session_date: string;
  location: string;
  capacity: number;
  status: 'planned' | 'open' | 'closed' | 'in_progress' | 'completed';
  description?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Station {
  id: string;
  session_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  station_order: number;
  max_candidates: number;
  required_examiners: number;
  created_at: string;
}

export interface TimeSlot {
  id: string;
  session_id: string;
  start_time: string;
  end_time: string;
  slot_order: number;
  created_at: string;
}

export interface SessionRegistration {
  id: string;
  session_id: string;
  student_id: string;
  registration_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  approved_by?: string;
  approved_at?: string;
  notes?: string;
}

export interface StationAssignment {
  id: string;
  session_id: string;
  station_id: string;
  examiner_id: string;
  time_slot_id: string;
  assigned_at: string;
}

export interface CandidatePass {
  id: string;
  session_id: string;
  student_id: string;
  station_id: string;
  time_slot_id: string;
  examiner_id?: string;
  pass_order: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed';
  start_time?: string;
  end_time?: string;
  created_at: string;
}

export interface EvaluationGrid {
  id: string;
  station_id: string;
  name: string;
  description?: string;
  criteria: EvaluationCriterion[];
  max_score: number;
  created_at: string;
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  description?: string;
  max_score: number;
  weight?: number;
}

export interface Evaluation {
  id: string;
  candidate_pass_id: string;
  examiner_id: string;
  evaluation_grid_id?: string;
  scores: Record<string, number>;
  total_score: number;
  comments?: string;
  is_validated: boolean;
  validated_at?: string;
  validated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Result {
  id: string;
  session_id: string;
  student_id: string;
  total_score: number;
  average_score: number;
  station_scores: Record<string, number>;
  global_grade: 'A' | 'B' | 'C' | 'D' | 'F';
  is_published: boolean;
  published_at?: string;
  published_by?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Form Types
export interface LoginForm {
  identifier: string;
  password?: string;
  pin?: string;
}

export interface StudentRegistrationForm {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  promotion: string;
  niveau: string;
}

export interface SessionForm {
  title: string;
  promotion: string;
  session_date: string;
  location: string;
  capacity: number;
  description?: string;
}

export interface StationForm {
  name: string;
  description?: string;
  duration_minutes: number;
  station_order: number;
  max_candidates: number;
  required_examiners: number;
}

export interface EvaluationForm {
  scores: Record<string, number>;
  comments?: string;
}

// UI Component Props
export interface DashboardProps {
  user: Profile;
  children: React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
}

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

// Planning Types
export interface PlanningSlot {
  time_slot: TimeSlot;
  station: Station;
  examiner?: Examiner;
  candidate?: Student;
  status: 'free' | 'assigned' | 'occupied';
}

export interface PlanningView {
  session: ECOSSession;
  slots: PlanningSlot[][];
}