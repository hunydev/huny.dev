import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { useFfmpeg } from '../../hooks/useFfmpeg';
import { useApiCall } from '../../hooks/useApiCall';

interface AnalysisResult {
  recognizedText: string;
  words: Array<{ word: string; start: number; end: number }>;
  levenshtein: {
    distance: number;
    similarity: number;
  };
  cer: {
    substitutions: number;
    deletions: number;
    insertions: number;
    rate: number;
    matchRate: number;
  };
  wer: {
    substitutions: number;
    deletions: number;
    insertions: number;
    rate: number;
    matchRate: number;
  };
  diff: Array<{
    type: 'equal' | 'insert' | 'delete' | 'replace';
    oldText?: string;
    newText?: string;
  }>;
}

const ReadMatchPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [audioFile, setAudioFile] = React.useState<File | null>(null);
  const [audioUrl, setAudioUrl] = React.useState<string>('');
  const [referenceText, setReferenceText] = React.useState('');
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const ffmpeg = useFfmpeg();
  const { data: result, loading, error, execute, reset, setError } = useApiCall<AnalysisResult>({
    url: '/api/read-match',
    method: 'POST',
    tabId: 'read-match',
    apiTask,
    isActiveTab,
  });

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // 이전 URL 해제
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioFile(selectedFile);
    setAudioUrl(URL.createObjectURL(selectedFile));
    reset();
  };

  const handleAnalyze = async () => {
    if (!audioFile) {
      setError('음원 파일을 선택해 주세요.');
      return;
    }
    if (!referenceText.trim()) {
      setError('원형 텍스트를 입력해 주세요.');
      return;
    }

    try {
      let fileToSend = audioFile;

      // FFmpeg로 MP3 변환 시도
      if (ffmpeg.ready && !audioFile.type.includes('mp3')) {
        try {
          console.log('🎵 FFmpeg로 MP3 변환 중...');
          fileToSend = await ffmpeg.convertVideoToAudio(audioFile);
          console.log('✅ MP3 변환 완료');
        } catch (convErr) {
          console.warn('⚠️  FFmpeg 변환 실패, 원본 파일 사용:', convErr);
        }
      }

      const formData = new FormData();
      formData.append('audio', fileToSend);
      formData.append('referenceText', referenceText.trim());

      await execute({ body: formData });
    } catch (err) {
      console.error('분석 오류:', err);
    }
  };

  const handleReset = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl('');
    setReferenceText('');
    reset();
  };

  // 단어 클릭 시 타임스탬프로 점프
  const handleWordClick = (word: string) => {
    if (!result?.words || !audioRef.current) return;

    // 정규화된 단어로 찾기 (소문자 변환만)
    const normalizedWord = word.toLowerCase().trim();
    
    // 원본 words 배열에서 정규화하여 비교
    const matchedWord = result.words.find(w => {
      const normalizedW = w.word.toLowerCase().trim();
      return normalizedW === normalizedWord;
    });

    if (matchedWord) {
      audioRef.current.currentTime = matchedWord.start;
      audioRef.current.play();
    }
  };

  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(2) + '%';
  };

  // 컴포넌트 언마운트 시 URL 해제
  React.useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-indigo-300">
            <Icon name="readMatch" className="w-6 h-6" aria-hidden />
          </span>
          Read Match
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          음원의 텍스트를 인식하고 원형 텍스트와 비교하여 일치율을 분석합니다. Levenshtein Distance, CER, WER 지표를 제공합니다.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-xs text-gray-500">OpenAI Whisper · 정확도 분석</span>
        </div>
      </header>

      <main className="space-y-6">
        {(audioFile || referenceText || result) && (
          <div className="flex justify-end">
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              초기화
            </button>
          </div>
        )}

        {/* 음원 업로드 */}
        <section className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">음원 파일 업로드</h2>
          <div className="space-y-4">
            <input
              type="file"
              accept="audio/*,video/*"
              onChange={handleAudioChange}
              disabled={loading}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {audioFile && (
              <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm">
                <p className="text-gray-300">
                  <span className="font-medium">선택된 파일:</span> {audioFile.name}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  크기: {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 원형 텍스트 입력 */}
        <section className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">원형 텍스트 입력</h2>
          <textarea
            value={referenceText}
            onChange={(e) => setReferenceText(e.target.value)}
            disabled={loading}
            placeholder="비교할 원형 텍스트를 입력하세요..."
            className="w-full h-32 px-4 py-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="mt-2 text-xs text-gray-500">
            문자 수: {referenceText.length}
          </p>
        </section>

        {/* 분석 버튼 */}
        {audioFile && referenceText && !result && (
          <div className="flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Icon name="loader" className="animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Icon name="readMatch" />
                  분석 시작
                </>
              )}
            </button>
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* 분석 결과 */}
        {result && (
          <>
            {/* 음원 재생 */}
            {audioUrl && (
              <section className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">음원 재생</h2>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  className="w-full"
                  style={{
                    filter: 'invert(0.9) hue-rotate(180deg)',
                    borderRadius: '8px',
                  }}
                />
              </section>
            )}

            {/* 인식된 텍스트 */}
            <section className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">인식된 텍스트</h2>
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                <p className="text-gray-300 whitespace-pre-wrap">{result.recognizedText}</p>
              </div>
            </section>

            {/* 일치율 지표 - WER 기준 */}
            <section className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">일치율 (WER 기준)</h2>
              <div className="flex justify-center">
                <div className="p-8 bg-gradient-to-br from-purple-900/40 to-purple-800/30 rounded-xl border-2 border-purple-600/70 max-w-md w-full">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Icon name="readMatch" className="w-8 h-8 text-purple-300" />
                    <h3 className="text-xl font-bold text-white">단어 일치율 (WER)</h3>
                  </div>
                  <p className="text-6xl font-bold text-purple-200 text-center mb-4">
                    {formatPercentage(result.wer.matchRate)}
                  </p>
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-300">
                      오류율: <span className="font-semibold">{formatPercentage(result.wer.rate)}</span>
                    </p>
                    <div className="flex justify-center gap-4 text-xs text-gray-400">
                      <span>치환: {result.wer.substitutions}</span>
                      <span>삭제: {result.wer.deletions}</span>
                      <span>삽입: {result.wer.insertions}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 부가 지표 */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CER */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-white">CER (문자 오류율)</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-300 mb-1">
                    {formatPercentage(result.cer.matchRate)}
                  </p>
                  <p className="text-xs text-gray-400">
                    S:{result.cer.substitutions} D:{result.cer.deletions} I:{result.cer.insertions}
                  </p>
                </div>

                {/* Levenshtein */}
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-white">Levenshtein 유사도</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-300 mb-1">
                    {formatPercentage(result.levenshtein.similarity)}
                  </p>
                  <p className="text-xs text-gray-400">
                    편집 거리: {result.levenshtein.distance}
                  </p>
                </div>
              </div>
            </section>

            {/* Diff 시각화 (단어 단위) */}
            <section className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">단어 비교 (Diff)</h2>
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 overflow-x-auto">
                <div className="flex flex-wrap gap-2 text-sm leading-relaxed">
                  {result.diff.map((item, idx) => (
                    <span key={idx} className="inline-block">
                      {item.type === 'equal' && item.oldText && (
                        <button
                          onClick={() => handleWordClick(item.oldText!)}
                          className="text-gray-300 px-1 hover:bg-white/10 rounded cursor-pointer transition-colors"
                          title="클릭하여 재생"
                        >
                          {item.oldText}
                        </button>
                      )}
                      {item.type === 'delete' && (
                        <span className="bg-red-900/50 text-red-300 px-2 py-1 rounded line-through opacity-60 cursor-not-allowed" title="인식되지 않음">
                          {item.oldText}
                        </span>
                      )}
                      {item.type === 'insert' && item.newText && (
                        <button
                          onClick={() => handleWordClick(item.newText!)}
                          className="bg-green-900/50 text-green-300 px-2 py-1 rounded hover:bg-green-900/70 cursor-pointer transition-colors"
                          title="클릭하여 재생"
                        >
                          {item.newText}
                        </button>
                      )}
                      {item.type === 'replace' && (
                        <span className="inline-flex items-center gap-1">
                          <span className="bg-red-900/50 text-red-300 px-2 py-1 rounded line-through opacity-60 cursor-not-allowed" title="인식되지 않음">
                            {item.oldText}
                          </span>
                          <span className="text-gray-600">→</span>
                          {item.newText && (
                            <button
                              onClick={() => handleWordClick(item.newText!)}
                              className="bg-green-900/50 text-green-300 px-2 py-1 rounded hover:bg-green-900/70 cursor-pointer transition-colors"
                              title="클릭하여 재생"
                            >
                              {item.newText}
                            </button>
                          )}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-red-900/50 border border-red-700 rounded"></span>
                  <span>원문에만 존재</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-green-900/50 border border-green-700 rounded"></span>
                  <span>인식된 텍스트에만 존재</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-gray-700 border border-gray-600 rounded"></span>
                  <span>일치</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                  <p className="text-xs text-blue-200">
                    <strong>클릭 가능:</strong> 회색 및 초록색 단어를 클릭하면 해당 시점으로 음원이 재생됩니다.
                  </p>
                </div>
                <div className="p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                  <p className="text-xs text-blue-200">
                    <strong>참고:</strong> 비교 시 대/소문자는 무시됩니다. 단어 단위로 비교하므로 일부 차이가 더 크게 표시될 수 있습니다.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default ReadMatchPage;
