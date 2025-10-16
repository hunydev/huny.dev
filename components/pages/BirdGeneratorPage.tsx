import React from 'react';
import { PageProps } from '../../types';
import { ErrorMessage, LoadingButton, ApiProviderBadge } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { Icon } from '../../constants/icons';
import sideImg from '../../extra/mascot/images/side.png';
import frontImg from '../../extra/mascot/images/front.png';
import rearImg from '../../extra/mascot/images/rear.png';

type BirdGeneratorResponse = {
  urls?: string[];
  [k: string]: any;
};

const BirdGeneratorPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [model, setModel] = React.useState<'gpt-image-1' | 'dall-e-2'>('gpt-image-1');
  const [dimension, setDimension] = React.useState<'2d' | '3d'>('2d');
  const [prompt, setPrompt] = React.useState<string>('A stylized cyberpunk bird with neon highlights, highly detailed');
  const [background, setBackground] = React.useState<'auto' | 'transparent' | 'opaque'>('auto');
  const [n, setN] = React.useState<number>(1);
  const [outputFormat, setOutputFormat] = React.useState<'png' | 'jpeg' | 'webp'>('png');
  const [size, setSize] = React.useState<'1024x1024' | '1536x1024' | '1024x1536' | 'auto' | '256x256' | '512x512'>('1024x1024');
  const [results, setResults] = React.useState<{ urls: string[]; meta?: any } | null>(null);

  const api = useApiCall<BirdGeneratorResponse>({
    url: '/api/bird-generator',
    method: 'POST',
    tabId: 'bird-generator',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      setResults({ urls: Array.isArray(data?.urls) ? data.urls : [], meta: data });
    },
  });

  const canRun = !api.loading && prompt.trim().length > 0;

  const handleGenerate = async () => {
    setResults(null);
    try {
      // Fetch imported images as blobs, then send to Worker as multipart/form-data
      const fetchAsFile = async (src: string, name: string) => {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`이미지 로드 실패: ${name}`);
        const blob = await res.blob();
        return new File([blob], name, { type: blob.type || 'image/png' });
      };

      const files = await Promise.all([
        fetchAsFile(sideImg, 'side.png'),
        fetchAsFile(frontImg, 'front.png'),
        fetchAsFile(rearImg, 'rear.png'),
      ]);

      // Compose prompt with 2D/3D dimension hint
      const dimensionHint = dimension === '2d'
        ? 'Render as a 2D flat illustration. Minimal depth, stylized, vector-like, no 3D shading.'
        : 'Render as a 3D volumetric scene with realistic depth and lighting (physically-based shading).';
      const combinedPrompt = `${prompt}\n\nStyle: ${dimensionHint}`;

      const fd = new FormData();
      fd.append('model', model);
      // Images: gpt-image-1 supports multiple images (image[]). dall-e-2 supports only one (use center/front).
      if (model === 'gpt-image-1') {
        files.forEach(f => fd.append('image[]', f));
      } else {
        fd.append('image', files[1]);
      }
      fd.append('prompt', combinedPrompt);
      fd.append('background', background);
      fd.append('n', String(n));
      fd.append('output_format', outputFormat);
      fd.append('size', size);

      await api.execute({ body: fd });
    } catch (e: any) {
      api.setError(e?.message || String(e));
    }
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-emerald-300">
            <Icon name="bird" className="w-6 h-6" aria-hidden />
          </span>
          Bird Generator
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          세 장의 기준 이미지를 섞어 새로운 새 이미지를 만들어봅니다. OpenAI Images Edit (<span className="text-emerald-300">gpt-image-1</span> / <span className="text-emerald-300">dall-e-2</span>) 지원.
          <br/>dall-e-2 선택 시 규격상 한 장만 허용되어 중앙(front) 이미지만 사용합니다.
        </p>
        <div className="mt-2">
          <ApiProviderBadge provider="openai" />
        </div>
      </header>

      {/* Top: three ingredient images */}
      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <div className="grid grid-cols-3 gap-3 items-center">
          <div className="aspect-square rounded overflow-hidden bg-black/30 flex items-center justify-center">
            <img src={sideImg} alt="side" className="h-full w-full object-contain" loading="lazy" decoding="async" />
          </div>
          <div className="aspect-square rounded overflow-hidden bg-black/30 flex items-center justify-center">
            <img src={frontImg} alt="front" className="h-full w-full object-contain" loading="lazy" decoding="async" />
          </div>
          <div className="aspect-square rounded overflow-hidden bg-black/30 flex items-center justify-center">
            <img src={rearImg} alt="rear" className="h-full w-full object-contain" loading="lazy" decoding="async" />
          </div>
        </div>
        <div className="mt-2 text-center text-xs text-gray-400">재료(좌: side, 중: front, 우: rear)</div>
      </section>

      {/* Controls */}
      <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Model</label>
            <select
              className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm"
              value={model}
              onChange={(e) => {
                const next = e.target.value as 'gpt-image-1' | 'dall-e-2';
                setModel(next);
                // Normalize size to supported set per model
                if (next === 'dall-e-2' && !['256x256','512x512','1024x1024'].includes(size)) {
                  setSize('1024x1024');
                }
                if (next === 'gpt-image-1' && !['1024x1024','1536x1024','1024x1536','auto'].includes(size)) {
                  setSize('1024x1024');
                }
              }}
            >
              <option value="gpt-image-1">gpt-image-1</option>
              <option value="dall-e-2">dall-e-2</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Dimension</label>
            <select
              className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm"
              value={dimension}
              onChange={(e) => setDimension(e.target.value as '2d' | '3d')}
            >
              <option value="2d">2D (flat)</option>
              <option value="3d">3D (depth)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Background</label>
            <select className={`w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm ${model==='dall-e-2' ? 'opacity-60' : ''}`} value={background} onChange={(e) => setBackground(e.target.value as any)} disabled={model==='dall-e-2'}>
              <option value="auto">auto</option>
              <option value="transparent">transparent</option>
              <option value="opaque">opaque</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Count (n)</label>
            <select className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm" value={n} onChange={(e) => setN(Number(e.target.value))}>
              {Array.from({ length: 6 }).map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Output Format</label>
            <select className={`w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm ${model==='dall-e-2' ? 'opacity-60' : ''}`} value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as any)} disabled={model==='dall-e-2'}>
              <option value="png">png</option>
              <option value="jpeg">jpeg</option>
              <option value="webp">webp</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Size</label>
            <select className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm" value={size} onChange={(e) => setSize(e.target.value as any)}>
              {model === 'gpt-image-1' ? (
                <>
                  <option value="1024x1024">1024x1024</option>
                  <option value="1536x1024">1536x1024 (landscape)</option>
                  <option value="1024x1536">1024x1536 (portrait)</option>
                  <option value="auto">auto</option>
                </>
              ) : (
                <>
                  <option value="256x256">256x256</option>
                  <option value="512x512">512x512</option>
                  <option value="1024x1024">1024x1024</option>
                </>
              )}
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs text-gray-400 mb-1">Prompt</label>
          <textarea
            className="w-full min-h-[120px] bg-[#1f1f1f] border border-white/10 rounded p-3 text-sm outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="어떤 새를 만들까요? 스타일/색감/자세/배경 등을 설명하세요."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
        <div className="mt-3 flex items-center justify-center">
          <LoadingButton
            onClick={handleGenerate}
            disabled={!canRun}
            loading={api.loading}
            loadingText="생성 중…"
            idleText="생성"
            variant="success"
            className="px-4 py-2 text-sm"
          />
        </div>
        <ErrorMessage error={api.error} className="mt-3" />
      </section>

      {/* Results */}
      <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">결과</h2>
        {results ? (
          <>
            <div className="text-xs text-gray-400 mb-2">이미지 {results.urls.length}개</div>
            {results.urls.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {results.urls.map((u, idx) => (
                  <div key={idx} className="rounded border border-white/10 bg-black/40 overflow-hidden">
                    <img src={u} alt={`result-${idx+1}`} className="w-full h-auto object-contain" loading="lazy" decoding="async" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">이미지 응답이 없습니다.</div>
            )}
          </>
        ) : (
          <div className="text-sm text-gray-500">아직 결과가 없습니다. 옵션을 설정하고 ‘생성’을 눌러보세요.</div>
        )}
      </section>
    </div>
  );
};

export default BirdGeneratorPage;
