import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants/icons';
import { ApiProviderBadge, Badge, ErrorMessage, FileDropZone, LoadingButton, PlaygroundGuideModal } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { useFileUpload } from '../../hooks/useFileUpload';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

type BlockClassification = {
  id: string;
  category: 'NORMAL_CONTENT' | 'METADATA_OR_LAYOUT' | 'HIDDEN_PROMPT_ATTACK' | 'VISIBLE_PROMPT_ATTACK' | 'SUSPICIOUS_OTHER';
  reason?: string;
};

type SuspiciousBlock = {
  id: string;
  page: number;
  text: string;
  font_size?: number;
  bbox?: { x: number; y: number; width: number; height: number };
  suspicious_style_flags?: Record<string, boolean>;
};

type HiddenPromptDetection = {
  has_hidden_prompt_attack: boolean;
  summary: string;
  suspicious_block_ids: string[];
  block_classification: BlockClassification[];
};

type HiddenPromptApiResponse = {
  detection: HiddenPromptDetection;
  document_meta: {
    title: string;
    num_pages: number;
    file_name?: string;
    file_size_bytes?: number;
    blocks_analyzed?: number;
    truncated?: boolean;
  };
  suspicious_blocks?: SuspiciousBlock[];
  highlight_pdf_data_url?: string;
  stats?: {
    parse_ms?: number;
    gemini_ms?: number;
  };
};

const MAX_PDF_BYTES = 12 * 1024 * 1024;

