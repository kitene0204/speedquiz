import { useState, type FormEvent } from 'react';
import { X, Plus, Sparkles, Check } from 'lucide-react';
import { ChapterConfig, CategoryThemeColor, PRESET_CATEGORY_TEMPLATES } from '../types';
import { playPopSound } from '../lib/sound';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (category: ChapterConfig, key: string) => void;
  existingKeys: string[];
}

const EMOJI_LIST = [
  '🎈', '🎏', '🚌', '🎒', '🏖️', '⛄', '🎾', '🎓', 
  '🌸', '🍁', '☀️', '🍕', '🎮', '🏕️', '🍿', '🚲', 
  '🎨', '⚽', '📚', '☕', '🚀', '💡', '🎉', '🎁'
];

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

export function CreateCategoryModal({
  isOpen,
  onClose,
  onCreate,
  existingKeys,
}: CreateCategoryModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎈');
  const [title, setTitle] = useState('');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState<CategoryThemeColor>('orange');

  if (!isOpen) return null;

  const handleApplyPreset = (template: typeof PRESET_CATEGORY_TEMPLATES[0]) => {
    playPopSound();
    setName(template.name);
    setEmoji(template.emoji);
    setTitle(template.title);
    setBadge(template.badge);
    setDescription(template.description);
    if (template.themeColor) {
      setThemeColor(template.themeColor);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!title) {
      setTitle(`${val} 맞히기!`);
    }
    if (!badge) {
      setBadge(`${val} ${emoji}`);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    // Generate unique key
    let key = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!key || existingKeys.includes(key)) {
      if (cleanName.includes('주말')) key = 'weekend';
      else if (cleanName.includes('연휴')) key = 'holiday';
      else if (cleanName.includes('체험') || cleanName.includes('여행')) key = 'trip';
      else if (cleanName.includes('소개')) key = 'intro';
      else key = `cat_${Date.now().toString(36)}`;
    }

    // Ensure uniqueness
    let finalKey = key;
    let counter = 1;
    while (existingKeys.includes(finalKey)) {
      finalKey = `${key}_${counter}`;
      counter++;
    }

    const newConfig: ChapterConfig = {
      id: finalKey,
      name: cleanName,
      emoji: emoji || '✨',
      title: title.trim() || `${cleanName}를 맞춰봐!`,
      badge: badge.trim() || `${cleanName} ${emoji}`,
      description: description.trim() || `${cleanName} 키워드를 맞히는 즐거운 퀴즈 활동`,
      themeColor,
      isCustom: true,
    };

    playPopSound();
    onCreate(newConfig, finalKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl sm:rounded-4xl border-4 sm:border-6 border-[#BAE6FD] shadow-[0_20px_0_0_#0EA5E9] w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#FEF9C3] border-b-4 border-[#FEF08A] px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-[0_3px_0_0_#D97706] border-2 border-white">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0369A1] tracking-tight">
                새 활동 카테고리 추가
              </h2>
              <p className="text-xs font-bold text-[#0369A1]/70">
                주말, 연휴, 체험학습 등 새로운 주제의 퀴즈 카테고리를 만드세요
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-amber-100 transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Quick Preset Templates */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>추천 템플릿 (클릭 시 자동 입력)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_CATEGORY_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(tmpl)}
                  className="p-2.5 rounded-xl border-2 border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xl mb-1">{tmpl.emoji}</div>
                  <div className="font-black text-xs text-slate-800 group-hover:text-amber-950 truncate">
                    {tmpl.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Category Name & Emoji */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                <span>카테고리 이름</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="예: 주말 지낸 이야기, 황금연휴"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-sm font-black text-slate-800 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">
                대표 이모지
              </label>
              <input
                type="text"
                maxLength={4}
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-center text-lg font-black text-slate-800 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Quick Emoji Bar */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500">빠른 이모지 선택:</span>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_LIST.map((em, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    playPopSound();
                    setEmoji(em);
                  }}
                  className={`w-8 h-8 rounded-lg text-base flex items-center justify-center border transition-all cursor-pointer ${
                    emoji === em
                      ? 'bg-amber-100 border-amber-400 scale-110 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Quiz Main Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">
              퀴즈 메인 타이틀 (화면 상단 제목)
            </label>
            <input
              type="text"
              placeholder="예: 나의 주말을 맞춰봐!, 우리의 연휴를 맞춰봐!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-300 text-sm font-bold text-slate-800 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-colors"
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
                placeholder="예: 주말 이야기 🎈"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">
                소개 설명 문구
              </label>
              <input
                type="text"
                placeholder="예: 주말 동안 무엇을 했는지 맞히는 퀴즈"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-50 border-2 border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-sky-500 focus:bg-white"
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
                  onClick={() => setThemeColor(opt.key)}
                  className={`p-2 rounded-xl border-2 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    themeColor === opt.key
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

          {/* Preview Box */}
          <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 space-y-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">미리보기</span>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{emoji}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-[#0369A1]">{title || '퀴즈 대제목'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-slate-600 border border-slate-300">
                    {badge || '배지'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {description || '소개 설명 문구'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2 flex justify-end gap-2">
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
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-amber-950 font-black text-xs sm:text-sm transition-all shadow-[0_3px_0_0_#D97706] flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>카테고리 생성하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
