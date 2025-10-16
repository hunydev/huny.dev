import React from 'react';
import { PageProps } from '../../types';
import { ErrorMessage, LoadingButton, ApiProviderBadge } from '../ui';
import { Icon } from '../../constants';

const INSTRUCTION_PRESETS = [
  { value: 'american', label: '미국인 억양', prompt: 'Speak Korean with an American English accent, as if a native English speaker is trying to speak Korean.' },
  { value: 'british', label: '영국인 억양', prompt: 'Speak Korean with a British English accent, as if a British person is speaking Korean.' },
  { value: 'japanese', label: '일본인 억양', prompt: 'Speak Korean with a Japanese accent, as if a Japanese person is speaking Korean.' },
  { value: 'chinese', label: '중국인 억양', prompt: 'Speak Korean with a Chinese accent, as if a Chinese person is speaking Korean.' },
  { value: 'custom', label: '직접 입력', prompt: '' },
];

type NonNativeKoreanTTSResponse = {
  audio: string;
  sampleRate?: number;
  mimeType?: string;
};

const pcmToWav = (pcmData: Uint8Array, sampleRate: number, numChannels: number = 1, bitsPerSample: number = 16): Uint8Array => {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const headerSize = 44;
  const wav = new Uint8Array(headerSize + dataSize);
  const view = new DataView(wav.buffer);

  // RIFF header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataSize, true); // file size - 8
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // audio format (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataSize, true);
  wav.set(pcmData, headerSize);

  return wav;
};

const NonNativeKoreanTTSPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [text, setText] = React.useState<string>('');
  const [instructionPreset, setInstructionPreset] = React.useState<string>('american');
  const [customInstruction, setCustomInstruction] = React.useState<string>('');
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
  const rawPcmDataRef = React.useRef<Uint8Array | null>(null);
  const sampleRateRef = React.useRef<number>(24000);

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
      rawPcmDataRef.current = null;
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

    const instruction = instructionPreset === 'custom' 
      ? customInstruction.trim() 
      : INSTRUCTION_PRESETS.find(p => p.value === instructionPreset)?.prompt || '';

    if (!instruction) {
      setError('지시사항을 입력하거나 프리셋을 선택해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    resetPlaybackState();
    setPlayerState('loading');
    apiTask?.startTask('non-native-korean-tts');

    try {
      const res = await fetch('/api/non-native-korean-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), instruction }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'TTS 요청에 실패했습니다.');
      }

      const json = (await res.json()) as Partial<NonNativeKoreanTTSResponse>;
      const base64 = typeof json?.audio === 'string' ? json.audio : '';
      if (!base64) {
        throw new Error('오디오 데이터가 없습니다.');
      }

      const sampleRate = typeof json?.sampleRate === 'number' && Number.isFinite(json.sampleRate) ? json.sampleRate : 24000;
      sampleRateRef.current = sampleRate;

      // Decode base64 to PCM
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      rawPcmDataRef.current = bytes;

      // Create AudioContext and buffer
      const ensureContext = async (): Promise<AudioContext> => {
        let ctx = audioContextRef.current;
        if (!ctx || ctx.state === 'closed') {
          try {
            ctx = new AudioContext({ sampleRate });
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

      apiTask?.completeTask('non-native-korean-tts', isActiveTab);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.message || '처리 중 오류가 발생했습니다.';
      setError(errorMsg);
      apiTask?.errorTask('non-native-korean-tts', errorMsg);
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

  const handleDownloadWav = React.useCallback(() => {
    if (!rawPcmDataRef.current) return;
    const wavData = pcmToWav(rawPcmDataRef.current, sampleRateRef.current, 1, 16);
    const blob = new Blob([wavData], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `non-native-korean-tts-${Date.now()}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

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
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <Icon name="nonNativeKoreanTts" className="w-6 h-6" />
          </span>
          Non-Native Korean TTS
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          한국어 텍스트를 입력하면 외국인 억양(미국/영국/일본/중국 등)으로 합성음을 생성합니다.
        </p>
        <div className="mt-2">
          <ApiProviderBadge provider="gemini" />
        </div>
        <p className="mt-1 text-[12px] text-gray-500">
          Gemini TTS API를 사용하며, instruction을 통해 발음 스타일을 조정합니다. 출력은 Linear 16-bit PCM이며 WebAudio API로 재생하거나 WAV 파일로 다운로드할 수 있습니다.
        </p>
      </header>

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">한국어 텍스트</label>
              <textarea
                className="w-full min-h-[120px] bg-[#1f1f1f] border border-white/10 rounded p-3 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="예: 안녕하세요. 저는 한국어를 배우고 있습니다."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">억양 프리셋</label>
              <select
                className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm mb-2"
                value={instructionPreset}
                onChange={(e) => setInstructionPreset(e.target.value)}
              >
                {INSTRUCTION_PRESETS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              {instructionPreset === 'custom' && (
                <>
                  <label className="block text-xs text-gray-400 mb-1">Custom Instruction</label>
                  <textarea
                    className="w-full min-h-[60px] bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 mb-2"
                    placeholder="예: Speak Korean with a French accent"
                    value={customInstruction}
                    onChange={(e) => setCustomInstruction(e.target.value)}
                  />
                </>
              )}
              <LoadingButton
                onClick={handleSubmit}
                disabled={!text.trim() || loading}
                loading={loading}
                loadingText="합성 중…"
                idleText="합성"
                variant="primary"
                className="w-full px-4 py-2 text-sm"
              />
            </div>
          </div>
          <ErrorMessage error={error} className="mt-3" />
        </form>
      </section>

      {audioReady && (
        <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
          <h2 className="text-sm font-medium text-white mb-3">재생 및 다운로드</h2>
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
            <button
              type="button"
              onClick={handleDownloadWav}
              className="px-4 py-2 rounded text-sm bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1"
            >
              <Icon name="download" className="w-4 h-4" />
              WAV 다운로드
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
            />
            <span>{formatTime(duration)}</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Sample Rate: {sampleRateRef.current} Hz | Format: 16-bit PCM
          </div>
        </section>
      )}
    </div>
  );
};

export default NonNativeKoreanTTSPage;
