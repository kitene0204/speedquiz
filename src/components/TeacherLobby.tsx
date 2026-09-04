import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Play, 
  RotateCcw, 
  Trash2, 
  Users, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Database,
  Volume2,
  VolumeX,
  PlusCircle,
  HelpCircle,
  Snowflake,
  GraduationCap
} from 'lucide-react';
import { QuizResponse, VacationSeason } from '../types';
import { deleteAllResponses, resetShownStatusAll, seedSampleResponses } from '../lib/supabase';
import { playPopSound } from '../lib/sound';

interface TeacherLobbyProps {
  responses: QuizResponse[];
  onStartQuiz: () => void;
  onOpenSupabaseGuide: () => void;
  onSwitchToStudent: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isSupabaseConnected: boolean;
  season: VacationSeason;
  onToggleSeason: (newSeason: VacationSeason) => void;
}

export function TeacherLobby({
  responses,
  onStartQuiz,
  onOpenSupabaseGuide,
  onSwitchToStudent,
  isMuted,
  onToggleMute,
  isSupabaseConnected,
  season,
  onToggleSeason,
}: TeacherLobbyProps) {
  const [copied, setCopied] = useState(false);
  const [hideNames, setHideNames] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isWinter = season === 'winter';
  const isTraining = season === 'training';

  // Student participation URL with season parameter preserved
  const studentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?role=student&season=${season}`
    : '';

  const totalCount = responses.length;
  const unshownCount = responses.filter(r => !r.is_shown).length;
  const shownCount = totalCount - unshownCount;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(studentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      playPopSound();
    } catch {
      // Fallback
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedSampleResponses(season);
      playPopSound();
    } finally {
      setIsSeeding(false);
    }
  };

  const handleResetShown = async () => {
    await resetShownStatusAll();
    playPopSound();
  };

  const handleDeleteAll = async () => {
    await deleteAllResponses();
    setShowDeleteConfirm(false);
    playPopSound();
  };

  const toggleSeasonMode = () => {
    playPopSound();
    const nextSeason: VacationSeason = season === 'summer' ? 'winter' : season === 'winter' ? 'training' : 'summer';
    onToggleSeason(nextSeason);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 space-y-8 select-none animate-fadeIn">
      {/* Top Banner / Classroom Title */}
      <div 
        className={`bg-white rounded-[40px] sm:rounded-[48px] shadow-[0_16px_0_0_#0EA5E9] border-6 sm:border-8 overflow-hidden transition-colors ${
          isTraining ? 'border-[#DDD6FE]' : isWinter ? 'border-[#BAE6FD]' : 'border-[#FEF08A]'
        }`}
      >
        <div 
          className={`p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left transition-colors border-b-4 ${
            isTraining 
              ? 'bg-[#FAF5FF] border-[#E9D5FF]' 
              : isWinter 
              ? 'bg-[#E0F2FE] border-[#BAE6FD]' 
              : 'bg-[#FEF9C3] border-[#FEF08A]'
          }`}
        >
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white font-black text-xs ${
                isTraining 
                  ? 'bg-purple-600 shadow-[0_2px_0_0_#7C3AED]' 
                  : 'bg-[#0EA5E9] shadow-[0_2px_0_0_#0284C7]'
              }`}>
                {isTraining ? <GraduationCap className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>
                  {isTraining 
                    ? '연수 진행자 모드 (교사 연수 대기실 🎓)' 
                    : isWinter 
                    ? '선생님 진행자 모드 (겨울방학 대기실 ⛄)' 
                    : '선생님 진행자 모드 (여름방학 대기실 🏖️)'}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleSeasonMode}
                className={`px-3 py-1 rounded-full text-xs font-black border transition-all cursor-pointer ${
                  isTraining
                    ? 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200'
                    : isWinter 
                    ? 'bg-white text-sky-700 border-sky-300 hover:bg-sky-50' 
                    : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                }`}
                title="클릭하여 모드 변경 (여름 ➔ 겨울 ➔ 교사 연수)"
              >
                {isTraining 
                  ? '🎓 교사 연수 모드 (클릭 전환)' 
                  : isWinter 
                  ? '❄️ 겨울방학 모드 (클릭 전환)' 
                  : '☀️ 여름방학 모드 (클릭 전환)'}
              </button>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0369A1] tracking-tight">
              {isTraining 
                ? '선생님의 경험을 맞춰봐! 🎓💡' 
                : isWinter 
                ? '내 겨울방학을 맞춰봐! ⛄❄️' 
                : '내 방학을 맞춰봐! 🏖️'}
            </h1>
            <p className="text-[#0369A1]/80 text-sm sm:text-base font-bold max-w-xl">
              {isTraining
                ? '화면의 QR 코드를 연수실 화면에 띄워주세요. 선생님들이 스마트폰으로 최근 경험한 일(취미, 특별한 경험, 방학 이야기 등) 키워드를 제출합니다!'
                : isWinter
                ? '화면의 QR 코드를 전자칠판에 띄워주세요. 학생들이 스마트폰이나 태블릿으로 겨울방학 키워드를 제출합니다!'
                : '화면의 QR 코드를 전자칠판에 띄워주세요. 학생들이 스마트폰이나 태블릿으로 자신의 방학 키워드를 제출합니다!'}
            </p>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-end">
            <button
              id="toggle-sound-button"
              onClick={onToggleMute}
              className={`px-4 py-3 rounded-2xl border-2 font-black text-sm transition-all flex items-center gap-2 cursor-pointer ${
                isMuted 
                  ? 'bg-slate-100 text-slate-400 border-slate-300' 
                  : 'bg-white text-[#0369A1] border-[#BAE6FD] shadow-[0_4px_0_0_#BAE6FD]'
              }`}
              title={isMuted ? '효과음 켜기' : '효과음 음소거'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-[#0EA5E9]" />}
              <span>{isMuted ? '음소거' : '효과음'}</span>
            </button>

            <button
              id="open-supabase-guide-button"
              onClick={onOpenSupabaseGuide}
              className={`px-4 py-3 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                isSupabaseConnected
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-[0_4px_0_0_#059669]'
                  : 'bg-white hover:bg-slate-50 text-[#0369A1] border-[#BAE6FD] shadow-[0_4px_0_0_#BAE6FD]'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>{isSupabaseConnected ? 'Supabase 연동 중' : 'Supabase 설정'}</span>
            </button>

            <button
              id="switch-student-preview-button"
              onClick={onSwitchToStudent}
              className={`px-4 py-3 rounded-2xl text-white font-black text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                isTraining
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-[0_4px_0_0_#6D28D9]'
                  : 'bg-[#0EA5E9] hover:bg-[#0284C7] shadow-[0_4px_0_0_#0284C7]'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>{isTraining ? '선생님 참여 화면 미리보기' : '학생 화면 미리보기'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = QR & Access, Right = Participants & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: QR Code Card (Big for classroom/training projection) */}
        <div 
          className={`lg:col-span-5 bg-white rounded-[36px] sm:rounded-[44px] p-6 sm:p-8 shadow-[0_16px_0_0_#0EA5E9] border-6 flex flex-col items-center text-center space-y-5 ${
            isTraining ? 'border-[#DDD6FE]' : isWinter ? 'border-[#BAE6FD]' : 'border-[#FEF08A]'
          }`}
        >
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border-2 ${
            isTraining 
              ? 'bg-[#F3E8FF] text-purple-800 border-purple-200' 
              : 'bg-[#BAE6FD] text-[#0369A1] border-[#0EA5E9]/20'
          }`}>
            <span>
              {isTraining 
                ? '🎓 선생님 참여 QR 코드 (교사 연수)' 
                : isWinter 
                ? '⛄ 학생 참여 QR 코드 (겨울방학)' 
                : '📱 학생 참여 QR 코드 (여름방학)'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#0369A1] tracking-tight">
            카메라로 QR을 스캔하세요!
          </h2>

          {/* QR Code Container */}
          <div 
            id="qr-code-display-card"
            className={`p-5 sm:p-6 rounded-3xl border-4 shadow-[0_8px_0_0_#BAE6FD] flex items-center justify-center transition-transform hover:scale-[1.02] ${
              isTraining ? 'bg-[#FAF5FF] border-[#DDD6FE]' : 'bg-[#F0F9FF] border-[#BAE6FD]'
            }`}
          >
            <QRCodeSVG
              value={studentUrl}
              size={220}
              level="M"
              includeMargin={false}
              className="rounded-xl shadow-xs"
            />
          </div>

          {/* Direct URL copy */}
          <div className="w-full space-y-2 pt-2">
            <p className="text-xs text-[#0369A1]/70 font-bold">
              QR 스캔이 어렵다면 아래 주소로 직접 접속할 수 있습니다:
            </p>
            <div className="flex items-center gap-2 bg-[#F0F9FF] border-2 border-[#BAE6FD] rounded-2xl p-2">
              <input
                type="text"
                readOnly
                value={studentUrl}
                className="w-full bg-transparent text-xs text-[#0369A1] font-mono px-2 outline-hidden truncate font-bold"
              />
              <button
                id="copy-student-url-button"
                onClick={handleCopyUrl}
                className="shrink-0 px-4 py-2 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-xs font-black transition-all flex items-center gap-1 shadow-[0_3px_0_0_#0284C7] active:translate-y-1 active:shadow-none cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>복사됨!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>주소 복사</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Status, Control Panel, Participants List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Real-time Status Card */}
          <div 
            className={`bg-white rounded-[36px] sm:rounded-[44px] p-6 sm:p-8 shadow-[0_16px_0_0_#0EA5E9] border-6 space-y-6 ${
              isTraining ? 'border-[#DDD6FE]' : isWinter ? 'border-[#BAE6FD]' : 'border-[#FEF08A]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black border-2 shadow-[0_4px_0_0_#0EA5E9] ${
                  isTraining 
                    ? 'bg-[#F3E8FF] text-purple-700 border-purple-300' 
                    : 'bg-[#BAE6FD] text-[#0369A1] border-[#0EA5E9]/40'
                }`}>
                  {isTraining 
                    ? <GraduationCap className="w-7 h-7" /> 
                    : isWinter 
                    ? <Snowflake className="w-7 h-7 text-[#0369A1]" /> 
                    : <Users className="w-7 h-7" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-[#0369A1]">실시간 제출 현황</h3>
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22C55E]"></span>
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    {isTraining
                      ? '선생님들이 경험 키워드를 제출하면 숫자가 실시간으로 올라갑니다.'
                      : '학생들이 제출하면 숫자가 실시간으로 올라갑니다.'}
                  </p>
                </div>
              </div>

              {/* Big Count Badge */}
              <div 
                className={`flex items-baseline gap-1.5 px-6 py-3 rounded-2xl self-start sm:self-auto border-3 shadow-xs ${
                  isTraining
                    ? 'bg-[#FAF5FF] border-[#E9D5FF] shadow-[0_4px_0_0_#E9D5FF]'
                    : isWinter 
                    ? 'bg-[#E0F2FE] border-[#BAE6FD] shadow-[0_4px_0_0_#BAE6FD]' 
                    : 'bg-[#FEF9C3] border-[#FEF08A] shadow-[0_4px_0_0_#FEF08A]'
                }`}
              >
                <span className="text-3xl sm:text-4xl font-black text-[#0369A1]">
                  {totalCount}
                </span>
                <span className="text-sm font-black text-[#0369A1]/70">명 제출 완료</span>
              </div>
            </div>

            {/* Launch Quiz Button */}
            <div className="space-y-3">
              <button
                id="start-quiz-button"
                onClick={onStartQuiz}
                disabled={totalCount === 0}
                className={`w-full py-5 px-6 rounded-2xl text-white font-black text-xl sm:text-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  isTraining
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-[0_8px_0_0_#6D28D9] hover:translate-y-1 hover:shadow-[0_4px_0_0_#6D28D9]'
                    : 'bg-[#22C55E] hover:bg-[#16A34A] shadow-[0_8px_0_0_#16A34A] hover:translate-y-1 hover:shadow-[0_4px_0_0_#16A34A]'
                }`}
              >
                <Play className="w-6 h-6 fill-white" />
                <span>
                  {totalCount === 0
                    ? (isTraining ? '선생님들의 응답을 기다리는 중...' : '학생들의 응답을 기다리는 중...')
                    : unshownCount === 0
                    ? `${isTraining ? '교사 연수' : isWinter ? '겨울방학' : '방학'} 퀴즈 완료 (다시 시작하기)`
                    : `${isTraining ? '🎓 교사 연수' : isWinter ? '겨울방학' : '방학'} 퀴즈 시작하기! (남은 문제: ${unshownCount}개) ▶`}
                </span>
              </button>

              {shownCount > 0 && (
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
                  <span>진행된 퀴즈: {shownCount}개 / 전체: {totalCount}개</span>
                  <button
                    onClick={handleResetShown}
                    className="text-[#0EA5E9] hover:text-[#0369A1] underline flex items-center gap-1 font-black cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>출제 상태 초기화 (처음부터)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Helper tools: Seed Demo Data & Delete */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t-2 border-slate-100">
              <button
                id="seed-demo-data-button"
                onClick={handleSeed}
                disabled={isSeeding}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0369A1] text-xs font-black transition-all border-2 border-[#BAE6FD] shadow-[0_3px_0_0_#BAE6FD] active:translate-y-1 active:shadow-none cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#0EA5E9]" />
                <span>
                  {isSeeding 
                    ? '추가 중...' 
                    : isTraining
                    ? '🎓 테스트용 선생님 6명 경험 채우기'
                    : isWinter 
                    ? '⛄ 테스트용 겨울방학 학생 6명 채우기' 
                    : '🧪 테스트용 여름방학 학생 6명 채우기'}
                </span>
              </button>

              <button
                id="delete-all-button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={totalCount === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black transition-all border-2 border-rose-200 shadow-[0_3px_0_0_#FECDD3] active:translate-y-1 active:shadow-none disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>전체 응답 삭제</span>
              </button>
            </div>
          </div>

          {/* Participant List Preview Card */}
          <div 
            className={`bg-white rounded-[36px] p-6 shadow-[0_12px_0_0_#0EA5E9] border-6 space-y-4 ${
              isTraining ? 'border-[#DDD6FE]' : isWinter ? 'border-[#BAE6FD]' : 'border-[#FEF08A]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-black text-[#0369A1] text-base">
                  참여자 목록 ({totalCount}명)
                </h4>
                <button
                  type="button"
                  onClick={() => setHideNames(!hideNames)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] text-xs font-bold transition-colors cursor-pointer"
                  title={isTraining ? '선생님들이 화면을 보고 계실 때 스포일러를 방지합니다' : '학생들이 칠판을 보고 있을 때 스포일러를 방지합니다'}
                >
                  {hideNames ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{hideNames ? '이름 가림(보안)' : '이름 보이기'}</span>
                </button>
              </div>

              <span className="text-xs font-bold text-slate-400">
                {hideNames ? '🔒 스포일러 방지 중' : '👀 이름 표시 중'}
              </span>
            </div>

            {totalCount === 0 ? (
              <div className="p-8 text-center bg-[#F0F9FF] rounded-2xl border-2 border-dashed border-[#BAE6FD] text-slate-400 space-y-2">
                <HelpCircle className="w-8 h-8 mx-auto text-[#0EA5E9]/40" />
                <p className="text-sm font-bold text-[#0369A1]/60">
                  {isTraining ? '아직 제출한 선생님이 없습니다.' : '아직 제출한 학생이 없습니다.'}
                </p>
                <p className="text-xs text-[#0369A1]/50 font-medium">
                  {isTraining
                    ? '선생님들이 QR코드를 스캔해 제출하거나, 위 \'테스트용 선생님 6명 경험 채우기\' 버튼을 눌러보세요!'
                    : '학생들이 QR코드를 스캔해 제출하거나, 위 \'테스트용 샘플 채우기\' 버튼을 눌러보세요!'}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                {responses.map((item, idx) => {
                  const displayName = hideNames
                    ? (isTraining ? `선생님 #${idx + 1}` : `학생 #${idx + 1}`)
                    : item.student_name;
                  return (
                    <div
                      key={item.id}
                      className={`px-3.5 py-1.5 rounded-xl border-2 text-xs font-black flex items-center gap-2 transition-all ${
                        item.is_shown
                          ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                          : 'bg-[#F0F9FF] text-[#0369A1] border-[#BAE6FD] shadow-[0_2px_0_0_#BAE6FD]'
                      }`}
                    >
                      <span>{displayName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white text-[#0EA5E9] font-mono border border-[#BAE6FD]">
                        {item.keywords.length}개
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div 
            id="delete-confirm-dialog"
            className="bg-white rounded-[36px] p-6 sm:p-8 max-w-md w-full shadow-[0_20px_0_0_#E11D48] space-y-4 border-6 border-[#FECDD3]"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center border-2 border-rose-300">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">모든 응답을 초기화하시겠습니까?</h3>
            <p className="text-slate-600 text-sm font-bold">
              현재 제출된 <strong className="text-rose-600">{totalCount}명</strong>의 {isTraining ? '선생님 경험 키워드' : '학생 방학 키워드'} 응답 데이터가 모두 삭제됩니다.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-sm transition-colors shadow-[0_3px_0_0_#CBD5E1] cursor-pointer"
              >
                취소
              </button>
              <button
                id="confirm-delete-all-button"
                onClick={handleDeleteAll}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm transition-colors shadow-[0_3px_0_0_#9F1239] cursor-pointer"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
