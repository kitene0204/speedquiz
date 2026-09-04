import { useState } from 'react';
import { Copy, Check, X, Database, Zap, ExternalLink } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, isSupabaseConfigured } from '../lib/supabase';

interface SupabaseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupabaseGuideModal({ isOpen, onClose }: SupabaseGuideModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn select-none">
      <div 
        id="supabase-guide-modal"
        className="bg-white rounded-[36px] sm:rounded-[44px] shadow-[0_20px_0_0_#0EA5E9] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border-6 sm:border-8 border-[#FEF08A]"
      >
        {/* Header */}
        <div className="bg-[#FEF9C3] border-b-4 border-[#FEF08A] p-6 text-[#0369A1] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0EA5E9] text-white flex items-center justify-center shadow-[0_3px_0_0_#0284C7]">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0369A1]">Supabase 실시간 연동 안내</h2>
              <p className="text-xs font-bold text-[#0369A1]/80 mt-0.5">
                {isSupabaseConfigured ? '✅ Supabase 실시간 클라우드 연결 활성화됨' : '💡 현재 브라우저 로컬 실시간 모드로 동작 중'}
              </p>
            </div>
          </div>
          <button
            id="modal-close-button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/80 hover:bg-white text-[#0369A1] border-2 border-[#FEF08A] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          {/* Status Box */}
          <div className={`p-5 rounded-3xl border-3 ${isSupabaseConfigured ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0369A1]'}`}>
            <div className="flex items-start gap-3">
              <Zap className="w-6 h-6 shrink-0 mt-0.5 text-[#0EA5E9]" />
              <div>
                <p className="font-black text-base">
                  {isSupabaseConfigured ? 'Supabase 데이터베이스가 연결되어 있습니다' : 'Supabase 없이도 바로 테스트 가능합니다!'}
                </p>
                <p className="text-xs mt-1 leading-relaxed font-bold opacity-80">
                  {isSupabaseConfigured
                    ? '모든 기기(학생 스마트폰, 태블릿, 교사용 전자칠판)에서 실시간으로 데이터가 Supabase와 동기화됩니다.'
                    : '현재는 브라우저 내부 동기화 엔진(BroadcastChannel & LocalStorage)으로 자동 작동합니다. 여러 브라우저 탭을 띄워 교사 화면과 학생 화면을 바로 테스트해보실 수 있습니다.'}
                </p>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-3">
            <h3 className="font-black text-[#0369A1] text-base flex items-center gap-2">
              <span>🚀 실제 교실에서 다중 기기로 사용하려면?</span>
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 text-xs sm:text-sm font-bold">
              <li>
                <a 
                  href="https://supabase.com" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[#0EA5E9] underline font-black inline-flex items-center gap-1 hover:text-[#0284C7]"
                >
                  Supabase 대시보드 <ExternalLink className="w-3.5 h-3.5" />
                </a>
                에서 새 프로젝트를 생성합니다.
              </li>
              <li>왼쪽 메뉴의 <strong>SQL Editor</strong>를 클릭하고 아래 쿼리를 붙여넣은 뒤 <strong>Run</strong>을 누릅니다.</li>
              <li>프로젝트 <strong>Settings &gt; API</strong>에서 URL 및 anon public key를 확인하여 환경변수(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)에 등록합니다.</li>
            </ol>
          </div>

          {/* SQL Code Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                SQL 스키마 및 Realtime 설정 스크립트
              </span>
              <button
                id="copy-sql-button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0EA5E9] text-white hover:bg-[#0284C7] font-black text-xs transition-all shadow-[0_2px_0_0_#0284C7] active:translate-y-0.5 active:shadow-none"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>SQL 복사하기</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs overflow-x-auto font-mono leading-relaxed select-all border-2 border-slate-700">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F0F9FF] border-t-4 border-[#BAE6FD] flex justify-end">
          <button
            id="modal-confirm-button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-black text-sm rounded-xl shadow-[0_4px_0_0_#0284C7] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
}