const formatBytes = (bytes?: number) => {
  if (!bytes || bytes <= 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatNumber = (value?: number) => {
  if (typeof value !== 'number') return '-';
  return value.toLocaleString();
};

const categoryColors: Record<BlockClassification['category'], string> = {
  NORMAL_CONTENT: 'bg-emerald-500/15 text-emerald-300',
  METADATA_OR_LAYOUT: 'bg-slate-500/15 text-slate-300',
  HIDDEN_PROMPT_ATTACK: 'bg-red-500/15 text-red-300',
  VISIBLE_PROMPT_ATTACK: 'bg-orange-500/15 text-orange-300',
  SUSPICIOUS_OTHER: 'bg-amber-500/15 text-amber-300',
};

const flagLabels: Record<string, string> = {
  too_small_font: '매우 작은 폰트',
  near_page_edge: '페이지 가장자리',
  white_on_white: '배경과 동일한 색상',
  overlapped_by_other_objects: '다른 객체에 가려짐',
};

const HiddenPromptPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const playgroundGuide = usePlaygroundGuide('hidden-prompt', isActiveTab);
  const fileUpload = useFileUpload({
    accept: 'application/pdf,.pdf',
    maxSize: MAX_PDF_BYTES,
  });
  const [requestHighlightPdf, setRequestHighlightPdf] = React.useState(true);
  const [result, setResult] = React.useState<HiddenPromptApiResponse | null>(null);

  const api = useApiCall<HiddenPromptApiResponse>({
    url: '/api/hidden-prompt',
    method: 'POST',
    tabId: 'hidden-prompt',
    isActiveTab,
    apiTask,
    onSuccess: (data) => setResult(data || null),
  });

  const handleAnalyze = async () => {
    if (!fileUpload.file) {
      fileUpload.setError('PDF 파일을 업로드해 주세요.');
      return;
    }
    setResult(null);
    const formData = new FormData();
    formData.append('pdf', fileUpload.file);
    formData.append('generate_highlight_pdf', requestHighlightPdf ? '1' : '0');
    await api.execute({ body: formData });
  };

  const resetAll = () => {
    fileUpload.reset();
    setResult(null);
    api.reset();
  };

  const combinedError = api.error || fileUpload.error;
  const suspiciousBlocks = result?.suspicious_blocks ?? [];
  const classificationPreview = result?.detection?.block_classification?.slice(0, 200) ?? [];
  const classificationTotal = result?.detection?.block_classification?.length ?? 0;
  const remainingClassification = Math.max(0, classificationTotal - classificationPreview.length);

  const categoryCounts = React.useMemo(() => {
    const counts = new Map<BlockClassification['category'], number>();
    result?.detection?.block_classification?.forEach(entry => {
      counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1);
    });
    return Array.from(counts.entries());
  }, [result]);

  const suspiciousFlagBadges = (flags?: Record<string, boolean>) => {
    if (!flags) return null;
    return Object.entries(flags)
      .filter(([, enabled]) => !!enabled)
      .map(([flag]) => (
        <Badge key={flag} variant="colored" colorClass="bg-white/10 text-xs text-gray-200 px-2 py-0.5 rounded">
          {flagLabels[flag] ?? flag}
        </Badge>
      ));
  };

  const docMeta = result?.document_meta;
  const hasAttack = result?.detection?.has_hidden_prompt_attack;

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-violet-300">
            <Icon name="hiddenPrompt" className="w-6 h-6" />
          </span>
          Hidden Prompt Inspector
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
          Gemini API를 활용하여 PDF 구조를 분석하고, 숨겨진 프롬프트 공격 여부를 블록 단위로 분류합니다.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <ApiProviderBadge provider="gemini" />
          {docMeta?.truncated && (
            <Badge variant="colored" colorClass="bg-amber-500/15 text-amber-200">
              일부 블록만 분석됨
            </Badge>
          )}
        </div>
      </header>

      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="Hidden Prompt Inspector"
        playgroundId="hidden-prompt"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-white">PDF 업로드</h2>
          <span className="text-xs text-gray-500">최대 {formatBytes(MAX_PDF_BYTES)}</span>
        </div>
        <FileDropZone
          file={fileUpload.file}
          error={fileUpload.error}
          isDragging={fileUpload.isDragging}
          accept="application/pdf,.pdf"
          onDrop={fileUpload.onDrop}
          onDragOver={fileUpload.onDragOver}
          onDragEnter={fileUpload.onDragEnter}
          onDragLeave={fileUpload.onDragLeave}
          onInputChange={fileUpload.onInputChange}
          onReset={fileUpload.reset}
          label="여기에 PDF를 드래그하거나 클릭하여 업로드하세요."
          hint="PDF의 텍스트와 위치 데이터를 추출한 후 Gemini로 전송합니다."
          showFileName
          showFileSize
        />
        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            className="rounded border-white/20 bg-black/30"
            checked={requestHighlightPdf}
            onChange={(e) => setRequestHighlightPdf(e.target.checked)}
          />
          분석 결과에서 수상 블록만 따로 모은 PDF를 생성합니다.
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <LoadingButton
            loading={api.loading}
            disabled={!fileUpload.file}
            onClick={handleAnalyze}
            loadingText="분석 중…"
            idleText="PDF 분석"
            variant="primary"
          />
          <LoadingButton
            loading={false}
            onClick={resetAll}
            idleText="초기화"
            variant="secondary"
          />
          <ErrorMessage error={combinedError} />
        </div>
      </section>

      {result && (
        <>
          <section className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-md border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-gray-500 mb-1">분석 상태</p>
              <p className={`text-lg font-semibold ${hasAttack ? 'text-red-300' : 'text-emerald-300'}`}>
                {hasAttack ? '숨겨진 프롬프트 감지됨' : '의심스러운 공격 없음'}
              </p>
              <p className="text-xs text-gray-400 mt-1">수상 ID: {result.detection.suspicious_block_ids.length}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-gray-500 mb-1">문서 정보</p>
              <p className="text-lg font-semibold text-white">{docMeta?.title || '(제목 없음)'}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatNumber(docMeta?.num_pages)} 페이지 · {formatBytes(docMeta?.file_size_bytes)}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-gray-500 mb-1">블록 분석 수</p>
              <p className="text-lg font-semibold text-white">{formatNumber(docMeta?.blocks_analyzed)}</p>
              <p className="text-xs text-gray-400 mt-1">
                추출 {result.stats?.parse_ms ?? '-'}ms · Gemini {result.stats?.gemini_ms ?? '-'}ms
              </p>
            </div>
          </section>

          <section className="mt-5 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium text-white">요약</h2>
              {result.highlight_pdf_data_url && (
                <a
                  href={result.highlight_pdf_data_url}
                  download={`${docMeta?.file_name?.replace(/\.pdf$/i, '') || 'hidden-prompt'}-suspicious.pdf`}
                  className="px-3 py-1.5 text-xs rounded border border-violet-400/40 text-violet-200 hover:bg-violet-400/10"
                >
                  수상 블록 PDF 다운로드
                </a>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-200 whitespace-pre-wrap break-words">
              {result.detection.summary}
            </p>

            {categoryCounts.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {categoryCounts.map(([category, count]) => (
                  <Badge
                    key={category}
                    variant="colored"
                    colorClass={`${categoryColors[category]} inline-flex items-center px-2 py-0.5 rounded`}
                  >
                    {category} · {count}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          <section className="mt-5 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white">수상 블록 미리보기</h2>
              <span className="text-xs text-gray-500">{suspiciousBlocks.length}개</span>
            </div>
            {suspiciousBlocks.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">수상 블록이 감지되지 않았습니다.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {suspiciousBlocks.map(block => (
                  <div key={block.id} className="rounded border border-white/10 bg-black/30 p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 gap-2">
                      <span>ID {block.id} · {block.page} 페이지</span>
                      <span>폰트 {block.font_size ? block.font_size.toFixed(1) : '?'}pt</span>
                    </div>
                    <p className="text-sm text-gray-100 whitespace-pre-wrap break-words">
                      {block.text || '(텍스트 없음)'}
                    </p>
                    <div className="flex flex-wrap gap-1 text-[11px] text-gray-400">
                      {suspiciousFlagBadges(block.suspicious_style_flags)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-5 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-white">블록 분류 결과</h2>
              {remainingClassification > 0 && (
                <span className="text-xs text-gray-500">
                  +{formatNumber(remainingClassification)}개 더 존재
                </span>
              )}
            </div>
            {classificationPreview.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">분류 결과가 없습니다.</p>
            ) : (
              <div className="mt-3 overflow-auto rounded border border-white/10">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-white/5 text-gray-400">
                    <tr>
                      <th className="px-3 py-2 font-medium">ID</th>
                      <th className="px-3 py-2 font-medium">카테고리</th>
                      <th className="px-3 py-2 font-medium">사유</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classificationPreview.map((entry) => (
                      <tr key={entry.id} className="border-t border-white/5">
                        <td className="px-3 py-2 text-gray-200">{entry.id}</td>
                        <td className="px-3 py-2">
                          <Badge
                            variant="colored"
                            colorClass={`${categoryColors[entry.category]} inline-flex items-center px-2 py-0.5 rounded`}
                          >
                            {entry.category}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-gray-400 whitespace-pre-wrap break-words">
                          {entry.reason || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default HiddenPromptPage;
