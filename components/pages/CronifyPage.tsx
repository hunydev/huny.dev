import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, ApiProviderBadge, PlaygroundGuideModal } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';
import cronstrue from 'cronstrue/i18n';

type CronGroup = 'A' | 'B' | 'C' | 'D';

interface CronResult {
  group: CronGroup;
  name: string;
  description: string;
  usage: string;
  expression: string;
  humanReadable: string;
  nextExecutions: string[];
  warnings: string[];
}

interface ApiResponse {
  results: CronResult[];
  originalInput: string;
}

const CronifyPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [inputText, setInputText] = React.useState<string>('');
  const [results, setResults] = React.useState<CronResult[]>([]);
  const [currentTime, setCurrentTime] = React.useState<string>('');
  const [copiedIndex, setCopiedIndex] = React.useState<number>(-1);
  const [timezone, setTimezone] = React.useState<string>('Asia/Seoul');

  const playgroundGuide = usePlaygroundGuide('cronify', isActiveTab);

  type Response = ApiResponse;
  const api = useApiCall<Response>({
    url: '/api/cronify',
    method: 'POST',
    tabId: 'cronify',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      if (data?.results) {
        // Process results: add humanReadable and nextExecutions
        const processedResults = data.results.map(result => {
          let humanReadable = '';
          let nextExecutions: string[] = [];
          
          try {
            // Generate human-readable description using cronstrue
            // cronstrue doesn't support Quartz ? syntax or AWS year field
            // Convert to standard format for interpretation
            let interpretExpression = result.expression;
            
            if (result.group === 'B') {
              // Quartz 6-field: replace ? with * for interpretation
              interpretExpression = result.expression.replace(/\?/g, '*');
            } else if (result.group === 'C') {
              // AWS cron 6-field: remove year field for interpretation
              const parts = result.expression.split(' ');
              if (parts.length === 6) {
                interpretExpression = parts.slice(0, 5).join(' ');
              }
            } else if (result.group === 'D') {
              // Quartz 7-field: remove year and replace ?
              const parts = result.expression.split(' ');
              if (parts.length === 7) {
                interpretExpression = parts.slice(0, 6).join(' ').replace(/\?/g, '*');
              }
            }
            
            humanReadable = cronstrue.toString(interpretExpression, {
              locale: 'ko',
              use24HourTimeFormat: true,
            });
          } catch (err) {
            humanReadable = '표현식 해석 실패';
          }
          
          // nextExecutions은 서버에서 계산해서 받음
          nextExecutions = result.nextExecutions || [];
          
          return {
            ...result,
            humanReadable,
            nextExecutions,
          };
        });
        
        setResults(processedResults);
      }
    },
  });

  // 현재 시각 실시간 업데이트 (초 단위 정밀)
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      api.setError('스케줄 문장을 입력해주세요.');
      return;
    }
    setResults([]);
    await api.execute({
      body: { text: inputText, timezone }
    });
  };

  const resetAll = () => {
    setInputText('');
    setResults([]);
    setCopiedIndex(-1);
    api.reset();
  };

  const handleCopy = async (expression: string, index: number) => {
    try {
      await navigator.clipboard.writeText(expression);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(-1), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const getGroupColor = (group: CronGroup): string => {
    switch (group) {
      case 'A': return 'border-blue-500/30 bg-blue-500/5';
      case 'B': return 'border-green-500/30 bg-green-500/5';
      case 'C': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'D': return 'border-purple-500/30 bg-purple-500/5';
      default: return 'border-white/10 bg-white/[0.03]';
    }
  };

  const getGroupBadgeColor = (group: CronGroup): string => {
    switch (group) {
      case 'A': return 'bg-blue-500/20 text-blue-300';
      case 'B': return 'bg-green-500/20 text-green-300';
      case 'C': return 'bg-yellow-500/20 text-yellow-300';
      case 'D': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-white/10 text-gray-300';
    }
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <Icon name="cronify" className="w-6 h-6" />
          </span>
          Cronify
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
          자연어로 스케줄을 입력하면 Linux cron, Quartz, AWS cron 등 다양한 형식의 cron 표현식으로 변환합니다.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <ApiProviderBadge provider="gemini" />
          <div className="text-sm text-gray-400">
            현재 시각: <span className="font-mono text-white">{currentTime}</span>
          </div>
        </div>
      </header>

      {/* Playground 가이드 모달 */}
      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="Cronify"
        playgroundId="cronify"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

      {/* 입력 섹션 */}
      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">스케줄 입력</h2>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="예: 매일 오전 9시 30분, 월~금 오후 6시, 매주 월요일 0시 등"
          className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-sm resize-y"
        />
        
        <div className="mt-3 flex items-center gap-2">
          <label className="text-xs text-gray-400">시간대:</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="px-2 py-1 text-xs rounded bg-black/40 border border-white/10"
          >
            <option value="Asia/Seoul">Asia/Seoul (KST)</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <LoadingButton
            loading={api.loading}
            disabled={!inputText.trim()}
            onClick={handleSubmit}
            loadingText="변환 중…"
            idleText="변환하기"
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
      </section>

      {/* 결과 섹션 */}
      {results.length > 0 && (
        <section className="mt-4">
          <h2 className="text-lg font-medium text-white mb-3">변환 결과</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`rounded-md border p-4 ${getGroupColor(result.group)}`}
              >
                {/* 그룹 헤더 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getGroupBadgeColor(result.group)}`}>
                      {result.group}
                    </span>
                    <span className="text-sm font-medium text-white">{result.name}</span>
                  </div>
                </div>

                {/* 사용처 */}
                <div className="text-xs text-gray-400 mb-3">
                  {result.usage}
                </div>

                {/* Cron 표현식 */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">표현식</span>
                    <button
                      onClick={() => handleCopy(result.expression, index)}
                      className="text-xs px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 transition"
                      title="복사"
                    >
                      {copiedIndex === index ? '✓ 복사됨' : '복사'}
                    </button>
                  </div>
                  <div className="px-3 py-2 rounded bg-black/40 border border-white/10 font-mono text-sm text-white break-all">
                    {result.expression}
                  </div>
                </div>

                {/* 해석 */}
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">해석</div>
                  <div className="text-sm text-gray-300">
                    {result.humanReadable}
                  </div>
                </div>

                {/* 다음 실행 시각 */}
                <div className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">다음 실행 시각 (최대 3회)</div>
                  <div className="space-y-1">
                    {result.nextExecutions.map((time, i) => (
                      <div key={i} className="text-xs font-mono text-gray-400">
                        {i + 1}. {time}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 경고 */}
                {result.warnings.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    {result.warnings.map((warning, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-yellow-400">
                        <Icon name="alert" className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 설명 섹션 */}
      {results.length === 0 && !api.loading && (
        <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-4">
          <h3 className="text-sm font-medium text-white mb-2">Cron 표현식 그룹</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <div><span className="font-medium text-blue-300">A: Linux cron (POSIX 5필드)</span> - 분 시 일 월 요일 | Linux, K8s, GCP</div>
            <div><span className="font-medium text-green-300">B: Quartz 6필드</span> - 초 분 시 일 월 요일 | Jenkins, Azure</div>
            <div><span className="font-medium text-yellow-300">C: AWS cron 6필드</span> - 분 시 일 월 요일 연도 | AWS EventBridge</div>
            <div><span className="font-medium text-purple-300">D: Quartz 7필드</span> - 초 분 시 일 월 요일 연도 | Spring, Airflow</div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CronifyPage;
