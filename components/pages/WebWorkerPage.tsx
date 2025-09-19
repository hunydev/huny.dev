import React from 'react';
import type { PageProps } from '../../types';

const DEFAULT_FN_NAME = 'worker_function';
const DEFAULT_PARAMS = 'n';
const DEFAULT_BODY = `// 1부터 n까지의 합 반환 (예시)\nlet s = 0;\nfor (let i = 1; i <= n; i++) s += i;\nreturn s;`;

const buildUserCode = (params: string, body: string) => `({\n  ${DEFAULT_FN_NAME}(${params}) {\n${body.split('\n').map(l => '    ' + l).join('\n')}\n  }\n})`;

const WORKER_SRC = `\nself.onmessage = (e) => {\n  const { userCode, fnName, args } = e.data || {};\n  try {\n    const mod = new Function('return (' + userCode + ')')();\n    if (!mod || typeof mod[fnName] !== 'function') throw new Error('fn not found');\n    const res = mod[fnName].apply(null, Array.isArray(args) ? args : []);\n    self.postMessage({ ok: true, out: JSON.parse(JSON.stringify(res)) });\n  } catch (err) {\n    self.postMessage({ ok: false, err: String(err && err.stack ? err.stack : err) });\n  }\n};\n`;

function parseArgsCSV(input: string): { ok: true; value: any[] } | { ok: false; error: string } {
  const trimmed = (input || '').trim();
  if (!trimmed) return { ok: true, value: [] };
  try {
    // JSON-style parsing: wrap as array and parse (e.g., 10, "abc", 20 -> [10, "abc", 20])
    const js = JSON.parse(`[${trimmed}]`);
    if (!Array.isArray(js)) return { ok: false, error: '인자 구문이 올바르지 않습니다.' };
    return { ok: true, value: js };
  } catch (e: any) {
    return { ok: false, error: `인자 파싱 오류: ${e?.message || String(e)}` };
  }
}

function isOkResult(x: { ok: true; value: any[] } | { ok: false; error: string }): x is { ok: true; value: any[] } {
  return (x as any).ok === true;
}

