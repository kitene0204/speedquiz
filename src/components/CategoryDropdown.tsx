import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Settings, Check, Sparkles } from 'lucide-react';
import { ChaptersSettings, VacationSeason, DEFAULT_CHAPTERS } from '../types';
import { playPopSound } from '../lib/sound';
import { getChapterTheme } from '../lib/theme';

interface CategoryDropdownProps {
  chapters: ChaptersSettings;
  currentSeason: VacationSeason;
  onSelectSeason: (season: VacationSeason) => void;
  countsBySeason: Record<string, number>;
  onOpenCreateModal: () => void;
  onOpenSettingsModal: () => void;
}

export function CategoryDropdown({
  chapters,
  currentSeason,
  onSelectSeason,
  countsBySeason,
  onOpenCreateModal,
  onOpenSettingsModal,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentConfig = chapters[currentSeason] || DEFAULT_CHAPTERS[currentSeason] || {
    name: '카테고리',
    emoji: '✨',
    title: '퀴즈',
    badge: '활동',
    description: '',
  };

  const currentCount = countsBySeason[currentSeason] || 0;
  const currentTheme = getChapterTheme(currentConfig, currentSeason);
  const chapterKeys = Object.keys(chapters);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (key: string) => {
    playPopSound();
    onSelectSeason(key);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button & Quick Add */}
      <div className="flex items-center gap-1.5 bg-white/95 p-1 rounded-2xl border-2 shadow-xs transition-all" style={{ borderColor: currentTheme.accentHex }}>
        {/* Main Collapsible Trigger Button */}
        <button
          type="button"
          id="category-dropdown-trigger"
          onClick={() => {
            playPopSound();
            setIsOpen(!isOpen);
          }}
          className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-black text-xs sm:text-sm cursor-pointer transition-all ${
            isOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-800 hover:bg-slate-100'
          }`}
          title="클릭하여 모든 카테고리 펼쳐보기"
          aria-expanded={isOpen}
        >
          <span className="text-base sm:text-lg leading-none">{currentConfig.emoji}</span>
          <span className="font-black text-slate-800 tracking-tight">
            {currentConfig.name}
          </span>

          {currentCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-slate-200 text-slate-700">
              {currentCount}명
            </span>
          )}

          <ChevronDown 
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-sky-600' : ''
            }`} 
          />
        </button>

        {/* Quick Add Button */}
        <button
          type="button"
          id="quick-add-category-button"
          onClick={() => {
            playPopSound();
            setIsOpen(false);
            onOpenCreateModal();
          }}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black transition-colors cursor-pointer"
          title="새 활동 카테고리 추가하기 (주말, 연휴, 체험학습 등)"
        >
          <Plus className="w-3.5 h-3.5 text-amber-700" />
          <span className="hidden sm:inline">카테고리 추가</span>
        </button>
      </div>

      {/* Dropdown Panel (펼쳐지는 구조) */}
      {isOpen && (
        <div 
          id="category-dropdown-panel"
          className="absolute left-0 mt-2 z-50 w-72 sm:w-88 max-w-[90vw] bg-white rounded-3xl border-3 border-sky-300 shadow-[0_12px_24px_rgba(0,0,0,0.15)] overflow-hidden animate-fadeIn select-none"
        >
          {/* Header */}
          <div className="bg-[#F0F9FF] border-b-2 border-sky-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-black text-[#0369A1]">
                활동 카테고리 선택 ({chapterKeys.length}개)
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              클릭 시 즉시 전환
            </span>
          </div>

          {/* List of Categories */}
          <div className="p-2 space-y-1.5 max-h-72 overflow-y-auto">
            {chapterKeys.map((key) => {
              const item = chapters[key] || DEFAULT_CHAPTERS[key];
              if (!item) return null;
              const isSelected = key === currentSeason;
              const count = countsBySeason[key] || 0;
              const theme = getChapterTheme(item, key);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelect(key)}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                    isSelected
                      ? `${theme.pillBg} ${theme.pillBorder} shadow-xs`
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0 p-1 rounded-xl bg-white/80 border border-slate-200 shadow-2xs">
                      {item.emoji}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-black text-sm truncate ${isSelected ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                          {item.name}
                        </span>
                        {item.badge && (
                          <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-md bg-white/90 text-slate-600 border border-slate-200 text-[10px] font-bold truncate max-w-[120px]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                        {item.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {count > 0 && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                        isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {count}명
                      </span>
                    )}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="p-2.5 bg-slate-50 border-t-2 border-slate-100 flex flex-col gap-1.5">
            <button
              type="button"
              id="dropdown-create-category-button"
              onClick={() => {
                playPopSound();
                setIsOpen(false);
                onOpenCreateModal();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-[0_2px_0_0_#D97706] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-900" />
              <span>+ 새 카테고리 추가하기 (주말, 연휴 등)</span>
            </button>

            <button
              type="button"
              id="dropdown-settings-button"
              onClick={() => {
                playPopSound();
                setIsOpen(false);
                onOpenSettingsModal();
              }}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>카테고리 제목 및 문구 수정 (설정)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
