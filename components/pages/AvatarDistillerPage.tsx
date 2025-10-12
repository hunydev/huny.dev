import React from 'react';
import type { PageProps } from '../../types';
import { ErrorMessage, LoadingButton, ApiProviderBadge } from '../ui';
import { downloadFromUrl } from '../../utils/download';
import { Icon } from '../../constants';

const AvatarDistillerPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [localPreview, setLocalPreview] = React.useState<string>('');
  const [styleId, setStyleId] = React.useState<'illustration' | 'photoreal'>('illustration');
  const [prompt, setPrompt] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [resultUrl, setResultUrl] = React.useState<string>('');

  const revokeLocal = React.useCallback(() => {
    if (localPreview && localPreview.startsWith('blob:')) URL.revokeObjectURL(localPreview);
    if (resultUrl && resultUrl.startsWith('blob:')) URL.revokeObjectURL(resultUrl);
  }, [localPreview, resultUrl]);

  React.useEffect(() => () => revokeLocal(), [revokeLocal]);

  const onFileChange = (next: File | null) => {
    revokeLocal();
    setFile(next);
    setResultUrl('');
    setError('');
    if (next) {
      const url = URL.createObjectURL(next);
      setLocalPreview(url);
    } else {
      setLocalPreview('');
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    onFileChange(f);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] || null;
    onFileChange(f);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const generate = async () => {
    if (!file) { setError('프로필로 사용할 이미지를 업로드해 주세요.'); return; }
    setLoading(true);
    setError('');
    setResultUrl('');
    apiTask?.startTask('avatar-distiller');
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('style', styleId);
      if (prompt.trim()) fd.append('prompt', prompt.trim());

      const res = await fetch('/api/avatar-distiller', { method: 'POST', body: fd });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `Failed: ${res.status}`);
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { image: text }; }
      const out = typeof data?.image === 'string' && data.image ? data.image : '';
      if (!out) throw new Error('생성된 아바타 이미지를 확인할 수 없습니다.');
      setResultUrl(out);
      apiTask?.completeTask('avatar-distiller', isActiveTab);
    } catch (e: any) {
      const errorMsg = e?.message || String(e);
      setError(errorMsg);
      apiTask?.errorTask('avatar-distiller', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const download = async () => {
    if (!resultUrl) return;
    try {
      await downloadFromUrl(resultUrl, `avatar-${styleId}.png`);
    } catch {}
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-rose-300">
            <Icon name="avatar" className="w-6 h-6" />
          </span>
          Avatar Distiller
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          업로드한 이미지를 프로필(아바타) 용도에 맞게 최적화합니다. 얼굴/피사체에 초점을 맞추고 표정·조명·배경을 정돈하여
          단순하지만 개성을 유지하는 최고의 프로필 이미지를 만들어 드립니다.
        </p>
        <div className="mt-2">
          <ApiProviderBadge provider="gemini" />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
        <div className="space-y-4">
          <div
            className={`border border-dashed rounded-lg p-5 text-center transition ${file ? 'border-rose-400/40 bg-rose-400/5' : 'border-white/15 bg-black/20 hover:border-white/30'}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            {file ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">업로드한 원본 이미지</p>
                <img src={localPreview} alt="원본 미리보기" className="max-h-72 mx-auto rounded border border-white/10 object-contain" />
                <div className="text-xs text-gray-500">{file.name} · {(file.size / 1024).toFixed(1)} KB</div>
                <button type="button" className="px-3 py-1.5 text-sm rounded border border-white/15 text-gray-200 hover:bg-white/10" onClick={() => onFileChange(null)}>다른 이미지 선택</button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">이미지를 드롭하거나 클릭하여 업로드해 주세요.</p>
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded border border-white/15 text-gray-200 hover:bg-white/10 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={onInputChange} />
                  <Icon name="addSquare" className="w-4 h-4" aria-hidden />
                  <span>이미지 선택</span>
                </label>
                <p className="text-xs text-gray-500">JPG/PNG 권장. 얼굴이 너무 작지 않도록 해상도 있는 이미지를 사용하세요.</p>
              </div>
            )}
          </div>

          <div className="rounded border border-white/10 bg-[#171717] p-4 space-y-4">
            <div>
              <h2 className="text-sm font-medium text-white">옵션</h2>
              <div className="mt-2 space-y-2">
                <label className={`flex items-start gap-3 rounded border px-3 py-2 ${styleId === 'illustration' ? 'border-rose-400/70 bg-white/[0.07]' : 'border-white/10 hover:border-white/20'}`}>
                  <input type="radio" name="style" value="illustration" checked={styleId === 'illustration'} onChange={() => setStyleId('illustration')} className="mt-1" />
                  <span>
                    <span className="text-sm font-medium text-white block">일러스트레이션</span>
                    <span className="text-xs text-gray-400 block">만화/일러스트 느낌을 유지하여 선명하고 안정된 프로필 이미지를 생성합니다.</span>
                  </span>
                </label>
                <label className={`flex items-start gap-3 rounded border px-3 py-2 ${styleId === 'photoreal' ? 'border-rose-400/70 bg-white/[0.07]' : 'border-white/10 hover:border-white/20'}`}>
                  <input type="radio" name="style" value="photoreal" checked={styleId === 'photoreal'} onChange={() => setStyleId('photoreal')} className="mt-1" />
                  <span>
                    <span className="text-sm font-medium text-white block">실사화</span>
                    <span className="text-xs text-gray-400 block">실사에 가까운 질감과 조명으로 자연스러운 프로필 이미지를 생성합니다.</span>
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">추가 프롬프트 (선택)</label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="예: 미소, 따뜻한 자연광, 배경은 보케 느낌의 야외 공원"
                className="w-full px-2 py-2 rounded bg-black/40 border border-white/10 text-sm resize-y"
              />
              <p className="text-xs text-gray-500 mt-1">프롬프트를 입력하면 컨셉을 반영해 최적의 프로필 이미지를 만듭니다. (기본값: 없음)</p>
            </div>

            <div className="rounded border border-white/10 bg-white/[0.02] p-3 text-xs text-gray-400 space-y-2">
              <div className="flex items-start gap-2">
                <Icon name="info" className="w-4 h-4 text-rose-300" aria-hidden />
                <div>
                  <p className="font-medium text-gray-200">프로필 최적화 지침</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>피사체(주로 얼굴)를 중앙 근접 구도에 배치하고, 배경은 깔끔하게 처리</li>
                    <li>명확한 윤곽과 안정적인 노출/대비, 과도한 디테일은 정돈</li>
                    <li>원형 크롭을 고려한 상하 여백과 헤드룸 확보</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className={`w-full px-4 py-2 rounded text-sm font-medium transition ${loading ? 'bg-rose-500/20 text-rose-200 cursor-wait' : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 border border-rose-500/40'}`}
            >
              {loading ? 'Gemini 변환 중…' : 'Gemini로 아바타 최적화'}
            </button>
            {error && <p className="text-xs text-amber-300">{error}</p>}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded border border-white/10 bg-[#111215] p-4">
            <h2 className="text-sm font-medium text-white flex items-center gap-2">
              <Icon name="image" className="w-4 h-4" aria-hidden />
              결과 미리보기
            </h2>
            <div className="mt-3 space-y-3">
              {resultUrl ? (
                <img src={resultUrl} alt="아바타 미리보기" className="w-48 h-48 object-cover mx-auto rounded-full border border-white/10 bg-black/40" />
              ) : (
                localPreview ? (
                  <img src={localPreview} alt="원본 미리보기" className="w-48 h-48 object-cover mx-auto rounded-full border border-white/10 bg-black/40 opacity-80" />
                ) : (
                  <div className="w-48 h-48 mx-auto rounded-full border border-dashed border-white/10 flex items-center justify-center text-xs text-gray-500">
                    변환 대기 중
                  </div>
                )
              )}
              <p className="text-xs text-gray-500">미리보기는 원형 크롭 기준으로 표시됩니다.</p>
              <div className="flex items-center justify-center gap-2">
                <button type="button" className="px-3 py-1.5 text-xs rounded border border-white/15 text-gray-200 hover:bg-white/10" onClick={download} disabled={!resultUrl}>PNG 다운로드</button>
                <button type="button" className="px-3 py-1.5 text-xs rounded border border-white/15 text-gray-200 hover:bg-white/10" onClick={() => { setResultUrl(''); setError(''); }} disabled={loading}>미리보기 초기화</button>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default AvatarDistillerPage;
