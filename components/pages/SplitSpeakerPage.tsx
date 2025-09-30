import React from 'react';
import { PageProps } from '../../types';
import { Badge, ErrorMessage, LoadingButton } from '../ui';
import { downloadJson, copyToClipboardWithFallback } from '../../utils/download';

// Gemini model used by the server worker
const GEMINI_MODEL = 'gemini-2.5-flash';

// Types for output structure
export type SplitSpeakerEntry = {
  text: string;
  name: string;
  gender: 'male' | 'female' | 'unknown' | string;
  extra?: string;
  directive: string;
};
export type SplitSpeakerResult = {
  prompts: SplitSpeakerEntry[];
};

const SAMPLE_TEXT = `"안녕하세요, 저는 한이예요." 라고 소녀가 말했다. 소녀의 옆에 있던 소년은 고개를 끄덕이며, "반가워요. 저는 민준입니다."라고 답했다. 비가 내리는 창밖을 바라보던 화자는 마음속으로 생각했다. "이 만남은 우연이 아닐지도 몰라." 

그때 문이 열리며 중년 남성이 들어왔다. 그는 차분한 목소리로 말했다. "두 분, 회의 시간이 다 됐습니다." 소녀와 소년은 서로를 쳐다보고 조용히 자리에서 일어섰다.`;

async function callSplitServerFirst(input: string): Promise<SplitSpeakerResult> {
  const res = await fetch('/api/split-speaker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: input }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    throw new Error(`서버 API 오류: ${res.status} ${res.statusText}${msg ? '\n' + msg : ''}\n개발 중이라면 별도 터미널에서 'wrangler dev'를 실행하고 .dev.vars에 GEMINI_API_KEY를 설정하세요.`);
  }
  const data = (await res.json()) as SplitSpeakerResult;
  if (!data || !Array.isArray(data.prompts)) {
    throw new Error('Unexpected server response: prompts 배열이 없습니다.');
  }
  // Client-side normalization (idempotent)
  const normalized: SplitSpeakerResult = {
    prompts: data.prompts.map((p: any) => {
      const text = typeof p?.text === 'string' ? p.text : String(p?.text ?? '');
      const name = typeof p?.name === 'string' && p.name.trim() ? p.name.trim() : 'Unknown';
      let gender = typeof p?.gender === 'string' ? p.gender.toLowerCase() : 'unknown';
      if (!['male', 'female', 'unknown'].includes(gender)) gender = 'unknown';
      const extra = typeof p?.extra === 'string' ? p.extra : '';
      const directive = typeof p?.directive === 'string' && p.directive.trim() ? p.directive.trim() : 'Neutral, clear, medium pace.';
      return { text, name, gender, extra, directive } as SplitSpeakerEntry;
    })
  };
  return normalized;
}

function extractJsonString(s: string): string {
  // 코드펜스가 포함된 경우 제거
  const fenceMatch = s.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  if (fenceMatch && fenceMatch[1]) return fenceMatch[1].trim();
  // 앞뒤 공백 제거
  return s.trim();
}


