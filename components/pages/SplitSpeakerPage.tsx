import React from 'react';
import { PageProps } from '../../types';

// 개발 환경에서만 Vite define로 주입됩니다. 프로덕션 번들은 undefined가 됩니다.
const DEV_GEMINI_API_KEY = process.env.GEMINI_API_KEY as unknown as string | undefined;
const GEMINI_MODEL = 'gemini-2.0-flash';

// Types for output structure
export type SplitSpeakerEntry = {
  text: string;
  name: string;
  gender: 'male' | 'female' | 'unknown' | string;
  extra?: string;
};
export type SplitSpeakerResult = {
  prompts: SplitSpeakerEntry[];
};

const SAMPLE_TEXT = `"안녕하세요, 저는 한이예요." 라고 소녀가 말했다. 소녀의 옆에 있던 소년은 고개를 끄덕이며, "반가워요. 저는 민준입니다."라고 답했다. 비가 내리는 창밖을 바라보던 화자는 마음속으로 생각했다. "이 만남은 우연이 아닐지도 몰라." 

그때 문이 열리며 중년 남성이 들어왔다. 그는 차분한 목소리로 말했다. "두 분, 회의 시간이 다 됐습니다." 소녀와 소년은 서로를 쳐다보고 조용히 자리에서 일어섰다.`;

async function callSplitServerFirst(input: string): Promise<SplitSpeakerResult> {
  // 1) 서버 라우트 시도 (권장)
  try {
    const res = await fetch('/api/split-speaker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    });
    if (res.ok) {
      const data = (await res.json()) as SplitSpeakerResult;
      if (!data || !Array.isArray(data.prompts)) throw new Error('Unexpected server response');
      return data;
    }
    // 서버가 준비되지 않았거나(404 등) 키 미설정(500)인 경우 폴백 고려
  } catch {
    // 네트워크/개발 서버 미기동 등
  }

  // 2) 개발 환경 폴백: 클라이언트에서 직접 Gemini 호출 (키가 주입된 경우에만)
  if (!DEV_GEMINI_API_KEY) {
    throw new Error('서버 API를 사용할 수 없고 개발용 GEMINI_API_KEY도 감지되지 않았습니다.\n옵션A) npm run serve:ssr 로 워커 개발 서버를 실행하세요.\n옵션B) .env.local에 GEMINI_API_KEY를 추가하고 개발 중에만 사용하세요.');
  }

  const instructions = [
    '당신은 주어진 한국어/영어 텍스트에서 화자를 분리하여 JSON을 만드는 도우미입니다.',
    '규칙:',
    '- 같은 화자가 연속으로 말하는 구간은 하나의 엔트리로 묶습니다.',
    '- 내레이션(서술자, 지문)은 name을 "Narrator"로 설정합니다.',
    '- 등장인물의 이름을 문맥에서 유추할 수 있으면 name에 기록합니다. 유추가 어렵다면 "Unknown#1"과 같이 넘버링합니다.',
    '- gender는 남성 male, 여성 female, 알 수 없으면 unknown 으로 표기합니다. 확실치 않다면 unknown을 사용합니다.',
    '- extra에는 직업, 관계, 연령대 등 문맥에서 확실히 추정 가능한 보조 정보를 간략히 기술합니다. 불확실하면 생략합니다.',
    '- 결과는 반드시 다음 스키마의 JSON만 출력합니다: { "prompts": [ { "text": string, "name": string, "gender": string, "extra": string } ] }',
    '- 마크다운 코드펜스나 설명 텍스트 없이 JSON만 반환합니다.'
  ].join('\n');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': DEV_GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [
        { parts: [ { text: instructions }, { text: `INPUT:\n${input}` } ] },
      ],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gemini API 오류: ${res.status} ${res.statusText}\n${text}`);
  }
  const data: any = await res.json();
  const raw: string = ((data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [])
    .map((p: any) => p?.text || '')
    .join('');
  const jsonStr = extractJsonString(raw);
  let parsed: SplitSpeakerResult;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Gemini 응답을 JSON으로 파싱하는 데 실패했습니다.\n원문:\n' + raw);
  }
  if (!parsed || !Array.isArray(parsed.prompts)) {
    throw new Error('예상 형식과 다른 응답입니다. prompts 배열이 없습니다.');
  }
  return parsed;
}

function extractJsonString(s: string): string {
  // 코드펜스가 포함된 경우 제거
  const fenceMatch = s.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  if (fenceMatch && fenceMatch[1]) return fenceMatch[1].trim();
  // 앞뒤 공백 제거
  return s.trim();
}

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-[11px] text-gray-300">{children}</span>
);

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
    try {
      await navigator.clipboard.writeText(payload);
      alert('JSON이 클립보드에 복사되었습니다.');
    } catch {
      // fallback
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'split-speaker.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadJson = () => {
    if (!result) return;
    const payload = JSON.stringify(result, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'split-speaker.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2a7 7 0 0 0-7 7v1.278A4 4 0 0 0 3 14v2a4 4 0 0 0 4 4h3l4 2v-2h1a4 4 0 0 0 4-4v-2a4 4 0 0 0-2-3.464V9a7 7 0 0 0-7-7m0 2a5 5 0 0 1 5 5v1.278A4 4 0 0 0 15 12v2a4 4 0 0 0 .318 1.56A2 2 0 0 1 14 16h-1v1.382L10.236 16H7a2 2 0 0 1-2-2v-2c0-.74.402-1.385 1-1.732V9a5 5 0 0 1 5-5"/></svg>
          </span>
          Split Speaker
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          소설이나 기사 등 임의의 텍스트에서 화자를 자동으로 분리하고, {`{ prompts: [...] }`} 구조의 JSON으로 변환합니다.
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <Badge>Playground</Badge>
          <Badge>Gemini · {GEMINI_MODEL}</Badge>
          {DEV_GEMINI_API_KEY ? <Badge>Dev key detected</Badge> : <Badge>Server API preferred</Badge>}
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
            <button
              type="button"
              onClick={fillSample}
              className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm"
              disabled={loading}
            >
              예시 채우기
            </button>
            <button
              type="button"
              onClick={onClear}
              className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm"
              disabled={loading || (!text && !result && !error)}
            >
              초기화
            </button>
            <button
              type="button"
              onClick={onRun}
              className={`px-3 py-1.5 rounded text-sm ${canRun ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600/40 text-white/70 cursor-not-allowed'}`}
              disabled={!canRun}
            >
              {loading ? '분석 중…' : '분리 실행'}
            </button>
          </div>
          {(!DEV_GEMINI_API_KEY) && (
            <p className="mt-2 text-xs text-amber-300">
              팁: 개발 중인 경우 .env.local에 GEMINI_API_KEY를 설정하면 서버 없이도 테스트할 수 있습니다. 프로덕션에서는 서버 API를 사용합니다.
            </p>
          )}
          {error && (
            <div className="mt-3 text-sm text-red-300 whitespace-pre-wrap">{error}</div>
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
              <button
                type="button"
                onClick={downloadJson}
                className="px-2.5 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs"
                disabled={!result}
                title="JSON 파일 저장"
              >
                저장
              </button>
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
