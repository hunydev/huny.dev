import React from 'react';
import { PageProps } from '../../types';

const LANGUAGE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'ko-KR', label: '한국어 (ko-KR)' },
  { value: 'en-US', label: 'English (en-US)' },
  { value: 'ja-JP', label: '日本語 (ja-JP)' },
  { value: 'zh-CN', label: '中文 (zh-CN)' },
  { value: 'fr-FR', label: 'Français (fr-FR)' },
  { value: 'de-DE', label: 'Deutsch (de-DE)' },
  { value: 'es-ES', label: 'Español (es-ES)' },
];

const MODE_OPTIONS: Array<{ value: 'simple' | 'description' | 'detail'; label: string; helper: string }> = [
  {
    value: 'simple',
    label: 'Simple',
    helper: '한 줄 요약 (예: "고양이 그림입니다.")',
  },
  {
    value: 'description',
    label: 'Description',
    helper: '2-3문장 묘사 (기본값)',
  },
  {
    value: 'detail',
    label: 'Detail',
    helper: '시각장애인용 세밀 묘사 + 텍스트 읽기',
  },
];

type ImageToSpeechResponse = {
  description: string;
  language: string;
  mode: 'simple' | 'description' | 'detail';
  audio: string;
  mimeType?: string;
  sampleRate?: number;
  usage?: { analysisTokens: number | null; ttsTokens: number | null };
};

const ImageToSpeechPage: React.FC<PageProps> = () => {
  const [mode, setMode] = React.useState<'simple' | 'description' | 'detail'>('description');
  const [language, setLanguage] = React.useState<string>('ko-KR');
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [audioUrl, setAudioUrl] = React.useState('');
  const [audioMime, setAudioMime] = React.useState('audio/mpeg');
  const [usage, setUsage] = React.useState<{ analysisTokens: number | null; ttsTokens: number | null } | null>(null);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [previewUrl, audioUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setDescription('');
    setUsage(null);
    setAudioUrl('');
    setAudioMime('audio/mpeg');

    const next = e.target.files?.[0];
    setFile(next ?? null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    if (next) {
      const url = URL.createObjectURL(next);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('이미지를 업로드해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setDescription('');
    setAudioUrl('');
    setUsage(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('mode', mode);
      formData.append('language', language);

      const res = await fetch('/api/image-to-speech', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || '이미지 분석 요청에 실패했습니다.');
      }

      const json = (await res.json()) as Partial<ImageToSpeechResponse>;
      const base64 = typeof json?.audio === 'string' ? json.audio : '';
      if (!base64 || typeof base64 !== 'string') {
        throw new Error('오디오 데이터가 없습니다.');
      }

      const mime: string = typeof json?.mimeType === 'string' ? json.mimeType : 'audio/mpeg';
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      setAudioMime(mime);
      setDescription(typeof json?.description === 'string' ? json.description : '');
      setUsage(json?.usage ?? null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const hasResult = !!description || !!audioUrl;

  return (
    <div className="text-gray-300 max-w-4xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
              <rect x={3} y={3} width={10} height={10} rx={2} />
              <path d="m3 13 3-3 6 3" />
              <circle cx={9} cy={7} r={1.5} />
              <path d="M15 10v6a2 2 0 0 0 2 2h1.5" />
              <path d="M15 14h2.5a2.5 2.5 0 0 0 0-5H15" />
            </svg>
          </span>
          Image to Speech
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          이미지를 업로드하면 Gemini가 시각 정보를 분석하여 텍스트 묘사를 생성하고, 지정한 언어와 단계에 맞춰 TTS 오디오로 변환합니다.
        </p>
        <p className="mt-1 text-[12px] text-gray-500">
          지원 포맷: PNG, JPEG, WEBP, GIF, SVG (최대 8MB). 기본 언어는 한국어(Korean), 묘사 단계 기본값은 Description입니다.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-md border border-white/10 bg-white/[0.03] p-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">이미지 업로드</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-200 file:mr-4 file:rounded file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-blue-500"
              disabled={loading}
            />
            {previewUrl ? (
              <div className="mt-3">
                <span className="text-xs text-gray-400">미리보기</span>
                <div className="mt-2 rounded border border-white/10 bg-black/20 p-2 max-h-[280px] overflow-hidden">
                  <img src={previewUrl} alt="Preview" className="max-h-[240px] object-contain mx-auto" />
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-500">이미지를 선택하면 미리보기가 표시됩니다.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs text-gray-400 mb-2">묘사 단계</span>
              <div className="space-y-2">
                {MODE_OPTIONS.map(option => (
                  <label key={option.value} className="flex items-start gap-2 text-sm">
                    <input
                      type="radio"
                      name="mode"
                      value={option.value}
                      checked={mode === option.value}
                      onChange={() => setMode(option.value)}
                      className="mt-1"
                      disabled={loading}
                    />
                    <span>
                      <span className="text-gray-200 font-medium">{option.label}</span>
                      <span className="block text-xs text-gray-400">{option.helper}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">언어 선택</label>
              <select
                className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                disabled={loading}
              >
                {LANGUAGE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">언어는 텍스트 표현 및 음성 합성에 모두 적용됩니다.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-gray-500">
              이미지 비공개 처리, 요청 결과는 서버에 저장되지 않습니다.
            </div>
            <button
              type="submit"
              disabled={loading || !file}
              className={`px-5 py-2 rounded text-sm font-medium ${
                loading || !file ? 'bg-blue-600/40 text-white/70 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {loading ? '처리 중…' : '변환하기'}
            </button>
          </div>
        </section>
      </form>

      {error && (
        <div className="mt-4 rounded border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {hasResult && (
        <section className="mt-6 rounded-md border border-white/10 bg-white/[0.03] p-4 space-y-4">
          <div>
            <h2 className="text-sm font-medium text-white">생성된 설명</h2>
            <p className="mt-2 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{description}</p>
            <div className="mt-2 text-xs text-gray-500 flex flex-wrap items-center gap-3">
              <span>언어: {language}</span>
              <span>묘사 단계: {mode}</span>
              {usage?.analysisTokens != null && <span>Vision tokens: {usage.analysisTokens}</span>}
              {usage?.ttsTokens != null && <span>TTS tokens: {usage.ttsTokens}</span>}
            </div>
          </div>

          {audioUrl && (
            <div>
              <h2 className="text-sm font-medium text-white">오디오 미리듣기</h2>
              <audio className="mt-2 w-full" controls src={audioUrl} preload="metadata" />
              <p className="mt-2 text-xs text-gray-500">MIME: {audioMime}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ImageToSpeechPage;
