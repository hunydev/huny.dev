import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton } from '../ui';
import { downloadFromUrl } from '../../utils/download';

const STYLE_OPTIONS: Array<{ id: 'illustration' | 'photoreal'; label: string; description: string }> = [
  {
    id: 'illustration',
    label: '일러스트레이션',
    description: '만화 느낌을 유지하면서 더 정교하고 채도가 높은 일러스트 스타일을 적용합니다.',
  },
  {
    id: 'photoreal',
    label: '현실감',
    description: '실사에 가까운 질감과 조명을 활용해 장면을 현실적으로 재구성합니다.',
  },
];

const ComicRestylerPage: React.FC<PageProps> = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>('');
  const [styleId, setStyleId] = React.useState<'illustration' | 'photoreal'>('illustration');
  const [prompt, setPrompt] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [resultUrl, setResultUrl] = React.useState<string>('');

  React.useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      try {
        const items = e.clipboardData?.items || [];
        for (const item of items as any) {
          if (item.type?.startsWith('image/')) {
            const f = item.getAsFile();
            if (f) {
              setFile(f);
              const url = URL.createObjectURL(f);
              setPreviewUrl(url);
              setError('');
              setResultUrl('');
              break;
            }
          }
        }
      } catch {}
    };
    window.addEventListener('paste', onPaste as any);
    return () => window.removeEventListener('paste', onPaste as any);
  }, []);

  React.useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl && resultUrl.startsWith('blob:')) URL.revokeObjectURL(resultUrl);
  }, [previewUrl, resultUrl]);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    setFile(f);
    const url = URL.createObjectURL(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(url);
    setResultUrl('');
    setError('');
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const f = e.dataTransfer.files?.[0];
      if (f) handleFile(f);
    } catch {}
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const generate = async () => {
    if (!file) {
      setError('원본 만화 이미지(컷 만화 짤)를 업로드하거나 붙여넣어 주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setResultUrl('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('style', styleId);
      if (prompt.trim()) fd.append('prompt', prompt.trim());

      const res = await fetch('/api/comic-restyler', { method: 'POST', body: fd });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `Failed: ${res.status}`);
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}
      const image: string = typeof data?.image === 'string' ? data.image : '';
      if (!image) throw new Error('이미지 생성에 실패했습니다.');
      setResultUrl(image);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!resultUrl) return;
    try {
      await downloadFromUrl(resultUrl, `comic-restyled-${styleId}.png`);
    } catch {}
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-indigo-300">
            <Icon name="comicRestyler" className="w-6 h-6" />
          </span>
          Comic Restyler
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          인터넷에서 자주 보는 N컷 만화 스케치 이미지를 업로드하면, 컷 구성과 대사는 유지하면서 등장인물과 배경을 더 생동감 있게 재렌더링합니다. 원하는 스타일(일러스트/현실감)을 선택하고 추가 프롬프트로 분위기를 보완해 보세요.
        </p>
      </header>

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">입력</h2>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div>
            <div
              className={`relative rounded border border-dashed ${file ? 'border-white/10 bg-black/30' : 'border-white/20 bg-black/20'} p-4 flex flex-col items-center justify-center text-center min-h-[220px]`}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="원본" className="max-h-72 object-contain rounded" />
              ) : (
                <>
                  <p className="text-sm text-gray-400">만화 컷 이미지를 드래그&드롭하거나 클릭하여 업로드, 또는 붙여넣기(Ctrl/Cmd + V)</p>
                  <label className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded border border-white/10 text-gray-200 hover:bg-white/10 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z"/></svg>
                    <span>이미지 선택</span>
                    <input type="file" accept="image/*" className="hidden" onChange={onPick} />
                  </label>
                </>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-xs uppercase text-gray-400 tracking-wide mb-2">스타일</h3>
              <div className="space-y-2">
                {STYLE_OPTIONS.map((opt) => (
                  <label key={opt.id} className={`flex items-start gap-3 rounded border px-3 py-2 ${styleId === opt.id ? 'border-indigo-400/70 bg-white/[0.07]' : 'border-white/10 hover:border-white/20'}`}>
                    <input
                      type="radio"
                      name="style"
                      value={opt.id}
                      checked={styleId === opt.id}
                      onChange={() => setStyleId(opt.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="text-sm font-medium text-white block">{opt.label}</span>
                      <span className="text-xs text-gray-400 block">{opt.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">추가 프롬프트 (선택)</label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 야외 빛, 석양 조명, 캐릭터 의상을 현대적으로 업데이트"
                className="w-full px-2 py-2 rounded bg-black/40 border border-white/10 text-sm resize-y"
              />
            </div>
            <div className="text-xs text-gray-500 bg-black/30 border border-white/5 rounded p-3 leading-relaxed">
              컷의 가로세로 비율, 순서, 말풍선 위치와 대사는 그대로 보존하면서 캐릭터와 배경의 디테일을 업그레이드합니다. 컷이 잘리지 않도록 여백이 아주 많은 이미지는 미리 잘라서 업로드하는 것이 좋습니다.
            </div>
            <div className="flex items-center gap-2">
              <LoadingButton
                loading={loading}
                disabled={!file || loading}
                onClick={generate}
                loadingText="변환 중…"
                idleText="변환 실행"
                variant="primary"
                className={`px-3 py-2 rounded text-sm border border-white/10 ${file && !loading ? 'hover:bg-white/10 text-white' : 'text-gray-400'} ${loading ? 'opacity-70' : ''}`}
              />
              <LoadingButton
                loading={false}
                onClick={() => {
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setFile(null);
                  setPreviewUrl('');
                  setResultUrl('');
                  setError('');
                }}
                loadingText=""
                idleText="초기화"
                variant="secondary"
              />
              <ErrorMessage error={error} className="text-xs text-amber-300 truncate" />
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
              onClick={downloadImage}
              disabled={!resultUrl}
            >PNG 다운로드</button>
          </div>
        </div>
        {resultUrl ? (
          <div className="rounded border border-white/10 bg-[#0b0b0b] p-2">
            <img src={resultUrl} alt="재구성된 컷" className="w-full max-h-[720px] object-contain" />
          </div>
        ) : (
          <div className="text-sm text-gray-500">아직 결과가 없습니다. 원본 이미지를 업로드한 뒤 변환을 실행해 보세요.</div>
        )}
      </section>
    </div>
  );
};

export default ComicRestylerPage;
