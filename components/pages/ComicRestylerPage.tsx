import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, FileDropZone, ApiProviderBadge } from '../ui';
import { downloadFromUrl } from '../../utils/download';
import { useApiCall } from '../../hooks/useApiCall';
import { useFileUpload } from '../../hooks/useFileUpload';

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

const ComicRestylerPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [styleId, setStyleId] = React.useState<'illustration' | 'photoreal'>('illustration');
  const [prompt, setPrompt] = React.useState<string>('');
  const [resultUrl, setResultUrl] = React.useState<string>('');

  const fileUpload = useFileUpload({
    accept: 'image/*',
    maxSize: 10 * 1024 * 1024,
  });

  type ComicResponse = { image: string };
  const api = useApiCall<ComicResponse>({
    url: '/api/comic-restyler',
    method: 'POST',
    tabId: 'comic-restyler',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      const img = data?.image || '';
      if (!img) {
        api.setError('이미지 생성에 실패했습니다.');
        return;
      }
      setResultUrl(img);
    },
  });

  React.useEffect(() => {
    window.addEventListener('paste', fileUpload.onPaste);
    return () => window.removeEventListener('paste', fileUpload.onPaste);
  }, [fileUpload.onPaste]);

  React.useEffect(() => () => {
    if (resultUrl && resultUrl.startsWith('blob:')) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const generate = async () => {
    if (!fileUpload.file) {
      api.setError('원본 만화 이미지(컷 만화 짤)를 업로드하거나 붙여넣어 주세요.');
      return;
    }
    setResultUrl('');
    const fd = new FormData();
    fd.append('image', fileUpload.file);
    fd.append('style', styleId);
    if (prompt.trim()) fd.append('prompt', prompt.trim());
    await api.execute({ body: fd });
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
        <div className="mt-2">
          <ApiProviderBadge provider="gemini" />
        </div>
      </header>

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">입력</h2>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div>
            <FileDropZone
              file={fileUpload.file}
              previewUrl={fileUpload.previewUrl}
              error={fileUpload.error}
              isDragging={fileUpload.isDragging}
              accept="image/*"
              onDrop={fileUpload.onDrop}
              onDragOver={fileUpload.onDragOver}
              onDragEnter={fileUpload.onDragEnter}
              onDragLeave={fileUpload.onDragLeave}
              onInputChange={fileUpload.onInputChange}
              onReset={() => {
                fileUpload.reset();
                setResultUrl('');
              }}
              label="만화 컷 이미지를 드래그&드롭하거나 클릭하여 업로드, 또는 붙여넣기(Ctrl/Cmd + V)"
              previewClassName="max-h-72 object-contain"
            />
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
                loading={api.loading}
                disabled={!fileUpload.file}
                onClick={generate}
                loadingText="변환 중…"
                idleText="변환 실행"
                variant="primary"
                className="px-3 py-2 text-sm"
              />
              <LoadingButton
                loading={false}
                onClick={() => {
                  fileUpload.reset();
                  setResultUrl('');
                }}
                loadingText=""
                idleText="초기화"
                variant="secondary"
              />
              <ErrorMessage error={api.error || fileUpload.error} className="text-xs text-amber-300 truncate" />
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
