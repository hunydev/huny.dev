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
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6"><path fill="currentColor" d="M5.4 12.575q.65 0 1.113-.287t.462-.863t-.462-.875t-1.113-.3t-1.112.3t-.463.875t.463.863t1.112.287M1.875 8.8V7.7h2.85V6.3h1.3v1.4H8.9v1.1zM5.4 13.675q-1.175 0-2.013-.587t-.837-1.663q0-1.1.838-1.675T5.4 9.175q1.2 0 2.038.575t.837 1.675t-.837 1.675t-2.038.575M3.575 17.7v-3.5H4.9v2.4h6.6v1.1zM9.7 15.075V6.3h1.275v3.75H12.7v1.1H11v3.925zm7.85.575q.7 0 1.363-.325t1.212-.925v-2.65q-.575.075-1.062.175t-.913.225q-1.125.35-1.687.875T15.9 14.25q0 .65.45 1.025t1.2.375m-.575 1.7q-1.425 0-2.25-.812t-.825-2.213q0-1.3.825-2.125t2.65-1.325q.575-.15 1.263-.275t1.487-.225q-.05-1.175-.55-1.713t-1.55-.537q-.65 0-1.287.238T15.1 9.2l-.8-1.4q.825-.625 1.938-1.012T18.5 6.4q1.775 0 2.7 1.1t.925 3.2v6.425H20.45L20.3 16q-.7.625-1.537.988t-1.788.362"/></svg>
          </span>
          Text to Phoneme
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">입력한 텍스트를 노말라이즈하고, 그 결과를 G2P(발음)로 변환합니다.</p>
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
