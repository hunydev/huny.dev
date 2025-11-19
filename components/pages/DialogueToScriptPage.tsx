import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ApiProviderBadge, ErrorMessage, LoadingButton, PlaygroundGuideModal } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';
import { useFfmpeg } from '../../hooks/useFfmpeg';

const LANG_HINTS = [
  { value: 'auto', label: '자동 감지' },
  { value: 'ko', label: '한국어' },
  { value: 'en', label: '영어' },
  { value: 'ja', label: '일본어' },
  { value: 'zh', label: '중국어' },
];

const SPEAKER_COLORS = [
  { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-300', ring: 'focus:ring-blue-400/50' },
  { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-300', ring: 'focus:ring-purple-400/50' },
  { border: 'border-green-500', bg: 'bg-green-500/10', text: 'text-green-300', ring: 'focus:ring-green-400/50' },
  { border: 'border-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-300', ring: 'focus:ring-orange-400/50' },
  { border: 'border-pink-500', bg: 'bg-pink-500/10', text: 'text-pink-300', ring: 'focus:ring-pink-400/50' },
  { border: 'border-cyan-500', bg: 'bg-cyan-500/10', text: 'text-cyan-300', ring: 'focus:ring-cyan-400/50' },
  { border: 'border-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-300', ring: 'focus:ring-yellow-400/50' },
  { border: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-300', ring: 'focus:ring-red-400/50' },
];

type TranscriptSegment = {
  id: string;
  text: string;
  start: number;
  end: number;
  speaker?: string;
};

type DialogueToScriptResponse = {
  summary?: string;
  duration?: number;
  language?: string;
  segments: TranscriptSegment[];
  speakers?: string[];
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatTime = (seconds?: number) => {
  if (!Number.isFinite(seconds) || (seconds ?? 0) < 0) {
    return '00:00';
  }
  const totalSeconds = Math.floor(seconds!);
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const DialogueToScriptPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const playgroundGuide = usePlaygroundGuide('dialogue-to-script', isActiveTab);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [languageHint, setLanguageHint] = React.useState('auto');
  const [summary, setSummary] = React.useState('');
  const [segments, setSegments] = React.useState<TranscriptSegment[]>([]);
  const [speakers, setSpeakers] = React.useState<string[]>([]);
  const [duration, setDuration] = React.useState(0);
  const [detectedLanguage, setDetectedLanguage] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selectedSegmentId, setSelectedSegmentId] = React.useState<string | null>(null);
  const ffmpeg = useFfmpeg();
  const [shouldUseAudioOnly, setShouldUseAudioOnly] = React.useState(true);
  const segmentRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  const api = useApiCall<DialogueToScriptResponse>({
    url: '/api/dialogue-to-script',
    method: 'POST',
    tabId: 'dialogue-to-script',
    isActiveTab,
    apiTask,
    onSuccess: data => {
      setSummary(data?.summary ?? '');
      setSegments(Array.isArray(data?.segments) ? data!.segments : []);
      setSpeakers(Array.isArray(data?.speakers) ? data!.speakers : []);
      setDuration(typeof data?.duration === 'number' ? data!.duration : 0);
      setDetectedLanguage(data?.language ? data.language.toUpperCase() : '');
      setSelectedSegmentId(null);
    },
  });

  // Speaker color mapping
  const speakerColorMap = React.useMemo(() => {
    const map = new Map<string, typeof SPEAKER_COLORS[0]>();
    speakers.forEach((speaker, idx) => {
      map.set(speaker, SPEAKER_COLORS[idx % SPEAKER_COLORS.length]);
    });
    return map;
  }, [speakers]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = e.target.files?.[0] ?? null;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(nextFile);
    setSummary('');
    setSegments([]);
    setSpeakers([]);
    setDetectedLanguage('');
    setDuration(0);
    setSearch('');
    setSelectedSegmentId(null);

    if (nextFile) {
      const url = URL.createObjectURL(nextFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('');
    }
  };

  const handleTranscribe = async () => {
    if (!file) {
      return;
    }

    const form = new FormData();

    let fileToUpload: File = file;
    if (shouldUseAudioOnly && ffmpeg.ready) {
      try {
        const audioFile = await ffmpeg.convertVideoToAudio(file);
        if (audioFile) {
          console.log(`🎵 FFmpeg 변환 성공: ${file.size} → ${audioFile.size} bytes`);
          fileToUpload = audioFile;
        }
      } catch (err) {
        console.warn('FFmpeg 변환 실패, 원본 비디오 전송으로 대체', err);
      }
    }

    form.append('video', fileToUpload);
    if (languageHint && languageHint !== 'auto') {
      form.append('language', languageHint);
    }

    await api.execute({ body: form });
  };

  const handleSegmentJump = (segment: TranscriptSegment) => {
    setSelectedSegmentId(segment.id);
    if (videoRef.current) {
      try {
        videoRef.current.currentTime = segment.start;
        videoRef.current.focus();
      } catch {
        // ignore
      }
    }
  };

  const scrollToSegment = (segmentId: string) => {
    const element = segmentRefs.current.get(segmentId);
    if (element && scrollContainerRef.current) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleVideoTimeUpdate = React.useCallback(() => {
    if (!videoRef.current || segments.length === 0) return;
    const currentTime = videoRef.current.currentTime;
    const currentSegment = segments.find(
      seg => currentTime >= seg.start && currentTime <= seg.end
    );
    if (currentSegment && currentSegment.id !== selectedSegmentId) {
      setSelectedSegmentId(currentSegment.id);
      scrollToSegment(currentSegment.id);
    }
  }, [segments, selectedSegmentId]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.addEventListener('timeupdate', handleVideoTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleVideoTimeUpdate);
    };
  }, [handleVideoTimeUpdate]);

  const hasResult = segments.length > 0;

  const normalizedSearch = search.trim().toLowerCase();
  const filteredSegments = React.useMemo(() => {
    if (!normalizedSearch) return segments;
    const re = new RegExp(escapeRegExp(normalizedSearch), 'i');
    return segments.filter(seg => re.test(seg.text) || (seg.speaker && re.test(seg.speaker)));
  }, [segments, normalizedSearch]);

  const highlightText = (text: string) => {
    if (!normalizedSearch) return text;
    const parts = text.split(new RegExp(`(${escapeRegExp(normalizedSearch)})`, 'gi'));
    return parts.map((part, idx) =>
      part.toLowerCase() === normalizedSearch ? (
        <mark key={idx} className="bg-yellow-400/30 text-white rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleReset = () => {
    setFile(null);
    setSummary('');
    setSegments([]);
    setSpeakers([]);
    setDetectedLanguage('');
    setDuration(0);
    setSearch('');
    setSelectedSegmentId(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-indigo-300">
            <Icon name="dialogueToScript" className="w-6 h-6" aria-hidden />
          </span>
          Dialogue to Script
        </h1>
        <p className="mt-2 text-sm text-gray-400 max-w-3xl">
          영상 속 대화를 화자별로 분리하여 전사합니다. 각 화자의 발화가 색상으로 구분되어 표시됩니다.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <ApiProviderBadge provider="openai" />
          <button
            type="button"
            onClick={playgroundGuide.openGuide}
            className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1.5"
          >
            <Icon name="helpCircle" className="w-4 h-4" />
            사용 가이드
          </button>
        </div>
      </header>

      <PlaygroundGuideModal isOpen={playgroundGuide.isModalOpen} onClose={playgroundGuide.closeGuide} guideId="dialogue-to-script" />

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-4 space-y-4">
        <div>
          <label htmlFor="dialogue-video-input" className="block text-sm font-semibold text-white mb-2">
            비디오 업로드
          </label>
          <input
            id="dialogue-video-input"
            type="file"
            accept="video/*,audio/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-white/10 file:text-gray-200 hover:file:bg-white/20"
          />
          <p className="mt-1.5 text-xs text-gray-500">MP4, MOV, WAV 등 지원. 권장 파일 크기: 60MB 이하.</p>
        </div>

        <div>
          <label htmlFor="dialogue-language-hint" className="block text-sm font-semibold text-white mb-2">
            언어 힌트 (선택)
          </label>
          <select
            id="dialogue-language-hint"
            value={languageHint}
            onChange={e => setLanguageHint(e.target.value)}
            className="block w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm focus:border-white/30 focus:outline-none"
          >
            {LANG_HINTS.map(hint => (
              <option key={hint.value} value={hint.value}>
                {hint.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <LoadingButton
            onClick={handleTranscribe}
            disabled={!file || api.loading}
            loading={api.loading}
            className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            전사 시작
          </LoadingButton>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-sm rounded border border-white/15 text-gray-200 hover:bg-white/10"
            disabled={!file && segments.length === 0}
          >
            초기화
          </button>
        </div>
        <ErrorMessage error={api.error} />
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-white/10 bg-white/[0.03] p-4 space-y-4 flex flex-col max-h-[700px]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">비디오 미리보기</h2>
            {detectedLanguage && (
              <span className="text-xs rounded-full border border-white/15 px-2 py-0.5 text-gray-300">
                감지 언어: {detectedLanguage}
              </span>
            )}
          </div>
          {previewUrl ? (
            <video
              ref={videoRef}
              controls
              src={previewUrl}
              className="w-full rounded border border-white/10 bg-black"
              preload="metadata"
            />
          ) : (
            <div className="flex h-52 items-center justify-center rounded border border-dashed border-white/15 text-sm text-gray-500">
              업로드한 비디오가 여기 표시됩니다.
            </div>
          )}
          {summary ? (
            <div className="rounded-md border border-white/10 bg-black/30 p-3">
              <h3 className="text-xs font-semibold text-white">자동 요약</h3>
              <p className="mt-1 text-sm text-gray-300 whitespace-pre-wrap">{summary}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-500">전사 후 핵심 내용 요약이 표시됩니다.</p>
          )}
          {hasResult && (
            <>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded border border-white/10 bg-black/30 p-3">
                  <dt className="text-xs text-gray-400">총 길이</dt>
                  <dd className="text-white text-lg font-semibold">{formatTime(duration)}</dd>
                </div>
                <div className="rounded border border-white/10 bg-black/30 p-3">
                  <dt className="text-xs text-gray-400">대화 구간</dt>
                  <dd className="text-white text-lg font-semibold">{segments.length}</dd>
                </div>
              </dl>
              {speakers.length > 0 && (
                <div className="rounded border border-white/10 bg-black/30 p-3">
                  <h3 className="text-xs font-semibold text-white mb-2">화자 ({speakers.length}명)</h3>
                  <div className="flex flex-wrap gap-2">
                    {speakers.map(speaker => {
                      const colors = speakerColorMap.get(speaker);
                      return (
                        <span
                          key={speaker}
                          className={`text-xs rounded-full border px-3 py-1 ${colors?.border || 'border-white/15'} ${colors?.bg || 'bg-white/5'} ${colors?.text || 'text-gray-300'}`}
                        >
                          {speaker}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="rounded-md border border-white/10 bg-white/[0.03] p-4 flex flex-col max-h-[700px]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">대화 스크립트</h2>
              <p className="text-xs text-gray-500">문장을 검색하고 클릭하면 해당 시점으로 즉시 이동합니다.</p>
            </div>
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-gray-400">
              <span aria-hidden className="text-white/70">🔍</span>
              <span>{normalizedSearch ? `${filteredSegments.length}개 매칭` : '검색어를 입력해 보세요'}</span>
            </div>
          </div>

          <div className="mt-3">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="키워드, 문장, 화자 등을 검색"
              className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm focus:border-white/30 focus:outline-none"
            />
          </div>

          <div className="mt-4 flex-1 overflow-hidden">
            {hasResult ? (
              <div ref={scrollContainerRef} className="h-full overflow-y-auto pr-1 space-y-3">
                {filteredSegments.length === 0 ? (
                  <p className="text-sm text-gray-500">검색 결과가 없습니다.</p>
                ) : (
                  filteredSegments.map(segment => {
                    const colors = segment.speaker ? speakerColorMap.get(segment.speaker) : undefined;
                    const isSelected = selectedSegmentId === segment.id;
                    return (
                      <button
                        key={segment.id}
                        ref={el => {
                          if (el) {
                            segmentRefs.current.set(segment.id, el);
                          } else {
                            segmentRefs.current.delete(segment.id);
                          }
                        }}
                        type="button"
                        onClick={() => handleSegmentJump(segment)}
                        className={`w-full text-left rounded border px-3 py-3 transition focus:outline-none focus:ring-2 ${
                          isSelected
                            ? `${colors?.border || 'border-blue-500'} ${colors?.bg || 'bg-blue-500/10'}`
                            : 'border-white/10 hover:border-white/30'
                        } ${colors?.ring || 'focus:ring-blue-400/50'}`}
                      >
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>
                            {formatTime(segment.start)} — {formatTime(segment.end)}
                          </span>
                          {segment.speaker && (
                            <span className={`font-semibold ${colors?.text || 'text-blue-300'}`}>
                              {segment.speaker}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-100 leading-relaxed">{highlightText(segment.text)}</p>
                      </button>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                전사 결과가 아직 없습니다.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DialogueToScriptPage;
