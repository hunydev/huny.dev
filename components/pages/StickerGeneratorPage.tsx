import React from 'react';
import type { PageProps } from '../../types';

const StickerGeneratorPage: React.FC<PageProps> = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string>('');
  const [minCount, setMinCount] = React.useState<number>(10);
  const [prompt, setPrompt] = React.useState<string>('');
  const [transparent, setTransparent] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [outUrl, setOutUrl] = React.useState<string>('');

  React.useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      try {
        const items = e.clipboardData?.items || [];
        for (const it of items as any) {
          const type = it.type || '';
          if (type.startsWith('image/')) {
            const f = it.getAsFile();
            if (f) {
              setFile(f);
              const url = URL.createObjectURL(f);
              setImageUrl(url);
              setOutUrl('');
              setError('');
              break;
            }
          }
        }
      } catch {}
    };
    window.addEventListener('paste', onPaste as any);
    return () => window.removeEventListener('paste', onPaste as any);
  }, []);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setImageUrl(url);
      setOutUrl('');
      setError('');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const f = e.dataTransfer.files?.[0];
      if (f && f.type.startsWith('image/')) {
        setFile(f);
        const url = URL.createObjectURL(f);
        setImageUrl(url);
        setOutUrl('');
        setError('');
      }
    } catch {}
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const resetAll = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl('');
    setOutUrl('');
    setError('');
    setMinCount(10);
    setPrompt('');
    setTransparent(false);
  };

  const generate = async () => {
    if (!file) {
      setError('이미지를 업로드하거나 붙여넣어 주세요.');
      return;
    }
    if (!Number.isFinite(minCount) || minCount < 1) {
      setError('최소 스티커 개수는 1 이상이어야 합니다.');
      return;
    }
    setLoading(true);
    setError('');
    setOutUrl('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('min', String(Math.floor(minCount)));
      if (prompt.trim()) fd.append('prompt', prompt.trim());
      fd.append('transparent', transparent ? '1' : '0');

      const res = await fetch('/api/sticker-generator', { method: 'POST', body: fd });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `Failed: ${res.status}`);
      let js: any = {};
      try { js = text ? JSON.parse(text) : {}; } catch {}
      const dataUrl: string = typeof js?.image === 'string' ? js.image : '';
      if (!dataUrl) throw new Error('이미지 생성에 실패했습니다.');
      setOutUrl(dataUrl);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const downloadPng = async () => {
    try {
      if (!outUrl) return;
      const resp = await fetch(outUrl);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sticker-sheet.png';
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const resolutionHint = minCount >= 12
    ? '스티커 수가 많아질수록 한 장의 이미지에 포함되는 스티커 크기가 작아져 해상도가 낮아질 수 있습니다.'
    : '스티커 수가 증가하면 개별 스티커 해상도가 낮아질 수 있습니다.';

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-pink-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6"><path fill="currentColor" d="M3 4h13l5 5v11a2 2 0 0 1-2 2H3zm2 2v14h14V10h-4a2 2 0 0 1-2-2V6zM6 12h6v2H6zm0 3h5v2H6z"/></svg>
          </span>
          Sticker Generator
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">업로드한 이미지를 바탕으로 다양한 포즈/방향/컨셉의 스티커를 한 장의 시트로 생성합니다. 최소 개수(default 10)와 투명 배경 옵션을 설정할 수 있습니다.</p>
      </header>

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">입력</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div
              className={`relative rounded border border-dashed ${file ? 'border-white/10 bg-black/30' : 'border-white/20 bg-black/20'} p-4 flex flex-col items-center justify-center text-center min-h-[180px]`}
              onDrop={onDrop}
              onDragOver={onDragOver}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="source" className="max-h-64 object-contain rounded" />
              ) : (
                <>
                  <p className="text-sm text-gray-400">이미지를 드래그&드롭하거나 클릭하여 업로드, 또는 붙여넣기(Ctrl/Cmd + V)</p>
                  <label className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded border border-white/10 text-gray-200 hover:bg-white/10 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z"/></svg>
                    <span>이미지 선택</span>
                    <input type="file" accept="image/*" className="hidden" onChange={onPick} />
                  </label>
                </>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-sm text-gray-300 w-28">최소 개수</label>
              <input
                type="number"
                min={1}
                value={minCount}
                onChange={(e) => setMinCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-28 px-2 py-1 rounded bg-black/40 border border-white/10 text-sm"
              />
            </div>
            <p className="text-xs text-amber-300 mb-3">{resolutionHint}</p>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-sm text-gray-300 w-28">투명 배경</label>
              <input
                id="transparent"
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="transparent" className="text-sm text-gray-400">PNG의 알파 채널(투명)을 요청합니다.</label>
            </div>
            <div className="mb-2">
              <label className="block text-sm text-gray-300 mb-1">추가 프롬프트(선택)</label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 개발자 스티커 스타일, 다양한 프로그래밍 언어/도구를 테마로 포함"
                className="w-full px-2 py-2 rounded bg-black/40 border border-white/10 text-sm resize-y"
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                className={`px-3 py-2 rounded text-sm border border-white/10 ${file && !loading ? 'hover:bg-white/10 text-white' : 'text-gray-400'} ${loading ? 'opacity-70' : ''}`}
                onClick={generate}
                disabled={!file || loading}
              >{loading ? '생성 중…' : '생성'}</button>
              <button
                type="button"
                className="px-3 py-2 rounded text-sm border border-white/10 text-gray-300 hover:bg-white/10"
                onClick={resetAll}
              >초기화</button>
              {error && <span className="text-xs text-amber-300 truncate">{error}</span>}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-white">결과</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded text-sm border border-white/10 text-gray-300 hover:bg-white/10"
              onClick={downloadPng}
              disabled={!outUrl}
            >PNG 다운로드</button>
          </div>
        </div>
        {outUrl ? (
          <div className="rounded border border-white/10 bg-[#0b0b0b] p-2">
            <div
              className={`relative w-full overflow-auto rounded ${transparent ? 'bg-[length:16px_16px] bg-[linear-gradient(45deg,rgba(255,255,255,0.06)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.06)_75%,rgba(255,255,255,0.06)),linear-gradient(45deg,rgba(255,255,255,0.06)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.06)_75%,rgba(255,255,255,0.06))] bg-[position:0_0,8px_8px]' : ''}`}
              style={transparent ? { backgroundColor: '#0b0b0b' } : undefined}
            >
              <img src={outUrl} alt="sticker sheet" className="max-h-[640px] w-auto mx-auto" />
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">아직 결과가 없습니다. 이미지를 업로드/붙여넣고 ‘생성’을 눌러보세요.</div>
        )}
      </section>
    </div>
  );
};

export default StickerGeneratorPage;
