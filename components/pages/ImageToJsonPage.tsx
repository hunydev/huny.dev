import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import {
  ApiProviderBadge,
  ErrorMessage,
  FileDropZone,
  LoadingButton,
  PlaygroundGuideModal,
} from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { useFileUpload } from '../../hooks/useFileUpload';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

const PLAYGROUND_ID = 'image-to-json';

type DocumentPreset = 'receipt' | 'meal-plan' | 'poster' | 'invoice' | 'auto';

const joinLines = (lines: string[]) => lines.join('\n');

const PRESET_OPTIONS: Array<{ value: DocumentPreset; label: string; description: string }> = [
  { value: 'receipt', label: '영수증', description: '매장/가맹점 영수증, 주문서, 결제 내역' },
  { value: 'meal-plan', label: '식단표', description: '카페테리아, 급식 식단표, 메뉴판' },
  { value: 'poster', label: '포스터', description: '이벤트/행사 포스터, 공지 이미지' },
  { value: 'invoice', label: '인보이스', description: '거래 명세서, 청구서' },
  { value: 'auto', label: '자동 감지', description: '문서 타입을 직접 추정' },
];

const PRESET_HINTS: Record<DocumentPreset, string> = {
  receipt: joinLines([
    '필수 키:',
    '- merchant: { name, branch, address, business_number, phone }',
    '- transaction: { datetime_iso, payment_method, terminal_id }',
    '- lineItems[]: { name, quantity, unit, unitPrice: { amount, currency }, totalPrice: { amount, currency } }',
    '- totals: { subtotal, tax, discount, grandTotal }',
    '- taxes[]: { rate, amount } (필요 시)',
    'lineItems, totals, taxes 의 숫자는 반드시 number 타입으로 반환',
  ]),
  'meal-plan': joinLines([
    '필수 키:',
    '- schedule: { start_date, end_date, location }',
    '- meals[]: { mealType, servedAt, items: [{ name, calories, allergens, tags[] }] }',
    '- nutrition_summary: { calories, protein, fat, carbs } (가능 시)',
    '알레르기 정보나 태그가 없으면 빈 배열로 둡니다.',
  ]),
  poster: joinLines([
    '필수 키:',
    '- title, subtitle, organizer, location, start_datetime, end_datetime',
    '- call_to_action, url, contact, hashtags[]',
    '- highlights[]: { label, value }',
    '시간/날짜는 ISO 8601 문자열, 위치는 주소/장소 명칭 그대로 유지',
  ]),
  invoice: joinLines([
    '필수 키:',
    '- parties: { seller: { name, address, contact }, buyer: { name, address, contact } }',
    '- invoice: { number, issue_date, due_date, currency }',
    '- lineItems[]: { description, quantity, unitPrice, totalPrice, taxRate }',
    '- totals: { subtotal, tax, shipping, grandTotal, balanceDue }',
    '합계는 currency/amount 객체를 사용하고, 숫자는 number 타입으로 유지',
  ]),
  auto: joinLines([
    '문서가 어떤 유형이든 다음 구조를 유지:',
    '- sections[]: { title, fields: [{ key, value, confidence, unit? }] }',
    '- lineItems[] (있을 때만), totals, contacts, metadata',
    '가능하면 라인아이템과 요약 텍스트를 분리, 찾을 수 없는 필드는 null/빈 배열',
  ]),
};

type ImageToJsonResponse = {
  json?: Record<string, unknown>;
  jsonText?: string;
  metadata?: {
    documentType?: string;
    detectedDocumentType?: string;
    model?: string;
    language?: string;
    schemaHintIncluded?: boolean;
    confidence?: number;
    extractedFields?: string[];
  };
};

const ImageToJsonPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [schemaPreset, setSchemaPreset] = React.useState<DocumentPreset>('receipt');
  const [schemaHint, setSchemaHint] = React.useState<string>(PRESET_HINTS.receipt);
  const [schemaDirty, setSchemaDirty] = React.useState(false);
  const [language, setLanguage] = React.useState<'ko' | 'en'>('ko');
  const [jsonText, setJsonText] = React.useState('');
  const [metadata, setMetadata] = React.useState<ImageToJsonResponse['metadata'] | null>(null);
  const [copied, setCopied] = React.useState(false);

  const playgroundGuide = usePlaygroundGuide(PLAYGROUND_ID, Boolean(isActiveTab));
  const fileUpload = useFileUpload({
    accept: 'image/*',
    maxSize: 8 * 1024 * 1024,
  });

  const api = useApiCall<ImageToJsonResponse>({
    url: '/api/image-to-json',
    method: 'POST',
    tabId: PLAYGROUND_ID,
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      const nextJson = data?.jsonText || (data?.json ? JSON.stringify(data.json, null, 2) : '');
      setJsonText(nextJson || '');
      setMetadata(data?.metadata ?? null);
    },
  });

  React.useEffect(() => {
    if (!isActiveTab) return;
    const handlePaste = (event: ClipboardEvent) => {
      fileUpload.onPaste(event);
    };
    window.addEventListener('paste', handlePaste as unknown as EventListener);
    return () => window.removeEventListener('paste', handlePaste as unknown as EventListener);
  }, [fileUpload.onPaste, isActiveTab]);

  React.useEffect(() => {
    let timer: number | undefined;
    if (copied) {
      timer = window.setTimeout(() => setCopied(false), 1500);
    }
    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [copied]);

  const handlePresetChange = (value: DocumentPreset) => {
    setSchemaPreset(value);
    if (!schemaDirty) {
      setSchemaHint(PRESET_HINTS[value]);
    }
  };

  const handleSchemaChange = (value: string) => {
    setSchemaDirty(true);
    setSchemaHint(value);
  };

  const resetSchemaToPreset = () => {
    setSchemaHint(PRESET_HINTS[schemaPreset]);
    setSchemaDirty(false);
  };

  const handleAnalyze = async () => {
    if (!fileUpload.file) {
      api.setError('이미지를 업로드하거나 붙여넣어 주세요.');
      return;
    }
    setCopied(false);
    setJsonText('');
    setMetadata(null);

    const formData = new FormData();
    formData.append('image', fileUpload.file);
    formData.append('documentType', schemaPreset);
    formData.append('language', language);
    if (schemaHint.trim()) {
      formData.append('schemaHint', schemaHint.trim());
    }

    await api.execute({ body: formData });
  };

  const resetAll = () => {
    fileUpload.reset();
    setSchemaPreset('receipt');
    setSchemaHint(PRESET_HINTS.receipt);
    setSchemaDirty(false);
    setLanguage('ko');
    setJsonText('');
    setMetadata(null);
    setCopied(false);
    api.reset();
  };

  const handleCopy = async () => {
    if (!jsonText.trim()) return;
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
    } catch (error) {
      console.error('copy failed', error);
    }
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <Icon name="imageToJson" className="w-6 h-6" aria-hidden />
          </span>
          Image to Json
          <button
            type="button"
            onClick={playgroundGuide.openGuide}
            className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
            aria-label="사용 가이드 보기"
          >
            ?
          </button>
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          영수증, 식단표, 포스터 등 다양한 이미지를 Gemini로 분석해 기계가 바로 활용할 수 있는 JSON으로 구조화합니다.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <ApiProviderBadge provider="gemini" />
          <span className="text-xs text-gray-500">
            • 파일 선택 · 드래그 · Ctrl/Cmd+V 붙여넣기 지원 • 8MB 이하 이미지
          </span>
        </div>
      </header>

      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="Image to Json"
        playgroundId={PLAYGROUND_ID}
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
          <Icon name="file" className="w-4 h-4 text-sky-300" aria-hidden />
          입력 구성
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              onReset={fileUpload.reset}
              label="이미지를 드래그하거나 클릭 / 붙여넣기(Ctrl+V)"
              hint="PNG · JPG · WebP / 최대 8MB"
              previewClassName="max-h-72 object-contain"
            />
            <ul className="mt-3 text-xs text-gray-500 space-y-1 list-disc list-inside">
              <li>배경이 기울어져 있어도 자동으로 텍스트를 추출합니다.</li>
              <li>여러 페이지가 담긴 이미지라면 가장 중요한 페이지부터 요약합니다.</li>
              <li>민감한 정보는 마스킹한 뒤 업로드하세요.</li>
            </ul>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-2">스키마 프리셋</p>
              <div className="flex flex-wrap gap-2">
                {PRESET_OPTIONS.map((option) => {
                  const selected = schemaPreset === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handlePresetChange(option.value)}
                      className={`px-3 py-1.5 rounded border text-xs text-left transition ${
                        selected
                          ? 'border-sky-400 bg-sky-400/10 text-white'
                          : 'border-white/10 text-gray-300 hover:border-white/30'
                      }`}
                    >
                      <span className="block font-medium">{option.label}</span>
                      <span className="block text-[11px] text-gray-500">{option.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                <span>추출 필드 가이드</span>
                <button
                  type="button"
                  onClick={resetSchemaToPreset}
                  className="text-[11px] text-gray-400 hover:text-white"
                  disabled={!schemaDirty}
                >
                  프리셋으로 초기화
                </button>
              </div>
              <textarea
                value={schemaHint}
                onChange={(e) => handleSchemaChange(e.target.value)}
                rows={6}
                className="w-full text-sm rounded border border-white/10 bg-black/30 px-3 py-2 resize-y focus:ring-1 focus:ring-sky-500 focus:outline-none"
                placeholder="JSON 필드를 자유롭게 설명해 주세요."
              />
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                <span>Gemini가 이 구조를 우선 반영합니다.</span>
                <span>{schemaHint.length}자</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs">
              <label className="flex flex-col gap-1">
                <span className="text-gray-400">필드 언어</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value === 'en' ? 'en' : 'ko')}
                  className="px-2 py-1 rounded border border-white/10 bg-black/30 text-sm"
                >
                  <option value="ko">한국어 (필드명·요약)</option>
                  <option value="en">English (field labels)</option>
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <LoadingButton
                loading={api.loading}
                disabled={!fileUpload.file}
                onClick={handleAnalyze}
                loadingText="구조화 중…"
                idleText="Gemini로 구조화"
                variant="blue"
              />
              <LoadingButton
                loading={false}
                onClick={resetAll}
                loadingText=""
                idleText="초기화"
                variant="secondary"
              />
              <ErrorMessage error={api.error || fileUpload.error} className="text-xs text-amber-300" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Icon name="clipboard" className="w-4 h-4 text-emerald-300" aria-hidden />
            <h2 className="text-sm font-medium text-white">JSON 결과</h2>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded text-xs flex items-center gap-1 border ${
              jsonText
                ? 'border-emerald-400 text-emerald-200 hover:bg-emerald-400/10'
                : 'border-white/10 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!jsonText}
          >
            <Icon name={copied ? 'checkBadge' : 'clipboard'} className="w-3 h-3" aria-hidden />
            {copied ? '복사됨' : 'JSON 복사'}
          </button>
        </div>

        {metadata && (
          <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-400">
            <div className="border border-white/5 rounded px-3 py-2">
              <p className="text-gray-500 mb-0.5">감지된 문서</p>
              <p className="text-sm text-white font-medium">
                {metadata.detectedDocumentType || metadata.documentType || '알 수 없음'}
              </p>
            </div>
            <div className="border border-white/5 rounded px-3 py-2">
              <p className="text-gray-500 mb-0.5">모델 / 언어</p>
              <p className="text-sm text-white font-medium">
                {metadata.model || 'gemini-2.0-flash-exp'} · {metadata.language?.toUpperCase() || language.toUpperCase()}
              </p>
            </div>
            <div className="border border-white/5 rounded px-3 py-2">
              <p className="text-gray-500 mb-0.5">신뢰도</p>
              <p className="text-sm text-white font-medium">
                {typeof metadata.confidence === 'number' ? `${(metadata.confidence * 100).toFixed(1)}%` : '제공 안됨'}
              </p>
            </div>
            {metadata.extractedFields?.length ? (
              <div className="md:col-span-3 border border-white/5 rounded px-3 py-2">
                <p className="text-gray-500 mb-1">식별된 필드</p>
                <div className="flex flex-wrap gap-1">
                  {metadata.extractedFields.slice(0, 18).map((field) => (
                    <span
                      key={field}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-white/5 border border-white/10 text-gray-300"
                    >
                      {field}
                    </span>
                  ))}
                  {metadata.extractedFields.length > 18 && (
                    <span className="text-[11px] text-gray-500">
                      +{metadata.extractedFields.length - 18} more
                    </span>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="rounded border border-white/10 bg-black/40 p-3 text-sm font-mono text-gray-100 whitespace-pre-wrap overflow-auto min-h-[220px]">
          {jsonText ? (
            <pre className="whitespace-pre-wrap break-words text-[13px] leading-relaxed">{jsonText}</pre>
          ) : (
            <div className="text-gray-500 text-sm">
              아직 결과가 없습니다. 이미지를 선택하고 &ldquo;Gemini로 구조화&rdquo; 버튼을 눌러보세요.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ImageToJsonPage;
