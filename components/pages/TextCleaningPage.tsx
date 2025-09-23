import React from 'react';
import type { PageProps } from '../../types';

// Simple tokenizer: split into whitespace, punctuation, and other runs
function tokenize(s: string): string[] {
  const re = /(\s+|[.,!?;:\-—()\[\]{}"“”'’`~…·•]|[^\s.,!?;:\-—()\[\]{}"“”'’`~…·•]+)/g;
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m[0] !== undefined) out.push(m[0]);
  }
  // Ensure at least empty array
  return out.length ? out : [];
}

// LCS-based diff at token level
type Op = { type: 'equal' | 'insert' | 'delete'; tokens: string[] };
function diffTokens(a: string[], b: string[]): Op[] {
  const n = a.length, m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (a[i] === b[j]) dp[i][j] = 1 + dp[i + 1][j + 1];
      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: Op[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      if (ops.length && ops[ops.length - 1].type === 'equal') ops[ops.length - 1].tokens.push(a[i]);
      else ops.push({ type: 'equal', tokens: [a[i]] });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      if (ops.length && ops[ops.length - 1].type === 'delete') ops[ops.length - 1].tokens.push(a[i]);
      else ops.push({ type: 'delete', tokens: [a[i]] });
      i++;
    } else {
      if (ops.length && ops[ops.length - 1].type === 'insert') ops[ops.length - 1].tokens.push(b[j]);
      else ops.push({ type: 'insert', tokens: [b[j]] });
      j++;
    }
  }
  while (i < n) { if (ops.length && ops[ops.length - 1].type === 'delete') ops[ops.length - 1].tokens.push(a[i]); else ops.push({ type: 'delete', tokens: [a[i]] }); i++; }
  while (j < m) { if (ops.length && ops[ops.length - 1].type === 'insert') ops[ops.length - 1].tokens.push(b[j]); else ops.push({ type: 'insert', tokens: [b[j]] }); j++; }
  return ops;
}

const Badge: React.FC<{ colorClass: string; label: string }> = ({ colorClass, label }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] ${colorClass}`}>{label}</span>
);

const TextCleaningPage: React.FC<PageProps> = () => {
  const inputRef = React.useRef<HTMLDivElement | null>(null);
  const [rawText, setRawText] = React.useState('');
  const [baseline, setBaseline] = React.useState(''); // captured when Clean runs
  const [cleaned, setCleaned] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const onInput = () => {
    const t = inputRef.current?.innerText ?? '';
    setRawText(t.replace(/\u00A0/g, ' ')); // normalize nbsp
  };

  const runClean = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setError('');
    setCleaned('');
    setBaseline(rawText);
    try {
      const res = await fetch('/api/text-cleaning', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: rawText })
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `Failed: ${res.status}`);
      let js: any = {};
      try { js = text ? JSON.parse(text) : {}; } catch {}
      const out: string = typeof js?.cleaned === 'string' ? js.cleaned : '';
      setCleaned(out);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const originalTokens = React.useMemo(() => tokenize(baseline), [baseline]);
  const cleanedTokens = React.useMemo(() => tokenize(cleaned), [cleaned]);
  const ops = React.useMemo(() => diffTokens(originalTokens, cleanedTokens), [originalTokens, cleanedTokens]);
  const hasResult = baseline.trim().length > 0 && cleaned.trim().length > 0;

  const renderOriginal = () => {
    if (!hasResult) return <span className="text-gray-500">정제 버튼을 눌러 결과를 생성하세요.</span>;
    const nodes: React.ReactNode[] = [];
    for (const op of ops) {
      if (op.type === 'equal') {
        nodes.push(...op.tokens.map((t, idx) => <span key={`e${nodes.length}-${idx}`}>{t}</span>));
      } else if (op.type === 'delete') {
        nodes.push(...op.tokens.map((t, idx) => (
          <span key={`d${nodes.length}-${idx}`} className="bg-red-500/15 text-red-300 line-through">{t}</span>
        )));
      } else { /* insert — not present in original */ }
    }
    return nodes;
  };

  const renderCleaned = () => {
    if (!hasResult) return <span className="text-gray-500">정제 버튼을 눌러 결과를 생성하세요.</span>;
    const nodes: React.ReactNode[] = [];
    for (const op of ops) {
      if (op.type === 'equal') {
        nodes.push(...op.tokens.map((t, idx) => <span key={`e2${nodes.length}-${idx}`}>{t}</span>));
      } else if (op.type === 'insert') {
        nodes.push(...op.tokens.map((t, idx) => (
          <span key={`i${nodes.length}-${idx}`} className="bg-green-500/15 text-green-300">{t}</span>
        )));
      } else { /* delete — not present in cleaned */ }
    }
    return nodes;
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-sky-300">
            {/* Magic wand / cleaning icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden>
              <path d="m14.1 22l-4.25-4.25l1.4-1.4l2.85 2.85l5.65-5.65l1.4 1.4zM3 16L7.85 3h2.35l4.85 13h-2.3l-1.15-3.3H6.35L5.2 16zm4.05-5.2h3.9l-1.9-5.4h-.1z"/>
            </svg>
          </span>
          Text Cleaning
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">입력한 텍스트의 오타 및 맞춤법을 교정하고, 좌/우 비교 UI로 변화점을 강조합니다.</p>
      </header>

      {/* Input */}
      <section className="space-y-3">
        <div className="rounded border border-white/10 bg-[#1e1e1e] p-3">
          <label className="block text-xs text-gray-400 mb-1">입력 텍스트</label>
          <div
            ref={inputRef}
            contentEditable
            role="textbox"
            aria-multiline
            spellCheck
            onInput={onInput}
            className="min-h-[120px] px-3 py-2 rounded bg-[#1e1e1e] border border-white/10 text-gray-200 outline-none focus:ring-1 focus:ring-white/20"
            data-placeholder="여기에 텍스트를 붙여넣거나 입력하세요"
            style={{ whiteSpace: 'pre-wrap' }}
            suppressContentEditableWarning
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={runClean}
              disabled={loading || !rawText.trim()}
              className={`px-3 py-2 rounded text-sm border border-white/10 ${loading ? 'opacity-70' : 'hover:bg-white/10'} ${rawText.trim() ? 'text-white' : 'text-gray-400'}`}
            >{loading ? 'Cleaning…' : 'Clean'}</button>
            {error && <span className="text-xs text-amber-300 truncate">{error}</span>}
          </div>
        </div>

        {/* Legend */}
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <span className="mr-2">표기:</span>
          <Badge colorClass="bg-red-500/15 text-red-300" label="원문에서 제거/변경" />
          <Badge colorClass="bg-green-500/15 text-green-300" label="정제본에서 추가/변경" />
        </div>

        {/* Compare */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded border border-white/10 bg-[#1e1e1e] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Original</span>
            </div>
            <div className="min-h-[120px] text-gray-200" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{renderOriginal()}</div>
          </div>
          <div className="rounded border border-white/10 bg-[#1e1e1e] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Cleaned</span>
            </div>
            <div className="min-h-[120px] text-gray-200" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{renderCleaned()}</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TextCleaningPage;
