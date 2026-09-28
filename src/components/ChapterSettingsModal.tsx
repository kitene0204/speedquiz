import { useState, useEffect } from 'react';
import { X, Settings, RotateCcw, Check, Sparkles, Plus, Trash2 } from 'lucide-react';
import { ChaptersSettings, DEFAULT_CHAPTERS, QuizMode, CategoryThemeColor } from '../types';
import { playPopSound } from '../lib/sound';
import { getChapterTheme } from '../lib/theme';

interface ChapterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: ChaptersSettings;
  onSave: (updated: ChaptersSettings) => void;
  activeMode?: QuizMode;
  onOpenCreateCategory?: () => void;
}

const EMOJI_SUGGESTIONS = ['🏖️', '⛄', '🎾', '🎓', '🎈', '🎏', '🚌', '🎒', '🏫', '🌸', '🍁', '☀️', '🎉', '🚀', '💡', '📚', '☕', '🏕️', '🍕', '🎮'];

const THEME_OPTIONS: Array<{ key: CategoryThemeColor; label: string; bg: string }> = [
  { key: 'orange', label: '오렌지 (주말)', bg: 'bg-orange-500' },
  { key: 'rose', label: '로즈 (연휴)', bg: 'bg-rose-500' },
  { key: 'indigo', label: '인디고 (체험학습)', bg: 'bg-indigo-600' },
  { key: 'purple', label: '퍼플 (자기소개)', bg: 'bg-purple-600' },
  { key: 'sky', label: '스카이블루', bg: 'bg-sky-500' },
  { key: 'emerald', label: '윔블던그린', bg: 'bg-[#2A8255]' },
  { key: 'amber', label: '골드옐로우', bg: 'bg-amber-400' },
  { key: 'teal', label: '민트티얼', bg: 'bg-teal-600' },
];

