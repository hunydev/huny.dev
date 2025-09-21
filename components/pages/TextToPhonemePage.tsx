import React from 'react';
import type { PageProps } from '../../types';

const TextToPhonemePage: React.FC<PageProps> = () => {
  const [text, setText] = React.useState('');
  const [normalized, setNormalized] = React.useState('');
  const [g2p, setG2p] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const run = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setNormalized('');
    setG2p('');
    try {
      const res = await fetch('/api/text-to-phoneme', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, lang: 'ko' }),
      });
      const raw = await res.text();
      if (!res.ok) throw new Error(raw || `Request failed: ${res.status}`);
      let data: any = {};
      try { data = JSON.parse(raw); } catch {}
      const n = typeof data?.normalized === 'string' ? data.normalized : (typeof data?.normalized_text === 'string' ? data.normalized_text : '');
      const p = typeof data?.g2p === 'string' ? data.g2p : (typeof data?.g2p_text === 'string' ? data.g2p_text : '');
      setNormalized(n);
      setG2p(p);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[960px] mx-auto">
      <header className="mb-4">
        <h1 className="text-xl font-semibold text-white">Text to Phoneme</h1>
        <p className="text-sm text-gray-400">입력한 텍스트를 노말라이즈하고, 그 결과를 G2P(발음)로 변환합니다.</p>
      </header>

      <section className="space-y-3">
        {/* Input */}
        <div className="rounded border border-white/10 bg-[#1e1e1e] p-3">
          <label className="block text-xs text-gray-400 mb-1">입력 텍스트</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="예: 국밥 10번 말아줘"
            rows={4}
            className="w-full resize-y px-3 py-2 rounded bg-[#1e1e1e] border border-white/10 text-gray-200 placeholder:text-gray-500"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={run}
              disabled={loading || !text.trim()}
              className={`px-3 py-2 rounded text-sm border border-white/10 ${loading ? 'opacity-70' : 'hover:bg-white/10'} ${text.trim() ? 'text-white' : 'text-gray-400'}`}
              title={loading ? '변환 중…' : '변환 실행'}
            >{loading ? '변환 중…' : '변환'}</button>
            {error && <span className="text-xs text-amber-300 truncate">{error}</span>}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center" aria-hidden>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-400"><path fill="currentColor" d="M7 10l5 5l5-5z"/></svg>
        </div>

        {/* Normalized Result */}
        <div className="rounded border border-white/10 bg-[#1e1e1e] p-3">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs text-gray-400">텍스트 노말라이즈 결과</label>
          </div>
          <textarea
            value={normalized}
            readOnly
            rows={3}
            placeholder="예: 국밥 열 번 말아줘"
            className="w-full resize-y px-3 py-2 rounded bg-[#111215] border border-white/10 text-gray-200 placeholder:text-gray-600"
          />
        </div>

        {/* Arrow */}
        <div className="flex justify-center" aria-hidden>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-400"><path fill="currentColor" d="M7 10l5 5l5-5z"/></svg>
        </div>

        {/* G2P Result */}
        <div className="rounded border border-white/10 bg-[#1e1e1e] p-3">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs text-gray-400">G2P 결과</label>
          </div>
          <textarea
            value={g2p}
            readOnly
            rows={3}
            placeholder="예: 국빱 열뻔 마라줘"
            className="w-full resize-y px-3 py-2 rounded bg-[#111215] border border-white/10 text-gray-200 placeholder:text-gray-600"
          />
        </div>
      </section>
    </div>
  );
};

export default TextToPhonemePage;