const WebWorkerPage: React.FC<PageProps> = () => {
  const [params, setParams] = React.useState<string>(DEFAULT_PARAMS);
  const [body, setBody] = React.useState<string>(DEFAULT_BODY);
  const [argsText, setArgsText] = React.useState<string>('10');
  const [prompt, setPrompt] = React.useState<string>('n을 받아서 1부터 n까지의 합을 반환');
  const [result, setResult] = React.useState<{ ok: boolean; out?: any; err?: string } | null>(null);
  const [running, setRunning] = React.useState<boolean>(false);
  const [genLoading, setGenLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  const workerRef = React.useRef<Worker | null>(null);
  const timeoutRef = React.useRef<number | null>(null);

  const assembled = React.useMemo(() => buildUserCode(params, body), [params, body]);

  const terminateWorker = React.useCallback(() => {
    if (workerRef.current) {
      try { workerRef.current.terminate(); } catch {}
      workerRef.current = null;
    }
    if (timeoutRef.current) {
      try { clearTimeout(timeoutRef.current); } catch {}
      timeoutRef.current = null;
    }
    setRunning(false);
  }, []);

  React.useEffect(() => () => terminateWorker(), [terminateWorker]);

  const run = async () => {
    if (running) return;
    setError('');
    setResult(null);

    const parsed = parseArgsCSV(argsText);
    if (!isOkResult(parsed)) {
      setError(parsed.error);
      return;
    }
    const args = parsed.value;

    try {
      const blob = new Blob([WORKER_SRC], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const w = new Worker(url);
      URL.revokeObjectURL(url); // revoke soon after creation
      workerRef.current = w;
      setRunning(true);

      w.onmessage = (e: MessageEvent) => {
        setResult(e.data);
        terminateWorker();
      };
      w.onerror = (e) => {
        setResult({ ok: false, err: String(e.message || e) });
        terminateWorker();
      };

      // 10초 타임아웃
      timeoutRef.current = setTimeout(() => {
        setResult(prev => prev ?? { ok: false, err: '작업이 10초를 초과하여 중단되었습니다.' });
        terminateWorker();
      }, 10_000) as unknown as number;

      w.postMessage({ userCode: assembled, fnName: DEFAULT_FN_NAME, args });
    } catch (e: any) {
      setResult({ ok: false, err: String(e?.message || e) });
      terminateWorker();
    }
  };

  const generateWithAI = async () => {
    if (genLoading) return;
    setGenLoading(true);
    setError('');
    try {
      const res = await fetch('/api/worker-codegen', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt, fnName: DEFAULT_FN_NAME, params }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `Failed: ${res.status}`);
      let js: any = {};
      try { js = text ? JSON.parse(text) : {}; } catch {}
      const bodyStr: string = typeof js?.body === 'string' ? js.body : '';
      if (!bodyStr || !/return\s+/m.test(bodyStr)) {
        throw new Error('AI가 유효한 함수 본문을 반환하지 않았습니다. 다시 시도해 주세요.');
      }
      setBody(bodyStr);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Web Worker</h1>
          <p className="text-sm text-gray-400">격리된 워커(Blob)를 사용해 사용자 JS를 안전하게 실행합니다. 함수 이름은 고정: <code>worker_function</code></p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className={`px-3 py-2 rounded text-sm border border-white/10 ${running ? 'opacity-70' : 'hover:bg-white/10'} text-white whitespace-nowrap shrink-0`}
            onClick={run}
            disabled={running}
            title={running ? '실행 중…' : '실행'}
          >{running ? '실행 중…' : '실행'}</button>
          <button
            className="px-3 py-2 rounded text-sm border border-white/10 text-gray-300 hover:bg-white/10 whitespace-nowrap shrink-0"
            onClick={terminateWorker}
            disabled={!running}
            title="강제 종료"
          >강제 종료</button>
        </div>
      </header>

      {/* 요청/설정 */}
      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs text-gray-400">AI 요청 (코드 본문 생성)</label>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 min-w-0 px-3 py-2 rounded bg-[#1e1e1e] border border-white/10 text-gray-200 placeholder:text-gray-500"
                placeholder="예: n을 받아 1~n 합을 반환하는 함수"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button
                className={`px-3 py-2 rounded text-sm border border-white/10 ${genLoading ? 'opacity-70' : 'hover:bg-white/10'} text-white`}
                onClick={generateWithAI}
                disabled={genLoading}
                title={genLoading ? '요청 중…' : 'AI로 생성'}
              >{genLoading ? '요청 중…' : 'AI로 생성'}</button>
            </div>
            <p className="text-xs text-gray-500">AI는 함수 내부 본문만 반환합니다. 반드시 <code>return</code>이 포함되어야 합니다.</p>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-2 items-center">
              <label className="text-xs text-gray-400">함수 서명</label>
              <div className="flex items-center gap-2 min-w-0 flex-wrap md:flex-nowrap">
                <code className="px-1.5 py-0.5 md:px-2 md:py-1 rounded bg-[#1e1e1e] border border-white/10 text-gray-300 shrink-0 text-xs md:text-sm">{DEFAULT_FN_NAME}(</code>
                <input
                  className="flex-1 min-w-0 px-2 py-1 rounded bg-[#1e1e1e] border border-white/10 text-gray-200"
                  value={params}
                  onChange={(e) => setParams(e.target.value)}
                  placeholder="예: n 또는 a, b"
                />
                <code className="px-1.5 py-0.5 md:px-2 md:py-1 rounded bg-[#1e1e1e] border border-white/10 text-gray-300 shrink-0 text-xs md:text-sm">)</code>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr] gap-2 items-center">
              <label className="text-xs text-gray-400">실행 인자 (CSV)</label>
              <input
                className="flex-1 min-w-0 px-3 py-2 rounded bg-[#1e1e1e] border border-white/10 text-gray-200 placeholder:text-gray-500"
                placeholder='예: 10, "abc", 20'
                value={argsText}
                onChange={(e) => setArgsText(e.target.value)}
              />
            </div>
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-amber-300">{error}</p>}
      </section>

      {/* 결과 표시: 요청/소스 사이 */}
      <section className="mt-3 rounded-md border border-white/10 bg-[#1e1e1e] p-3">
        <h2 className="text-sm font-medium text-white mb-2">결과</h2>
        {result ? (
          result.ok ? (
            <pre className="text-sm text-gray-200 overflow-auto"><code>{JSON.stringify(result.out, null, 2)}</code></pre>
          ) : (
            <div className="text-sm text-rose-300 whitespace-pre-wrap">{result.err}</div>
          )
        ) : (
          <div className="text-sm text-gray-500">아직 결과가 없습니다. 코드를 작성하고 실행을 눌러보세요.</div>
        )}
      </section>

      {/* 코드 편집 */}
      <section className="mt-3 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">소스 코드</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs text-gray-400">함수 본문 (중괄호 내부 로직)</label>
            <textarea
              className="w-full h-56 rounded bg-[#1e1e1e] border border-white/10 text-gray-200 p-2 font-mono text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={DEFAULT_BODY}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-gray-400">최종 userCode 미리보기 (읽기전용)</label>
            <pre className="w-full h-56 rounded bg-[#111827] border border-white/10 text-gray-200 p-2 overflow-auto text-xs"><code>{assembled}</code></pre>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WebWorkerPage;
