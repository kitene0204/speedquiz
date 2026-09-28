import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { QuizResponse, VacationSeason } from '../types';

// ============================================================================
// [필수 설정] 올바른 프로젝트 URL('fg')과 새로운 Publishable Key 반영
// ============================================================================
const PORTAL_URL = 'https://lqajnsqoovngfgabalkj.supabase.co';
const PORTAL_ANON_KEY = 'sb_publishable_DcAlnHgLYSd92ICS66z3RA_DvrzyPhX';

export const isSupabaseConfigured = Boolean(
  PORTAL_URL &&
  PORTAL_ANON_KEY &&
  PORTAL_URL.trim().length > 0 &&
  PORTAL_ANON_KEY.trim().length > 0 &&
  !PORTAL_URL.includes('YOUR_') &&
  !PORTAL_ANON_KEY.includes('YOUR_')
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(PORTAL_URL.trim(), PORTAL_ANON_KEY.trim());
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
}

const LOCAL_STORAGE_KEY = 'vacation_quiz_responses_v1';
const BROADCAST_CHANNEL_NAME = 'vacation_quiz_realtime_channel';

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported or failed:', e);
  }
}

export function normalizeQuizResponse(item: any): QuizResponse {
  const rawKeywords: string[] = Array.isArray(item.keywords) ? item.keywords : [];
  let detectedSeason = item.season;

  // 1. Look for embedded __SEASON:xxx__ meta tag in keywords
  const metaTag = rawKeywords.find(
    (k) => typeof k === 'string' && k.startsWith('__SEASON:') && k.endsWith('__')
  );

  if (metaTag) {
    detectedSeason = metaTag.replace('__SEASON:', '').replace('__', '');
  }

  // 2. Filter out internal metadata tags from display keywords
  const cleanKeywords = rawKeywords.filter(
    (k) => typeof k === 'string' && !k.startsWith('__SEASON:') && !k.startsWith('__META:')
  );

  return {
    id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    created_at: item.created_at || new Date().toISOString(),
    student_name: item.student_name || '참여자',
    keywords: cleanKeywords,
    is_shown: !!item.is_shown,
    season: detectedSeason || 'summer',
  };
}

export function getLocalResponses(): QuizResponse[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(normalizeQuizResponse);
    }
    return [];
  } catch {
    return [];
  }
}

export function setLocalResponses(responses: QuizResponse[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(responses));
    broadcastChannel?.postMessage({ type: 'UPDATE', responses });
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export async function fetchQuizResponses(season?: VacationSeason): Promise<QuizResponse[]> {
  let allResponses: QuizResponse[] = [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('quiz_responses')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Supabase fetch error, falling back to local:', error.message);
        allResponses = getLocalResponses();
      } else if (data && Array.isArray(data)) {
        allResponses = data.map(normalizeQuizResponse);
      }
    } catch (err) {
      console.warn('Supabase fetch exception, falling back to local:', err);
      allResponses = getLocalResponses();
    }
  } else {
    allResponses = getLocalResponses();
  }

  if (season) {
    return allResponses.filter(r => (r.season || 'summer') === season);
  }

  return allResponses;
}

