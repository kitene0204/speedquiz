export interface QuizResponse {
  id: string;
  created_at: string;
  student_name: string;
  keywords: string[];
  is_shown: boolean;
}

export type AppRole = 'teacher' | 'student';
export type QuizMode = 'summer' | 'winter' | 'training';
export type VacationSeason = QuizMode;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}
