import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, ApiProviderBadge, PlaygroundGuideModal } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

interface MorphResult {
  summary: string; // 본질 파악 근거 요약
  metadata: {
    originalLength: number;
    processedLength: number;
    detectedStructures: string[]; // 표, 코드, 리스트 등
    confidenceScore: number; // 0-100
    language: string;
    primaryTransformations: string[]; // 적용된 주요 변환
  };
  markdownContent: string; // 최종 MD 본문
  changeLog: {
    description: string;
    examples: Array<{ before: string; after: string }>; // 대표 변경 사례
  };
}

interface ApiResponse {
  result: MorphResult;
  originalInput: string;
}

const TextMorphPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [inputText, setInputText] = React.useState<string>('');
  const [result, setResult] = React.useState<MorphResult | null>(null);
  const [copiedSection, setCopiedSection] = React.useState<string>('');
  const [showRawMarkdown, setShowRawMarkdown] = React.useState<boolean>(false);
  
  const playgroundGuide = usePlaygroundGuide('text-morph');

  type Response = ApiResponse;
  const api = useApiCall<Response>({
    url: '/api/text-morph',
    method: 'POST',
    tabId: 'text-morph',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      if (data?.result) {
        setResult(data.result);
        setShowRawMarkdown(false); // 새 결과는 항상 미리보기로 표시
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      api.setError('텍스트를 입력해주세요.');
      return;
    }
    setResult(null);
    await api.execute({
      body: { text: inputText }
    });
  };

  const handleCopy = React.useCallback((text: string, section: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(''), 2000);
    });
  }, []);

  const renderConfidenceBar = (score: number) => {
    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-300`} style={{ width: `${score}%` }} />
      </div>
    );
  };

  const renderMarkdownAsHtml = (markdown: string): string => {
    let html = markdown;
    
    // Code blocks with language
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="bg-gray-900 p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm text-gray-300">${code.trim()}</code></pre>`;
    });
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1.5 py-0.5 rounded text-sm text-blue-400">$1</code>');
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>');
    
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    
    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-300">$1</em>');
    
    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 text-gray-300">$1</li>');
    html = html.replace(/(<li class="ml-4 text-gray-300">.*<\/li>\n?)+/g, '<ul class="list-disc list-inside my-2 space-y-1">$&</ul>');
    
    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 text-gray-300">$1</li>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Tables (basic support)
    html = html.replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(s => s.trim());
      const cellsHtml = cells.map(cell => `<td class="border border-gray-700 px-3 py-2 text-gray-300">${cell.trim()}</td>`).join('');
      return `<tr>${cellsHtml}</tr>`;
    });
    html = html.replace(/(<tr>.*<\/tr>\n?)+/g, '<table class="border-collapse border border-gray-700 my-4 w-full">$&</table>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="text-gray-300 my-2">');
    html = html.replace(/\n/g, '<br />');
    
    return `<div class="prose prose-invert max-w-none"><p class="text-gray-300 my-2">${html}</p></div>`;
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        title="Text Morph 사용 가이드"
        content={
          <div className="space-y-4 text-sm text-gray-300">
            <section>
              <h3 className="font-semibold text-white mb-2">📝 개요</h3>
              <p>가독성이 떨어지는 텍스트를 AI가 분석하여 읽기 쉬운 Markdown으로 자동 변환합니다.</p>
            </section>
            <section>
              <h3 className="font-semibold text-white mb-2">✨ 주요 기능</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>표/코드/리스트 구조 자동 감지 및 포맷팅</li>
                <li>한글 중심 변환 (원문 병기)</li>
                <li>노이즈 및 제어문자 제거</li>
                <li>날짜, 단위, 통화 정규화</li>
                <li>신뢰도 스코어 제공</li>
                <li>변경 내역 추적</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-white mb-2">💡 사용 예시</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Markdown 표가 포함된 raw text</li>
                <li>영어와 한자가 섞인 텍스트</li>
                <li>바이너리에서 추출한 노이즈 포함 텍스트</li>
                <li>구조화되지 않은 문서</li>
              </ul>
            </section>
            <section>
              <h3 className="font-semibold text-white mb-2">📊 출력 구성</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>분석 요약:</strong> 텍스트 본질 파악 근거</li>
                <li><strong>메타 정보:</strong> 감지된 구조, 신뢰도 점수</li>
                <li><strong>Markdown 본문:</strong> 최종 변환 결과</li>
                <li><strong>변경 로그:</strong> 주요 변경 사항 (before/after)</li>
              </ul>
            </section>
          </div>
        }
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="textMorph" className="w-5 h-5" />
          <h1 className="text-xl font-semibold text-white">Text Morph</h1>
          <ApiProviderBadge provider="gemini" />
        </div>
        <button
          onClick={playgroundGuide.openGuide}
          className="text-gray-400 hover:text-white transition-colors p-2"
          title="사용 가이드"
        >
          <Icon name="help" className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-gray-400">
        출처·의도 불명 텍스트를 입력하면 AI가 본질을 파악하고 읽기 쉬운 Markdown으로 변환합니다.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            입력 텍스트
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="가독성이 떨어지는 텍스트를 입력하세요...&#10;&#10;예시:&#10;- Markdown 표가 포함된 raw text&#10;- 영어/한자가 섞인 텍스트&#10;- 바이너리 추출 텍스트&#10;- 구조화되지 않은 문서"
            className="w-full h-40 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={api.loading}
          />
        </div>

        <LoadingButton type="submit" loading={api.loading} disabled={!inputText.trim() || api.loading}>
          <Icon name="play" className="w-4 h-4 mr-2" />
          변환 시작
        </LoadingButton>
      </form>

      {api.error && <ErrorMessage error={api.error} />}

      {result && (
        <div className="space-y-6 border-t border-gray-700 pt-6">
          {/* 분석 요약 */}
          <section className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Icon name="search" className="w-5 h-5 text-blue-400" />
                분석 요약
              </h2>
              <button
                onClick={() => handleCopy(result.summary, 'summary')}
                className="text-gray-400 hover:text-white transition-colors p-1"
                title="복사"
              >
                <Icon name={copiedSection === 'summary' ? 'check' : 'copy'} className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-300 whitespace-pre-wrap">{result.summary}</p>
          </section>

          {/* 메타 정보 */}
          <section className="bg-gray-800 rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Icon name="info" className="w-5 h-5 text-purple-400" />
              메타 정보
            </h2>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">원본 길이:</span>
                <span className="ml-2 text-white">{result.metadata.originalLength.toLocaleString()}자</span>
              </div>
              <div>
                <span className="text-gray-400">변환 길이:</span>
                <span className="ml-2 text-white">{result.metadata.processedLength.toLocaleString()}자</span>
              </div>
              <div>
                <span className="text-gray-400">언어:</span>
                <span className="ml-2 text-white">{result.metadata.language}</span>
              </div>
              <div>
                <span className="text-gray-400">감지된 구조:</span>
                <span className="ml-2 text-white">{result.metadata.detectedStructures.join(', ') || '없음'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">신뢰도:</span>
                <span className="text-white font-semibold">{result.metadata.confidenceScore}%</span>
              </div>
              {renderConfidenceBar(result.metadata.confidenceScore)}
            </div>

            {result.metadata.primaryTransformations.length > 0 && (
              <div>
                <span className="text-sm text-gray-400 block mb-2">적용된 변환:</span>
                <div className="flex flex-wrap gap-2">
                  {result.metadata.primaryTransformations.map((transform, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                    >
                      {transform}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Markdown 본문 */}
          <section className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Icon name="file" className="w-5 h-5 text-green-400" />
                Markdown 본문
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRawMarkdown(!showRawMarkdown)}
                  className="text-gray-400 hover:text-white transition-colors px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                  title={showRawMarkdown ? '미리보기로 전환' : '원문으로 전환'}
                >
                  {showRawMarkdown ? '미리보기' : '원문'}
                </button>
                <button
                  onClick={() => handleCopy(result.markdownContent, 'markdown')}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                  title="복사"
                >
                  <Icon name={copiedSection === 'markdown' ? 'check' : 'copy'} className="w-4 h-4" />
                </button>
              </div>
            </div>
            {showRawMarkdown ? (
              <div className="prose prose-invert max-w-none">
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 whitespace-pre-wrap">
                  {result.markdownContent}
                </pre>
              </div>
            ) : (
              <div 
                className="bg-gray-900 p-4 rounded-lg overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: renderMarkdownAsHtml(result.markdownContent) }}
              />
            )}
          </section>

          {/* 변경 로그 */}
          <section className="bg-gray-800 rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Icon name="history" className="w-5 h-5 text-orange-400" />
              변경 로그
            </h2>
            <p className="text-sm text-gray-400">{result.changeLog.description}</p>
            
            {result.changeLog.examples.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300">주요 변경 사례:</h3>
                {result.changeLog.examples.map((example, idx) => (
                  <div key={idx} className="bg-gray-900 rounded-lg p-3 space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">이전:</div>
                      <div className="text-sm text-red-400 font-mono bg-gray-800 p-2 rounded">
                        {example.before}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Icon name="arrowDown" className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">이후:</div>
                      <div className="text-sm text-green-400 font-mono bg-gray-800 p-2 rounded">
                        {example.after}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default TextMorphPage;
