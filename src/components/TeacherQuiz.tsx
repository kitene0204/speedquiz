import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Shuffle, 
  Award,
  Users
} from 'lucide-react';
import { QuizResponse, VacationSeason } from '../types';
import { markResponseAsShown, resetShownStatusAll } from '../lib/supabase';
import { playFanfareSound, playPopSound } from '../lib/sound';

interface TeacherQuizProps {
  responses: QuizResponse[];
  onBackToLobby: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  season: VacationSeason;
}

export function TeacherQuiz({
  responses,
  onBackToLobby,
  isMuted,
  onToggleMute,
  season,
}: TeacherQuizProps) {
  const [currentQuiz, setCurrentQuiz] = useState<QuizResponse | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isWinter = season === 'winter';
  const isTraining = season === 'training';

  // Compute stats
  const totalCount = responses.length;
  const completedCount = responses.filter(r => r.is_shown).length;
  const unshownItems = responses.filter(r => !r.is_shown);

  // Select a random unshown response
  const pickRandomUnshown = useCallback((available: QuizResponse[], excludeId?: string) => {
    const candidates = excludeId ? available.filter(r => r.id !== excludeId) : available;
    const pool = candidates.length > 0 ? candidates : available;
    if (pool.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }, []);

  // Initialize or re-pick when responses change
  useEffect(() => {
    if (!currentQuiz) {
      const next = pickRandomUnshown(unshownItems);
      if (next) {
        setCurrentQuiz(next);
        setIsRevealed(false);
      }
    } else {
      // If current quiz was deleted or changed
      const stillExists = responses.find(r => r.id === currentQuiz.id);
      if (!stillExists) {
        const next = pickRandomUnshown(unshownItems);
        setCurrentQuiz(next);
        setIsRevealed(false);
      }
    }
  }, [responses, unshownItems, currentQuiz, pickRandomUnshown]);

  const fireConfetti = () => {
    try {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    } catch {
      // ignore
    }
  };

  const handleRevealAnswer = async () => {
    if (!currentQuiz || isRevealed) return;
    setIsRevealed(true);
    playFanfareSound();
    fireConfetti();
    // System updates is_shown to true in the database
    await markResponseAsShown(currentQuiz.id, true);
  };

  const handleNextQuiz = async () => {
    playPopSound();
    // Ensure current item is marked as shown
    if (currentQuiz && !currentQuiz.is_shown) {
      await markResponseAsShown(currentQuiz.id, true);
    }

    // Pick next unshown from remaining
    const remaining = unshownItems.filter(r => r.id !== currentQuiz?.id);
    if (remaining.length > 0) {
      const next = pickRandomUnshown(remaining);
      setCurrentQuiz(next);
      setIsRevealed(false);
    } else {
      // No more left!
      setCurrentQuiz(null);
      setIsRevealed(false);
      fireConfetti();
    }
  };

  const handleShuffleAnother = () => {
    playPopSound();
    const next = pickRandomUnshown(unshownItems, currentQuiz?.id);
    if (next) {
      setCurrentQuiz(next);
      setIsRevealed(false);
    }
  };

  const handleResetAllQuiz = async () => {
    await resetShownStatusAll();
    playPopSound();
    setIsRevealed(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // If all completed or no items
  const isFinished = totalCount > 0 && unshownItems.length === 0 && (!currentQuiz || isRevealed);

  if (isFinished && !currentQuiz) {
    return (
      <div className="max-w-5xl mx-auto w-full px-4 py-8 animate-fadeIn">
        <div 
          className={`bg-white rounded-[40px] sm:rounded-[48px] shadow-[0_20px_0_0_#0EA5E9] flex flex-col overflow-hidden border-6 sm:border-8 p-6 sm:p-12 text-center space-y-8 ${
            isTraining ? 'border-[#DDD6FE]' : isWinter ? 'border-[#BAE6FD]' : 'border-[#FEF08A]'
          }`}
        >
          <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center rotate-3 border-4 text-4xl ${
            isTraining 
              ? 'bg-[#F3E8FF] text-purple-700 shadow-[0_8px_0_0_#C084FC] border-[#E9D5FF]' 
              : 'bg-[#FEF08A] text-[#0369A1] shadow-[0_8px_0_0_#FACC15] border-[#FDE047]'
          }`}>
            {isTraining ? '🎓' : isWinter ? '⛄' : '🏆'}
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black text-[#0369A1] tracking-tight">
              {isTraining 
                ? '와아! 모든 교사 연수 퀴즈 완료! 🎓🎉' 
                : isWinter 
                ? '와아! 모든 겨울방학 퀴즈 완료! ⛄🎉' 
                : '와아! 모든 방학 퀴즈 완료! 🎊'}
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-lg mx-auto font-bold">
              {isTraining ? (
                <>참여하신 선생님 <strong className="text-purple-700">{totalCount}분</strong>의 경험 키워드를 모두 함께 나누었습니다!</>
              ) : (
                <>우리 반 친구 <strong className="text-[#0369A1]">{totalCount}명</strong>의 {isWinter ? '겨울방학' : '방학'} 키워드를 모두 맞혔습니다!</>
              )}
            </p>
          </div>

          {/* All Responses Gallery */}
          <div className="bg-[#F0F9FF] rounded-3xl p-6 sm:p-8 border-4 border-[#BAE6FD] text-left space-y-4">
            <h2 className="text-lg font-black text-[#0369A1] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0EA5E9]" />
              <span>
                {isTraining 
                  ? `선생님들의 경험 키워드 모아보기 (${totalCount}명)` 
                  : `우리 반 ${isWinter ? '겨울방학' : '방학'} 키워드 모아보기 (${totalCount}명)`}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
              {responses.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white border-2 border-[#BAE6FD] shadow-[0_4px_0_0_#BAE6FD] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[#0369A1] text-base">
                      {item.student_name}
                    </span>
                    <span className="text-xs text-white bg-[#22C55E] px-2.5 py-0.5 rounded-full font-bold shadow-xs">
                      완료
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-xs bg-[#F0F9FF] text-[#0369A1] font-bold px-2 py-0.5 rounded-md border border-[#BAE6FD]"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <button
              id="quiz-replay-all-button"
              onClick={handleResetAllQuiz}
              className={`py-4 px-8 rounded-2xl text-white font-black text-xl transition-all active:translate-y-2 active:shadow-none flex items-center justify-center gap-2 cursor-pointer ${
                isTraining
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-[0_8px_0_0_#7C3AED] hover:translate-y-1 hover:shadow-[0_4px_0_0_#7C3AED]'
                  : 'bg-[#0EA5E9] hover:bg-[#0284C7] shadow-[0_8px_0_0_#0284C7] hover:translate-y-1 hover:shadow-[0_4px_0_0_#0284C7]'
              }`}
            >
              <RotateCcw className="w-5 h-5" />
              <span>처음부터 다시 맞히기</span>
            </button>
            <button
              id="quiz-return-lobby-button"
              onClick={onBackToLobby}
              className="py-4 px-8 rounded-2xl bg-slate-200 text-slate-700 hover:bg-slate-300 font-black text-xl transition-all shadow-[0_8px_0_0_#94A3B8] hover:translate-y-1 hover:shadow-[0_4px_0_0_#94A3B8] active:translate-y-2 active:shadow-none flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>대기 화면으로 돌아가기</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz View - Theme matching the Design HTML
  const currentNumber = completedCount + (isRevealed ? 0 : 1);

  return (
    <div className="max-w-6xl mx-auto w-full select-none animate-fadeIn">
      {/* The Iconic Theme Frame */}
      <div 
        id="quiz-main-stage"
        className={`bg-white rounded-[40px] sm:rounded-[48px] shadow-[0_20px_0_0_#0EA5E9] flex flex-col overflow-hidden border-6 sm:border-8 ${
          isTraining ? 'border-[#DDD6FE]' : isWinter ? 'border-[#BAE6FD]' : 'border-[#FEF08A]'
        }`}
      >
        {/* Header Bar */}
        <header 
          className={`min-h-20 sm:h-24 flex flex-wrap items-center justify-between px-6 sm:px-12 py-3 border-b-4 gap-4 ${
            isTraining 
              ? 'bg-[#FAF5FF] border-[#E9D5FF]' 
              : isWinter 
              ? 'bg-[#E0F2FE] border-[#BAE6FD]' 
              : 'bg-[#FEF9C3] border-[#FEF08A]'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`text-white px-5 sm:px-6 py-1.5 sm:py-2 rounded-full font-bold text-base sm:text-xl ${
              isTraining ? 'bg-purple-600 shadow-[0_3px_0_0_#7C3AED]' : 'bg-[#0EA5E9] shadow-[0_3px_0_0_#0284C7]'
            }`}>
              제 {currentNumber} / {totalCount} 번
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-[#0369A1] tracking-tight">
              {isTraining 
                ? '교사 연수 경험 키워드 퀴즈 🎓' 
                : isWinter 
                ? '겨울방학 키워드 스피드 퀴즈 ⛄' 
                : '방학 키워드 스피드 퀴즈'}
            </h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex flex-col items-end">
              <span className="text-xs sm:text-sm font-bold text-[#0369A1]/60 uppercase tracking-widest">
                참여 인원
              </span>
              <span className="text-lg sm:text-2xl font-black text-[#0369A1]">
                {completedCount} / {totalCount}명 완료
              </span>
            </div>

            {/* Quick controls: sound, shuffle, fullscreen, exit */}
            <div className="flex items-center gap-1.5">
              {unshownItems.length > 1 && !isRevealed && (
                <button
                  id="quiz-shuffle-button"
                  onClick={handleShuffleAnother}
                  className="p-2.5 rounded-xl bg-white text-[#0369A1] border-2 border-[#BAE6FD] hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                  title="다른 문제로 건너뛰기"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              )}

              <button
                id="quiz-sound-toggle-button"
                onClick={onToggleMute}
                className="p-2.5 rounded-xl bg-white text-[#0369A1] border-2 border-[#BAE6FD] hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                title={isMuted ? '소리 켜기' : '소리 끄기'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#0EA5E9]" />}
              </button>

              <button
                id="quiz-fullscreen-button"
                onClick={toggleFullscreen}
                className="p-2.5 rounded-xl bg-white text-[#0369A1] border-2 border-[#BAE6FD] hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                title={isFullscreen ? '전체화면 종료' : '전체화면'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center relative min-h-[460px]">
          {/* Eyebrow badge */}
          <div className="inline-block bg-rose-100 text-rose-600 px-8 py-1.5 rounded-full text-sm font-black tracking-widest uppercase mb-8 shadow-xs">
            {isTraining 
              ? '어떤 선생님의 최근 경험일까요? 🎓💡' 
              : isWinter 
              ? '누구의 겨울방학일까요? ❄️' 
              : '누구의 방학일까요? 🏖️'}
          </div>

          {/* Large Keyword Cards */}
          {currentQuiz && (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-5xl">
              {currentQuiz.keywords.map((keyword, index) => (
                <div
                  key={index}
                  className="bg-white border-4 border-[#BAE6FD] text-[#0369A1] text-3xl sm:text-5xl lg:text-6xl font-black px-6 sm:px-10 py-4 sm:py-8 rounded-[24px] sm:rounded-[32px] shadow-[0_12px_0_0_#BAE6FD] hover:scale-105 transition-transform"
                >
                  # {keyword}
                </div>
              ))}
            </div>
          )}

          {/* Mystery Question or Revealed Answer Card */}
          <div className="w-full max-w-2xl">
            {!isRevealed ? (
              <div className="w-full bg-slate-50 rounded-3xl p-6 sm:p-8 border-4 border-dashed border-slate-200">
                <div className="flex items-center justify-center gap-4 opacity-30">
                  <span className="text-6xl sm:text-8xl font-black text-slate-400 tracking-[0.2em] animate-pulse">
                    ???
                  </span>
                </div>
              </div>
            ) : (
              <div 
                id="quiz-answer-revealed"
                className="w-full bg-[#F0FDF4] rounded-3xl p-6 sm:p-8 border-4 border-[#86EFAC] shadow-[0_12px_0_0_#86EFAC] text-center space-y-2 animate-scaleUp"
              >
                <div className="text-emerald-600 text-sm sm:text-base font-black uppercase tracking-widest">
                  🎉 정답 공개! 🎉
                </div>
                <div className="text-4xl sm:text-6xl lg:text-7xl font-black text-emerald-950 tracking-tight">
                  {currentQuiz?.student_name}
                </div>
                <div className="text-emerald-700 font-bold text-sm sm:text-base">
                  {isTraining
                    ? '선생님의 특별하고 유익했던 최근 경험이었습니다! 👏✨'
                    : isWinter 
                    ? '친구의 신나는 겨울방학 이야기였습니다! ⛄❄️' 
                    : '친구의 즐거운 방학 이야기였습니다! 👏'}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer Controls Bar */}
        <footer className="min-h-24 sm:h-32 bg-[#F0F9FF] border-t-4 border-[#BAE6FD] flex flex-wrap items-center justify-between px-6 sm:px-12 py-4 gap-4">
          <div className="flex gap-3">
            <button
              id="quiz-back-button"
              onClick={onBackToLobby}
              className="bg-slate-200 text-slate-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-slate-300 shadow-[0_4px_0_0_#CBD5E1] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>대기실</span>
            </button>
          </div>

          {/* Action Button: Reveal vs Next */}
          <div className="flex gap-4">
            {!isRevealed ? (
              <button
                id="reveal-answer-button"
                onClick={handleRevealAnswer}
                className={`text-white px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl font-black text-xl sm:text-2xl hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all cursor-pointer ${
                  isTraining
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-[0_8px_0_0_#7C3AED] hover:shadow-[0_4px_0_0_#7C3AED]'
                    : 'bg-[#0EA5E9] text-white shadow-[0_8px_0_0_#0284C7] hover:shadow-[0_4px_0_0_#0284C7]'
                }`}
              >
                정답 확인
              </button>
            ) : (
              <button
                id="next-quiz-button"
                onClick={handleNextQuiz}
                className="bg-[#22C55E] text-white px-8 sm:px-12 py-3.5 sm:py-4 rounded-2xl font-black text-xl sm:text-2xl shadow-[0_8px_0_0_#16A34A] hover:translate-y-1 hover:shadow-[0_4px_0_0_#16A34A] active:translate-y-2 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{unshownItems.length <= 1 ? '결과 보기' : '다음 문제'}</span>
                <span>▶</span>
              </button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="w-[120px] text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
              진행률 ({totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%)
            </div>
            <div className="w-full bg-slate-200 h-3 rounded-full mt-1 overflow-hidden">
              <div 
                className="bg-[#22C55E] h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