export async function submitQuizResponse(
  studentName: string,
  keywords: string[],
  season: VacationSeason = 'summer'
): Promise<{ success: boolean; data?: QuizResponse; error?: string }> {
  const cleanName = studentName.trim();
  const cleanKeywords = keywords.map(k => k.trim()).filter(k => k.length > 0);

  if (!cleanName) {
    return { success: false, error: '이름을 입력해주세요.' };
  }
  if (cleanKeywords.length < 2) {
    return { success: false, error: '키워드를 최소 2개 이상 입력해주세요.' };
  }

  const newRecord: QuizResponse = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    student_name: cleanName,
    keywords: cleanKeywords,
    is_shown: false,
    season,
  };

  // Embed the season meta tag into keywords so it persists across devices even if Supabase lacks a 'season' column!
  const metaSeasonTag = `__SEASON:${season}__`;
  const dbKeywords = [...cleanKeywords, metaSeasonTag];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('quiz_responses')
        .insert({
          id: newRecord.id,
          student_name: cleanName,
          keywords: dbKeywords,
          is_shown: false,
          season,
        })
        .select()
        .single();

      if (error) {
        // If Supabase table doesn't have the season column yet, fallback gracefully with dbKeywords
        if (error.message && (error.message.includes('season') || error.code === '42703')) {
          console.warn('Supabase table missing season column, inserting with embedded season tag:', error.message);
          const { data: fallbackData } = await supabase
            .from('quiz_responses')
            .insert({
              id: newRecord.id,
              student_name: cleanName,
              keywords: dbKeywords,
              is_shown: false,
            })
            .select()
            .single();

          const normalized = normalizeQuizResponse(fallbackData || { ...newRecord, keywords: dbKeywords });
          const current = getLocalResponses();
          setLocalResponses([...current, normalized]);
          return { success: true, data: normalized };
        }

        console.warn('Supabase insert error, saving locally:', error.message);
        const current = getLocalResponses();
        setLocalResponses([...current, newRecord]);
        return { success: true, data: newRecord };
      }

      const normalized = normalizeQuizResponse(data || newRecord);
      const current = getLocalResponses();
      setLocalResponses([...current, normalized]);
      return { success: true, data: normalized };
    } catch (err) {
      console.warn('Supabase insert exception, saving locally:', err);
      const current = getLocalResponses();
      setLocalResponses([...current, newRecord]);
      return { success: true, data: newRecord };
    }
  }

  const current = getLocalResponses();
  const updated = [...current, newRecord];
  setLocalResponses(updated);
  return { success: true, data: newRecord };
}

export async function updateResponseSeason(id: string, newSeason: VacationSeason): Promise<boolean> {
  let target: QuizResponse | undefined;
  const current = getLocalResponses();
  target = current.find(r => r.id === id);

  if (target) {
    const updatedRecord: QuizResponse = { ...target, season: newSeason };
    const updatedList = current.map(item => item.id === id ? updatedRecord : item);
    setLocalResponses(updatedList);
  }

  if (supabase) {
    try {
      if (!target) {
        const { data } = await supabase.from('quiz_responses').select('*').eq('id', id).single();
        if (data) {
          target = normalizeQuizResponse(data);
        }
      }

      if (target) {
        const cleanKeywords = target.keywords.filter(
          k => typeof k === 'string' && !k.startsWith('__SEASON:') && !k.startsWith('__META:')
        );
        const dbKeywords = [...cleanKeywords, `__SEASON:${newSeason}__`];

        // 1. Try update with both season column and keywords
        const { error } = await supabase
          .from('quiz_responses')
          .update({
            season: newSeason,
            keywords: dbKeywords,
          })
          .eq('id', id);

        // 2. If season column is missing, update keywords only
        if (error) {
          await supabase
            .from('quiz_responses')
            .update({
              keywords: dbKeywords,
            })
            .eq('id', id);
        }
      }
    } catch (err) {
      console.warn('Supabase updateResponseSeason exception:', err);
    }
  }

  return true;
}

export async function moveAllResponsesToSeason(
  fromSeason: VacationSeason,
  toSeason: VacationSeason
): Promise<number> {
  const current = getLocalResponses();
  const toMove = current.filter(r => (r.season || 'summer') === fromSeason);

  for (const item of toMove) {
    await updateResponseSeason(item.id, toSeason);
  }

  // Also inspect Supabase directly so any non-local records are moved
  if (supabase) {
    try {
      const { data } = await supabase.from('quiz_responses').select('*');
      if (data && Array.isArray(data)) {
        for (const raw of data) {
          const norm = normalizeQuizResponse(raw);
          if (norm.season === fromSeason && !toMove.some(m => m.id === norm.id)) {
            await updateResponseSeason(norm.id, toSeason);
          }
        }
      }
    } catch (e) {
      console.warn('Error in moveAllResponsesToSeason supabase pass:', e);
    }
  }

  return toMove.length;
}

