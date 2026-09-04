import { useState, type FormEvent } from 'react';
import { Sparkles, CheckCircle2, Send, Edit3, Tag, Snowflake, Sun, GraduationCap } from 'lucide-react';
import { submitQuizResponse } from '../lib/supabase';
import { playPopSound } from '../lib/sound';
import { VacationSeason } from '../types';

const SUMMER_TAGS = [
  '🏖️ 워터파크',
  '🌊 계곡 물놀이',
  '🍲 마라탕 2단계',
  '😴 12시까지 늦잠',
  '💻 엔트리 코딩',
  '🎮 닌텐도 스위치',
  '✈️ 비행기 여행',
  '🍧 복숭아 빙수',
  '⛺ 밤하늘 캠핑',
  '🐶 시골 할머니댁',
  '📚 만화 카페',
  '🍕 야식 피자',
];

const WINTER_TAGS = [
  '⛄ 눈사람 만들기',
  '🎿 스키장·눈썰매',
  '🍊 이불 속 귤',
  '🍲 슈크림 붕어빵',
  '⛸️ 아이스링크',
  '♨️ 따뜻한 온천',
  '🎮 방학 밤샘 게임',
  '😴 12시까지 늦잠',
  '🎅 크리스마스 파티',
  '🍠 달콤한 군고구마',
  '💻 엔트리 눈싸움',
  '🍜 뜨끈한 어묵 국물',
];

const TEACHER_TRAINING_TAGS = [
  '☕ 1일 3커피 수혈',
  '💻 생성형 AI 수업 도전',
  '🏃 주말 10km 마라톤',
  '🪴 베란다 텃밭 토마토',
  '✈️ 제주 올레길 트레킹',
  '🥐 전국 빵지순례 5곳',
  '🎾 테니스 레슨 시작',
  '🏕️ 노지 차박 캠핑',
  '📚 직무연수 60시간',
  '🐶 반려견과 글램핑',
  '🎮 닌텐도 젤다 엔딩',
  '🍲 마라탕 3단계 도전',
  '🎨 유화 원데이클래스',
  '🧘 매일 아침 모닝 요가',
  '🏊 수영 접영 마스터',
  '🎸 어쿠스틱 기타 독학',
];

interface StudentFormProps {
  onBackToTeacher?: () => void;
  season?: VacationSeason;
  onToggleSeason?: (newSeason: VacationSeason) => void;
}

