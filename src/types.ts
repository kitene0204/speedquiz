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

export interface ChapterConfig {
  name: string;
  emoji: string;
  title: string;
  badge: string;
  description: string;
}

export interface ChaptersSettings {
  summer: ChapterConfig;
  winter: ChapterConfig;
  training: ChapterConfig;
}

export const DEFAULT_CHAPTERS: ChaptersSettings = {
  summer: {
    name: '여름방학',
    emoji: '🏖️',
    title: '내 방학을 맞춰봐!',
    badge: '스피드 퀴즈',
    description: '초·중·고등학생 및 교사를 위한 방학 키워드 공유 퀴즈',
  },
  winter: {
    name: '겨울방학',
    emoji: '⛄',
    title: '내 겨울방학을 맞춰봐!',
    badge: '겨울방학 퀴즈 ❄️',
    description: '초·중·고등학생 및 교사를 위한 겨울방학 키워드 공유 퀴즈',
  },
  training: {
    name: '교사 연수',
    emoji: '🎓',
    title: '선생님의 경험을 맞춰봐!',
    badge: '교사 연수 윔블던 그린 🎾',
    description: '교사 연수 동기유발 & 아이스브레이킹을 위한 경험 키워드 공유 퀴즈',
  },
};
