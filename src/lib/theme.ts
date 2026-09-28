import { ChapterConfig, CategoryThemeColor } from '../types';

export interface ThemeStyles {
  tabActive: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  cardBorder: string;
  headerBg: string;
  headerBorder: string;
  buttonActive: string;
  accentHex: string;
}

export const THEME_PALETTES: Record<CategoryThemeColor, ThemeStyles> = {
  amber: {
    tabActive: 'bg-amber-400 text-amber-950 shadow-[0_2px_0_0_#D97706]',
    pillBg: 'bg-amber-100',
    pillText: 'text-amber-900',
    pillBorder: 'border-amber-300',
    cardBorder: 'border-[#FEF08A]',
    headerBg: 'bg-[#FEF9C3]',
    headerBorder: 'border-[#FEF08A]',
    buttonActive: 'bg-amber-400 hover:bg-amber-500 shadow-[0_4px_0_0_#D97706] text-amber-950',
    accentHex: '#FEF08A',
  },
  sky: {
    tabActive: 'bg-sky-500 text-white shadow-[0_2px_0_0_#0284C7]',
    pillBg: 'bg-[#E0F2FE]',
    pillText: 'text-sky-800',
    pillBorder: 'border-sky-300',
    cardBorder: 'border-[#BAE6FD]',
    headerBg: 'bg-[#E0F2FE]',
    headerBorder: 'border-[#BAE6FD]',
    buttonActive: 'bg-sky-500 hover:bg-sky-600 shadow-[0_4px_0_0_#0284C7] text-white',
    accentHex: '#BAE6FD',
  },
  emerald: {
    tabActive: 'bg-[#2A8255] text-white shadow-[0_2px_0_0_#1B5D3A]',
    pillBg: 'bg-[#EBF6F0]',
    pillText: 'text-[#1E6D44]',
    pillBorder: 'border-[#8ED1A8]',
    cardBorder: 'border-[#8ED1A8]',
    headerBg: 'bg-[#F2FBF5]',
    headerBorder: 'border-[#B2DFCA]',
    buttonActive: 'bg-[#2A8255] hover:bg-[#236F48] shadow-[0_4px_0_0_#1B5D3A] text-white',
    accentHex: '#8ED1A8',
  },
  orange: {
    tabActive: 'bg-orange-500 text-white shadow-[0_2px_0_0_#C2410C]',
    pillBg: 'bg-orange-100',
    pillText: 'text-orange-900',
    pillBorder: 'border-orange-300',
    cardBorder: 'border-[#FED7AA]',
    headerBg: 'bg-[#FFF7ED]',
    headerBorder: 'border-[#FED7AA]',
    buttonActive: 'bg-orange-500 hover:bg-orange-600 shadow-[0_4px_0_0_#C2410C] text-white',
    accentHex: '#FED7AA',
  },
  rose: {
    tabActive: 'bg-rose-500 text-white shadow-[0_2px_0_0_#BE123C]',
    pillBg: 'bg-rose-100',
    pillText: 'text-rose-900',
    pillBorder: 'border-rose-300',
    cardBorder: 'border-[#FECDD3]',
    headerBg: 'bg-[#FFF1F2]',
    headerBorder: 'border-[#FECDD3]',
    buttonActive: 'bg-rose-500 hover:bg-rose-600 shadow-[0_4px_0_0_#BE123C] text-white',
    accentHex: '#FECDD3',
  },
  indigo: {
    tabActive: 'bg-indigo-600 text-white shadow-[0_2px_0_0_#4338CA]',
    pillBg: 'bg-indigo-100',
    pillText: 'text-indigo-900',
    pillBorder: 'border-indigo-300',
    cardBorder: 'border-[#C7D2FE]',
    headerBg: 'bg-[#EEF2FF]',
    headerBorder: 'border-[#C7D2FE]',
    buttonActive: 'bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_0_0_#4338CA] text-white',
    accentHex: '#C7D2FE',
  },
  purple: {
    tabActive: 'bg-purple-600 text-white shadow-[0_2px_0_0_#7E22CE]',
    pillBg: 'bg-purple-100',
    pillText: 'text-purple-900',
    pillBorder: 'border-purple-300',
    cardBorder: 'border-[#E9D5FF]',
    headerBg: 'bg-[#FAF5FF]',
    headerBorder: 'border-[#E9D5FF]',
    buttonActive: 'bg-purple-600 hover:bg-purple-700 shadow-[0_4px_0_0_#7E22CE] text-white',
    accentHex: '#E9D5FF',
  },
  teal: {
    tabActive: 'bg-teal-600 text-white shadow-[0_2px_0_0_#0F766E]',
    pillBg: 'bg-teal-100',
    pillText: 'text-teal-900',
    pillBorder: 'border-teal-300',
    cardBorder: 'border-[#99F6E4]',
    headerBg: 'bg-[#F0FDFA]',
    headerBorder: 'border-[#99F6E4]',
    buttonActive: 'bg-teal-600 hover:bg-teal-700 shadow-[0_4px_0_0_#0F766E] text-white',
    accentHex: '#99F6E4',
  },
};

export function getChapterTheme(chapter?: ChapterConfig, seasonKey?: string): ThemeStyles {
  if (chapter?.themeColor && THEME_PALETTES[chapter.themeColor]) {
    return THEME_PALETTES[chapter.themeColor];
  }

  // Fallback by key
  if (seasonKey === 'winter') return THEME_PALETTES.sky;
  if (seasonKey === 'training') return THEME_PALETTES.emerald;
  if (seasonKey === 'weekend') return THEME_PALETTES.orange;
  if (seasonKey === 'holiday') return THEME_PALETTES.rose;
  if (seasonKey === 'trip') return THEME_PALETTES.indigo;
  if (seasonKey === 'intro') return THEME_PALETTES.purple;

  return THEME_PALETTES.amber;
}
