import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, ApiProviderBadge, PlaygroundGuideModal } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

// Prompt 목적 옵션
const PURPOSE_OPTIONS = [
  { value: 'general', label: '일반', description: '일반적인 Q&A, 글쓰기, 요약 등 범용 목적의 프롬프트' },
  { value: 'image', label: '이미지 생성', description: '이미지 생성 모델(예: 이미지 스타일, 구도, 조명 등)에 최적화된 프롬프트' },
  { value: 'video', label: '영상 생성', description: '영상 생성/편집 모델을 위한 장면, 구도, 스타일 중심 프롬프트' },
  { value: 'code', label: '코드 생성', description: '코드 작성/리팩터링/리뷰 등 개발 작업을 위한 프롬프트' },
] as const;

export type PromptPurpose = (typeof PURPOSE_OPTIONS)[number]['value'];

// 결과 볼륨 옵션
const VOLUME_OPTIONS = [
  { value: 'concise', label: '적당하게', description: '필수 정보 위주로 간결하게 정리된 프롬프트' },
  { value: 'detailed', label: '자세하게', description: '맥락, 제약조건, 출력 형식까지 상세히 포함한 프롬프트' },
] as const;

export type PromptVolume = (typeof VOLUME_OPTIONS)[number]['value'];

interface PromptEngineeringResponse {
  optimizedPrompt: string;
  rationale: string;
  checklist: string[];
}

const PromptEngineeringPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [inputText, setInputText] = React.useState('');
  const [purpose, setPurpose] = React.useState<PromptPurpose>('general');
  const [volume, setVolume] = React.useState<PromptVolume>('concise');
  const [result, setResult] = React.useState<PromptEngineeringResponse | null>(null);
  const [copiedSection, setCopiedSection] = React.useState<string>('');

  const playgroundGuide = usePlaygroundGuide('prompt-engineering', isActiveTab || false);

  const api = useApiCall<PromptEngineeringResponse>({
    url: '/api/prompt-engineering',
    method: 'POST',
    tabId: 'prompt-engineering',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      if (data?.optimizedPrompt) {
        setResult(data);
      }
    },
  });

  const handleOptimize = async () => {
    if (!inputText.trim()) {
      api.setError('먼저 프롬프트로 쓰일 텍스트를 입력해주세요.');
      return;
    }
    setResult(null);
    await api.execute({
      body: {
        text: inputText,
        purpose,
        volume,
      },
    });
  };

  const handleReset = () => {
    setInputText('');
    setPurpose('general');
    setVolume('concise');
    setResult(null);
    setCopiedSection('');
    api.reset();
  };

  const handleCopy = async (text: string, section: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(''), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <Icon name="promptEngineering" className="w-6 h-6" />
          </span>
          Prompt Engineering
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
          내가 떠올린 단순한 요청을, AI가 더 잘 이해하고 성능을 최대한 끌어낼 수 있는 형태의 프롬프트로 고도화합니다.
          목적(일반/이미지/영상/코드)과 결과 볼륨(적당하게/자세하게)을 선택하면 프롬프트 엔지니어링 템플릿에 맞춰 재구성해 줍니다.
        </p>
        <div className="mt-2">
          <ApiProviderBadge provider="gemini" />
        </div>
      </header>

      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="Prompt Engineering"
        playgroundId="prompt-engineering"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

      {/* 입력 섹션 */}
      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-3">입력</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs text-gray-400 mb-1">내가 떠올린 요청 / 설명</label>
            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                '예시:\n- "이력서 한 장을 바탕으로, 개발자 포트폴리오 소개문을 써줘"\n- "이 스토리 줄거리로 15초 숏츠 콘티를 만들어줘"\n- "이 요구사항을 만족하는 React 컴포넌트를 만들어줘"'
              }
              className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-sm resize-y"
              disabled={api.loading}
            />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">목적</label>
              <div className="space-y-2">
                {PURPOSE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPurpose(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded border text-xs transition ${
                      purpose === opt.value
                        ? 'border-blue-500/70 bg-blue-500/10 text-white'
                        : 'border-white/10 bg-black/30 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-medium text-sm">{opt.label}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">결과 볼륨</label>
              <div className="space-y-2">
                {VOLUME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVolume(opt.value)}
                    className={`w-full text-left px-3 py-2 rounded border text-xs transition ${
                      volume === opt.value
                        ? 'border-emerald-500/70 bg-emerald-500/10 text-white'
                        : 'border-white/10 bg-black/30 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-medium text-sm">{opt.label}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <LoadingButton
            loading={api.loading}
            disabled={!inputText.trim()}
            onClick={handleOptimize}
            loadingText="최적화 중…"
            idleText="최적화"
            variant="primary"
          />
          <LoadingButton
            loading={false}
            onClick={handleReset}
            loadingText=""
            idleText="초기화"
            variant="secondary"
          />
          <ErrorMessage error={api.error} />
        </div>
      </section>

      {/* 결과 섹션 */}
      {result && (
        <section className="mt-4 space-y-4">
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-white flex items-center gap-2">
                <Icon name="file" className="w-4 h-4 text-green-400" />
                최적화된 프롬프트
              </h2>
              <button
                type="button"
                onClick={() => handleCopy(result.optimizedPrompt, 'prompt')}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200"
              >
                <Icon name={copiedSection === 'prompt' ? 'check' : 'clipboard'} className="w-3 h-3" />
                {copiedSection === 'prompt' ? '복사됨' : '복사'}
              </button>
            </div>
            <pre className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-200 bg-black/40 border border-white/10 rounded p-3">
              {result.optimizedPrompt}
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Icon name="info" className="w-4 h-4 text-sky-400" />
                  설계 이유 (Rationale)
                </h3>
                <button
                  type="button"
                  onClick={() => handleCopy(result.rationale, 'rationale')}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200"
                >
                  <Icon name={copiedSection === 'rationale' ? 'check' : 'clipboard'} className="w-3 h-3" />
                  {copiedSection === 'rationale' ? '복사됨' : '복사'}
                </button>
              </div>
              <p className="text-xs md:text-sm text-gray-300 whitespace-pre-wrap break-words">
                {result.rationale}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
              <h3 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                <Icon name="checklist" className="w-4 h-4 text-emerald-400" />
                체크리스트
              </h3>
              <ul className="space-y-1 text-xs text-gray-300 list-disc list-inside">
                {result.checklist.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PromptEngineeringPage;
