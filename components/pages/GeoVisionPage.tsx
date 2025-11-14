import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, FileDropZone, ApiProviderBadge, PlaygroundGuideModal } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { useFileUpload } from '../../hooks/useFileUpload';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

const GeoVisionMap = React.lazy(() => import('./GeoVisionMap'));

export type GeoVisionResult = {
  latitude: number;
  longitude: number;
  zoom: number;
  precision: string;
  locationName?: string;
  reasoning?: string;
};

const GeoVisionPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [result, setResult] = React.useState<GeoVisionResult | null>(null);

  const playgroundGuide = usePlaygroundGuide('geo-vision', isActiveTab);

  const fileUpload = useFileUpload({
    accept: 'image/*',
    maxSize: 8 * 1024 * 1024,
  });

  const api = useApiCall<GeoVisionResult>({
    url: '/api/geo-vision',
    method: 'POST',
    tabId: 'geo-vision',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      if (!data) {
        api.setError('위치 추정에 실패했습니다.');
        return;
      }
      setResult(data);
    },
  });

  React.useEffect(() => {
    window.addEventListener('paste', fileUpload.onPaste);
    return () => window.removeEventListener('paste', fileUpload.onPaste);
  }, [fileUpload.onPaste]);

  const resetAll = () => {
    fileUpload.reset();
    setResult(null);
    api.setError('');
  };

  const handleAnalyze = async () => {
    if (!fileUpload.file) {
      api.setError('이미지를 업로드하거나 붙여넣어 주세요.');
      return;
    }
    setResult(null);
    const fd = new FormData();
    fd.append('image', fileUpload.file);
    await api.execute({ body: fd });
  };

  const hasResult = !!result;

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-emerald-300">
            <Icon name="geoVision" className="w-6 h-6" />
          </span>
          Geo Vision
          <button
            type="button"
            onClick={playgroundGuide.openGuide}
            className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
            aria-label="사용 가이드 보기"
            title="사용 가이드 보기"
          >
            ?
          </button>
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          거리뷰 스타일 이미지를 업로드하면 OpenAI Vision(gpt-5)이 실제 위치를 추정하고, 지도를 해당 위치로 이동해 줍니다.
          추정한 근거를 한국어로 함께 보여주어 어떤 단서를 보고 판단했는지 확인할 수 있습니다.
        </p>
        <div className="mt-2">
          <ApiProviderBadge provider="openai" />
        </div>
        <p className="mt-1 text-[12px] text-gray-500">
          지원 포맷: PNG, JPEG, WEBP, GIF, SVG (최대 8MB). 위치가 대륙/국가 단위로만 추정되는 경우 지도는 넓게, 랜드마크/거리 단위로 추정되면
          지도를 크게 확대합니다.
        </p>
      </header>

      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="Geo Vision"
        playgroundId="geo-vision"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

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
              onReset={resetAll}
              label="거리뷰 이미지를 드래그&드롭하거나 클릭하여 업로드, 또는 붙여넣기(Ctrl/Cmd + V)"
              previewClassName="max-h-72 object-contain"
            />
          </div>
          <div className="space-y-3 text-sm text-gray-300">
            <p className="text-gray-400 text-xs md:text-sm">
              실제 길거리/도시/랜드마크가 보이는 이미지를 넣어 주세요. 실내 사진이나 추상적인 이미지는 위치 추정이 어렵습니다.
            </p>
            <ul className="list-disc list-inside text-xs md:text-sm text-gray-400 space-y-1">
              <li>도로 표지판, 언어, 번호판, 건축 양식 등은 위치 추정에 큰 도움이 됩니다.</li>
              <li>AI는 항상 정답을 맞추지는 않지만, 가능한 단서를 최대한 활용해 최선의 추측을 합니다.</li>
              <li>이미지와 API 응답은 서버에 저장되지 않으며, Playground 세션에서만 사용됩니다.</li>
            </ul>
            <div className="flex items-center gap-2 pt-1">
              <LoadingButton
                loading={api.loading}
                disabled={!fileUpload.file}
                onClick={handleAnalyze}
                loadingText="분석 중…"
                idleText="위치 분석"
                variant="primary"
                className="px-3 py-2 text-sm"
              />
              <LoadingButton
                loading={false}
                onClick={resetAll}
                loadingText=""
                idleText="초기화"
                variant="secondary"
                className="px-3 py-2 text-sm"
              />
              <ErrorMessage error={api.error || fileUpload.error} className="text-xs" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-3">결과</h2>
        {hasResult ? (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
              <div>
                {hasResult ? (
                  <React.Suspense fallback={<div className="rounded border border-white/10 bg-black/60 w-full h-80 md:h-96 flex items-center justify-center text-gray-400 text-sm">지도 로딩 중...</div>}>
                    <GeoVisionMap
                      latitude={result!.latitude}
                      longitude={result!.longitude}
                      zoom={result!.zoom}
                    />
                  </React.Suspense>
                ) : (
                  <div className="text-sm text-gray-500">지도를 표시할 수 없습니다. 다시 시도해 주세요.</div>
                )}
                <p className="mt-2 text-[11px] text-gray-500">
                  지도 타일 데이터: OpenStreetMap. 확대/축소는 AI가 반환한 zoom 값에 따라 자동으로 설정됩니다.
                </p>
              </div>
              <div className="space-y-3">
                <div className="text-sm text-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="globe" className="w-4 h-4 text-gray-300" />
                    <span className="font-medium">추정 위치</span>
                  </div>
                  <div className="ml-6 text-xs md:text-sm text-gray-300 space-y-1">
                    {result?.locationName && (
                      <div>
                        <span className="text-gray-400">이름: </span>
                        <span className="font-medium">{result.locationName}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400">좌표: </span>
                      <span>
                        {result?.latitude.toFixed(5)}, {result?.longitude.toFixed(5)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">정확도: </span>
                      <span>{result?.precision || 'unknown'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Zoom: </span>
                      <span>{result?.zoom}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon name="info" className="w-4 h-4" />
                    <span className="font-medium">AI 추론 근거</span>
                  </div>
                  <div className="ml-6 text-xs md:text-sm text-gray-300 whitespace-pre-wrap leading-relaxed bg-black/30 border border-white/5 rounded p-3 max-h-64 overflow-auto">
                    {result?.reasoning?.trim() ? result.reasoning : 'AI가 별도의 설명을 반환하지 않았습니다.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            아직 결과가 없습니다. 거리뷰 이미지를 업로드하고 '위치 분석' 버튼을 눌러보세요.
          </div>
        )}
      </section>
    </div>
  );
};

export default GeoVisionPage;
