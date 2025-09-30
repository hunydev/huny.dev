import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton } from '../ui';
import { downloadFromUrl } from '../../utils/download';

const AVAILABLE_SIZES = [32, 48, 64, 96, 128, 192, 256];

const formatDownloadName = (size: number | undefined, format: string) => {
  if (!size) return `favicon.${format}`;
  return `favicon-${size}.${format}`;
};

type GeneratedAsset = {
  size?: number;
  format: 'png' | 'ico';
  url: string;
  label?: string;
};

type ApiAsset = {
  size?: number;
  format?: string;
  url?: string;
  data?: string;
  label?: string;
};

type ApiResponse = {
  preview?: string;
  source?: string;
  assets?: ApiAsset[];
  jobId?: string;
  message?: string;
  error?: string;
};

const ensureDataUrl = (maybeBase64: string, format: string) => {
  if (!maybeBase64) return '';
  if (maybeBase64.startsWith('data:')) return maybeBase64;
  const mime = format === 'ico' ? 'image/x-icon' : 'image/png';
  return `data:${mime};base64,${maybeBase64}`;
};

const FaviconDistillerPage: React.FC<PageProps> = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [localPreview, setLocalPreview] = React.useState<string>('');
  const [selectedSizes, setSelectedSizes] = React.useState<Set<number>>(() => new Set([32, 64, 128]));
  const [includeIco, setIncludeIco] = React.useState(true);
  const [transparent, setTransparent] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [assets, setAssets] = React.useState<GeneratedAsset[]>([]);
  const [remotePreview, setRemotePreview] = React.useState<string>('');
  const [jobId, setJobId] = React.useState<string>('');
  const [message, setMessage] = React.useState<string>('');

  const revokeLocalPreview = React.useCallback(() => {
    if (localPreview && localPreview.startsWith('blob:')) {
      URL.revokeObjectURL(localPreview);
    }
  }, [localPreview]);

  React.useEffect(() => () => revokeLocalPreview(), [revokeLocalPreview]);

  const onFileChange = (nextFile: File | null) => {
    revokeLocalPreview();
    setFile(nextFile);
    setAssets([]);
    setRemotePreview('');
    setJobId('');
    setMessage('');
    if (nextFile) {
      const url = URL.createObjectURL(nextFile);
      setLocalPreview(url);
      setError('');
    } else {
      setLocalPreview('');
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      onFileChange(f);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      onFileChange(f);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const toggleSize = (size: number) => {
    setSelectedSizes(prev => {
      const next = new Set(prev);
      if (next.has(size)) {
        next.delete(size);
      } else {
        next.add(size);
      }
      return next;
    });
  };

  const parseAssets = (payload: ApiResponse): GeneratedAsset[] => {
    if (!Array.isArray(payload.assets)) return [];
    return payload.assets
      .map((asset, idx) => {
        const format = asset.format === 'ico' ? 'ico' : 'png';
        const size = typeof asset.size === 'number' ? asset.size : undefined;
        const url = typeof asset.url === 'string' && asset.url
          ? asset.url
          : typeof asset.data === 'string'
            ? ensureDataUrl(asset.data, format)
            : '';
        if (!url) return null;
        return {
          format,
          size,
          url,
          label: asset.label || (size ? `${size}px ${format.toUpperCase()}` : `${format.toUpperCase()} #${idx + 1}`),
        } as GeneratedAsset;
      })
      .filter((item): item is GeneratedAsset => !!item);
  };

  const handleGenerate = async () => {
    if (!file) {
      setError('아이콘에 사용할 이미지를 먼저 업로드해 주세요.');
      return;
    }
    if (selectedSizes.size === 0 && !includeIco) {
      setError('출력할 크기 또는 ICO 포맷을 하나 이상 선택해 주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setAssets([]);
    setRemotePreview('');
    setJobId('');
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('sizes', JSON.stringify(Array.from(selectedSizes.values())));
      fd.append('formats', includeIco ? 'png,ico' : 'png');
      fd.append('transparent', transparent ? '1' : '0');
      fd.append('simplifyLevel', 'auto');

      const res = await fetch('/api/favicon-distiller', {
        method: 'POST',
        body: fd,
      });

      const text = await res.text();
      let data: ApiResponse = {};
      try {
        data = text ? (JSON.parse(text) as ApiResponse) : {};
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        throw new Error(data.error || data.message || `Gemini 변환 실패 (${res.status})`);
      }

      const parsedAssets = parseAssets(data);
      if (parsedAssets.length === 0) {
        throw new Error('생성된 파비콘을 확인할 수 없습니다. 응답 형식을 확인해 주세요.');
      }

      setAssets(parsedAssets);
      if (data.preview) setRemotePreview(ensureDataUrl(data.preview, 'png'));
      if (data.source) setRemotePreview(prev => prev || ensureDataUrl(data.source!, 'png'));
      if (data.jobId) setJobId(data.jobId);
      if (data.message) setMessage(data.message);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const downloadAsset = async (asset: GeneratedAsset) => {
    try {
      await downloadFromUrl(asset.url, formatDownloadName(asset.size, asset.format));
    } catch (e: any) {
      setError(e?.message || '다운로드에 실패했습니다.');
    }
  };

  const uds = React.useMemo(() => Array.from(selectedSizes).sort((a, b) => a - b), [selectedSizes]);

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-sky-300">
            <Icon name="favicon" className="w-6 h-6" aria-hidden />
          </span>
          Favicon Distiller
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-400">
          고해상도 로고나 일러스트를 Gemini API로 단순화한 뒤, 파비콘에 적합한 해상도로 자동 변환합니다. 필요에 따라 PNG 혹은 ICO 포맷으로 저장하세요.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div
            className={`border border-dashed rounded-lg p-5 text-center transition ${file ? 'border-sky-400/40 bg-sky-400/5' : 'border-white/15 bg-black/20 hover:border-white/30'}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            {file ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">업로드한 원본 이미지</p>
                <img src={localPreview} alt="원본 미리보기" className="max-h-64 mx-auto rounded border border-white/10" />
                <div className="text-xs text-gray-500">{file.name} · {(file.size / 1024).toFixed(1)} KB</div>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm rounded border border-white/15 text-gray-200 hover:bg-white/10"
                  onClick={() => onFileChange(null)}
                >
                  다른 이미지 선택
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-400">이미지를 드롭하거나 클릭하여 업로드해 주세요.</p>
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded border border-white/15 text-gray-200 hover:bg-white/10 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={onInputChange} />
                  <Icon name="addSquare" className="w-4 h-4" aria-hidden />
                  <span>이미지 선택</span>
                </label>
                <p className="text-xs text-gray-500">SVG, PNG, JPG 등 로고/심볼 이미지를 권장합니다.</p>
              </div>
            )}
          </div>

          <div className="rounded border border-white/10 bg-[#171717] p-4 space-y-4">
            <div>
              <h2 className="text-sm font-medium text-white">출력 크기</h2>
              <p className="text-xs text-gray-500 mt-1">파비콘으로 자주 쓰이는 해상도를 선택하세요.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {AVAILABLE_SIZES.map(size => {
                  const checked = selectedSizes.has(size);
                  return (
                    <label
                      key={size}
                      className={`px-2 py-1.5 text-xs rounded border ${checked ? 'border-sky-400 bg-sky-400/10 text-white' : 'border-white/10 text-gray-400 hover:border-white/30 hover:text-white cursor-pointer'}`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={checked}
                        onChange={() => toggleSize(size)}
                      />
                      {size}px
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={includeIco} onChange={(e) => setIncludeIco(e.target.checked)} />
                ICO 패키지 포함 (다중 해상도)
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} />
                투명 배경 유지
              </label>
            </div>

            <div className="rounded border border-white/10 bg-white/[0.02] p-3 text-xs text-gray-400 space-y-2">
              <div className="flex items-start gap-2">
                <Icon name="todoGenerator" className="w-4 h-4 text-sky-300" aria-hidden />
                <div>
                  <p className="font-medium text-gray-200">어떻게 동작하나요?</p>
                  <p className="mt-1">업로드한 이미지를 Gemini 1.5 Pro Vision으로 분석해 핵심 요소만 남도록 벡터화/단순화 지침을 전달합니다. 그 결과물을 고정 해상도 캔버스에 재배치하여 파비콘에 적합한 대비와 여백을 확보합니다.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="info" className="w-4 h-4 text-amber-300" aria-hidden />
                <div>
                  <p className="font-medium text-gray-200">API 통합 팁</p>
                  <p className="mt-1">서버에서는 Gemini의 이미지 생성 엔드포인트(`/v1beta/models/gemini-1.5-pro-vision:generateImage`)를 사용하고, `background: transparent`와 `detail_level: minimal` 옵션을 적용하세요. 생성된 이미지는 PNG로 수신한 뒤 Sharp 등으로 리사이즈하여 다양한 파비콘 세트를 구성할 수 있습니다.</p>
                </div>
              </div>
            </div>

            <LoadingButton
              onClick={handleGenerate}
              loading={loading}
              loadingText="Gemini 변환 중…"
              idleText="Gemini로 파비콘 생성"
              variant="info"
              className="w-full px-4 py-2 text-sm font-medium"
            />
            <ErrorMessage error={error} />
            {!error && message && <p className="text-xs text-gray-500">{message}</p>}
            {!error && !loading && uds.length > 0 && (
              <p className="text-xs text-gray-500">선택된 해상도: {uds.map(size => `${size}px`).join(', ')}{includeIco ? ' · ICO 포함' : ''}</p>
            )}
            {jobId && (
              <p className="text-xs text-gray-500">작업 ID: {jobId}</p>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded border border-white/10 bg-[#111215] p-4">
            <h2 className="text-sm font-medium text-white flex items-center gap-2">
              <Icon name="image" className="w-4 h-4" aria-hidden />
              결과 미리보기
            </h2>
            <div className="mt-3 space-y-3">
              {(remotePreview || localPreview) ? (
                <img src={remotePreview || localPreview} alt="파비콘 미리보기" className="w-32 h-32 object-contain mx-auto rounded border border-white/10 bg-black/40" />
              ) : (
                <div className="w-32 h-32 mx-auto rounded border border-dashed border-white/10 flex items-center justify-center text-xs text-gray-500">
                  변환 대기 중
                </div>
              )}
              <p className="text-xs text-gray-500">
                단순화된 아이콘은 32px 미만에서도 식별 가능하도록 대비와 여백이 조정됩니다.
              </p>
            </div>
          </div>

          <div className="rounded border border-white/10 bg-[#111215] p-4">
            <h2 className="text-sm font-medium text-white flex items-center gap-2">
              <Icon name="clipboard" className="w-4 h-4" aria-hidden />
              다운로드
            </h2>
            <div className="mt-3 space-y-2">
              {assets.length === 0 && (
                <p className="text-xs text-gray-500">생성된 파비콘이 없어요. 이미지를 업로드하고 Gemini 변환을 실행해 주세요.</p>
              )}
              {assets.map(asset => (
                <div key={`${asset.format}-${asset.size ?? 'orig'}-${asset.url}`} className="flex items-center justify-between gap-3 rounded border border-white/10 bg-white/[0.02] px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-white/5 border border-white/10 text-xs text-gray-200">
                      {asset.size ? `${asset.size}px` : 'ICO'}
                    </span>
                    <div className="text-xs text-gray-400">
                      <p className="text-gray-200">{asset.label || formatDownloadName(asset.size, asset.format)}</p>
                      <p>{asset.format.toUpperCase()}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadAsset(asset)}
                    className="px-3 py-1.5 text-xs rounded border border-white/15 text-gray-200 hover:bg-white/10"
                  >
                    다운로드
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded border border-white/10 bg-[#111215] p-4">
            <h2 className="text-sm font-medium text-white flex items-center gap-2">
              <Icon name="bookmarkRibbon" className="w-4 h-4" aria-hidden />
              활용 시나리오
            </h2>
            <ul className="mt-2 space-y-2 text-xs text-gray-500 list-disc list-inside">
              <li>웹사이트 파비콘 세트 (16/32/48/64px PNG + ICO)</li>
              <li>PWA 앱 아이콘 (128/192/256px PNG)</li>
              <li>브랜드 킷 내 다크/라이트 테마용 심볼 추출</li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default FaviconDistillerPage;
