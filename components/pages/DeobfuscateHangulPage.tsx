import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, ApiProviderBadge, PlaygroundGuideModal } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

interface DeobfuscationResult {
  original: string;
  deobfuscated: string;
  confidence: number;
  syllableCount: {
    original: number;
    deobfuscated: number;
  };
  detectedPatterns: string[];
  explanation: string;
  alternatives?: string[];
}

interface ApiResponse {
  result: DeobfuscationResult;
}

const DeobfuscateHangulPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [inputText, setInputText] = React.useState<string>('');
  const [result, setResult] = React.useState<DeobfuscationResult | null>(null);
  const [copiedSection, setCopiedSection] = React.useState<string>('');
  
  const playgroundGuide = usePlaygroundGuide('deobfuscate-hangul');

  type Response = ApiResponse;
  const api = useApiCall<Response>({
    url: '/api/deobfuscate-hangul',
    method: 'POST',
    tabId: 'deobfuscate-hangul',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      if (data?.result) {
        setResult(data.result);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      api.setError('난독화된 텍스트를 입력해주세요.');
      return;
    }
    setResult(null);
    await api.execute({
      body: { text: inputText }
    });
  };

  const resetAll = () => {
    setInputText('');
    setResult(null);
    api.reset();
  };

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  const renderConfidenceBar = (score: number) => {
    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-300`} style={{ width: `${score}%` }} />
      </div>
    );
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-purple-300">
            <Icon name="deobfuscateHangul" className="w-6 h-6" />
          </span>
          Deobfuscate Hangul
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
          난독화된 한글을 AI가 분석하여 원래의 한글로 복원합니다.
        </p>
        <div className="mt-2">
          <ApiProviderBadge provider="gemini" />
        </div>
      </header>

      {/* Playground 가이드 모달 */}
      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="Deobfuscate Hangul"
        playgroundId="deobfuscate-hangul"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

      {/* 입력 섹션 */}
      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">입력</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            rows={6}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="난독화된 한글을 입력하세요...&#10;&#10;예시: 꾰쫏 덟샅 캠깳헖 침굴륥왃"
            className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-sm resize-y"
            disabled={api.loading}
          />
          <div className="flex items-center gap-2 mt-3">
            <LoadingButton
              loading={api.loading}
              disabled={!inputText.trim()}
              onClick={handleSubmit}
              loadingText="분석 중…"
              idleText="복원 시작"
              variant="primary"
            />
            <LoadingButton
              loading={false}
              onClick={resetAll}
              loadingText=""
              idleText="초기화"
              variant="secondary"
            />
            <ErrorMessage error={api.error} />
          </div>
        </form>
      </section>

      {/* 결과 섹션 */}
      {result && (
        <div className="mt-4 space-y-4">
          {/* 복원된 텍스트 */}
          <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Icon name="check" className="w-5 h-5 text-green-400" />
                복원된 텍스트
              </h2>
              <button
                onClick={() => handleCopy(result.deobfuscated, 'deobfuscated')}
                className="text-gray-400 hover:text-white transition-colors p-1"
                title="복사"
              >
                <Icon name={copiedSection === 'deobfuscated' ? 'check' : 'copy'} className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-black/40 border border-white/10 rounded p-4">
              <p className="text-xl text-green-300 font-medium break-words">{result.deobfuscated}</p>
            </div>
          </section>

          {/* 원본 텍스트 */}
          <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
            <h2 className="text-sm font-medium text-white mb-2">원본 텍스트</h2>
            <div className="bg-black/40 border border-white/10 rounded p-4">
              <p className="text-gray-400 break-words">{result.original}</p>
            </div>
          </section>

          {/* 분석 정보 */}
          <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Icon name="info" className="w-5 h-5 text-purple-400" />
              분석 정보
            </h2>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-400">신뢰도:</span>
                <div className="flex items-center gap-3 mt-1">
                  {renderConfidenceBar(result.confidence)}
                  <span className="text-sm font-semibold text-white">{result.confidence}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">원본 음절 수:</span>
                  <span className="ml-2 text-white">{result.syllableCount.original}개</span>
                </div>
                <div>
                  <span className="text-gray-400">복원 후 음절 수:</span>
                  <span className="ml-2 text-white">{result.syllableCount.deobfuscated}개</span>
                </div>
              </div>

              {result.detectedPatterns.length > 0 && (
                <div>
                  <span className="text-sm text-gray-400 block mb-2">감지된 난독화 패턴:</span>
                  <div className="flex flex-wrap gap-2">
                    {result.detectedPatterns.map((pattern, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300"
                      >
                        {pattern}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-400 block mb-2">설명:</span>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{result.explanation}</p>
              </div>

              {result.alternatives && result.alternatives.length > 0 && (
                <div>
                  <span className="text-sm text-gray-400 block mb-2">대안 후보:</span>
                  <div className="space-y-2">
                    {result.alternatives.map((alt, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-black/40 border border-white/10 rounded p-3">
                        <p className="text-gray-300">{alt}</p>
                        <button
                          onClick={() => handleCopy(alt, `alt-${idx}`)}
                          className="text-gray-400 hover:text-white transition-colors p-1"
                          title="복사"
                        >
                          <Icon name={copiedSection === `alt-${idx}` ? 'check' : 'copy'} className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default DeobfuscateHangulPage;