export async function markResponseAsShown(id: string, isShown = true): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('quiz_responses')
        .update({ is_shown: isShown })
        .eq('id', id);

      if (error) {
        console.warn('Supabase update error, falling back locally:', error.message);
      }
    } catch (err) {
      console.warn('Supabase update exception:', err);
    }
  }

  const current = getLocalResponses();
  const updated = current.map(item => (item.id === id ? { ...item, is_shown: isShown } : item));
  setLocalResponses(updated);
  return true;
}

export async function deleteSingleResponse(id: string): Promise<boolean> {
  // 1. Delete from Supabase by exact ID (primary key)
  if (supabase) {
    try {
      const { error } = await supabase
        .from('quiz_responses')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase deleteSingleResponse error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase deleteSingleResponse exception:', err);
    }
  }

  // 2. Delete from local storage
  const current = getLocalResponses();
  const remaining = current.filter(item => item.id !== id);
  setLocalResponses(remaining);
  return true;
}

export async function deleteAllResponses(season?: VacationSeason): Promise<boolean> {
  const current = getLocalResponses();
  const targets = season
    ? current.filter(item => (item.season || 'summer') === season)
    : current;
  const targetIds = targets.map(t => t.id);

  if (supabase) {
    try {
      if (season && targetIds.length > 0) {
        // Delete by IDs to guarantee success even if 'season' column does not exist in Supabase!
        const { error } = await supabase
          .from('quiz_responses')
          .delete()
          .in('id', targetIds);

        if (error) {
          console.warn('Supabase delete by IDs error:', error.message);
        }
      } else if (!season) {
        const { error } = await supabase
          .from('quiz_responses')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) {
          console.warn('Supabase delete error:', error.message);
        }
      }
    } catch (err) {
      console.warn('Supabase delete exception:', err);
    }
  }

  if (season) {
    const remaining = current.filter(item => (item.season || 'summer') !== season);
    setLocalResponses(remaining);
  } else {
    setLocalResponses([]);
  }
  return true;
}

export async function resetShownStatusAll(season?: VacationSeason): Promise<boolean> {
  if (supabase) {
    try {
      if (season) {
        await supabase
          .from('quiz_responses')
          .update({ is_shown: false })
          .eq('season', season);
      } else {
        await supabase
          .from('quiz_responses')
          .update({ is_shown: false })
          .neq('id', '00000000-0000-0000-0000-000000000000');
      }
    } catch (err) {
      console.warn('Supabase reset status exception:', err);
    }
  }

  const current = getLocalResponses();
  const updated = current.map(item => {
    if (!season || (item.season || 'summer') === season) {
      return { ...item, is_shown: false };
    }
    return item;
  });
  setLocalResponses(updated);
  return true;
}

