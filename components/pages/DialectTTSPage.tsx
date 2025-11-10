import React from 'react';
import { PageProps } from '../../types';
import { ErrorMessage, LoadingButton, ApiProviderBadge } from '../ui';
import { Icon } from '../../constants';

type Dialect = 'jeolla' | 'gyeongsang' | 'chungcheong' | 'gangwon';

const DIALECT_LABELS: Record<Dialect, string> = {
  jeolla: '전라도',
  gyeongsang: '경상도',
  chungcheong: '충청도',
  gangwon: '강원도',
};

type DialectTTSResponse = {
  audioBase64: string;
  convertedText?: string;
};

const DialectTTSPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [text, setText] = React.useState<string>('');
  const [dialect, setDialect] = React.useState<Dialect>('jeolla');
  const [useAccent, setUseAccent] = React.useState<boolean>(true);
  const [useStyle, setUseStyle] = React.useState<boolean>(false);
  const [convertedText, setConvertedText] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [audioReady, setAudioReady] = React.useState(false);
  const [playerState, setPlayerState] = React.useState<'idle' | 'loading' | 'playing' | 'paused' | 'stopped'>('idle');
  const [duration, setDuration] = React.useState(0);
  const [trackPosition, setTrackPosition] = React.useState(0);

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const audioBufferRef = React.useRef<AudioBuffer | null>(null);
  const sourceRef = React.useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = React.useRef(0);
  const offsetRef = React.useRef(0);
  const endFlagsRef = React.useRef<{ pause: boolean; stop: boolean }>({ pause: false, stop: false });
  const rafRef = React.useRef<number | null>(null);
  const playerStateRef = React.useRef(playerState);

  React.useEffect(() => {
    playerStateRef.current = playerState;
  }, [playerState]);

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
      setTrackPosition(clamped);
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
      } catch (_) {}
      try {
        sourceRef.current.disconnect();
      } catch (_) {}
      sourceRef.current = null;
    }
    endFlagsRef.current = { pause: false, stop: false };
    offsetRef.current = 0;
    startTimeRef.current = 0;
    stopProgressUpdate();
    setDuration(0);
    setTrackPosition(0);
    setPlayerState(keepBuffer && audioBufferRef.current ? 'stopped' : 'idle');
    if (!keepBuffer) {
      audioBufferRef.current = null;
      setAudioReady(false);
    }
    playerStateRef.current = keepBuffer && audioBufferRef.current ? 'stopped' : 'idle';
  }, [stopProgressUpdate]);

  React.useEffect(() => {
    return () => {
      resetPlaybackState();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => undefined);
        audioContextRef.current = null;
      }
    };
  }, [resetPlaybackState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('텍스트를 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setConvertedText('');
    resetPlaybackState();
    setPlayerState('loading');
    apiTask?.startTask('dialect-tts');

    try {
      const res = await fetch('/api/dialect-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), dialect, useAccent, useStyle }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'TTS 요청에 실패했습니다.');
      }

      const json = (await res.json()) as Partial<DialectTTSResponse>;
      const base64 = typeof json?.audioBase64 === 'string' ? json.audioBase64 : '';
      if (!base64) {
        throw new Error('오디오 데이터가 없습니다.');
      }

      if (json.convertedText) {
        setConvertedText(json.convertedText);
      }

      // Decode base64 to PCM bytes
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      // Create AudioContext and buffer
      const ensureContext = async (): Promise<AudioContext> => {
        let ctx = audioContextRef.current;
        if (!ctx || ctx.state === 'closed') {
          try {
            ctx = new AudioContext({ sampleRate: 24000 });
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

      const context = await ensureContext();
      const sampleRate = 24000; // Gemini TTS default
      const sampleCount = bytes.length / 2; // 16-bit PCM
      const decoded = context.createBuffer(1, sampleCount, sampleRate);
      const view = new DataView(bytes.buffer);
      const channelData = decoded.getChannelData(0);
      for (let i = 0; i < sampleCount; i++) {
        channelData[i] = view.getInt16(i * 2, true) / 32768;
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

      // Auto-play
      try {
        const source = context.createBufferSource();
        source.buffer = decoded;
        source.connect(context.destination);
        endFlagsRef.current = { pause: false, stop: false };
        startTimeRef.current = context.currentTime;
        offsetRef.current = 0;
        setTrackPosition(0);
        source.onended = () => {
          sourceRef.current = null;
          if (endFlagsRef.current.pause || endFlagsRef.current.stop) {
            endFlagsRef.current = { pause: false, stop: false };
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
        source.start(0, 0);
        scheduleProgressUpdate();
      } catch (playErr) {
        console.error(playErr);
        setPlayerState('stopped');
      }

      apiTask?.completeTask('dialect-tts', isActiveTab);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.message || '처리 중 오류가 발생했습니다.';
      setError(errorMsg);
      apiTask?.errorTask('dialect-tts', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlayPause = React.useCallback(async () => {
    if (!audioBufferRef.current) return;
    const context = audioContextRef.current;
    if (!context) return;

    if (playerState === 'playing') {
      const elapsed = context.currentTime - startTimeRef.current;
      offsetRef.current = Math.min(elapsed, audioBufferRef.current.duration);
      endFlagsRef.current.pause = true;
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch (_) {}
        try { sourceRef.current.disconnect(); } catch (_) {}
        sourceRef.current = null;
      }
      setPlayerState('paused');
      playerStateRef.current = 'paused';
      setTrackPosition(offsetRef.current);
      stopProgressUpdate();
      return;
    }

    // Resume or start playback
    const offset = playerState === 'paused' || playerState === 'stopped' ? offsetRef.current : 0;
    const source = context.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(context.destination);
    endFlagsRef.current = { pause: false, stop: false };
    startTimeRef.current = context.currentTime - offset;
    offsetRef.current = offset;
    setTrackPosition(offset);
    source.onended = () => {
      sourceRef.current = null;
      if (endFlagsRef.current.pause || endFlagsRef.current.stop) {
        endFlagsRef.current = { pause: false, stop: false };
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
  }, [playerState, scheduleProgressUpdate, stopProgressUpdate]);

  const handleStopPlayback = React.useCallback(() => {
    if (!audioBufferRef.current) return;
    if (sourceRef.current) {
      endFlagsRef.current.stop = true;
      try { sourceRef.current.stop(); } catch (_) {}
      try { sourceRef.current.disconnect(); } catch (_) {}
      sourceRef.current = null;
    }
    offsetRef.current = 0;
    setPlayerState('stopped');
    playerStateRef.current = 'stopped';
    setTrackPosition(0);
    stopProgressUpdate();
  }, [stopProgressUpdate]);

  const handleAccentChange = (checked: boolean) => {
    if (!checked && !useStyle) return;
    setUseAccent(checked);
  };

  const handleStyleChange = (checked: boolean) => {
    if (!checked && !useAccent) return;
    setUseStyle(checked);
  };

  const formatTime = (seconds: number): string => {
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
    const totalSeconds = Math.floor(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-purple-400">
            <Icon name="dialectTts" className="w-6 h-6" />
          </span>
          Dialect TTS
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          입력한 문장을 선택한 지역 방언으로 변환하여 TTS 음성으로 합성합니다.
        </p>
        <div className="mt-2">
          <ApiProviderBadge provider="gemini" />
        </div>
        <p className="mt-1 text-[12px] text-gray-500">
          Gemini TTS API를 사용하며, 방언 문체 변환 및 억양을 조정합니다. WebAudio API로 재생됩니다.
        </p>
      </header>

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">입력 텍스트</label>
              <textarea
                className="w-full min-h-[120px] bg-[#1f1f1f] border border-white/10 rounded p-3 text-sm outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="예: 오늘 날씨가 정말 좋네요"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">방언 선택</label>
              <select
                className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm mb-2"
                value={dialect}
                onChange={(e) => setDialect(e.target.value as Dialect)}
              >
                {Object.entries(DIALECT_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              <div className="space-y-2 mt-3">
                <label className="block text-xs text-gray-400 mb-1">변환 옵션 (최소 1개)</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAccent}
                    onChange={(e) => handleAccentChange(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm">억양 적용</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useStyle}
                    onChange={(e) => handleStyleChange(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm">문체 변환</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <LoadingButton
              type="submit"
              loading={loading}
              disabled={!text.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
            >
              TTS 생성
            </LoadingButton>
          </div>
        </form>
      </section>

      {error && <ErrorMessage message={error} />}

      {convertedText && (
        <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4 mb-4">
          <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <Icon name="file" className="w-4 h-4 text-blue-400" />
            변환된 텍스트
          </h2>
          <div className="bg-[#1f1f1f] border border-white/10 rounded p-3 text-sm">
            <p className="text-gray-200 whitespace-pre-wrap">{convertedText}</p>
          </div>
        </section>
      )}

      {audioReady && (
        <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
          <h2 className="text-sm font-medium text-white mb-3">재생</h2>
          <div className="flex items-center gap-2 mb-3">
            <button
              type="button"
              onClick={handleTogglePlayPause}
              className={`px-4 py-2 rounded text-sm ${playerState === 'playing' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
            >
              {playerState === 'playing' ? '일시정지' : '재생'}
            </button>
            <button
              type="button"
              onClick={handleStopPlayback}
              className="px-4 py-2 rounded text-sm bg-rose-600 hover:bg-rose-500 text-white"
              disabled={playerState === 'idle' || playerState === 'stopped'}
            >
              중지
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{formatTime(trackPosition)}</span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.01}
              value={trackPosition}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTrackPosition(val);
                offsetRef.current = val;
              }}
              className="flex-1"
              disabled={!audioReady}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </section>
      )}
    </div>
  );
};

export default DialectTTSPage;
