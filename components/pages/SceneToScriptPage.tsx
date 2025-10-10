import React from 'react';
import { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton } from '../ui';

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

const SceneToScriptPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [result, setResult] = React.useState<SceneToScriptResponse | null>(null);
  const [audioInfo, setAudioInfo] = React.useState<{ mime: string; sampleRate?: number } | null>(null);
  const [audioReady, setAudioReady] = React.useState(false);
  const [audioError, setAudioError] = React.useState('');
  const [playerState, setPlayerState] = React.useState<'idle' | 'loading' | 'playing' | 'paused' | 'stopped'>('idle');
  const [duration, setDuration] = React.useState(0);
  const [trackPosition, setTrackPosition] = React.useState(0);
  const [isSeeking, setIsSeeking] = React.useState(false);

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
      } catch {
        // no-op
      }
      try {
        sourceRef.current.disconnect();
      } catch {
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
    playerStateRef.current = keepBuffer && audioBufferRef.current ? 'stopped' : 'idle';
    if (!keepBuffer) {
      audioBufferRef.current = null;
      setAudioReady(false);
      setAudioInfo(null);
    }
    isSeekingRef.current = false;
  }, [stopProgressUpdate]);

  const resetState = React.useCallback(() => {
    setResult(null);
    setAudioError('');
    resetPlaybackState();
  }, [resetPlaybackState]);

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
    setAudioInfo(null);
    setAudioReady(false);
    setAudioError('');
    setPlayerState('loading');
    setDuration(0);
    setTrackPosition(0);
    setIsSeeking(false);
    apiTask?.startTask('scene-to-script');

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

      if (!data.audio) {
        setError('오디오 데이터가 포함되어 있지 않습니다.');
        return;
      }

      const mime = data.mimeType && data.mimeType.trim() ? data.mimeType : 'audio/mpeg';
      const base64 = data.audio;
      let bytes: Uint8Array;
      try {
        const binary = atob(base64);
        bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
      } catch (decodeErr) {
        console.error(decodeErr);
        setError('오디오 데이터를 해석할 수 없습니다.');
        return;
      }

      try {
        await initializeBuffer(bytes, mime, data.sampleRate);
      } catch (initErr: any) {
        console.error(initErr);
        setAudioError(initErr?.message ?? '오디오 버퍼를 준비하는 중 문제가 발생했습니다.');
        setPlayerState('stopped');
        playerStateRef.current = 'stopped';
      }

      setAudioInfo({ mime, sampleRate: data.sampleRate });
      setResult(data);
      if (audioBufferRef.current) {
        try {
          await startPlayback(0);
        } catch (playErr) {
          console.error(playErr);
          setPlayerState('stopped');
          playerStateRef.current = 'stopped';
          setAudioError('자동 재생에 실패했습니다. 재생 버튼을 눌러 주세요.');
        }
      }
      apiTask?.completeTask('scene-to-script', isActiveTab);
    } catch (err: any) {
      const errorMsg = err?.message ?? '요청 중 오류가 발생했습니다.';
      setError(errorMsg);
      apiTask?.errorTask('scene-to-script', errorMsg);
    } finally {
      setLoading(false);
    }
  };

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

  const ensureContext = React.useCallback(async () => {
    let ctx = audioContextRef.current;
    const requestedRate = audioInfo?.sampleRate;
    if (!ctx || ctx.state === 'closed') {
      try {
        ctx = requestedRate ? new AudioContext({ sampleRate: requestedRate }) : new AudioContext();
      } catch {
        ctx = new AudioContext();
      }
      audioContextRef.current = ctx;
    }
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx;
  }, [audioInfo?.sampleRate]);

  const initializeBuffer = React.useCallback(
    async (bytes: Uint8Array, mime: string, sampleRate?: number) => {
      const context = await ensureContext();
      const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
      let decoded: AudioBuffer | null = null;
      try {
        decoded = await context.decodeAudioData(arrayBuffer.slice(0));
      } catch (decodeError) {
        const normalizedMime = mime.toLowerCase();
        if (normalizedMime.includes('pcm') || normalizedMime.includes('raw')) {
          if (!sampleRate || !Number.isFinite(sampleRate)) {
            throw new Error('PCM 오디오를 디코딩하려면 샘플레이트 정보가 필요합니다.');
          }
          if (arrayBuffer.byteLength % 2 !== 0) {
            throw new Error('PCM 오디오 데이터 길이가 올바르지 않습니다.');
          }
          const frameCount = arrayBuffer.byteLength / 2;
          decoded = context.createBuffer(1, frameCount, sampleRate);
          const view = new DataView(arrayBuffer);
          const channel = decoded.getChannelData(0);
          for (let i = 0; i < frameCount; i++) {
            channel[i] = view.getInt16(i * 2, true) / 32768;
          }
        } else {
          throw decodeError;
        }
      }

      if (!decoded) {
        throw new Error('오디오 버퍼를 준비하지 못했습니다.');
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
    },
    [ensureContext, scheduleProgressUpdate],
  );

  const startPlayback = React.useCallback(
    async (offset: number) => {
      const context = await ensureContext();
      const buffer = audioBufferRef.current;
      if (!buffer) {
        throw new Error('오디오 버퍼가 준비되지 않았습니다.');
      }

      if (sourceRef.current) {
        try {
          sourceRef.current.stop();
        } catch {
          // no-op
        }
        try {
          sourceRef.current.disconnect();
        } catch {
          // no-op
        }
      }

      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      endFlagsRef.current = { pause: false, stop: false };
      const clampedOffset = Math.min(Math.max(offset, 0), buffer.duration);
      startTimeRef.current = context.currentTime - clampedOffset;
      offsetRef.current = clampedOffset;
      if (!isSeekingRef.current) {
        setTrackPosition(clampedOffset);
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
      source.start(0, clampedOffset);
      scheduleProgressUpdate();
    },
    [ensureContext, scheduleProgressUpdate, stopProgressUpdate],
  );

  const handlePause = React.useCallback(async () => {
    if (playerStateRef.current !== 'playing') return;
    const context = await ensureContext();
    if (sourceRef.current) {
      endFlagsRef.current.pause = true;
      offsetRef.current = Math.min(Math.max(context.currentTime - startTimeRef.current, 0), duration);
      try {
        sourceRef.current.stop();
      } catch {
        // ignore
      }
      try {
        sourceRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceRef.current = null;
    }
    setPlayerState('paused');
    playerStateRef.current = 'paused';
  }, [duration, ensureContext]);

  const handleStop = React.useCallback(async () => {
    if (!audioBufferRef.current) return;
    if (sourceRef.current) {
      endFlagsRef.current.stop = true;
      try {
        sourceRef.current.stop();
      } catch {
        // ignore
      }
      try {
        sourceRef.current.disconnect();
      } catch {
        // ignore
      }
      sourceRef.current = null;
    }
    offsetRef.current = 0;
    setPlayerState('stopped');
    playerStateRef.current = 'stopped';
    setTrackPosition(0);
    stopProgressUpdate();
  }, [stopProgressUpdate]);

  const handleSeek = React.useCallback(
    async (value: number) => {
      if (!audioBufferRef.current) return;
      const clamped = Math.min(Math.max(value, 0), audioBufferRef.current.duration);
      setTrackPosition(clamped);
      offsetRef.current = clamped;
      if (playerStateRef.current === 'playing') {
        await startPlayback(clamped);
      }
    },
    [startPlayback],
  );

  const togglePlay = React.useCallback(async () => {
    if (!audioBufferRef.current) {
      setAudioError('오디오 버퍼가 준비되지 않았습니다.');
      return;
    }

    if (playerStateRef.current === 'playing') {
      await handlePause();
      return;
    }

    try {
      await startPlayback(offsetRef.current || 0);
    } catch (err) {
      console.error(err);
      setAudioError('재생을 시작하는 중 문제가 발생했습니다.');
    }
  }, [handlePause, startPlayback]);

  const formatTime = React.useCallback((seconds: number): string => {
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
    const totalSeconds = Math.floor(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <Icon name="sceneToScript" className="w-6 h-6" aria-hidden />
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
            <LoadingButton
              type="submit"
              disabled={!file}
              loading={loading}
              loadingText="분석 중…"
              idleText="장면 분석"
              variant="primary"
              className="px-5 py-2 text-sm font-medium"
            />
          </div>
        </section>
      </form>

      <ErrorMessage error={error} className="mt-4" />

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

          <div className="rounded-md border border-white/10 bg-white/[0.03] p-4 space-y-4">
            <h2 className="text-sm font-medium text-white">합성 오디오</h2>
            {audioReady ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      playerState === 'playing'
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {playerState === 'playing' ? '일시 정지' : '재생'}
                  </button>
                  <button
                    type="button"
                    onClick={handleStop}
                    className="px-4 py-2 rounded text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    정지
                  </button>
                  <div className="text-xs text-gray-400">
                    {formatTime(trackPosition)} / {formatTime(duration)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={trackPosition}
                    step={0.01}
                    onChange={async event => {
                      const value = Number(event.target.value);
                      if (Number.isFinite(value)) {
                        await handleSeek(value);
                      }
                    }}
                    onMouseDown={() => setIsSeeking(true)}
                    onMouseUp={() => {
                      setIsSeeking(false);
                      isSeekingRef.current = false;
                    }}
                    onTouchStart={() => setIsSeeking(true)}
                    onTouchEnd={() => {
                      setIsSeeking(false);
                      isSeekingRef.current = false;
                    }}
                    className="flex-1"
                  />
                </div>
                {audioInfo ? (
                  <div className="text-xs text-gray-500 flex flex-wrap gap-4">
                    <span>포맷: {audioInfo.mime}</span>
                    <span>샘플레이트: {audioInfo.sampleRate ?? '미상'} Hz</span>
                  </div>
                ) : null}
                <ErrorMessage error={audioError} variant="warning" />
              </div>
            ) : (
              <p className="text-sm text-gray-500">오디오 데이터가 준비되지 않았습니다.</p>
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
