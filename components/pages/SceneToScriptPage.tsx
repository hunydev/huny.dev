import React from 'react';
import { PageProps } from '../../types';

const genderLabel = (gender: 'male' | 'female' | 'unknown') => {
  switch (gender) {
    case 'male':
      return '남성';
    case 'female':
      return '여성';
    default:
      return '미상';
  }
};

type SceneCharacter = {
  name: string;
  gender: 'male' | 'female' | 'unknown';
  personality?: string;
  role?: string;
  description?: string;
  voice: string;
  trait?: string;
};

type SceneDialogueLine = {
  speaker: string;
  line: string;
  emotion?: string;
  action?: string;
};

type SceneToScriptResponse = {
  sceneSummary: string;
  characters: SceneCharacter[];
  dialogue: SceneDialogueLine[];
  notes?: string;
  audio: string;
  mimeType?: string;
  sampleRate?: number;
  usage?: { analysisTokens: number | null; ttsTokens: number | null };
  rawNarrative?: string;
};

const SceneToScriptPage: React.FC<PageProps> = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [result, setResult] = React.useState<SceneToScriptResponse | null>(null);
  const [audioUrl, setAudioUrl] = React.useState('');
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const resetState = React.useCallback(() => {
    setResult(null);
    setAudioUrl('');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    resetState();
    const next = e.target.files?.[0] ?? null;
    setFile(next);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    if (next) {
      const url = URL.createObjectURL(next);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError('이미지를 업로드해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    resetState();

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/scene-to-script', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      if (!response.ok) {
        try {
          const errJson = text ? (JSON.parse(text) as { error?: string; detail?: unknown }) : null;
          setError(errJson?.error ?? `요청이 실패했습니다. (${response.status})`);
        } catch {
          setError(`요청이 실패했습니다. (${response.status})`);
        }
        return;
      }

      const data = text ? (JSON.parse(text) as SceneToScriptResponse) : null;
      if (!data) {
        setError('응답을 파싱할 수 없습니다.');
        return;
      }

      setResult(data);
      if (data.audio) {
        const mime = data.mimeType && data.mimeType.trim() ? data.mimeType : 'audio/mpeg';
        setAudioUrl(`data:${mime};base64,${data.audio}`);
      }
    } catch (err: any) {
      setError(err?.message ?? '요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="text-gray-300 max-w-5xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6">
              <rect x={3} y={3} width={18} height={18} rx={2} />
              <path d="M7 8h7" />
              <path d="M7 12h4" />
              <path d="M7 16h5" />
              <path d="M16 10c1.105 0 2 .672 2 1.5S17.105 13 16 13m0 0v3m0-3l1.5-1.5" />
            </svg>
          </span>
          Scene to Script
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          업로드한 장면 속 등장인물을 분석해 다화자 스크립트와 멀티 스피커 합성음을 생성합니다. 카툰·웹툰·단체 사진처럼 인물이 뚜렷한 이미지에 적합합니다.
        </p>
        <p className="mt-1 text-[12px] text-gray-500">
          사용 방법: 이미지를 업로드하고 "장면 분석"을 눌러 스크립트를 생성한 뒤, 자동으로 멀티 스피커 합성 음성이 제공됩니다.
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
              <p className="mt-2 text-xs text-gray-500">카툰/웹툰/다중 인물 사진 등 대화를 추론할 수 있는 이미지를 업로드하세요.</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-gray-500">
              합성에는 다화자 TTS가 사용됩니다. 등장인물이 없거나 대사 추론이 불가능하면 실패할 수 있습니다.
            </div>
            <button
              type="submit"
              disabled={loading || !file}
              className={`px-5 py-2 rounded text-sm font-medium ${
                loading || !file ? 'bg-blue-600/40 text-white/70 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {loading ? '분석 중…' : '장면 분석'}
            </button>
          </div>
        </section>
      </form>

      {error && (
        <div className="mt-4 rounded border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {result && (
        <section className="mt-6 space-y-4">
          <div className="rounded-md border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <h2 className="text-sm font-medium text-white">장면 요약</h2>
            <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
              {result.sceneSummary || '장면 요약이 제공되지 않았습니다.'}
            </p>
            {result.notes ? (
              <p className="text-xs text-gray-500">Notes: {result.notes}</p>
            ) : null}
            {result.rawNarrative ? (
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer text-gray-400">모델 설명 원문 보기</summary>
                <pre className="mt-2 whitespace-pre-wrap text-[11px] text-gray-500 bg-black/30 rounded p-2 border border-white/10">
                  {result.rawNarrative}
                </pre>
              </details>
            ) : null}
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm font-medium text-white mb-3">등장인물 및 보이스</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.characters.map(character => (
                <div key={character.name} className="border border-white/10 rounded bg-black/20 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-white text-sm font-medium">{character.name}</div>
                      <div className="text-xs text-gray-400">성별: {genderLabel(character.gender)}</div>
                    </div>
                    <div className="text-xs text-blue-300">{character.voice}</div>
                  </div>
                  {character.personality && (
                    <div className="mt-2 text-xs text-gray-400">성격: {character.personality}</div>
                  )}
                  {character.role && (
                    <div className="mt-1 text-xs text-gray-400">역할: {character.role}</div>
                  )}
                  {character.description && (
                    <div className="mt-1 text-xs text-gray-500">설명: {character.description}</div>
                  )}
                  {character.trait && (
                    <div className="mt-1 text-xs text-amber-200">보이스 특성: {character.trait}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
            <h2 className="text-sm font-medium text-white mb-3">대사 스크립트</h2>
            <div className="space-y-2">
              {result.dialogue.map((line, idx) => (
                <div key={`${line.speaker}-${idx}`} className="border border-white/10 rounded bg-black/15 p-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    <span className="text-sm text-white font-medium">{line.speaker}</span>
                    {line.emotion ? <span className="px-2 py-0.5 rounded-full bg-white/10 text-emerald-300">감정: {line.emotion}</span> : null}
                    {line.action ? <span className="px-2 py-0.5 rounded-full bg-white/10 text-sky-300">액션: {line.action}</span> : null}
                  </div>
                  <p className="mt-1 text-sm text-gray-200 leading-relaxed">{line.line}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <h2 className="text-sm font-medium text-white">합성 오디오</h2>
            {audioUrl ? (
              <audio ref={audioRef} controls className="w-full">
                <source src={audioUrl} type={result.mimeType || 'audio/mpeg'} />
                브라우저가 오디오 태그를 지원하지 않습니다.
              </audio>
            ) : (
              <p className="text-sm text-gray-500">오디오 데이터가 제공되지 않았습니다.</p>
            )}
            {result.usage ? (
              <div className="text-xs text-gray-500 flex flex-wrap gap-3">
                <span>Vision Tokens: {result.usage.analysisTokens ?? '—'}</span>
                <span>TTS Tokens: {result.usage.ttsTokens ?? '—'}</span>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
};

export default SceneToScriptPage;
