import { useState, useEffect } from 'react';
import { X, Settings, RotateCcw, Check, Sparkles, Sun, Snowflake, GraduationCap } from 'lucide-react';
import { ChaptersSettings, DEFAULT_CHAPTERS, QuizMode } from '../types';
import { playPopSound } from '../lib/sound';

interface ChapterSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: ChaptersSettings;
  onSave: (updated: ChaptersSettings) => void;
  activeMode?: QuizMode;
}

const EMOJI_SUGGESTIONS = ['🏖️', '⛄', '🎾', '🎓', '🏫', '🌸', '🍁', '☀️', '🎉', '🚀', '💡', '📚', '☕', '🏕️', '🍕', '🏊'];

export function ChapterSettingsModal({
  isOpen,
  onClose,
  chapters,
  onSave,
  activeMode = 'summer'
}: ChapterSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<QuizMode>(activeMode);
  const [formData, setFormData] = useState<ChaptersSettings>(chapters);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(chapters);
      setActiveTab(activeMode);
      setIsSavedFeedback(false);
    }
  }, [isOpen, chapters, activeMode]);

  if (!isOpen) return null;

  const currentConfig = formData[activeTab];

  const handleFieldChange = (field: keyof typeof currentConfig, value: string) => {
    setFormData(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      }
    }));
  };

  const handleResetToDefault = () => {
    playPopSound();
    setFormData(prev => ({
      ...prev,
      [activeTab]: { ...DEFAULT_CHAPTERS[activeTab] }
    }));
  };

  const handleResetAllToDefault = () => {
    playPopSound();
    setFormData(DEFAULT_CHAPTERS);
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
                챕터 제목 및 문구 직접 설정
              </h2>
              <p className="text-xs font-bold text-[#0369A1]/70">
                여름방학, 겨울방학, 교사연수의 탭 이름과 퀴즈 제목을 직접 타이핑하여 변경하세요
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

        {/* Tab selection */}
        <div className="bg-[#F0F9FF] border-b-2 border-[#BAE6FD] px-5 sm:px-8 py-3 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              setActiveTab('summer');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'summer'
                ? 'bg-amber-400 text-amber-950 shadow-[0_3px_0_0_#D97706]'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-600" />
            <span>{formData.summer.name} {formData.summer.emoji}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playPopSound();
              setActiveTab('winter');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'winter'
                ? 'bg-sky-500 text-white shadow-[0_3px_0_0_#0284C7]'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Snowflake className="w-4 h-4 text-sky-500" />
            <span>{formData.winter.name} {formData.winter.emoji}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playPopSound();
              setActiveTab('training');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'training'
                ? 'bg-[#006633] text-white shadow-[0_3px_0_0_#003D1E]'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>{formData.training.name} {formData.training.emoji}</span>
          </button>
        </div>

        {/* Modal Body / Inputs */}
        <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Quick Info Badge */}
          <div className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 ${
            activeTab === 'training'
              ? 'bg-[#EAF5EE] border-[#88D4A8] text-[#006633]'
              : activeTab === 'winter'
              ? 'bg-[#EFF6FF] border-[#BFDBFE] text-sky-900'
              : 'bg-[#FEFCE8] border-[#FEF08A] text-amber-900'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">
                현재 <strong>[{currentConfig.name}]</strong> 챕터를 수정하고 있습니다. 상단 탭에서 다른 챕터로 전환할 수 있습니다.
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs font-black underline hover:opacity-80 shrink-0 cursor-pointer"
            >
              이 챕터 기본값 복원
            </button>
          </div>

          <div className="space-y-4">
            {/* Chapter Tab Name and Emoji */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs sm:text-sm font-black text-slate-700">
                  1. 탭 표시 이름 (상단 전환 탭)
                </label>
                <input
                  type="text"
                  value={currentConfig.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="예: 여름방학, 신학기 첫날, 교사 연수"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-[#0EA5E9] focus:outline-hidden font-bold text-sm bg-white"
                  maxLength={20}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-black text-slate-700">
                  2. 대표 이모지
                </label>
                <input
                  type="text"
                  value={currentConfig.emoji}
                  onChange={(e) => handleFieldChange('emoji', e.target.value)}
                  placeholder="예: 🏖️, ⛄, 🎾"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-[#0EA5E9] focus:outline-hidden font-bold text-sm text-center bg-white"
                  maxLength={5}
                />
              </div>
            </div>

            {/* Emoji Quick Picker */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500">추천 이모지 클릭 선택:</span>
              <div className="flex flex-wrap gap-1.5">
                {EMOJI_SUGGESTIONS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      playPopSound();
                      handleFieldChange('emoji', em);
                    }}
                    className={`w-8 h-8 rounded-lg text-base flex items-center justify-center border transition-all cursor-pointer ${
                      currentConfig.emoji === em 
                        ? 'bg-amber-100 border-amber-400 scale-110 shadow-xs' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Quiz Title */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-black text-slate-700">
                3. 퀴즈 메인 대제목 (대기실 / 퀴즈 메인 화면에 크게 표시)
              </label>
              <input
                type="text"
                value={currentConfig.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="예: 내 방학을 맞춰봐!, 선생님의 경험을 맞춰봐!"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-[#0EA5E9] focus:outline-hidden font-bold text-sm bg-white"
                maxLength={40}
              />
            </div>

            {/* Badge Label */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-black text-slate-700">
                4. 상단 뱃지 문구 (소제목 라벨)
              </label>
              <input
                type="text"
                value={currentConfig.badge}
                onChange={(e) => handleFieldChange('badge', e.target.value)}
                placeholder="예: 스피드 퀴즈, 교사 연수 윔블던 그린 🎾"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-[#0EA5E9] focus:outline-hidden font-bold text-sm bg-white"
                maxLength={30}
              />
            </div>

            {/* Description Subtitle */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-black text-slate-700">
                5. 소개 및 안내 문구
              </label>
              <textarea
                value={currentConfig.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="초·중·고등학생 및 교사를 위한 키워드 공유 퀴즈 안내글"
                rows={2}
                className="w-full px-4 py-2 rounded-xl border-2 border-slate-300 focus:border-[#0EA5E9] focus:outline-hidden font-medium text-xs sm:text-sm bg-white resize-none"
                maxLength={100}
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 space-y-2">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              실시간 미리보기
            </span>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg text-[#0369A1]">
                    {currentConfig.title || '제목을 입력하세요'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-white text-[10px] font-bold ${
                    activeTab === 'training' ? 'bg-[#006633]' : activeTab === 'winter' ? 'bg-sky-500' : 'bg-[#0EA5E9]'
                  }`}>
                    {currentConfig.badge || '뱃지'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {currentConfig.description || '소개 문구'}
                </p>
              </div>
              <div className="shrink-0 px-3 py-1 rounded-xl text-xs font-black bg-slate-100 text-slate-700 border border-slate-300">
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
            <span>모든 챕터 기본값 초기화</span>
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
