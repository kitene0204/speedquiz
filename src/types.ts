export type AppRole = 'teacher' | 'student';
export type QuizMode = string;
export type VacationSeason = string;

export interface QuizResponse {
  id: string;
  created_at: string;
  student_name: string;
  keywords: string[];
  is_shown: boolean;
  season?: VacationSeason;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

export type CategoryThemeColor = 'amber' | 'sky' | 'emerald' | 'orange' | 'rose' | 'indigo' | 'purple' | 'teal';

export interface ChapterConfig {
  id?: string;
  name: string;
  emoji: string;
  title: string;
  badge: string;
  description: string;
  themeColor?: CategoryThemeColor;
  isCustom?: boolean;
}

export type ChaptersSettings = Record<string, ChapterConfig>;

export const DEFAULT_CHAPTERS: ChaptersSettings = {
  summer: {
    id: 'summer',
    name: '여름방학',
    emoji: '🏖️',
    title: '내 방학을 맞춰봐!',
    badge: '스피드 퀴즈',
    description: '초·중·고등학생 및 교사를 위한 방학 키워드 공유 퀴즈',
    themeColor: 'amber',
  },
  winter: {
    id: 'winter',
    name: '겨울방학',
    emoji: '⛄',
    title: '내 겨울방학을 맞춰봐!',
    badge: '겨울방학 퀴즈 ❄️',
    description: '초·중·고등학생 및 교사를 위한 겨울방학 키워드 공유 퀴즈',
    themeColor: 'sky',
  },
  training: {
    id: 'training',
    name: '교사 연수',
    emoji: '🎓',
    title: '선생님의 경험을 맞춰봐!',
    badge: '',
    description: '교사 연수 동기유발 & 아이스브레이킹을 위한 경험 키워드 공유 퀴즈',
    themeColor: 'emerald',
  },
};

// Preset category ideas when creating new categories (e.g. 주말, 연휴)
export const PRESET_CATEGORY_TEMPLATES: Array<Omit<ChapterConfig, 'id'>> = [
  {
    name: '주말 지낸 이야기',
    emoji: '🎈',
    title: '나의 주말을 맞춰봐!',
    badge: '주말 이야기 🎈',
    description: '주말 동안 있었던 재미있는 경험과 기억을 키워드로 공유하는 퀴즈',
    themeColor: 'orange',
    isCustom: true,
  },
  {
    name: '연휴 지낸 이야기',
    emoji: '🎏',
    title: '우리의 연휴를 맞춰봐!',
    badge: '명절·연휴 이야기 🎏',
    description: '추석, 설날, 황금연휴 동안의 특별한 추억을 키워드로 나누는 퀴즈',
    themeColor: 'rose',
    isCustom: true,
  },
  {
    name: '체험학습·수학여행',
    emoji: '🚌',
    title: '체험학습 추억을 맞춰봐!',
    badge: '생생한 추억 🚌',
    description: '현장체험학습 및 소풍, 수학여행에서의 소중한 추억을 맞히는 퀴즈',
    themeColor: 'indigo',
    isCustom: true,
  },
  {
    name: '새학기 자기소개',
    emoji: '🎒',
    title: '나를 소개하는 키워드!',
    badge: '첫 만남 아이스브레이킹 🎒',
    description: '친구들에게 나를 소개하는 핵심 키워드 3가지를 맞히는 자기소개 퀴즈',
    themeColor: 'purple',
    isCustom: true,
  },
];