const SplitSpeakerPage: React.FC<PageProps> = () => {
  const [text, setText] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [result, setResult] = React.useState<SplitSpeakerResult | null>(null);

  const canRun = !loading && text.trim().length > 0;

  const onRun = async () => {
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const out = await callSplitServerFirst(text.trim());
      setResult(out);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const fillSample = () => {
    setText(SAMPLE_TEXT);
  };

  const onClear = () => {
    setText('');
    setResult(null);
    setError('');
  };

  const copyJson = async () => {
    if (!result) return;
    const payload = JSON.stringify(result, null, 2);
    const copied = await copyToClipboardWithFallback(payload, 'split-speaker.json');
    if (copied) alert('JSON이 클립보드에 복사되었습니다.');
  };

  const handleDownloadJson = () => {
    if (!result) return;
    downloadJson(result, 'split-speaker.json');
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M2 5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-4 3v-3H5a3 3 0 0 1-3-3z"/><path d="M14 10a3 3 0 0 0 3-3v-.5h2a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-1l-3 2.25V16h-1a3 3 0 0 1-3-3v-1z" opacity=".65"/></svg>
          </span>
          Split Speaker
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          소설이나 기사 등 임의의 텍스트에서 화자를 자동으로 분리하고, {`{ prompts: [...] }`} 구조의 JSON으로 변환합니다.
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <Badge>Playground</Badge>
          <Badge>Gemini · {GEMINI_MODEL}</Badge>
          <Badge>Worker API</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Input panel */}
        <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
          <h2 className="text-sm font-medium text-white mb-2">원본 텍스트</h2>
          <textarea
            className="w-full min-h-[260px] md:min-h-[320px] bg-[#1f1f1f] border border-white/10 rounded p-3 text-sm outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="여기에 텍스트를 붙여넣고 ‘분리 실행’을 클릭하세요."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <LoadingButton
              loading={loading}
              disabled={loading}
              onClick={fillSample}
              loadingText=""
              idleText="예시 채우기"
              variant="secondary"
              className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm"
            />
            <LoadingButton
              loading={loading}
              disabled={loading || (!text && !result && !error)}
              onClick={onClear}
              loadingText=""
              idleText="초기화"
              variant="secondary"
              className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm"
            />
            <LoadingButton
              loading={loading}
              disabled={!canRun}
              onClick={onRun}
              loadingText="분석 중…"
              idleText="분리 실행"
              variant="blue"
            />
          </div>
          <p className="mt-2 text-xs text-amber-300">
            개발 중에는 워커 서버가 필요합니다. 별도 터미널에서 <code>wrangler dev</code>를 실행하고, 프로젝트 루트의 <code>.dev.vars</code>에 <code>GEMINI_API_KEY</code>를 설정하세요. Vite 개발 서버는 <code>/api</code> 요청을 워커(127.0.0.1:8787)로 프록시합니다.
          </p>
          {error && (
            <ErrorMessage error={error} className="mt-3 text-sm text-red-300 whitespace-pre-wrap" />
          )}
        </section>

        {/* Output panel */}
        <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="text-sm font-medium text-white">결과</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyJson}
                className="px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs"
                disabled={!result}
                title="JSON 복사"
              >
                복사
              </button>
              <LoadingButton
                loading={false}
                disabled={!result}
                onClick={handleDownloadJson}
                loadingText=""
                idleText="저장"
                variant="secondary"
                className="px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs"
              />
            </div>
          </div>

          {result ? (
            <>
              <div className="text-xs text-gray-400 mb-2">엔트리 {result.prompts.length}개</div>
              <pre className="text-xs bg-[#111] border border-white/10 rounded p-3 overflow-auto max-h-[320px]">
                {JSON.stringify(result, null, 2)}
              </pre>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {result.prompts.map((p, idx) => (
                  <div key={idx} className="rounded border border-white/10 bg-white/[0.02] p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-500/20 text-[11px] text-blue-300">{idx + 1}</span>
                      <span className="text-sm text-white">{p.name || 'Unknown'}</span>
                      <span className="text-xs text-gray-400">· {p.gender || 'unknown'}</span>
                      {p.extra && <span className="text-xs text-gray-400">· {p.extra}</span>}
                    </div>
                    {p.directive && (
                      <div className="text-[11px] text-blue-300/90 italic mb-1">directive: {p.directive}</div>
                    )}
                    <div className="text-sm text-gray-300 whitespace-pre-wrap">{p.text}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">아직 결과가 없습니다. 텍스트를 입력하고 ‘분리 실행’을 누르세요.</div>
          )}
        </section>
      </div>

      <section className="mt-6 text-xs text-gray-500">
        <p>개인정보가 포함된 텍스트는 업로드하지 마세요. 본 기능은 Google Gemini API를 호출하여 결과를 생성합니다.</p>
      </section>
    </div>
  );
};

export default SplitSpeakerPage;