export function ChapterSettingsModal({
  isOpen,
  onClose,
  chapters,
  onSave,
  activeMode = 'summer',
  onOpenCreateCategory,
}: ChapterSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<string>(activeMode);
  const [formData, setFormData] = useState<ChaptersSettings>(chapters);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(chapters);
      const keys = Object.keys(chapters);
      if (keys.includes(activeMode)) {
        setActiveTab(activeMode);
      } else if (keys.length > 0) {
        setActiveTab(keys[0]);
      }
      setIsSavedFeedback(false);
    }
  }, [isOpen, chapters, activeMode]);

  if (!isOpen) return null;

  const tabKeys = Object.keys(formData);
  const currentKey = formData[activeTab] ? activeTab : tabKeys[0] || 'summer';
  const currentConfig = formData[currentKey] || DEFAULT_CHAPTERS.summer;
  const currentTheme = getChapterTheme(currentConfig, currentKey);
  const isDefaultCategory = ['summer', 'winter', 'training'].includes(currentKey);

  const handleFieldChange = (field: keyof typeof currentConfig, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [currentKey]: {
        ...prev[currentKey],
        [field]: value,
      }
    }));
  };

  const handleResetToDefault = () => {
    playPopSound();
    if (DEFAULT_CHAPTERS[currentKey]) {
      setFormData(prev => ({
        ...prev,
        [currentKey]: { ...DEFAULT_CHAPTERS[currentKey] }
      }));
    }
  };

  const handleDeleteCategory = (keyToDelete: string) => {
    playPopSound();
    if (confirm(`'${formData[keyToDelete]?.name}' 카테고리를 삭제하시겠습니까?`)) {
      const next = { ...formData };
      delete next[keyToDelete];
      setFormData(next);
      const remainingKeys = Object.keys(next);
      if (remainingKeys.length > 0) {
        setActiveTab(remainingKeys[0]);
      }
    }
  };

  const handleResetAllToDefault = () => {
    playPopSound();
    if (confirm('모든 카테고리를 기본값(여름방학, 겨울방학, 교사연수)으로 초기화하시겠습니까?')) {
      setFormData(DEFAULT_CHAPTERS);
      setActiveTab('summer');
    }
  };

  const handleSave = () => {
    playPopSound();
    onSave(formData);
    setIsSavedFeedback(true);
    setTimeout(() => {
      setIsSavedFeedback(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-[#BAE6FD] shadow-[0_20px_0_0_#0EA5E9] w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#FEF9C3] border-b-4 border-[#FEF08A] px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-[0_3px_0_0_#D97706] border-2 border-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0369A1] tracking-tight">
                카테고리 & 챕터 상세 설정
              </h2>
              <p className="text-xs font-bold text-[#0369A1]/70">
                각 활동 카테고리의 탭 이름, 퀴즈 대제목, 배지 및 소개 문구를 직접 수정하세요
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-amber-100 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab selection (Scrollable with Add Category button) */}
        <div className="bg-[#F0F9FF] border-b-2 border-[#BAE6FD] px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
          {tabKeys.map((key) => {
            const item = formData[key];
            if (!item) return null;
            const isTabActive = currentKey === key;
            const theme = getChapterTheme(item, key);

            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  playPopSound();
                  setActiveTab(key);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isTabActive
                    ? theme.tabActive
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span>{item.emoji}</span>
                <span>{item.name}</span>
              </button>
            );
          })}

          {/* Add Category Tab Button */}
          {onOpenCreateCategory && (
            <button
              type="button"
              onClick={() => {
                playPopSound();
                onOpenCreateCategory();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-black text-xs transition-colors shrink-0 cursor-pointer"
              title="새 카테고리 추가하기"
            >
              <Plus className="w-3.5 h-3.5 text-amber-800" />
              <span>새 카테고리</span>
            </button>
          )}
        </div>

        {/* Modal Body / Inputs */}
        <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Quick Info Badge */}
          <div className={`p-4 rounded-2xl border-2 flex flex-wrap items-center justify-between gap-3 ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentConfig.emoji}</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                현재 <strong>[{currentConfig.name}]</strong> 카테고리를 편집하고 있습니다.
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isDefaultCategory ? (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-xs font-black underline text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  기본값 복원
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(currentKey)}
                  className="text-xs font-black text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-rose-300 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>이 카테고리 삭제</span>
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Tab Name & Emoji */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  카테고리 탭 표시 이름
                </label>
                <input
                  type="text"
                  value={currentConfig.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-sm font-black text-slate-800 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-colors"
                  placeholder="예: 여름방학, 주말 지낸 이야기"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  대표 이모지
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    maxLength={4}
                    value={currentConfig.emoji}
                    onChange={(e) => handleFieldChange('emoji', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-center text-lg font-black text-slate-800 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Emoji Quick Picker */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">추천 이모지:</span>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_SUGGESTIONS.map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      playPopSound();
                      handleFieldChange('emoji', emoji);
                    }}
                    className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center border transition-all cursor-pointer ${
                      currentConfig.emoji === emoji
                        ? 'bg-amber-100 border-amber-400 scale-110 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Quiz Main Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">
                퀴즈 메인 타이틀 (상단 큰 제목)
              </label>
              <input
                type="text"
                value={currentConfig.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-sm font-bold text-slate-800 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-colors"
                placeholder="예: 내 방학을 맞춰봐!, 나의 주말을 맞춰봐!"
              />
            </div>

            {/* Badge & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  상단 배지 문구
                </label>
                <input
                  type="text"
                  value={currentConfig.badge}
                  onChange={(e) => handleFieldChange('badge', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-sky-500 focus:bg-white"
                  placeholder="예: 스피드 퀴즈, 주말 이야기 🎈"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">
                  설명 문구
                </label>
                <input
                  type="text"
                  value={currentConfig.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-sky-500 focus:bg-white"
                  placeholder="예: 초·중·고등학생을 위한 키워드 공유 퀴즈"
                />
              </div>
            </div>

            {/* Theme Color Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">
                테마 색상 스타일
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {THEME_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleFieldChange('themeColor', opt.key)}
                    className={`p-2 rounded-xl border-2 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                      currentConfig.themeColor === opt.key
                        ? 'border-slate-800 bg-slate-100 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${opt.bg}`} />
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Preview */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              실제 화면 적용 미리보기
            </span>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-2xl shadow-xs">
                {currentConfig.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg text-[#0369A1]">
                    {currentConfig.title || '제목을 입력하세요'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-white text-[10px] font-bold bg-[#0EA5E9]">
                    {currentConfig.badge || '뱃지'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {currentConfig.description || '소개 문구'}
                </p>
              </div>
              <div className="ml-auto shrink-0 px-3 py-1 rounded-xl text-xs font-black bg-slate-100 text-slate-700 border border-slate-300">
                탭: {currentConfig.name} {currentConfig.emoji}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 border-t-2 border-slate-200 px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetAllToDefault}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본 카테고리로 초기화</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playPopSound();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-white font-black text-xs sm:text-sm transition-all cursor-pointer ${
                isSavedFeedback
                  ? 'bg-emerald-600 shadow-[0_3px_0_0_#059669]'
                  : 'bg-[#0EA5E9] hover:bg-[#0284C7] shadow-[0_3px_0_0_#0284C7]'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isSavedFeedback ? '저장 완료!' : '변경사항 저장하기'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
