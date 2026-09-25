export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: number;
  last_login: string | null;
  role_name: string;
  role_id: number;
}

export interface Role {
  id: number;
  name: string;
  label: string;
}

export interface Candidate {
  id: number;
  user_id: number;
  nik: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: 'L' | 'P';
  address: string | null;
  education: string | null;
  position_applied: string | null;
  status: 'registered' | 'testing' | 'completed' | 'hired' | 'rejected';
  full_name: string;
  email: string;
  username: string;
}

export interface TestCategory {
  id: number;
  code: string;
  name: string;
  description: string;
  total_time_seconds: number;
  time_per_question_seconds: number;
}

export interface IntelligenceQuestion {
  id: number;
  subcategory_id: number;
  question_text: string;
  image_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  difficulty: 'easy' | 'medium' | 'hard';
  score_weight: number;
  time_seconds: number;
  order_number: number;
  subcategory_name?: string;
}

export interface PersonalityQuestion {
  id: number;
  question_text: string;
  dimension: string;
  order_number: number;
  options?: PersonalityOption[];
}

export interface PersonalityOption {
  id: number;
  question_id: number;
  option_label: 'A' | 'B' | 'C' | 'D';
  statement_text: string;
  dimension_score: string;
}

export interface TestSession {
  id: number;
  candidate_id: number;
  category_id: number;
  started_at: string;
  finished_at: string | null;
  status: 'in_progress' | 'completed' | 'timeout' | 'abandoned';
  total_score: number;
  max_score: number;
  percentage: number;
  time_spent_seconds: number;
  candidate_name?: string;
  category_name?: string;
  category_code?: string;
  position_applied?: string;
}

export interface TestAssignment {
  id: number;
  candidate_id: number;
  category_id: number;
  access_token: string;
  expires_at: string;
  is_used: number;
  category_name?: string;
  category_code?: string;
}

export interface PersonalityResult {
  id: number;
  session_id: number;
  candidate_id: number;
  integrity_score: number;
  conflict_mgmt_score: number;
  conviction_score: number;
  creativity_score: number;
  teamwork_score: number;
  interpersonal_score: number;
  character_summary: string;
}

export type FlashMessage = {
  type: 'success' | 'error';
  message: string;
};