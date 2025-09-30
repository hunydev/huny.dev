import React from 'react';
import { PageProps } from '../../types';

const DEFAULT_TEXT = `작은 항구 마을에 낡은 등대가 있었습니다.
“오늘은 또 불이 꺼져 있네.” 어부 아저씨가 한숨을 내쉬었지요.
“불이 없으면 밤에 배들이 길을 잃을 거야.” 어린 소녀가 걱정스레 말했습니다.
그때 등대 안에서 작은 목소리가 들려왔습니다.
“미안해요… 제 심지가 다 닳아서 불을 켤 수가 없어요.” 등대 불꽃 요정이 속삭였지요.
소녀는 깜짝 놀라 대답했습니다. “그럼 내가 새 심지를 구해 줄게!”
“정말? 그렇다면 다시 환하게 빛낼 수 있어.” 요정의 눈이 반짝였습니다.
다음 날, 어부와 소녀는 함께 새 심지를 찾아 등대에 불을 밝혔습니다.
“고마워! 이제 배들이 다시 길을 잃지 않을 거야.” 요정이 기쁘게 외쳤습니다.
밤바다 위, 환한 불빛이 멀리까지 퍼지며 사람들의 마음을 든든하게 비추어 주었습니다.
`;

const MultiVoiceReaderPage: React.FC<PageProps> = () => {
  const [text, setText] = React.useState<string>(DEFAULT_TEXT);
  const [model, setModel] = React.useState<'gemini-2.5-flash-preview-tts' | 'gemini-2.5-pro-preview-tts'>('gemini-2.5-flash-preview-tts');
  const [convertLoading, setConvertLoading] = React.useState<boolean>(false);
  const [synthLoading, setSynthLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [audioInfo, setAudioInfo] = React.useState<{ base64: string; sampleRate: number; numChannels: number; sampleFormat: string } | null>(null);
  const [prompts, setPrompts] = React.useState<Array<{ text: string; name: string; gender: 'male' | 'female' | 'unknown'; extra: string; directive: string }>>([]);
  const FEMALE = ['Zephyr','Kore','Leda','Aoede','Callirrhoe','Autonoe','Despina','Erinome','Laomedeia','Achernar','Gacrux','Pulcherrima','Vindemiatrix','Sulafat'] as const;
  const MALE = ['Puck','Charon','Fenrir','Orus','Enceladus','Iapetus','Umbriel','Algieba','Algenib','Rasalgethi','Alnilam','Schedar','Achird','Zubenelgenubi','Sadachbia','Sadaltager'] as const;
  const ALL_VOICES = [...FEMALE, ...MALE] as const;
  const [voiceMap, setVoiceMap] = React.useState<Record<string, typeof ALL_VOICES[number]>>({});
  const uniqueNames = React.useMemo(() => {
    const s = new Set<string>();
    for (const p of prompts) s.add(p.name?.trim() || 'Unknown');
    return Array.from(s);
  }, [prompts]);

  // Segments fallback support
  const [segments, setSegments] = React.useState<Array<{ base64: string; sampleRate: number; mimeType: string }>>([]);
  const [playingSegments, setPlayingSegments] = React.useState(false);
  // Play/Stop state for single audio
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const srcRef = React.useRef<AudioBufferSourceNode | null>(null);

  const canConvert = !convertLoading && text.trim().length > 0;
  const canSynthesize = !synthLoading && text.trim().length > 0;

  // Decode base64 s16le PCM and play via Web Audio API
  const playPcmBase64 = async (b64: string, sampleRate = 24000, numChannels = 1) => {
    // stop if already playing
    if (srcRef.current) {
      try { srcRef.current.stop(0); } catch {}
      srcRef.current = null;
    }
    if (audioCtxRef.current) {
      try { await audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }

    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    // Convert little-endian 16-bit PCM to Float32Array
    const frameCount = Math.floor(bytes.length / 2 / numChannels);
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
    audioCtxRef.current = audioCtx;
    const audioBuffer = audioCtx.createBuffer(numChannels, frameCount, sampleRate);

    const view = new DataView(bytes.buffer);
    for (let ch = 0; ch < numChannels; ch++) {
      const channel = audioBuffer.getChannelData(ch);
      for (let i = 0; i < frameCount; i++) {
        const index = (i * numChannels + ch) * 2;
        const sample = view.getInt16(index, true); // little endian
        channel[i] = sample / 32768;
      }
    }

    const src = audioCtx.createBufferSource();
    src.buffer = audioBuffer;
    src.connect(audioCtx.destination);
    srcRef.current = src;
    setIsPlaying(true);
    const done = new Promise<void>((resolve) => {
      src.onended = () => {
        setIsPlaying(false);
        srcRef.current = null;
        audioCtxRef.current?.close().catch(() => {});
        audioCtxRef.current = null;
        resolve();
      };
    });
    src.start();
    await done;
  };

  const stopPlayback = async () => {
    if (srcRef.current) {
      try { srcRef.current.stop(0); } catch {}
      srcRef.current = null;
    }
    if (audioCtxRef.current) {
      try { await audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  // Play segments sequentially. Supports raw PCM and encoded audio via HTMLAudioElement
  const playSegments = async (items: Array<{ base64: string; sampleRate: number; mimeType: string }>) => {
    setPlayingSegments(true);
    try {
      for (const seg of items) {
        if (/^audio\/(raw|pcm)/.test(seg.mimeType)) {
          await playPcmBase64(seg.base64, seg.sampleRate, 1);
        } else {
          await new Promise<void>((resolve, reject) => {
            const audio = new Audio(`data:${seg.mimeType};base64,${seg.base64}`);
            audio.onended = () => resolve();
            audio.onerror = () => reject(new Error('오디오 재생 오류'));
            audio.play().catch(reject);
          });
        }
      }
    } finally {
      setPlayingSegments(false);
    }
  };

  // retry helper for transient 5xx
  const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
  const fetchJsonWithRetry = async (url: string, opts: RequestInit, retries = 2): Promise<any> => {
    let attempt = 0;
    while (true) {
      try {
        const res = await fetch(url, opts);
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`${res.status} ${res.statusText}${txt ? '\n' + txt : ''}`);
        }
        return await res.json();
      } catch (err) {
        if (attempt >= retries) throw err;
        const backoff = 500 * Math.pow(2, attempt);
        await sleep(backoff);
        attempt++;
      }
    }
  };

  const handleConvert = async () => {
    setError('');
    setAudioInfo(null);
    setSegments([]);
    setPrompts([]);
    setConvertLoading(true);
    try {
      const data: { prompts: Array<{ text: string; name: string; gender: 'male'|'female'|'unknown'; extra: string; directive: string }> }
        = await fetchJsonWithRetry('/api/split-speaker', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        }, 2);
      setPrompts(data.prompts || []);
      // 기본 보이스 매핑 초기화: 성별 선호 리스트를 우선하되, 전체 풀에서 중복 없이 배정
      const initMap: Record<string, typeof ALL_VOICES[number]> = {};
      const seen = new Set<string>();
      const used = new Set<typeof ALL_VOICES[number]>();
      const pickUnique = (preferred: readonly typeof ALL_VOICES[number][]) => {
        const found = preferred.find(v => !used.has(v));
        if (found) { used.add(found); return found; }
        const any = (ALL_VOICES as readonly typeof ALL_VOICES[number][]).find(v => !used.has(v));
        if (any) { used.add(any); return any; }
        // 모든 보이스를 소진한 경우 중복 허용(마지막 수단)
        return preferred[0] ?? ALL_VOICES[0];
      };
      for (const p of data.prompts || []) {
        const nm = p.name?.trim() || 'Unknown';
        if (seen.has(nm)) continue;
        seen.add(nm);
        const g = p.gender;
        if (g === 'female') initMap[nm] = pickUnique(FEMALE);
        else if (g === 'male') initMap[nm] = pickUnique(MALE);
        else initMap[nm] = pickUnique(ALL_VOICES);
      }
      setVoiceMap(initMap);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setConvertLoading(false);
    }
  };

  const handleSynthesize = async () => {
    setError('');
    setAudioInfo(null);
    setSegments([]);
    setSynthLoading(true);
    try {
      // If no intermediate prompts, auto convert first
      let promptsToUse = prompts;
      if (promptsToUse.length === 0) {
        const data: { prompts: Array<{ text: string; name: string; gender: 'male'|'female'|'unknown'; extra: string; directive: string }> }
          = await fetchJsonWithRetry('/api/split-speaker', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          }, 2);
        promptsToUse = data.prompts || [];
        setPrompts(promptsToUse);
        // init voice map
        const initMap: Record<string, typeof ALL_VOICES[number]> = {};
        const seen = new Set<string>();
        let fIdx = 0, mIdx = 0, uIdx = 0;
        for (const p of promptsToUse) {
          const nm = p.name?.trim() || 'Unknown';
          if (seen.has(nm)) continue;
          seen.add(nm);
          if (p.gender === 'female') initMap[nm] = FEMALE[fIdx++ % FEMALE.length];
          else if (p.gender === 'male') initMap[nm] = MALE[mIdx++ % MALE.length];
          else initMap[nm] = (ALL_VOICES as any)[uIdx++ % ALL_VOICES.length];
        }
        setVoiceMap(initMap);
        // use newly built voice map immediately
        var voiceMapToUse: Record<string, typeof ALL_VOICES[number]> = initMap;
      } else {
        var voiceMapToUse: Record<string, typeof ALL_VOICES[number]> = voiceMap;
      }
      const body = {
        model,
        prompts: promptsToUse,
        voiceMap: voiceMapToUse,
      };
      const data: any = await fetchJsonWithRetry('/api/multivoice-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, 2);
      if (data?.audio) {
        setAudioInfo({ base64: data.audio, sampleRate: data.sampleRate || 24000, numChannels: data.numChannels || 1, sampleFormat: data.sampleFormat || 's16le' });
      } else {
        throw new Error('오디오 데이터가 없습니다.');
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setSynthLoading(false);
    }
  };

  const handlePlay = async () => {
    if (!audioInfo) return;
    if (isPlaying) {
      await stopPlayback();
    } else {
      await playPcmBase64(audioInfo.base64, audioInfo.sampleRate, audioInfo.numChannels);
    }
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M4 22q-.825 0-1.412-.587T2 20V4q0-.825.588-1.412T4 2h8.15l-2 2H4v16h11v-2h2v2q0 .825-.587 1.413T15 22zm2-4v-2h7v2zm0-3v-2h5v2zm9 0l-4-4H8V6h3l4-4zm2-3.05v-6.9q.9.525 1.45 1.425T19 8.5t-.55 2.025T17 11.95m0 4.3v-2.1q1.75-.625 2.875-2.162T21 8.5t-1.125-3.488T17 2.85V.75q2.6.675 4.3 2.813T23 8.5t-1.7 4.938T17 16.25"/></svg>
          </span>
          MultiVoice Reader
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          입력 텍스트의 화자를 자동 분리하고 Gemini TTS 멀티스피커로 합성하여 하나의 오디오로 재생합니다.
        </p>
        <p className="mt-1 text-[12px] text-gray-500">
          사용 방법: (1) 텍스트 입력 → (2) 변환(선택) 또는 바로 합성 → (3) 결과에서 재생/중지. 화자별 보이스는 아래 "화자별 보이스 지정"에서 설정할 수 있어요.
        </p>
      </header>

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">Text</label>
            <textarea
              className="w-full min-h-[160px] bg-[#1f1f1f] border border-white/10 rounded p-3 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="여러 화자가 등장하는 글/대사를 입력하세요. 일반 서술도 포함됩니다."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Model</label>
            <select className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm" value={model} onChange={(e) => setModel(e.target.value as any)}>
              <option value="gemini-2.5-flash-preview-tts">gemini-2.5-flash-preview-tts</option>
              <option value="gemini-2.5-pro-preview-tts">gemini-2.5-pro-preview-tts</option>
            </select>
            <div className="mt-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleConvert}
                  className={`flex-1 px-4 py-2 rounded text-sm ${canConvert ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600/40 text-white/70 cursor-not-allowed'}`}
                  disabled={!canConvert}
                >
                  {convertLoading ? '변환 중…' : '변환'}
                </button>
                <button
                  type="button"
                  onClick={handleSynthesize}
                  className={`flex-1 px-4 py-2 rounded text-sm ${canSynthesize ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600/40 text-white/70 cursor-not-allowed'}`}
                  disabled={!canSynthesize}
                >
                  {synthLoading ? '합성 중…' : '합성'}
                </button>
              </div>
            </div>
          </div>
        </div>
        {error && <div className="mt-3 text-sm text-red-300 whitespace-pre-wrap">{error}</div>}
      </section>

      {/* Result panel placed above Intermediate for better visibility */}
      <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">결과</h2>
        {audioInfo ? (
          <div className="text-xs text-gray-400">
            <div>Sample rate: {audioInfo.sampleRate} Hz</div>
            <div>Channels: {audioInfo.numChannels}</div>
            <div>Format: {audioInfo.sampleFormat}</div>
            <button
              type="button"
              onClick={handlePlay}
              className={`mt-3 px-4 py-2 rounded text-sm ${!isPlaying ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'}`}
            >
              {!isPlaying ? '재생' : '중지'}
            </button>
          </div>
        ) : segments.length > 0 ? (
          <div>
            <div className="text-xs text-gray-400 mb-2">세그먼트 수: {segments.length}개</div>
            <button
              type="button"
              onClick={() => playSegments(segments)}
              className={`px-4 py-2 rounded text-sm ${!playingSegments ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-600/40 text-white/70 cursor-not-allowed'}`}
              disabled={playingSegments}
            >
              {playingSegments ? '재생 중…' : '세그먼트 재생'}
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-500">아직 결과가 없습니다. ‘합성’을 누르면 자동으로 변환 후 합성까지 한 번에 수행됩니다.</div>
        )}
      </section>

      {/* Intermediate structured prompts and voice mapping */}
      <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-3">중간 결과 (TTS 입력)</h2>
        {prompts.length === 0 ? (
          <div className="text-sm text-gray-500">먼저 ‘변환’을 눌러 화자/네레이션을 분리하세요.</div>
        ) : (
          <>
            <div className="mb-4 text-xs text-gray-400">아래는 모델이 분리한 화자/내레이션입니다. 필요하면 이름/성별/지시문/텍스트를 수정하세요. 각 화자의 보이스는 바로 아래에서 지정합니다.</div>

            {/* Per-speaker voice mapping */}
            <div className="mb-3">
              <h3 className="text-xs uppercase text-gray-400 tracking-wider mb-2">화자별 보이스 지정</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {uniqueNames.map((nm) => (
                  <div key={`sp-${nm}`} className="flex items-center gap-2 bg-black/20 border border-white/10 rounded p-2">
                    <div className="text-sm text-white flex-1 truncate" title={nm}>{nm}</div>
                    <select
                      className="bg-[#1f1f1f] border border-white/10 rounded p-1 text-sm"
                      value={voiceMap[nm] || ''}
                      onChange={(e) => setVoiceMap(prev => ({ ...prev, [nm]: e.target.value as any }))}
                    >
                      {ALL_VOICES.map(v => <option key={`V-${nm}-${v}`} value={v}>{v}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">화자가 2명을 초과하면, 서버는 각 줄을 해당 화자의 보이스로 개별 합성한 뒤 병합하거나 순차 재생용 세그먼트로 반환합니다.</p>
            </div>

            <div className="flex flex-col gap-2">
              {prompts.map((p, idx) => (
                <div key={idx} className="rounded border border-white/10 p-2 bg-black/20">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Name</label>
                      <input className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm" value={p.name} onChange={(e) => setPrompts(prev => prev.map((q, i) => i===idx ? { ...q, name: e.target.value } : q))} />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Gender</label>
                      <select className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm" value={p.gender} onChange={(e) => setPrompts(prev => prev.map((q, i) => i===idx ? { ...q, gender: e.target.value as any } : q))}>
                        <option value="unknown">unknown</option>
                        <option value="male">male</option>
                        <option value="female">female</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] text-gray-400 mb-1">Directive</label>
                      <input className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm" value={p.directive} onChange={(e) => setPrompts(prev => prev.map((q, i) => i===idx ? { ...q, directive: e.target.value } : q))} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] text-gray-400 mb-1">Extra</label>
                      <input className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm" value={p.extra} onChange={(e) => setPrompts(prev => prev.map((q, i) => i===idx ? { ...q, extra: e.target.value } : q))} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <label className="block text-[11px] text-gray-400 mb-1">Text</label>
                    <textarea className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm min-h-[80px]" value={p.text} onChange={(e) => setPrompts(prev => prev.map((q, i) => i===idx ? { ...q, text: e.target.value } : q))} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
export default MultiVoiceReaderPage;
