import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, ApiProviderBadge, PlaygroundGuideModal } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

interface ReStylerResponse {
  styledContent: string;
  originalFormat: string;
  outputFormat: string;
  appliedPreset?: string;
  customTheme?: string;
}

type StylePreset = 'tailwind' | 'material' | 'bootstrap' | 'minimalist' | 'glassmorphism' | 'none';
type OutputFormat = 'html' | 'markdown';

const STYLE_PRESETS: { value: StylePreset; label: string; description: string }[] = [
  { value: 'none', label: '없음', description: '커스텀 테마만 적용' },
  { value: 'tailwind', label: 'Tailwind', description: '모던하고 유틸리티 중심 스타일' },
  { value: 'material', label: 'Material Design', description: 'Google Material Design 스타일' },
  { value: 'bootstrap', label: 'Bootstrap', description: '클래식하고 반응형 스타일' },
  { value: 'minimalist', label: 'Minimalist', description: '깔끔하고 단순한 스타일' },
  { value: 'glassmorphism', label: 'Glassmorphism', description: '유리같은 반투명 모던 스타일' },
];

const ReStylerPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [inputContent, setInputContent] = React.useState<string>('');
  const [styledContent, setStyledContent] = React.useState<string>('');
  const [stylePreset, setStylePreset] = React.useState<StylePreset>('tailwind');
  const [customTheme, setCustomTheme] = React.useState<string>('');
  const [outputFormat, setOutputFormat] = React.useState<OutputFormat>('html');
  const [copiedSection, setCopiedSection] = React.useState<string>('');
  const [showPreview, setShowPreview] = React.useState<boolean>(true);
  
  const playgroundGuide = usePlaygroundGuide('restyler', isActiveTab);

  type Response = ReStylerResponse;
  const api = useApiCall<Response>({
    url: '/api/restyler',
    method: 'POST',
    tabId: 'restyler',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      if (data?.styledContent) {
        setStyledContent(data.styledContent);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) {
      api.setError('콘텐츠를 입력해주세요.');
      return;
    }
    setStyledContent('');
    await api.execute({
      body: {
        content: inputContent,
        stylePreset: stylePreset === 'none' ? undefined : stylePreset,
        customTheme: customTheme.trim() || undefined,
        outputFormat,
      }
    });
  };

  const handleReset = () => {
    setInputContent('');
    setStyledContent('');
    setStylePreset('tailwind');
    setCustomTheme('');
    setOutputFormat('html');
    api.reset();
  };

  const handleCopy = React.useCallback((text: string, section: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(''), 2000);
    });
  }, []);

  const renderMarkdownPreview = (markdown: string): string => {
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
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p class="text-gray-300 my-2">');
    html = html.replace(/\n/g, '<br />');
    
    return `<div class="prose prose-invert max-w-none"><p class="text-gray-300 my-2">${html}</p></div>`;
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <Icon name="reStyler" className="w-6 h-6" />
          </span>
          ReStyler
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
          CSS가 없거나 최소한의 스타일만 적용된 HTML을 입력하면 AI가 모던하고 스타일리시하게 재스타일링합니다.
        </p>
        <div className="mt-2">
          <ApiProviderBadge provider="gemini" />
        </div>
      </header>

      {/* Playground 가이드 모달 */}
      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="ReStyler"
        playgroundId="restyler"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

      {/* 입력 섹션 */}
      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">입력</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            rows={10}
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            placeholder="HTML, HTML with JS, 또는 plain text를 입력하세요...&#10;&#10;예시:&#10;&lt;div&gt;&#10;  &lt;h1&gt;Welcome&lt;/h1&gt;&#10;  &lt;p&gt;This is a simple text.&lt;/p&gt;&#10;&lt;/div&gt;"
            className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-sm resize-y font-mono"
            disabled={api.loading}
          />

          {/* 스타일 Preset 선택 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">스타일 Preset</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {STYLE_PRESETS.map((preset) => (
                <label
                  key={preset.value}
                  className={`
                    flex flex-col p-3 rounded border cursor-pointer transition-all
                    ${stylePreset === preset.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="stylePreset"
                    value={preset.value}
                    checked={stylePreset === preset.value}
                    onChange={(e) => setStylePreset(e.target.value as StylePreset)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-white">{preset.label}</span>
                  <span className="text-xs text-gray-400 mt-1">{preset.description}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Theme */}
          <div>
            <label htmlFor="customTheme" className="block text-sm font-medium text-white mb-2">
              커스텀 테마 (선택사항)
            </label>
            <input
              id="customTheme"
              type="text"
              value={customTheme}
              onChange={(e) => setCustomTheme(e.target.value)}
              placeholder="예: 다크모드, 네온 효과, 빈티지 스타일 등..."
              className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-sm"
              disabled={api.loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              추가로 적용하고 싶은 스타일 방향성을 자유롭게 입력하세요.
            </p>
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">출력 포맷</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="outputFormat"
                  value="html"
                  checked={outputFormat === 'html'}
                  onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-300">HTML</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="outputFormat"
                  value="markdown"
                  checked={outputFormat === 'markdown'}
                  onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-300">Markdown</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <LoadingButton
              loading={api.loading}
              disabled={!inputContent.trim()}
              onClick={handleSubmit}
              loadingText="스타일링 중…"
              idleText="ReStyle"
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
        </form>
      </section>

      {/* 결과 섹션 */}
      {styledContent && (
        <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Icon name={showPreview ? 'image' : 'file'} className="w-5 h-5 text-purple-400" />
              {showPreview ? '미리보기' : `스타일링된 소스 (${outputFormat.toUpperCase()})`}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-gray-400 hover:text-white transition-colors px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
                title={showPreview ? '소스 보기' : '미리보기'}
              >
                {showPreview ? '소스' : '미리보기'}
              </button>
              <button
                onClick={() => handleCopy(styledContent, 'result')}
                className="text-gray-400 hover:text-white transition-colors p-1"
                title="복사"
              >
                <Icon name={copiedSection === 'result' ? 'check' : 'copy'} className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {showPreview ? (
            <div className="bg-white rounded-lg overflow-hidden">
              {outputFormat === 'html' ? (
                <iframe
                  srcDoc={styledContent}
                  className="w-full border-0 h-[70vh] max-h-[1000px]"
                  title="HTML Preview"
                  sandbox="allow-scripts"
                />
              ) : (
                <div 
                  className="p-6 bg-white text-gray-900"
                  dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(styledContent) }}
                />
              )}
            </div>
          ) : (
            <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {styledContent}
              </pre>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ReStylerPage;
