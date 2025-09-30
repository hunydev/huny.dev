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

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const totalSeconds = Math.floor(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const isSeekControlKey = (key: string) =>
  key.startsWith('Arrow') || key === 'Home' || key === 'End' || key === 'PageUp' || key === 'PageDown';

const ImageToSpeechPage: React.FC<PageProps> = () => {
  const [mode, setMode] = React.useState<'simple' | 'description' | 'detail'>('description');
  const [language, setLanguage] = React.useState<string>('ko-KR');
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [audioInfo, setAudioInfo] = React.useState<{ mime: string; sampleRate?: number } | null>(null);
  const [audioReady, setAudioReady] = React.useState(false);
  const [audioError, setAudioError] = React.useState('');
  const [playerState, setPlayerState] = React.useState<'idle' | 'loading' | 'playing' | 'paused' | 'stopped'>('idle');
  const [duration, setDuration] = React.useState(0);
  const [trackPosition, setTrackPosition] = React.useState(0);
  const [isSeeking, setIsSeeking] = React.useState(false);
  const [usage, setUsage] = React.useState<{ analysisTokens: number | null; ttsTokens: number | null } | null>(null);

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const audioBufferRef = React.useRef<AudioBuffer | null>(null);
  const sourceRef = React.useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = React.useRef(0);
  const offsetRef = React.useRef(0);
  const endFlagsRef = React.useRef<{ pause: boolean; stop: boolean }>({ pause: false, stop: false });
  const rafRef = React.useRef<number | null>(null);
  const playerStateRef = React.useRef(playerState);
  const isSeekingRef = React.useRef(isSeeking);

  React.useEffect(() => {
    playerStateRef.current = playerState;
  }, [playerState]);

  React.useEffect(() => {
    isSeekingRef.current = isSeeking;
  }, [isSeeking]);

  const stopProgressUpdate = React.useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const scheduleProgressUpdate = React.useCallback(() => {
    stopProgressUpdate();
    const tick = () => {
      const context = audioContextRef.current;
      const buffer = audioBufferRef.current;
      if (!context || !buffer) {
        rafRef.current = null;
        return;
      }
      const elapsed = context.currentTime - startTimeRef.current;
      const clamped = Math.min(Math.max(elapsed, 0), buffer.duration);
      if (!isSeekingRef.current) {
        setTrackPosition(clamped);
      }
      if (playerStateRef.current === 'playing') {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [stopProgressUpdate]);

  const resetPlaybackState = React.useCallback((keepBuffer = false) => {
    if (sourceRef.current) {
      try {
        sourceRef.current.onended = null;
        sourceRef.current.stop();
      } catch (_) {
        // no-op
      }
      try {
        sourceRef.current.disconnect();
      } catch (_) {
        // no-op
      }
      sourceRef.current = null;
    }
    endFlagsRef.current = { pause: false, stop: false };
    offsetRef.current = 0;
    startTimeRef.current = 0;
    stopProgressUpdate();
    setDuration(0);
    setTrackPosition(0);
    setIsSeeking(false);
    setPlayerState(keepBuffer && audioBufferRef.current ? 'stopped' : 'idle');
    if (!keepBuffer) {
      audioBufferRef.current = null;
      setAudioReady(false);
      setAudioInfo(null);
    }
    playerStateRef.current = keepBuffer && audioBufferRef.current ? 'stopped' : 'idle';
    isSeekingRef.current = false;
  }, [stopProgressUpdate]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      resetPlaybackState();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => undefined);
        audioContextRef.current = null;
      }
    };
  }, [previewUrl, resetPlaybackState]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setDescription('');
    setUsage(null);
    setAudioError('');
    resetPlaybackState();

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
    setUsage(null);
    setAudioError('');
    resetPlaybackState();
    setPlayerState('loading');

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
      const sampleRate = typeof json?.sampleRate === 'number' && Number.isFinite(json.sampleRate) ? json.sampleRate : undefined;

      const ensureContext = async (): Promise<AudioContext> => {
        let ctx = audioContextRef.current;
        if (!ctx || ctx.state === 'closed') {
          try {
            ctx = sampleRate ? new AudioContext({ sampleRate }) : new AudioContext();
          } catch {
            ctx = new AudioContext();
          }
          audioContextRef.current = ctx;
        }
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        return ctx;
      };

      const loadBuffer = async () => {
        const context = await ensureContext();
        const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        let decoded: AudioBuffer | null = null;
        try {
          decoded = await context.decodeAudioData(arrayBuffer.slice(0));
        } catch (decodeErr) {
          if (mime.toLowerCase().includes('pcm') || mime.toLowerCase().includes('raw')) {
            if (!sampleRate) {
              throw new Error('PCM 오디오를 해석하기 위한 샘플레이트 정보가 필요합니다.');
            }
            if (arrayBuffer.byteLength % 2 !== 0) {
              throw new Error('PCM 오디오 데이터 길이가 올바르지 않습니다.');
            }
            const sampleCount = arrayBuffer.byteLength / 2;
            decoded = context.createBuffer(1, sampleCount, sampleRate);
            const view = new DataView(arrayBuffer);
            const channelData = decoded.getChannelData(0);
            for (let i = 0; i < sampleCount; i++) {
              channelData[i] = view.getInt16(i * 2, true) / 32768;
            }
          } else {
            throw decodeErr;
          }
        }

        if (!decoded) {
          throw new Error('오디오 버퍼를 준비할 수 없습니다.');
        }

        audioBufferRef.current = decoded;
        offsetRef.current = 0;
        startTimeRef.current = 0;
        setDuration(decoded.duration);
        setTrackPosition(0);
        setAudioReady(true);
        setPlayerState('stopped');
        playerStateRef.current = 'stopped';
        scheduleProgressUpdate();
      };

      await loadBuffer();
      setAudioInfo({ mime, sampleRate });
      setDescription(typeof json?.description === 'string' ? json.description : '');
      setUsage(json?.usage ?? null);

      const startPlayback = async (offset: number) => {
        const context = await ensureContext();
        const buffer = audioBufferRef.current;
        if (!buffer) return;
        if (sourceRef.current) {
          try {
            sourceRef.current.stop();
          } catch (_) {
            // no-op
          }
          try {
            sourceRef.current.disconnect();
          } catch (_) {
            // no-op
          }
        }
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        endFlagsRef.current = { pause: false, stop: false };
        startTimeRef.current = context.currentTime - offset;
        offsetRef.current = offset;
        if (!isSeekingRef.current) {
          setTrackPosition(offset);
        }
        source.onended = () => {
          sourceRef.current = null;
          if (endFlagsRef.current.pause) {
            endFlagsRef.current.pause = false;
            return;
          }
          if (endFlagsRef.current.stop) {
            endFlagsRef.current.stop = false;
            offsetRef.current = 0;
            setPlayerState('stopped');
            return;
          }
          offsetRef.current = 0;
          setPlayerState('stopped');
          playerStateRef.current = 'stopped';
          setTrackPosition(0);
          stopProgressUpdate();
        };
        sourceRef.current = source;
        setPlayerState('playing');
        playerStateRef.current = 'playing';
        source.start(0, offset);
        scheduleProgressUpdate();
      };

      try {
        await startPlayback(0);
      } catch (playErr) {
        console.error(playErr);
        setPlayerState('stopped');
        setAudioError('자동 재생에 실패했습니다. 재생 버튼을 눌러 주세요.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const hasResult = !!description || audioReady;

  const ensureContext = React.useCallback(async () => {
    if (!audioBufferRef.current) {
      throw new Error('오디오 버퍼가 준비되지 않았습니다.');
    }
    let ctx = audioContextRef.current;
    if (!ctx || ctx.state === 'closed') {
      try {
        ctx = audioInfo?.sampleRate ? new AudioContext({ sampleRate: audioInfo.sampleRate }) : new AudioContext();
      } catch {
        ctx = new AudioContext();
      }
      audioContextRef.current = ctx;
    }
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx;
  }, [audioInfo]);

  const startPlayback = React.useCallback(async (offset: number) => {
    const context = await ensureContext();
    const buffer = audioBufferRef.current;
    if (!buffer) return;
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (_) {
        // no-op
      }
      try {
        sourceRef.current.disconnect();
      } catch (_) {
        // no-op
      }
    }
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    endFlagsRef.current = { pause: false, stop: false };
    startTimeRef.current = context.currentTime - offset;
    offsetRef.current = Math.min(Math.max(offset, 0), buffer.duration);
    if (!isSeekingRef.current) {
      setTrackPosition(offsetRef.current);
    }
    source.onended = () => {
      sourceRef.current = null;
      if (endFlagsRef.current.pause) {
        endFlagsRef.current.pause = false;
        return;
      }
      if (endFlagsRef.current.stop) {
        endFlagsRef.current.stop = false;
        offsetRef.current = 0;
        setPlayerState('stopped');
        playerStateRef.current = 'stopped';
        setTrackPosition(0);
        stopProgressUpdate();
        return;
      }
      offsetRef.current = 0;
      setPlayerState('stopped');
      playerStateRef.current = 'stopped';
      setTrackPosition(0);
      stopProgressUpdate();
    };
    sourceRef.current = source;
    setPlayerState('playing');
    playerStateRef.current = 'playing';
    source.start(0, offsetRef.current);
    scheduleProgressUpdate();
  }, [ensureContext, scheduleProgressUpdate, stopProgressUpdate]);

  const handleTogglePlayPause = React.useCallback(async () => {
    if (!audioBufferRef.current) return;
    if (playerState === 'playing') {
      const context = audioContextRef.current;
      if (!context || !sourceRef.current) return;
      const elapsed = context.currentTime - startTimeRef.current;
      const duration = audioBufferRef.current.duration;
      offsetRef.current = Math.min(elapsed, duration);
      endFlagsRef.current.pause = true;
      try {
        sourceRef.current.stop();
      } catch (_) {
        // no-op
      }
      try {
        sourceRef.current.disconnect();
      } catch (_) {
        // no-op
      }
      sourceRef.current = null;
      setPlayerState('paused');
      playerStateRef.current = 'paused';
      setTrackPosition(offsetRef.current);
      stopProgressUpdate();
      return;
    }

    const offset = playerState === 'paused' || playerState === 'stopped' ? offsetRef.current : 0;
    try {
      await startPlayback(offset);
      setAudioError('');
    } catch (err) {
      console.error(err);
      setAudioError('오디오 재생에 실패했습니다.');
      setPlayerState('stopped');
      playerStateRef.current = 'stopped';
      stopProgressUpdate();
    }
  }, [playerState, startPlayback, stopProgressUpdate]);

  const handleStopPlayback = React.useCallback(() => {
    if (!audioBufferRef.current) return;
    if (!sourceRef.current) {
      offsetRef.current = 0;
      setPlayerState('stopped');
      playerStateRef.current = 'stopped';
      setTrackPosition(0);
      stopProgressUpdate();
      return;
    }
    endFlagsRef.current.stop = true;
    try {
      sourceRef.current.stop();
    } catch (_) {
      // no-op
    }
    try {
      sourceRef.current.disconnect();
    } catch (_) {
      // no-op
    }
    sourceRef.current = null;
    offsetRef.current = 0;
    setPlayerState('stopped');
    playerStateRef.current = 'stopped';
    setTrackPosition(0);
    stopProgressUpdate();
  }, [stopProgressUpdate]);

  const handleSeekStart = React.useCallback(() => {
    if (!audioBufferRef.current) return;
    setIsSeeking(true);
    isSeekingRef.current = true;
    stopProgressUpdate();
  }, [stopProgressUpdate]);

  const handleSeekChange = React.useCallback((value: number) => {
    if (!audioBufferRef.current) return;
    const buffer = audioBufferRef.current;
    const clamped = Math.min(Math.max(value, 0), buffer.duration);
    setTrackPosition(clamped);
    offsetRef.current = clamped;
  }, []);

  const handleSeekCommit = React.useCallback(async (value: number) => {
    if (!audioBufferRef.current) {
      setIsSeeking(false);
      isSeekingRef.current = false;
      return;
    }
    const buffer = audioBufferRef.current;
    const clamped = Math.min(Math.max(value, 0), buffer.duration);
    setIsSeeking(false);
    isSeekingRef.current = false;
    offsetRef.current = clamped;
    setTrackPosition(clamped);

    if (playerState === 'playing') {
      try {
        await startPlayback(clamped);
        setAudioError('');
      } catch (err) {
        console.error(err);
        setAudioError('오디오 재생에 실패했습니다.');
        setPlayerState('stopped');
        playerStateRef.current = 'stopped';
        stopProgressUpdate();
      }
      return;
    }

    const context = audioContextRef.current;
    if (context && context.state !== 'closed') {
      startTimeRef.current = context.currentTime - clamped;
    }
  }, [playerState, startPlayback, stopProgressUpdate]);

  const handleRangeChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleSeekChange(Number(event.target.value));
  }, [handleSeekChange]);

  const handleRangePointerDown = React.useCallback(() => {
    handleSeekStart();
  }, [handleSeekStart]);

  const handleRangePointerUp = React.useCallback((event: React.PointerEvent<HTMLInputElement>) => {
    void handleSeekCommit(Number(event.currentTarget.value));
  }, [handleSeekCommit]);

  const handleRangePointerCancel = React.useCallback((event: React.PointerEvent<HTMLInputElement>) => {
    void handleSeekCommit(Number(event.currentTarget.value));
  }, [handleSeekCommit]);

  const handleRangeKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSeekControlKey(event.key)) {
      handleSeekStart();
    }
  }, [handleSeekStart]);

  const handleRangeKeyUp = React.useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSeekControlKey(event.key)) {
      void handleSeekCommit(Number(event.currentTarget.value));
    }
  }, [handleSeekCommit]);

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
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
                    <span className="text-gray-200 font-medium">{option.label}</span>
                    <span className="block text-xs text-gray-400">{option.helper}</span>
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

          {audioReady && (
            <div>
              <h2 className="text-sm font-medium text-white">오디오 미리듣기</h2>
              <div className="mt-2 space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="tabular-nums">{formatTime(trackPosition)}</span>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(duration, 0.001)}
                    step={Math.max(duration / 500, 0.01)}
                    value={Number.isFinite(trackPosition) ? trackPosition : 0}
                    onChange={handleRangeChange}
                    onPointerDown={handleRangePointerDown}
                    onPointerUp={handleRangePointerUp}
                    onPointerCancel={handleRangePointerCancel}
                    onKeyDown={handleRangeKeyDown}
                    onKeyUp={handleRangeKeyUp}
                    disabled={!audioReady || duration <= 0}
                    aria-label="재생 위치"
                    className="flex-1 h-1.5 cursor-pointer rounded-full bg-white/30 accent-blue-500 disabled:cursor-not-allowed"
                  />
                  <span className="tabular-nums">{formatTime(duration)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlayPause}
                    disabled={playerState === 'loading' || !audioReady}
                    className={`px-4 py-1.5 rounded text-sm font-medium ${
                      playerState === 'loading' || !audioReady
                        ? 'bg-blue-600/40 text-white/60 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {playerState === 'playing' ? '일시정지' : '재생'}
                  </button>
                  <button
                    type="button"
                    onClick={handleStopPlayback}
                    disabled={playerState === 'loading' || !audioReady || playerState === 'stopped'}
                    className={`px-4 py-1.5 rounded text-sm font-medium ${
                      playerState === 'loading' || !audioReady || playerState === 'stopped'
                        ? 'bg-gray-600/40 text-white/60 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-500 text-white'
                    }`}
                  >
                    중지
                  </button>
                  <span className="text-xs text-gray-500">
                    상태: {playerState === 'playing' ? '재생 중' : playerState === 'paused' ? '일시정지' : playerState === 'stopped' ? '정지' : '대기'}
                  </span>
                </div>
              </div>
              {audioInfo ? (
                <p className="mt-2 text-xs text-gray-500">MIME: {audioInfo.mime}{audioInfo.sampleRate ? ` · 샘플레이트: ${audioInfo.sampleRate}Hz` : ''}</p>
              ) : null}
              {audioError ? (
                <p className="mt-2 text-xs text-amber-300">{audioError}</p>
              ) : null}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ImageToSpeechPage;