export async function seedSampleResponses(season: VacationSeason = 'summer'): Promise<QuizResponse[]> {
  const summerSamples: Array<{ name: string; keywords: string[] }> = [
    { name: '김지우', keywords: ['강원도 계곡 물놀이', '마라탕 2단계', '엔트리 게임 만들기'] },
    { name: '이하준', keywords: ['비행기 타고 일본 여행', '메론소다', '포켓몬 카드 수집'] },
    { name: '박서윤', keywords: ['오후까지 늦잠', '모여봐요 동물의 숲', '엽기떡볶이 로제'] },
    { name: '최민재', keywords: ['축구부 합숙 훈련', '캐리비안베이 파도풀', '넷플릭스 정주행'] },
    { name: '정하은', keywords: ['도서관 만화책 삼매경', '복숭아 눈꽃빙수', '강아지랑 매일 산책'] },
    { name: '강도윤', keywords: ['제주도 스노클링', '흑돼지 바베큐', '밤새 로블록스'] },
  ];

  const winterSamples: Array<{ name: string; keywords: string[] }> = [
    { name: '김지우', keywords: ['비발디파크 스키장', '슈크림 붕어빵 5개', '엔트리 눈싸움 코딩'] },
    { name: '이하준', keywords: ['삿포로 눈축제 여행', '뜨끈한 미소라멘', '눈오리 집게 30마리'] },
    { name: '박서윤', keywords: ['전기장판에 귤 까먹기', '모동숲 겨울 축제', '크리스마스 케이크'] },
    { name: '최민재', keywords: ['아이스링크 스케이트', '포장마차 어묵 국물', '넷플릭스 정주행'] },
    { name: '정하은', keywords: ['집 앞 눈사람 만들기', '군고구마 호호 불기', '만화방에서 뒹굴기'] },
    { name: '강도윤', keywords: ['온천 워터파크', '따뜻한 코코아', '밤새 친구들과 롤'] },
  ];

  const trainingSamples: Array<{ name: string; keywords: string[] }> = [
    { name: '김선생님 (5학년)', keywords: ['주말 10km 마라톤 완주', '베란다 토마토 수확', '생성형 AI 수업 적용'] },
    { name: '이선생님 (연구부장)', keywords: ['제주 올레길 4코스 트레킹', '핸드드립 커피 마스터', '닌텐도 젤다 엔딩'] },
    { name: '박선생님 (음악전담)', keywords: ['교직 10년 만에 첫 스키', '전국 빵지순례 7곳', '대학원 논문 최종 통과'] },
    { name: '최선생님 (3학년)', keywords: ['아이들과 텃밭 상추 파티', '어쿠스틱 기타 독학', '매일 만보 걷기 100일'] },
    { name: '정선생님 (체육부장)', keywords: ['방학 직무연수 60시간', '반려견과 차박 캠핑', '프랑스 자수 완성'] },
    { name: '강선생님 (1학년)', keywords: ['수영 접영 마스터', '마라탕 3단계 도전', '도서관 소설 20권 독파'] },
  ];

  const samples = season === 'winter' ? winterSamples : season === 'training' ? trainingSamples : summerSamples;
  const results: QuizResponse[] = [];

  for (const s of samples) {
    const res = await submitQuizResponse(s.name, s.keywords, season);
    if (res.data) {
      results.push(res.data);
    }
  }

  return results;
}

export function subscribeToQuizChanges(
  onUpdate: () => void
): () => void {
  const handleBroadcast = (event: MessageEvent) => {
    if (event.data?.type === 'UPDATE') {
      onUpdate();
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LOCAL_STORAGE_KEY) {
      onUpdate();
    }
  };
  window.addEventListener('storage', handleStorage);

  let supabaseChannel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;

  if (supabase) {
    try {
      supabaseChannel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'quiz_responses',
          },
          () => {
            onUpdate();
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription error:', err);
    }
  }

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
    if (supabase && supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
    }
  };
}

// 이 부분이 빠져서 에러가 났습니다. 다시 복구 완료!
export const SUPABASE_SQL_SCHEMA = `-- 1. quiz_responses 테이블 생성
CREATE TABLE quiz_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  student_name TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  is_shown BOOLEAN DEFAULT false NOT NULL,
  season TEXT DEFAULT 'summer' NOT NULL
);

-- 기존에 이미 테이블을 생성하셨다면 아래 1줄만 SQL Editor에서 추가 실행해주세요:
ALTER TABLE quiz_responses ADD COLUMN IF NOT EXISTS season TEXT DEFAULT 'summer' NOT NULL;

-- 2. Row Level Security (RLS) 활성화
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

-- 3. 학생(익명) 및 교사 읽기/쓰기/수정/삭제 권한 부여
CREATE POLICY "Enable all access for quiz_responses" ON quiz_responses
  FOR ALL USING (true) WITH CHECK (true);

-- 4. 실시간 (Realtime) 동기화 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE quiz_responses;
`;
