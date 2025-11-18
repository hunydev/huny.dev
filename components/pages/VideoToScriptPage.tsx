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

type TranscriptSegment = {
  id: string;
  text: string;
  start: number;
  end: number;
  speaker?: string;
  confidence?: number;
};

type VideoToScriptResponse = {
  summary?: string;
  duration?: number;
  language?: string;
  segments: TranscriptSegment[];
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

const VideoToScriptPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const playgroundGuide = usePlaygroundGuide('video-to-script', isActiveTab);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [languageHint, setLanguageHint] = React.useState('auto');
  const [summary, setSummary] = React.useState('');
  const [segments, setSegments] = React.useState<TranscriptSegment[]>([]);
  const [duration, setDuration] = React.useState(0);
  const [detectedLanguage, setDetectedLanguage] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selectedSegmentId, setSelectedSegmentId] = React.useState<string | null>(null);
  const ffmpeg = useFfmpeg();
  const [shouldUseAudioOnly, setShouldUseAudioOnly] = React.useState(true);

  const api = useApiCall<VideoToScriptResponse>({
    url: '/api/video-to-script',
    method: 'POST',
    tabId: 'video-to-script',
    isActiveTab,
    apiTask,
    onSuccess: data => {
      setSummary(data?.summary ?? '');
      setSegments(Array.isArray(data?.segments) ? data!.segments : []);
      setDuration(typeof data?.duration === 'number' ? data!.duration : 0);
      setDetectedLanguage(data?.language ? data.language.toUpperCase() : '');
      setSelectedSegmentId(null);
    },
  });

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
    setDetectedLanguage('');
    setDuration(0);
    setSearch('');
    setSelectedSegmentId(null);

    if (nextFile) {
      setPreviewUrl(URL.createObjectURL(nextFile));
    } else {
      setPreviewUrl('');
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl('');
    setSummary('');
    setSegments([]);
    setDetectedLanguage('');
    setDuration(0);
    setSearch('');
    setSelectedSegmentId(null);
    api.reset();
  };

  const handleTranscribe = async () => {
    if (!file) {
      api.setError('분석할 비디오 파일을 업로드해 주세요.');
      return;
    }
    const fd = new FormData();
    try {
      let payloadFile: File = file;
      if (shouldUseAudioOnly) {
        const extracted = await ffmpeg.convertVideoToAudio(file).catch(err => {
          console.warn('FFmpeg 변환 실패, 원본 비디오 전송으로 대체', err);
          setShouldUseAudioOnly(false);
          return null;
        });
        if (extracted) {
          payloadFile = extracted;
        }
      }
    fd.append('video', payloadFile);
    if (languageHint !== 'auto') {
      fd.append('language', languageHint);
    }
    setSummary('');
    setSegments([]);
    setDetectedLanguage('');
    setDuration(0);
    setSelectedSegmentId(null);
    await api.execute({ body: fd });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      api.setError(message || '오디오 추출에 실패했습니다.');
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredSegments = React.useMemo(() => {
    if (!normalizedSearch) return segments;
    return segments.filter(seg => seg.text.toLowerCase().includes(normalizedSearch));
  }, [segments, normalizedSearch]);

  const highlightText = React.useCallback(
    (text: string) => {
      if (!normalizedSearch) return text;
      const regex = new RegExp(`(${escapeRegExp(normalizedSearch)})`, 'ig');
      const parts = text.split(regex);
      return parts.map((part, idx) => {
        if (part.toLowerCase() === normalizedSearch) {
          return (
            <mark key={`${part}-${idx}`} className="bg-amber-400/40 text-white px-0.5 rounded">
              {part}
            </mark>
          );
        }
        return <React.Fragment key={`${part}-${idx}`}>{part}</React.Fragment>;
      });
    },
    [normalizedSearch],
  );

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

  const hasResult = segments.length > 0;

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-indigo-300">
            <Icon name="videoToScript" className="w-6 h-6" aria-hidden />
          </span>
          Video to Script
          <button
            type="button"
            onClick={playgroundGuide.openGuide}
            className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
            aria-label="사용 가이드 보기"
          >
            ?
          </button>
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          비디오를 업로드하면 OpenAI Whisper가 음성을 전사하고, 각 스크립트 구간을 타임라인과 연결해 줍니다. 원하는 문장을 검색하고 클릭하면 해당 구간으로 바로 이동할 수 있습니다.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <ApiProviderBadge provider="openai" />
          <span className="text-xs text-gray-500">사용자 OpenAI 키 필수 · mp4/quicktime/webm 지원</span>
        </div>
      </header>

      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="Video to Script"
        playgroundId="video-to-script"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-4 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex-1 space-y-3">
            <label className="text-xs text-gray-400">비디오 파일</label>
            <label className="flex flex-col gap-2 rounded border border-dashed border-white/20 bg-black/20 px-4 py-6 text-center hover:border-white/40 cursor-pointer">
              <input type="file" accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/*" className="hidden" onChange={handleFileChange} />
              <Icon name="video" className="mx-auto h-8 w-8 text-gray-400" aria-hidden />
              <div className="text-sm text-gray-200">
                {file ? file.name : '클릭하거나 드롭하여 비디오를 업로드하세요'}
              </div>
              <p className="text-xs text-gray-500">최대 60MB · 30분 이내 권장</p>
            </label>
          </div>
          <div className="w-full lg:w-64 space-y-3">
            <label className="text-xs text-gray-400" htmlFor="language-hint">
              언어 힌트
            </label>
            <select
              id="language-hint"
              value={languageHint}
              onChange={e => setLanguageHint(e.target.value)}
              className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm focus:border-white/30 focus:outline-none"
            >
              {LANG_HINTS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="rounded border border-blue-400/30 bg-blue-400/10 px-3 py-2 text-xs text-blue-100">
              <p>언어를 지정하면 전사 품질이 향상됩니다. 불확실하다면 "자동 감지"를 사용하세요.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <LoadingButton
            onClick={handleTranscribe}
            loading={api.loading}
            disabled={!file}
            loadingText="전사 중…"
            idleText="Transcribe"
            variant="primary"
          />
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
        <section className="rounded-md border border-white/10 bg-white/[0.03] p-4 space-y-4">
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
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded border border-white/10 bg-black/30 p-3">
                <dt className="text-xs text-gray-400">총 길이</dt>
                <dd className="text-white text-lg font-semibold">{formatTime(duration)}</dd>
              </div>
              <div className="rounded border border-white/10 bg-black/30 p-3">
                <dt className="text-xs text-gray-400">스크립트 구간</dt>
                <dd className="text-white text-lg font-semibold">{segments.length}</dd>
              </div>
            </dl>
          )}
        </section>

        <section className="rounded-md border border-white/10 bg-white/[0.03] p-4 flex flex-col">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">스크립트 & 타임라인</h2>
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
              <div className="h-full overflow-y-auto pr-1 space-y-3">
                {filteredSegments.length === 0 ? (
                  <p className="text-sm text-gray-500">검색 결과가 없습니다.</p>
                ) : (
                  filteredSegments.map(segment => (
                    <button
                      key={segment.id}
                      type="button"
                      onClick={() => handleSegmentJump(segment)}
                      className={`w-full text-left rounded border px-3 py-3 transition focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
                        selectedSegmentId === segment.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>
                          {formatTime(segment.start)} — {formatTime(segment.end)}
                        </span>
                        {segment.speaker ? <span className="text-blue-300">{segment.speaker}</span> : null}
                      </div>
                      <p className="mt-1 text-sm text-gray-100 leading-relaxed">{highlightText(segment.text)}</p>
                      {typeof segment.confidence === 'number' && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-gray-400">
                          신뢰도 {(segment.confidence * 100).toFixed(1)}%
                        </span>
                      )}
                    </button>
                  ))
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

export default VideoToScriptPage;
