import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, FileDropZone, ApiProviderBadge, PlaygroundGuideModal } from '../ui';
import { downloadFromUrl } from '../../utils/download';
import { useApiCall } from '../../hooks/useApiCall';
import { useFileUpload } from '../../hooks/useFileUpload';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

const StickerGeneratorPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [minCount, setMinCount] = React.useState<number>(10);
  const [prompt, setPrompt] = React.useState<string>('');
  const [transparent, setTransparent] = React.useState<boolean>(false);
  const [outUrl, setOutUrl] = React.useState<string>('');

  const playgroundGuide = usePlaygroundGuide('sticker-generator');

  const fileUpload = useFileUpload({
    accept: 'image/*',
    maxSize: 10 * 1024 * 1024,
  });

  type StickerResponse = { image: string };
  const api = useApiCall<StickerResponse>({
    url: '/api/sticker-generator',
    method: 'POST',
    tabId: 'sticker-generator',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      const dataUrl = data?.image || '';
      if (!dataUrl) {
        api.setError('이미지 생성에 실패했습니다.');
        return;
      }
      setOutUrl(dataUrl);
    },
  });

  React.useEffect(() => {
    window.addEventListener('paste', fileUpload.onPaste);
    return () => window.removeEventListener('paste', fileUpload.onPaste);
  }, [fileUpload.onPaste]);

  const resetAll = () => {
    fileUpload.reset();
    setOutUrl('');
    setMinCount(10);
    setPrompt('');
    setTransparent(false);
  };

  const generate = async () => {
    if (!fileUpload.file) {
      api.setError('이미지를 업로드하거나 붙여넣어 주세요.');
      return;
    }
    if (!Number.isFinite(minCount) || minCount < 1) {
      api.setError('최소 스티커 개수는 1 이상이어야 합니다.');
      return;
    }
    setOutUrl('');
    const fd = new FormData();
    fd.append('image', fileUpload.file);
    fd.append('min', String(Math.floor(minCount)));
    if (prompt.trim()) fd.append('prompt', prompt.trim());
    fd.append('transparent', transparent ? '1' : '0');
    await api.execute({ body: fd });
  };

  const downloadPng = async () => {
    if (!outUrl) return;
    try {
      await downloadFromUrl(outUrl, 'sticker-sheet.png');
    } catch {}
  };

  const resolutionHint = minCount >= 12
    ? '스티커 수가 많아질수록 한 장의 이미지에 포함되는 스티커 크기가 작아져 해상도가 낮아질 수 있습니다.'
    : '스티커 수가 증가하면 개별 스티커 해상도가 낮아질 수 있습니다.';

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-pink-300">
                <Icon name="stickerGenerator" className="w-6 h-6" />
              </span>
              Sticker Generator
            </h1>
            <p className="mt-2 text-gray-400 text-sm md:text-base">업로드한 이미지를 바탕으로 다양한 포즈/방향/컨셉의 스티커를 한 장의 시트로 생성합니다. 최소 개수(default 10)와 투명 배경 옵션을 설정할 수 있습니다.</p>
            <div className="mt-2">
              <ApiProviderBadge provider="gemini" />
            </div>
          </div>
          <button
            type="button"
            onClick={playgroundGuide.openGuide}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
            aria-label="사용 가이드 보기"
            title="사용 가이드 보기"
          >
            <Icon name="info" className="w-5 h-5" />
          </button>
        </div>
      </header>

      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="Sticker Generator"
        playgroundId="sticker-generator"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">입력</h2>
        <div className="grid md:grid-cols-2 gap-4">
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
              onReset={resetAll}
              label="이미지를 드래그&드롭하거나 클릭하여 업로드, 또는 붙여넣기(Ctrl/Cmd + V)"
              previewClassName="max-h-64 object-contain"
            />
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
              <LoadingButton
                loading={api.loading}
                disabled={!fileUpload.file}
                onClick={generate}
                loadingText="생성 중…"
                idleText="생성"
                variant="primary"
                className="px-3 py-2 text-sm"
              />
              <LoadingButton
                loading={false}
                onClick={resetAll}
                loadingText=""
                idleText="초기화"
                variant="secondary"
              />
              <ErrorMessage error={api.error || fileUpload.error} />
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
