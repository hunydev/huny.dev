import React from 'react';
import { PageProps } from '../../types';

const DEFAULT_TEXT = `이미 그 깊은 숲속에는 많은 너구리들이 살고 있었어요.
"숲속의 도토리는 다 임자가 있어.
어디서 굴러먹던 놈이 와 함부로 손을 대는 거야?"
깊은 숲속의 너구리들은 아주 차가운 표정으로 그렇게 말했어요.
이 다람쥐는 닥쳐올 겨울이 걱정되었습니다.
생각다 못한 다람쥐는 너구리들에게 이렇게 말했지요.
"도토리를 주워 드릴게요.
대신 그것을 조금만 제게 나누어 주시지 않겠어요?"
너구리들은 그러마고 이내 고개를 끄덕였습니다.
`;

const MultiVoiceReaderPage: React.FC<PageProps> = () => {
  const [text, setText] = React.useState<string>(DEFAULT_TEXT);
  const [model, setModel] = React.useState<'gemini-2.5-flash-preview-tts' | 'gemini-2.5-pro-preview-tts'>('gemini-2.5-flash-preview-tts');
  const [convertLoading, setConvertLoading] = React.useState<boolean>(false);
  const [synthLoading, setSynthLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [audioInfo, setAudioInfo] = React.useState<{ base64: string; sampleRate: number; numChannels: number; sampleFormat: string } | null>(null);
  const [prompts, setPrompts] = React.useState<Array<{ text: string; name: string; gender: 'male' | 'female' | 'unknown'; extra: string; directive: string }>>([]);
  const [mapping, setMapping] = React.useState<'narration_vs_others' | 'alternate'>('narration_vs_others');
  const [speakerALabel, setSpeakerALabel] = React.useState<string>('Narrator');
  const [speakerBLabel, setSpeakerBLabel] = React.useState<string>('Speaker');
  const FEMALE = ['Zephyr','Kore','Leda','Aoede','Callirrhoe','Autonoe','Despina','Erinome','Laomedeia','Achernar','Gacrux','Pulcherrima','Vindemiatrix','Sulafat'] as const;
  const MALE = ['Puck','Charon','Fenrir','Orus','Enceladus','Iapetus','Umbriel','Algieba','Algenib','Rasalgethi','Alnilam','Schedar','Achird','Zubenelgenubi','Sadachbia','Sadaltager'] as const;
  const ALL_VOICES = [...FEMALE, ...MALE] as const;
  const [voiceAName, setVoiceAName] = React.useState<typeof ALL_VOICES[number]>('Gacrux');
  const [voiceBName, setVoiceBName] = React.useState<typeof ALL_VOICES[number]>('Puck');
  const [voiceMap, setVoiceMap] = React.useState<Record<string, typeof ALL_VOICES[number]>>({});
  const uniqueNames = React.useMemo(() => {
    const s = new Set<string>();
    for (const p of prompts) s.add(p.name?.trim() || 'Unknown');
    return Array.from(s);
  }, [prompts]);

  // Segments fallback support
  const [segments, setSegments] = React.useState<Array<{ base64: string; sampleRate: number; mimeType: string }>>([]);
  const [playingSegments, setPlayingSegments] = React.useState(false);

  const canConvert = !convertLoading && text.trim().length > 0;
  const canSynthesize = !synthLoading && prompts.length > 0;

  // Decode base64 s16le PCM and play via Web Audio API
  const playPcmBase64 = async (b64: string, sampleRate = 24000, numChannels = 1) => {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    // Convert little-endian 16-bit PCM to Float32Array
    const frameCount = Math.floor(bytes.length / 2 / numChannels);
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
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
    const done = new Promise<void>((resolve) => {
      src.onended = () => resolve();
    });
    src.start();
    await done;
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
      // 기본 보이스 매핑 초기화(성별 기반 추천)
      const initMap: Record<string, typeof ALL_VOICES[number]> = {};
      const seen = new Set<string>();
      let fIdx = 0, mIdx = 0, uIdx = 0;
      for (const p of data.prompts || []) {
        const nm = p.name?.trim() || 'Unknown';
        if (seen.has(nm)) continue;
        seen.add(nm);
        if (p.gender === 'female') initMap[nm] = FEMALE[fIdx++ % FEMALE.length];
        else if (p.gender === 'male') initMap[nm] = MALE[mIdx++ % MALE.length];
        else initMap[nm] = (ALL_VOICES as any)[uIdx++ % ALL_VOICES.length];
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
      const body = {
        model,
        prompts,
        mapping,
        speakerALabel,
        speakerBLabel,
        voiceAName,
        voiceBName,
        voiceMap,
      };
      const data: any = await fetchJsonWithRetry('/api/multivoice-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, 2);
      if (data?.audio) {
        setAudioInfo({ base64: data.audio, sampleRate: data.sampleRate || 24000, numChannels: data.numChannels || 1, sampleFormat: data.sampleFormat || 's16le' });
      } else if (Array.isArray(data?.segments) && data.segments.length > 0) {
        setSegments(data.segments.map((s: any) => ({ base64: s.audio, sampleRate: s.sampleRate || 24000, mimeType: s.mimeType || 'audio/raw;rate=24000' })));
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
    await playPcmBase64(audioInfo.base64, audioInfo.sampleRate, audioInfo.numChannels);
  };
  const handlePlaySegments = async () => {
    if (segments.length === 0) return;
    await playSegments(segments);
  };

  return (
    <div className="text-gray-300 max-w-5xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3 10a1 1 0 0 1 1-1h1c2.761 0 5-2.239 5-5a1 1 0 1 1 2 0c0 3.86-3.14 7-7 7H4a1 1 0 0 1-1-1m15.5-5a.75.75 0 0 1 .75.75V18.5a.75.75 0 0 1-1.135.65l-4.5-2.75a.75.75 0 0 1-.365-.65V6.35a.75.75 0 0 1 .365-.65l4.5-2.75A.75.75 0 0 1 18.5 5"/></svg>
          </span>
          MultiVoice Reader
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          입력 텍스트의 화자를 자동 분리하고 Gemini TTS 멀티스피커로 합성하여 하나의 오디오로 재생합니다.
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
              {audioInfo && (
                <button
                  type="button"
                  onClick={handlePlay}
                  className="w-full mt-2 px-4 py-2 rounded text-sm bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  재생
                </button>
              )}
            </div>
          </div>
        </div>
        {error && <div className="mt-3 text-sm text-red-300 whitespace-pre-wrap">{error}</div>}
      </section>

      {/* Intermediate structured prompts and voice mapping */}
      <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-3">중간 결과 (TTS 입력)</h2>
        {prompts.length === 0 ? (
          <div className="text-sm text-gray-500">먼저 ‘변환’을 눌러 화자/네레이션을 분리하세요.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">매핑 방식</label>
                <select className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm" value={mapping} onChange={(e) => setMapping(e.target.value as any)}>
                  <option value="narration_vs_others">Narrator vs Others</option>
                  <option value="alternate">Alternate (교대로 배정)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Speaker A Label</label>
                <input className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm" value={speakerALabel} onChange={(e) => setSpeakerALabel(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Speaker B Label</label>
                <input className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm" value={speakerBLabel} onChange={(e) => setSpeakerBLabel(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Voice A</label>
                  <select className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm" value={voiceAName} onChange={(e) => setVoiceAName(e.target.value as any)}>
                    {ALL_VOICES.map(v => <option key={`A-${v}`} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Voice B</label>
                  <select className="w-full bg-[#1f1f1f] border border-white/10 rounded p-2 text-sm" value={voiceBName} onChange={(e) => setVoiceBName(e.target.value as any)}>
                    {ALL_VOICES.map(v => <option key={`B-${v}`} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

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

      <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">결과</h2>
        {audioInfo ? (
          <div className="text-xs text-gray-400">
            <div>Sample rate: {audioInfo.sampleRate} Hz</div>
            <div>Channels: {audioInfo.numChannels}</div>
            <div>Format: {audioInfo.sampleFormat}</div>
          </div>
        ) : segments.length > 0 ? (
          <div>
            <div className="text-xs text-gray-400 mb-2">세그먼트 수: {segments.length}개</div>
            <button
              type="button"
              onClick={handlePlaySegments}
              className={`px-4 py-2 rounded text-sm ${!playingSegments ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-600/40 text-white/70 cursor-not-allowed'}`}
              disabled={playingSegments}
            >
              {playingSegments ? '재생 중…' : '세그먼트 재생'}
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-500">아직 결과가 없습니다. 텍스트를 입력하고 ‘변환’ 후 ‘합성’을 눌러보세요.</div>
        )}
      </section>
    </div>
  );
};
export default MultiVoiceReaderPage;
