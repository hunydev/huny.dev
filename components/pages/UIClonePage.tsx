import React from 'react';
import type { PageProps } from '../../types';

const UIClonePage: React.FC<PageProps> = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string>('');
  const [html, setHtml] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  // Handle paste (global on this page)
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
              setHtml('');
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
      setHtml('');
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
        setHtml('');
        setError('');
      }
    } catch {}
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const resetAll = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl('');
    setHtml('');
    setError('');
  };

  const generate = async () => {
    if (!file) {
      setError('이미지를 업로드하거나 붙여넣어 주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setHtml('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      // Optional: hints
      fd.append('constraints', 'single-file html with inline <style>; no external fetch; semantic structure; minimal JS if needed; responsive when possible');

      const res = await fetch('/api/ui-clone', { method: 'POST', body: fd });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `Failed: ${res.status}`);
      let js: any = {};
      try { js = text ? JSON.parse(text) : {}; } catch {}
      const outHtml: string = typeof js?.html === 'string' ? js.html : '';
      if (!outHtml) throw new Error('서버가 유효한 HTML을 반환하지 않았습니다.');
      setHtml(outHtml);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const downloadHtml = () => {
    if (!html) return;
    const blob = new Blob([html], { type: 'text/html;charset=UTF-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ui-clone.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyHtml = async () => {
    if (!html) return;
    try {
      await navigator.clipboard.writeText(html);
      alert('HTML이 클립보드에 복사되었습니다.');
    } catch {}
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-pink-300">
            {/* Layers/clone icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6"><path fill="currentColor" d="M11 22q-.825 0-1.412-.587T9 20v-7q0-.825.588-1.412T11 11h7q.825 0 1.413.588T20 13v7q0 .825-.587 1.413T18 22zM4 15q-.825 0-1.412-.587T2 13V6q0-.825.588-1.412T4 4h7q.825 0 1.413.588T13 6v1H6q-.825 0-1.412.588T4 9z"/></svg>
          </span>
          UI Clone
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">캡쳐 이미지를 업로드/붙여넣기 후, Gemini로 단일 HTML 파일(인라인 CSS 포함)을 생성하고, 샌드박스된 프리뷰와 다운로드를 제공합니다.</p>
      </header>

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">입력 이미지</h2>
        <div
          className={`relative rounded border border-dashed ${file ? 'border-white/10 bg-black/30' : 'border-white/20 bg-black/20'} p-4 flex flex-col items-center justify-center text-center min-h-[180px]`}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="screenshot" className="max-h-64 object-contain rounded" />
          ) : (
            <>
              <p className="text-sm text-gray-400">이미지를 드래그&드롭하거나 클릭하여 업로드, 또는 페이지에서 직접 붙여넣기(Ctrl/Cmd + V)</p>
              <label className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded border border-white/10 text-gray-200 hover:bg-white/10 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z"/></svg>
                <span>이미지 선택</span>
                <input type="file" accept="image/*" className="hidden" onChange={onPick} />
              </label>
            </>
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
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
      </section>

      <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-white">프리뷰 (격리)</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded text-sm border border-white/10 text-gray-300 hover:bg-white/10"
              onClick={copyHtml}
              disabled={!html}
              title="HTML 복사"
            >복사</button>
            <button
              type="button"
              className="px-3 py-2 rounded text-sm border border-white/10 text-gray-300 hover:bg-white/10"
              onClick={downloadHtml}
              disabled={!html}
              title="HTML 다운로드"
            >다운로드</button>
          </div>
        </div>
        {html ? (
          <div className="rounded border border-white/10 bg-[#0b0b0b]">
            <iframe
              title="ui-clone-preview"
              sandbox="allow-scripts allow-forms allow-same-origin"
              srcDoc={html}
              className="w-full h-[480px] rounded"
            />
          </div>
        ) : (
          <div className="text-sm text-gray-500">아직 결과가 없습니다. 이미지를 업로드/붙여넣고 ‘생성’을 눌러보세요.</div>
        )}
      </section>
    </div>
  );
};

export default UIClonePage;
