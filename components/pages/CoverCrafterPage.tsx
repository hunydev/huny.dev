import React from 'react';
import type { PageProps } from '../../types';
import { ErrorMessage, LoadingButton, ApiProviderBadge, PlaygroundGuideModal } from '../ui';
import { downloadFromUrl } from '../../utils/download';
import { Icon } from '../../constants';
import { useApiCall } from '../../hooks/useApiCall';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

const VARIANT_OPTIONS: Array<{ value: 'cover' | 'thumbnail'; label: string; description: string }> = [
  { value: 'cover', label: '블로그/기사 커버', description: '포스트 상단을 가득 채우는 히어로 이미지 스타일' },
  { value: 'thumbnail', label: '영상/썸네일', description: '유튜브·SNS 썸네일처럼 강렬한 임팩트 강조' },
];

const RATIO_OPTIONS: Array<{ value: 'wide' | 'square' | 'vertical' | 'story'; label: string; hint: string }> = [
  { value: 'wide', label: '와이드 (16:9)', hint: '웹 커버, 영상 썸네일에 최적' },
  { value: 'square', label: '정사각형 (1:1)', hint: 'SNS 피드용 공용 사이즈' },
  { value: 'vertical', label: '세로 (4:5)', hint: '블로그 카드, 카드뉴스 등에 적합' },
  { value: 'story', label: '스토리 (9:16)', hint: '모바일 풀스크린 / 릴스·쇼츠용' },
];

const STYLE_OPTIONS: Array<{ value: 'illustration' | 'photoreal'; label: string; hint: string }> = [
  { value: 'illustration', label: '일러스트레이션', hint: '편안한 색감과 굵직한 형태, 컨셉 표현' },
  { value: 'photoreal', label: '실사 이미지', hint: '사진 스타일, 자연스러운 빛과 텍스처' },
];

const MAX_INPUT_CHARS = 5000;

const CoverCrafterPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [scriptText, setScriptText] = React.useState<string>('');
  const [variant, setVariant] = React.useState<'cover' | 'thumbnail'>('cover');
  const [ratio, setRatio] = React.useState<'wide' | 'square' | 'vertical' | 'story'>('wide');
  const [style, setStyle] = React.useState<'illustration' | 'photoreal'>('illustration');
  const [imageUrl, setImageUrl] = React.useState<string>('');
  const [message, setMessage] = React.useState<string>('');
  const [promptSummary, setPromptSummary] = React.useState<string>('');

  const playgroundGuide = usePlaygroundGuide('cover-crafter');

  type CoverResponse = { image: string; message?: string; prompt?: string; error?: string };
  const api = useApiCall<CoverResponse>({
    url: '/api/cover-crafter',
    method: 'POST',
    tabId: 'cover-crafter',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      const img = data?.image || '';
      if (!img) {
        api.setError('생성된 이미지를 확인할 수 없습니다.');
        return;
      }
      setImageUrl(img.startsWith('data:') ? img : `data:image/png;base64,${img}`);
      if (data?.message) setMessage(String(data.message));
      if (data?.prompt) setPromptSummary(String(data.prompt));
    },
  });

  const trimmedLength = scriptText.trim().length;
  const remaining = Math.max(0, MAX_INPUT_CHARS - scriptText.length);

  const handleGenerate = async () => {
    if (!trimmedLength) {
      api.setError('콘텐츠 전문을 붙여넣고 다시 시도해 주세요.');
      return;
    }
    setImageUrl('');
    setMessage('');
    setPromptSummary('');
    await api.execute({
      body: {
        text: scriptText,
        variant,
        ratio,
        style,
      },
    });
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const title = scriptText.trim().replace(/\s/g, '-').slice(0, 20);
      await downloadFromUrl(imageUrl, `cover-${title || 'untitled'}.png`);
    } catch {}
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-sky-300">
                <Icon name="coverCrafter" className="w-6 h-6" aria-hidden />
              </span>
              Cover Crafter
            </h1>
            <p className="mt-2 text-sm md:text-base text-gray-400">
              블로그·기사·영상 스크립트를 붙여넣으면 Gemini가 내용을 분석해 맞춤형 커버/썸네일 이미지를 제안합니다.
              구도 비율과 스타일을 선택해 브랜드에 어울리는 시각을 빠르게 확보해 보세요.
            </p>
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
            ?
          </button>
        </div>
      </header>

      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="Cover Crafter"
        playgroundId="cover-crafter"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="rounded border border-white/10 bg-[#171717] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white">원본 콘텐츠</h2>
              <span className={`text-xs ${remaining < 0 ? 'text-rose-400' : 'text-gray-500'}`}>
                {trimmedLength ? `${trimmedLength.toLocaleString()}자 입력됨` : '입력 없음'} · 남은 글자 {remaining.toLocaleString()}자
              </span>
            </div>
            <textarea
              className="w-full min-h-[220px] rounded border border-white/10 bg-black/30 text-sm p-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="블로그 글, 기사 전문, 영상 스크립트를 그대로 붙여넣어 주세요. 핵심 맥락을 충분히 포함할수록 정확도가 좋아집니다."
              value={scriptText}
              maxLength={MAX_INPUT_CHARS}
              onChange={(e) => setScriptText(e.target.value)}
            />
          </div>

          <div className="rounded border border-white/10 bg-[#171717] p-4 space-y-6">
            <div>
              <h2 className="text-sm font-medium text-white">생성 옵션</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase">사용 목적</label>
                  <div className="space-y-2">
                    {VARIANT_OPTIONS.map(opt => (
                      <label key={opt.value} className={`flex items-start gap-3 rounded border p-3 text-sm transition ${variant === opt.value ? 'border-sky-400 bg-sky-400/10 text-white' : 'border-white/10 text-gray-300 hover:border-white/30 hover:text-white'}`}>
                        <input
                          type="radio"
                          name="variant"
                          value={opt.value}
                          checked={variant === opt.value}
                          onChange={() => setVariant(opt.value)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium">{opt.label}</div>
                          <div className="text-xs text-gray-400">{opt.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase">이미지 비율</label>
                    <div className="mt-2 grid grid-cols-1 gap-2">
                      {RATIO_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRatio(opt.value)}
                          className={`w-full text-left px-3 py-2 rounded border text-sm transition ${ratio === opt.value ? 'border-emerald-400 bg-emerald-400/10 text-white' : 'border-white/10 text-gray-300 hover:border-white/30 hover:text-white'}`}
                        >
                          <div className="font-medium">{opt.label}</div>
                          <div className="text-xs text-gray-400">{opt.hint}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase">스타일</label>
                    <div className="mt-2 flex gap-2">
                      {STYLE_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setStyle(opt.value)}
                          className={`flex-1 px-3 py-2 rounded border text-sm transition ${style === opt.value ? 'border-purple-400 bg-purple-400/10 text-white' : 'border-white/10 text-gray-300 hover:border-white/30 hover:text-white'}`}
                        >
                          <div className="font-medium">{opt.label}</div>
                          <div className="text-xs text-gray-400">{opt.hint}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <button
                type="button"
                disabled={api.loading}
                onClick={handleGenerate}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded border text-sm font-medium transition ${api.loading ? 'border-white/15 text-gray-400 bg-white/5 cursor-wait' : 'border-sky-400 text-white hover:bg-sky-400/10'}`}
              >
                {api.loading ? (
                  <>
                    <Icon name="loader" className="animate-spin h-4 w-4 text-sky-300" aria-hidden />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Icon name="image" className="w-4 h-4" aria-hidden />
                    이미지 생성하기
                  </>
                )}
              </button>
              <div className="text-xs text-gray-500">
                입력 전문의 핵심 키워드를 기반으로 색감, 구도, 상징 요소를 자동으로 도출합니다.
              </div>
            </div>

            <ErrorMessage error={api.error} />
            {message && (
              <div className="rounded border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                {message}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-300 space-y-2">
            <h2 className="text-sm font-medium text-white flex items-center gap-2">
              <Icon name="info" className="w-4 h-4 text-sky-300" aria-hidden />
              사용 가이드
            </h2>
            <ul className="list-disc list-outside pl-5 space-y-1 text-xs text-gray-400">
              <li>글 전문을 붙여넣되, 핵심 내용을 위주로 5,000자 이하로 정리해 주세요.</li>
              <li>커버/썸네일 목적과 비율을 조합해 다양한 버전을 빠르게 확보할 수 있습니다.</li>
              <li>스타일을 실사로 변경하면 사진 느낌의 결과를 기대할 수 있습니다.</li>
            </ul>
          </div>

          <div className="rounded border border-white/10 bg-[#111] p-4 text-sm text-gray-300 space-y-3">
            <h2 className="text-sm font-medium text-white">결과 미리보기</h2>
            {imageUrl ? (
              <div className="space-y-3">
                <img src={imageUrl} alt="생성된 커버" className="w-full rounded-md border border-white/10 object-contain" />
                {promptSummary && (
                  <div className="rounded border border-white/10 bg-white/[0.02] p-3 text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">
                    {promptSummary}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded border border-white/15 text-sm text-white hover:bg-white/10"
                >
                  <Icon name="download" className="w-4 h-4" aria-hidden />
                  PNG 다운로드
                </button>
              </div>
            ) : (
              <div className="text-xs text-gray-500">
                아직 생성된 이미지가 없습니다. 콘텐츠를 붙여넣고 옵션을 선택한 뒤 이미지를 생성해 보세요.
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};

export default CoverCrafterPage;