export function StudentForm({ onBackToTeacher, season = 'summer', onToggleSeason }: StudentFormProps) {
  const isWinter = season === 'winter';
  const isTraining = season === 'training';
  const popularTags = isTraining ? TEACHER_TRAINING_TAGS : isWinter ? WINTER_TAGS : SUMMER_TAGS;

  const [name, setName] = useState('');
  const [keyword1, setKeyword1] = useState('');
  const [keyword2, setKeyword2] = useState('');
  const [keyword3, setKeyword3] = useState('');
  const [keyword4, setKeyword4] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ name: string; keywords: string[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddTag = (tagWithEmoji: string) => {
    // strip leading emoji
    const cleanText = tagWithEmoji.replace(/^[^\s]+\s*/, '');
    if (!keyword1.trim()) {
      setKeyword1(cleanText);
    } else if (!keyword2.trim()) {
      setKeyword2(cleanText);
    } else if (!keyword3.trim()) {
      setKeyword3(cleanText);
    } else if (!keyword4.trim()) {
      setKeyword4(cleanText);
    }
    playPopSound();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const rawKeywords = [keyword1, keyword2, keyword3, keyword4]
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (!name.trim()) {
      setErrorMsg(isTraining ? '정답 확인을 위해 성함(소속)을 입력해주세요!' : '정답 확인을 위해 이름을 꼭 입력해주세요!');
      return;
    }

    if (rawKeywords.length < 2) {
      setErrorMsg(
        isTraining
          ? '최근 경험 키워드를 최소 2개 이상(권장 3~4개) 입력해주세요!'
          : `${isWinter ? '겨울방학' : '방학'} 키워드를 최소 2개 이상(권장 3~4개) 입력해주세요!`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitQuizResponse(name, rawKeywords);
      if (res.success) {
        playPopSound();
        setSubmittedData({
          name: name.trim(),
          keywords: rawKeywords,
        });
        setIsSubmitted(true);
      } else {
        setErrorMsg(res.error || '제출에 실패했습니다. 다시 시도해주세요.');
      }
    } catch {
      setErrorMsg('제출 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNew = () => {
    setName('');
    setKeyword1('');
    setKeyword2('');
    setKeyword3('');
    setKeyword4('');
    setIsSubmitted(false);
    setSubmittedData(null);
  };

  const toggleNextSeason = () => {
    if (!onToggleSeason) return;
    const nextSeason: VacationSeason = season === 'summer' ? 'winter' : season === 'winter' ? 'training' : 'summer';
    onToggleSeason(nextSeason);
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-2 sm:px-4 animate-fadeIn select-none">
      {/* Student/Teacher Participant Form Box */}
      <div 
        className={`bg-white rounded-[40px] sm:rounded-[48px] shadow-[0_20px_0_0_#0EA5E9] border-6 sm:border-8 overflow-hidden transition-all ${
          isTraining ? 'border-[#DDD6FE]' : isWinter ? 'border-[#BAE6FD]' : 'border-[#FEF08A]'
        }`}
      >
        {/* Header Ribbon */}
        <div 
          className={`p-6 sm:p-8 text-center relative border-b-4 ${
            isTraining 
              ? 'bg-[#FAF5FF] border-[#E9D5FF]' 
              : isWinter 
              ? 'bg-[#E0F2FE] border-[#BAE6FD]' 
              : 'bg-[#FEF9C3] border-[#FEF08A]'
          }`}
        >
          {/* Season Indicator & Quick Toggle */}
          {onToggleSeason && (
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={toggleNextSeason}
                className={`px-3 py-1 rounded-xl text-xs font-black border transition-all flex items-center gap-1 shadow-xs cursor-pointer ${
                  isTraining
                    ? 'bg-white text-purple-800 border-purple-300 hover:bg-purple-50'
                    : isWinter 
                    ? 'bg-white text-sky-800 border-sky-300 hover:bg-sky-50' 
                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
                }`}
                title="모드 전환 (여름 ➔ 겨울 ➔ 교사 연수)"
              >
                {isTraining ? (
                  <>
                    <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                    <span>연수 모드</span>
                  </>
                ) : isWinter ? (
                  <>
                    <Snowflake className="w-3.5 h-3.5 text-sky-500" />
                    <span>겨울 모드</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>여름 모드</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white font-black text-xs mb-3 ${
            isTraining ? 'bg-purple-600 shadow-[0_2px_0_0_#7C3AED]' : 'bg-[#0EA5E9] shadow-[0_2px_0_0_#0284C7]'
          }`}>
            {isTraining ? <GraduationCap className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>
              {isTraining ? '선생님 참여 화면 (교사 연수 🎓)' : isWinter ? '학생 참여 화면 (겨울방학 ⛄)' : '학생 참여 화면 (방학 🏖️)'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0369A1] tracking-tight">
            {isTraining ? '선생님의 경험을 맞춰봐! 🎓💡' : isWinter ? '내 겨울방학을 맞춰봐! ⛄❄️' : '내 방학을 맞춰봐! 🏖️'}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#0369A1]/70 mt-2 max-w-md mx-auto">
            {isTraining
              ? '최근 경험한 특별한 일, 취미, 교실 에피소드, 여행 키워드를 2~4개 적어보세요. 동료 선생님들이 키워드만 보고 누구의 이야기인지 맞힐 거예요!'
              : `나의 신났던 ${isWinter ? '겨울방학' : '방학'} 키워드를 2~4개 적어보세요. 친구들이 키워드만 보고 누구의 이야기인지 맞힐 거예요!`}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8">
          {isSubmitted && submittedData ? (
            /* Success View */
            <div id="student-success-card" className="space-y-6 text-center py-4 animate-scaleUp">
              <div className="w-20 h-20 rounded-full bg-[#22C55E]/10 border-4 border-[#22C55E] text-[#22C55E] flex items-center justify-center mx-auto shadow-[0_6px_0_0_#16A34A]">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {isTraining 
                    ? '선생님 경험 키워드 제출 완료! 🎓🎉' 
                    : isWinter 
                    ? '겨울방학 키워드 제출 완료! ⛄' 
                    : '방학 키워드 제출 완료! 🎉'}
                </h2>
                <p className="text-slate-600 text-sm font-bold">
                  {isTraining ? '연수실 화면에 실시간으로 등록되었습니다.' : '선생님 전자칠판 화면에 실시간으로 등록되었습니다.'}
                </p>
              </div>

              {/* Summary of submitted keywords */}
              <div className="bg-[#F0F9FF] rounded-3xl p-6 border-4 border-[#BAE6FD] text-left space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-[#BAE6FD]">
                  <span>{isTraining ? '제출자 성함' : '제출자 이름'}</span>
                  <span className="font-black text-[#0369A1] text-base">{submittedData.name}</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-black text-[#0369A1]">
                    {isTraining ? '내가 제출한 경험 키워드' : `내가 제출한 ${isWinter ? '겨울방학' : '방학'} 키워드`}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {submittedData.keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 rounded-xl bg-white border-2 border-[#0EA5E9] text-[#0369A1] font-black text-sm shadow-[0_2px_0_0_#BAE6FD]"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  id="student-edit-new-button"
                  type="button"
                  onClick={handleResetForNew}
                  className="py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-[#0369A1] font-black text-sm border-2 border-[#BAE6FD] shadow-[0_4px_0_0_#BAE6FD] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>다시 작성하거나 수정하기</span>
                </button>

                {onBackToTeacher && (
                  <button
                    type="button"
                    onClick={onBackToTeacher}
                    className="py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm border border-slate-300 cursor-pointer"
                  >
                    {isTraining ? '연수 진행 화면으로 돌아가기' : '선생님 화면으로 돌아가기'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div 
                  id="student-error-banner"
                  className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-sm font-black flex items-center gap-2 animate-shake"
                >
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Name Field */}
              <div className="space-y-2">
                <label className="block text-sm sm:text-base font-black text-[#0369A1] flex items-center gap-1.5">
                  <span>{isTraining ? '1. 성함 (또는 학년/과목과 성함)' : '1. 내 이름 (또는 번호와 이름)'}</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  required
                  placeholder={isTraining ? "예: 3학년 김선생님 (또는 연구부 박지민 선생님)" : "예: 3번 김지우 (또는 지우)"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-[#F0F9FF] border-3 border-[#BAE6FD] text-base font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0EA5E9] focus:bg-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                />
                <p className="text-xs text-slate-500 font-bold">
                  💡 퀴즈 출제 시에는 이름이 가려지고, 정답 확인 시 공개됩니다!
                </p>
              </div>

              {/* Keywords Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm sm:text-base font-black text-[#0369A1] flex items-center gap-1.5">
                    <span>
                      {isTraining 
                        ? '2. 나의 최근 경험 키워드 (최소 2개, 권장 3~4개)' 
                        : `2. 나의 ${isWinter ? '겨울방학' : '방학'} 한 줄 키워드 (최소 2개, 권장 3~4개)`}
                    </span>
                    <span className="text-rose-500">*</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1 block">키워드 1 (필수)</label>
                    <input
                      id="keyword-input-1"
                      type="text"
                      required
                      placeholder={isTraining ? "예: 주말 10km 마라톤 완주" : isWinter ? "예: 비발디파크 눈썰매" : "예: 강원도 계곡 물놀이"}
                      value={keyword1}
                      onChange={(e) => setKeyword1(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#F0F9FF] border-2 border-[#BAE6FD] text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0EA5E9] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1 block">키워드 2 (필수)</label>
                    <input
                      id="keyword-input-2"
                      type="text"
                      required
                      placeholder={isTraining ? "예: 1일 3아메리카노 필수" : isWinter ? "예: 슈크림 붕어빵 5개" : "예: 마라탕 2단계"}
                      value={keyword2}
                      onChange={(e) => setKeyword2(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#F0F9FF] border-2 border-[#BAE6FD] text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0EA5E9] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1 block">키워드 3 (선택)</label>
                    <input
                      id="keyword-input-3"
                      type="text"
                      placeholder={isTraining ? "예: 베란다 방울토마토 수확" : isWinter ? "예: 집 앞 눈사람 만들기" : "예: 12시까지 늦잠"}
                      value={keyword3}
                      onChange={(e) => setKeyword3(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#F0F9FF] border-2 border-[#BAE6FD] text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0EA5E9] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-slate-500 mb-1 block">키워드 4 (선택)</label>
                    <input
                      id="keyword-input-4"
                      type="text"
                      placeholder={isTraining ? "예: 생성형 AI 수업 적용" : isWinter ? "예: 전기장판에서 귤 까먹기" : "예: 엔트리 게임 개발"}
                      value={keyword4}
                      onChange={(e) => setKeyword4(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#F0F9FF] border-2 border-[#BAE6FD] text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#0EA5E9] focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Recommended Popular Tags */}
              <div className="bg-[#F0F9FF] rounded-3xl p-4 sm:p-5 border-2 border-[#BAE6FD] space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#0369A1]">
                  <Tag className="w-3.5 h-3.5" />
                  <span>
                    {isTraining 
                      ? '추천 경험 키워드 (클릭하면 바로 입력돼요!)' 
                      : `추천 ${isWinter ? '겨울방학' : '방학'} 키워드 (클릭하면 바로 입력돼요!)`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 border border-[#BAE6FD] text-xs font-bold text-[#0369A1] transition-colors shadow-xs active:scale-95 cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="submit-keywords-button"
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-2xl text-white font-black text-lg sm:text-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                  isTraining
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-[0_8px_0_0_#6D28D9] hover:translate-y-1 hover:shadow-[0_4px_0_0_#6D28D9]'
                    : 'bg-[#0EA5E9] hover:bg-[#0284C7] shadow-[0_8px_0_0_#0284C7] hover:translate-y-1 hover:shadow-[0_4px_0_0_#0284C7]'
                }`}
              >
                <Send className="w-5 h-5" />
                <span>
                  {isSubmitting 
                    ? (isTraining ? '연수 진행 화면으로 전송 중...' : '선생님 화면으로 전송 중...') 
                    : isTraining 
                    ? '선생님 경험 키워드 제출하기! 🎓' 
                    : `${isWinter ? '겨울방학' : '방학'} 키워드 제출하기!`}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
