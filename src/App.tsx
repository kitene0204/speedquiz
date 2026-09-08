/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  fetchQuizResponses, 
  subscribeToQuizChanges, 
  isSupabaseConfigured 
} from './lib/supabase';
import { QuizResponse, AppRole, VacationSeason } from './types';
import { TeacherLobby } from './components/TeacherLobby';
import { TeacherQuiz } from './components/TeacherQuiz';
import { StudentForm } from './components/StudentForm';
import { SupabaseGuideModal } from './components/SupabaseGuideModal';
import { SnowEffect } from './components/SnowEffect';
import { toggleMute, getMuteState } from './lib/sound';
import { Users, Presentation, Database, HelpCircle, Snowflake, Sun, GraduationCap } from 'lucide-react';

const SEASON_STORAGE_KEY = 'vacation_quiz_season_v1';
const KEYWORD_COUNT_STORAGE_KEY = 'vacation_quiz_keyword_count_v1';

export default function App() {
  // Detect role from URL query (e.g. ?role=student) or default to teacher
  const [role, setRole] = useState<AppRole>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryRole = params.get('role');
      if (queryRole === 'student') return 'student';
    }
    return 'teacher';
  });

  // Detect season/mode: summer | winter | training
  const [season, setSeason] = useState<VacationSeason>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const querySeason = params.get('season') || params.get('mode');
      if (querySeason === 'winter' || querySeason === 'summer' || querySeason === 'training') {
        return querySeason;
      }
      const saved = localStorage.getItem(SEASON_STORAGE_KEY);
      if (saved === 'winter' || saved === 'summer' || saved === 'training') {
        return saved as VacationSeason;
      }
    }
    return 'summer';
  });

  // Adjustable number of keywords/questions (문항 수 조절: 기본 3~4개, 1~6개 조절 가능)
  const [keywordCount, setKeywordCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryCount = parseInt(params.get('count') || params.get('keywords') || '', 10);
      if (queryCount >= 1 && queryCount <= 8) {
        return queryCount;
      }
      const saved = localStorage.getItem(KEYWORD_COUNT_STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed >= 1 && parsed <= 8) {
          return parsed;
        }
      }
    }
    return 3;
  });

  const [teacherScreen, setTeacherScreen] = useState<'lobby' | 'quiz'>('lobby');
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(getMuteState());

  const isWinter = season === 'winter';
  const isTraining = season === 'training';

  // Load responses from Supabase (or local storage fallback)
  const refreshResponses = useCallback(async () => {
    try {
      const data = await fetchQuizResponses();
      setResponses(data);
    } catch (err) {
      console.error('Failed to load quiz responses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshResponses();

    // Subscribe to Realtime updates (Supabase Realtime + BroadcastChannel + window storage)
    const unsubscribe = subscribeToQuizChanges(() => {
      refreshResponses();
    });

    return () => {
      unsubscribe();
    };
  }, [refreshResponses]);

  // Keep URL query in sync when teacher switches role or season
  const syncUrlParams = (newRole: AppRole, newSeason: VacationSeason) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newRole === 'student') {
        url.searchParams.set('role', 'student');
      } else {
        url.searchParams.delete('role');
      }

      if (newSeason === 'winter') {
        url.searchParams.set('season', 'winter');
      } else if (newSeason === 'training') {
        url.searchParams.set('season', 'training');
      } else {
        url.searchParams.delete('season');
      }
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleKeywordCountChange = (newCount: number) => {
    const clamped = Math.max(1, Math.min(8, newCount));
    setKeywordCount(clamped);
    try {
      localStorage.setItem(KEYWORD_COUNT_STORAGE_KEY, String(clamped));
    } catch {
      // ignore
    }
  };

  const handleRoleChange = (newRole: AppRole) => {
    setRole(newRole);
    syncUrlParams(newRole, season);
  };

  const handleSeasonChange = (newSeason: VacationSeason) => {
    setSeason(newSeason);
    try {
      localStorage.setItem(SEASON_STORAGE_KEY, newSeason);
    } catch {
      // ignore
    }
    syncUrlParams(role, newSeason);
  };

  const handleToggleMute = () => {
    const next = toggleMute();
    setIsMuted(next);
  };

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isTraining ? 'bg-[#EDE9FE]' : isWinter ? 'bg-[#E0F2FE]' : 'bg-[#BAE6FD]'
      } text-slate-800 selection:bg-amber-300 selection:text-amber-950 font-sans relative`}
    >
      {/* Gentle winter falling snowflakes */}
      {isWinter && <SnowEffect />}

      {/* Top Navigation Bar */}
      <header 
        className={`sticky top-0 z-40 border-b-4 transition-colors duration-300 shadow-xs ${
          isTraining 
            ? 'bg-[#FAF5FF] border-[#E9D5FF]' 
            : isWinter 
            ? 'bg-[#EFF6FF] border-[#BFDBFE]' 
            : 'bg-[#FEF9C3] border-[#FEF08A]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-20 py-2 flex flex-wrap items-center justify-between gap-4">
          {/* Logo */}
          <div 
            onClick={() => {
              if (role === 'teacher') setTeacherScreen('lobby');
            }}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div 
              className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center font-black border-2 border-white transition-all text-2xl ${
                isTraining
                  ? 'bg-purple-600 shadow-[0_4px_0_0_#7C3AED]'
                  : isWinter
                  ? 'bg-sky-500 shadow-[0_4px_0_0_#0284C7]'
                  : 'bg-[#0EA5E9] shadow-[0_4px_0_0_#0284C7]'
              }`}
            >
              {isTraining ? '🎓' : isWinter ? '⛄' : '🏖️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl sm:text-2xl text-[#0369A1] tracking-tight">
                  {isTraining ? '선생님의 경험을 맞춰봐!' : isWinter ? '내 겨울방학을 맞춰봐!' : '내 방학을 맞춰봐!'}
                </span>
                <span className={`hidden sm:inline-block px-3 py-0.5 rounded-full text-white text-xs font-bold shadow-xs ${
                  isTraining ? 'bg-purple-600' : isWinter ? 'bg-sky-500' : 'bg-[#0EA5E9]'
                }`}>
                  {isTraining ? '교사 연수 동기유발 💡' : isWinter ? '겨울방학 퀴즈 ❄️' : '스피드 퀴즈'}
                </span>
              </div>
              <p className="text-xs font-bold text-[#0369A1]/70 hidden md:block">
                {isTraining
                  ? '교사 연수 동기유발 & 아이스브레이킹을 위한 경험 키워드 공유 퀴즈'
                  : `초·중·고등학생 및 교사를 위한 ${isWinter ? '겨울방학' : '방학'} 키워드 공유 퀴즈`}
              </p>
            </div>
          </div>

          {/* Center: Season/Mode Switcher & Role Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Mode Switcher (여름방학 🏖️ / 겨울방학 ⛄ / 교사 연수 🎓) */}
            <div 
              id="season-mode-toggle"
              className="flex items-center bg-white/95 p-1 rounded-2xl border-2 shadow-xs transition-colors"
              style={{ borderColor: isTraining ? '#DDD6FE' : isWinter ? '#93C5FD' : '#FEF08A' }}
            >
              <button
                id="season-tab-summer"
                type="button"
                onClick={() => handleSeasonChange('summer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                  season === 'summer'
                    ? 'bg-amber-400 text-amber-950 shadow-[0_2px_0_0_#D97706]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="여름방학 모드로 전환"
              >
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>여름방학 🏖️</span>
              </button>

              <button
                id="season-tab-winter"
                type="button"
                onClick={() => handleSeasonChange('winter')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                  season === 'winter'
                    ? 'bg-sky-500 text-white shadow-[0_2px_0_0_#0284C7]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="겨울방학 모드로 전환"
              >
                <Snowflake className="w-3.5 h-3.5 text-white" />
                <span>겨울방학 ⛄</span>
              </button>

              <button
                id="season-tab-training"
                type="button"
                onClick={() => handleSeasonChange('training')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                  season === 'training'
                    ? 'bg-purple-600 text-white shadow-[0_2px_0_0_#6D28D9]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="교사 연수 모드로 전환 (아이스브레이킹 & 동기유발)"
              >
                <GraduationCap className="w-4 h-4 text-purple-200" />
                <span>교사 연수 🎓</span>
              </button>
            </div>

            {/* Role Switcher Tabs */}
            <div 
              className="flex items-center bg-white/95 p-1 rounded-2xl border-2 shadow-xs transition-colors"
              style={{ borderColor: isTraining ? '#DDD6FE' : isWinter ? '#93C5FD' : '#FEF08A' }}
            >
              <button
                id="role-tab-teacher"
                type="button"
                onClick={() => handleRoleChange('teacher')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                  role === 'teacher'
                    ? (isTraining ? 'bg-purple-600 text-white shadow-[0_3px_0_0_#6D28D9]' : 'bg-[#0EA5E9] text-white shadow-[0_3px_0_0_#0284C7]')
                    : 'text-[#0369A1] hover:bg-slate-100'
                }`}
              >
                <Presentation className="w-4 h-4" />
                <span>{isTraining ? '진행자 (연수)' : '교사 (진행자)'}</span>
              </button>
              <button
                id="role-tab-student"
                type="button"
                onClick={() => handleRoleChange('student')}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                  role === 'student'
                    ? (isTraining ? 'bg-purple-600 text-white shadow-[0_3px_0_0_#6D28D9]' : 'bg-[#0EA5E9] text-white shadow-[0_3px_0_0_#0284C7]')
                    : 'text-[#0369A1] hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{isTraining ? '선생님 (참여)' : '학생 (참여자)'}</span>
              </button>
            </div>
          </div>

          {/* Right: Database Connection Indicator & Guide Button */}
          <div className="flex items-center gap-2">
            <button
              id="top-supabase-badge"
              onClick={() => setIsGuideOpen(true)}
              className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all border-2 cursor-pointer ${
                isSupabaseConfigured
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-[0_3px_0_0_#059669]'
                  : 'bg-white text-[#0369A1] border-[#0EA5E9] shadow-[0_3px_0_0_#BAE6FD] hover:bg-slate-50'
              }`}
              title="Supabase 실시간 연동 상태 확인 및 설정 가이드"
            >
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-white animate-pulse' : 'bg-[#0EA5E9]'}`} />
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConfigured ? 'Supabase 연동 중' : 'Supabase 설정'}</span>
            </button>
            <button
              id="top-guide-icon-button"
              onClick={() => setIsGuideOpen(true)}
              className="p-2.5 rounded-xl bg-white text-[#0369A1] border-2 border-[#FEF08A] shadow-xs sm:hidden cursor-pointer"
              title="설정 가이드"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 flex flex-col justify-center py-6 sm:py-8 px-3 sm:px-6 relative z-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-[#0369A1] space-y-3">
            <div className="w-10 h-10 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin" />
            <p className="text-base font-bold">데이터를 불러오는 중입니다...</p>
          </div>
        ) : role === 'student' ? (
          <StudentForm
            onBackToTeacher={() => handleRoleChange('teacher')}
            season={season}
            onToggleSeason={handleSeasonChange}
            initialKeywordCount={keywordCount}
            onKeywordCountChange={handleKeywordCountChange}
          />
        ) : teacherScreen === 'lobby' ? (
          <TeacherLobby
            responses={responses}
            onStartQuiz={() => setTeacherScreen('quiz')}
            onOpenSupabaseGuide={() => setIsGuideOpen(true)}
            onSwitchToStudent={() => handleRoleChange('student')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            isSupabaseConnected={isSupabaseConfigured}
            season={season}
            onToggleSeason={handleSeasonChange}
            keywordCount={keywordCount}
            onKeywordCountChange={handleKeywordCountChange}
          />
        ) : (
          <TeacherQuiz
            responses={responses}
            onBackToLobby={() => setTeacherScreen('lobby')}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            season={season}
          />
        )}
      </main>

      {/* Footer info bar */}
      <footer className="py-4 max-w-7xl mx-auto px-4 sm:px-8 w-full flex flex-col sm:flex-row justify-between items-center gap-2 relative z-20">
        <p className="text-[#0369A1] font-bold text-xs sm:text-sm flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-sky-500'}`} />
          <span>슈파베이스 리얼타임 엔진 {isSupabaseConfigured ? '연결됨' : '연동 대기 (로컬 모드)'}</span>
          {isWinter && (
            <span className="ml-2 px-2 py-0.5 rounded-md bg-white/80 text-sky-700 text-xs border border-sky-300">
              ⛄ 겨울방학 모드 ON
            </span>
          )}
          {isTraining && (
            <span className="ml-2 px-2 py-0.5 rounded-md bg-white/80 text-purple-700 text-xs border border-purple-300">
              🎓 교사 연수 모드 ON
            </span>
          )}
        </p>
        <p className="text-[#0369A1] font-bold text-xs sm:text-sm opacity-60 text-right uppercase tracking-widest">
          {isTraining ? 'TEACHER WORKSHOP QUIZ • TRAINING MODE' : `VACATION KEYWORD QUIZ • ${season.toUpperCase()} MODE`}
        </p>
      </footer>

      {/* Supabase SQL Schema & Guide Modal */}
      <SupabaseGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
