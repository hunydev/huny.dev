import React from 'react';
import { PageProps } from '../../types';
import { Icon } from '../../constants/icons';

type Thumbnail = {
  url: string;
  timestamp: number;
  filename: string;
};

const VideoToGridPage: React.FC<PageProps> = ({ isActiveTab }) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState('');
  const [intervalSec, setIntervalSec] = React.useState(5);
  const [enableScene, setEnableScene] = React.useState(true);
  const [sceneThreshold, setSceneThreshold] = React.useState(0.15);
  const [thumbnails, setThumbnails] = React.useState<Thumbnail[]>([]);
  const [extracting, setExtracting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState('');
  const [selectedThumb, setSelectedThumb] = React.useState<Thumbnail | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const modalVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const hiddenVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const hiddenCanvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setThumbnails([]);
    setError('');
  };

  // 프레임 캡처 함수 (고속 처리)
  const captureFrameAt = async (video: HTMLVideoElement, canvas: HTMLCanvasElement, time: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        video.removeEventListener('seeked', onSeeked);
        reject(new Error('Seek timeout'));
      }, 5000);

      const onSeeked = () => {
        clearTimeout(timeout);
        video.removeEventListener('seeked', onSeeked);
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context 없음'));
        
        canvas.width = Math.floor(video.videoWidth / 4);
        canvas.height = Math.floor(video.videoHeight / 4);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('toBlob 실패'));
          resolve(blob);
        }, 'image/jpeg', 0.7);  // 품질 0.8 → 0.7 (속도 향상)
      };
      
      video.addEventListener('seeked', onSeeked);
      video.pause();              // 반드시 멈춰두고
      video.currentTime = time;   // 원하는 시점으로 점프
    });
  };

  // 두 프레임 간 픽셀 차이 계산 (장면 전환 감지용) - 최적화 버전
  const calculateFrameDifference = (imageData1: ImageData, imageData2: ImageData): number => {
    const data1 = imageData1.data;
    const data2 = imageData2.data;
    let diff = 0;
    
    // 샘플링: 4픽셀마다 1개씩만 비교 (속도 4배 향상, 정확도는 충분)
    for (let i = 0; i < data1.length; i += 16) {  // 4픽셀 * 4채널 = 16
      diff += Math.abs(data1[i] - data2[i]);       // R
      diff += Math.abs(data1[i+1] - data2[i+1]);   // G
      diff += Math.abs(data1[i+2] - data2[i+2]);   // B
    }
    
    // 샘플링 비율 반영하여 정규화
    const sampledPixels = Math.floor(data1.length / 16);
    return diff / (sampledPixels * 3 * 255);
  };

  const handleExtract = async () => {
    if (!file) {
      setError('비디오 파일을 선택해 주세요.');
      return;
    }

    const video = hiddenVideoRef.current;
    const canvas = hiddenCanvasRef.current;
    
    if (!video || !canvas) {
      setError('비디오/캔버스 요소가 준비되지 않았습니다.');
      return;
    }

    setExtracting(true);
    setError('');
    setThumbnails([]);
    setProgress(0);

    try {
      // 비디오 로드 대기
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('비디오 로드 실패'));
        video.src = URL.createObjectURL(file);
      });

      const duration = video.duration;
      const thumbs: Thumbnail[] = [];
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context 없음');

      console.log(`🎬 비디오 길이: ${duration.toFixed(2)}초`);

      if (enableScene) {
        // 장면 전환 감지 모드: 적응형 스캔
        let prevImageData: ImageData | null = null;
        let lastCaptureTime = -intervalSec;
        let t = 0;

        console.log(`🎬 장면 전환 감지 모드 시작 (간격: ${intervalSec}초, 민감도: ${sceneThreshold})`);

        while (t < duration) {
          // 분석용 매우 작은 캔버스 (32x18) - 속도 최적화
          canvas.width = 32;
          canvas.height = 18;
          
          await new Promise<void>((resolve) => {
            let timeout: NodeJS.Timeout;
            const onSeeked = () => {
              clearTimeout(timeout);
              video.removeEventListener('seeked', onSeeked);
              ctx.drawImage(video, 0, 0, 32, 18);
              resolve();
            };
            
            timeout = setTimeout(() => {
              video.removeEventListener('seeked', onSeeked);
              resolve(); // 타임아웃 시에도 계속 진행
            }, 2000);

            video.addEventListener('seeked', onSeeked);
            video.pause();
            video.currentTime = t;
          });

          const currentImageData = ctx.getImageData(0, 0, 32, 18);
          
          // 간격 기반 캡처 체크
          const timeSinceLastCapture = t - lastCaptureTime;
          const shouldCaptureByInterval = timeSinceLastCapture >= intervalSec;
          
          // 장면 전환 체크
          let shouldCaptureByScene = false;
          if (prevImageData && !shouldCaptureByInterval) {
            const diff = calculateFrameDifference(prevImageData, currentImageData);
            shouldCaptureByScene = diff > sceneThreshold;
          }

          if (shouldCaptureByInterval || shouldCaptureByScene) {
            const blob = await captureFrameAt(video, canvas, t);
            const url = URL.createObjectURL(blob);
            thumbs.push({
              url,
              timestamp: t,
              filename: `thumb_${thumbs.length + 1}.jpg`,
            });
            lastCaptureTime = t;
            
            // 캡처 직후에는 빠르게 다음 구간으로 이동 (간격의 80% 점프)
            if (shouldCaptureByInterval) {
              t += intervalSec * 0.8;
            } else {
              t += 1; // 장면 전환 시 1초씩 스캔
            }
          } else {
            // 캡처하지 않으면 빠르게 스캔 (1.5초 점프)
            t += 1.5;
          }

          prevImageData = currentImageData;
          
          // 진행률 업데이트
          setProgress(Math.min(95, Math.floor((t / duration) * 100)));
        }
      } else {
        // 간격 기반 캡처만 (고속 모드)
        console.log(`⚡ 고속 모드 시작 (간격: ${intervalSec}초)`);
        const startTime = Date.now();
        
        for (let t = 0; t < duration; t += intervalSec) {
          const blob = await captureFrameAt(video, canvas, t);
          const url = URL.createObjectURL(blob);
          thumbs.push({
            url,
            timestamp: t,
            filename: `thumb_${thumbs.length + 1}.jpg`,
          });
          
          // 진행률 업데이트
          setProgress(Math.min(95, Math.floor((t / duration) * 100)));
        }
        
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`⚡ 고속 모드 완료: ${elapsed}초 소요`);
      }

      console.log(`🎉 총 ${thumbs.length}개의 썸네일 추출 완료`);
      setProgress(100);
      setThumbnails(thumbs);
      
      // 메모리 정리
      video.src = '';
      video.load();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || '썸네일 추출에 실패했습니다.');
      console.error('썸네일 추출 오류:', err);
    } finally {
      setExtracting(false);
      setProgress(0);
    }
  };

  const handleThumbnailClick = (thumb: Thumbnail) => {
    setSelectedThumb(thumb);
    setShowModal(true);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  };

  React.useEffect(() => {
    if (showModal && modalVideoRef.current && selectedThumb) {
      modalVideoRef.current.currentTime = selectedThumb.timestamp;
      modalVideoRef.current.play().catch(() => {
        // ignore
      });
    }
  }, [showModal, selectedThumb]);

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    thumbnails.forEach(t => URL.revokeObjectURL(t.url));
    setFile(null);
    setPreviewUrl('');
    setThumbnails([]);
    setError('');
    setSelectedThumb(null);
    setShowModal(false);
  };

  const maxSceneThreshold = 0.5; // 픽셀 차이 기반 (0~1 범위)

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-indigo-300">
            <Icon name="videoToGrid" className="w-6 h-6" aria-hidden />
          </span>
          Video to Grid
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          비디오에서 썸네일을 추출하여 그리드로 표시합니다. 원하는 장면을 클릭하면 해당 위치로 바로 이동할 수 있습니다.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-xs text-gray-500">브라우저 네이티브 기능 · 빠르고 가벼움</span>
        </div>
      </header>

      <main className="space-y-6">
        {file && (
          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              초기화
            </button>
          </div>
        )}

        {/* 파일 업로드 */}
        <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">비디오 업로드</h2>
            <div className="space-y-4">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700 file:cursor-pointer"
              />
              {previewUrl && (
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    src={previewUrl}
                    controls
                    className="w-full max-h-80 object-contain"
                  />
                </div>
              )}
            </div>
        </section>

        {/* 옵션 설정 */}
        {file && (
          <section className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-6">
              <h2 className="text-lg font-semibold text-white mb-4">추출 옵션</h2>
              
              {/* 간격 설정 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  캡쳐 간격: {intervalSec}초
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={intervalSec}
                    onChange={(e) => setIntervalSec(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="1"
                    value={intervalSec}
                    onChange={(e) => setIntervalSec(Math.min(10, Math.max(1, Number(e.target.value))))}
                    className="w-20 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 장면 전환 감지 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <input
                    type="checkbox"
                    checked={enableScene}
                    onChange={(e) => setEnableScene(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  장면 전환 감지
                </label>
                {enableScene && (
                  <div className="mt-3">
                    <label className="block text-sm text-gray-400 mb-2">
                      민감도: {sceneThreshold.toFixed(3)} (낮을수록 미세한 변화도 감지)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0.01"
                        max={maxSceneThreshold}
                        step="0.01"
                        value={sceneThreshold}
                        onChange={(e) => setSceneThreshold(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="number"
                        min="0.01"
                        max={maxSceneThreshold}
                        step="0.01"
                        value={sceneThreshold}
                        onChange={(e) => setSceneThreshold(Math.min(maxSceneThreshold, Math.max(0.01, Number(e.target.value))))}
                        className="w-20 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 추출 버튼 */}
              <button
                onClick={handleExtract}
                disabled={extracting}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {extracting ? (
                  <>
                    <Icon name="loader" className="animate-spin" />
                    추출 중... {progress > 0 && `${progress}%`}
                  </>
                ) : (
                  '썸네일 추출'
                )}
              </button>

              {/* 진행률 바 */}
              {extracting && progress > 0 && (
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}
          </section>
        )}

        {/* 그리드 결과 */}
        {thumbnails.length > 0 && (
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">
                추출된 썸네일 ({thumbnails.length}개)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {thumbnails.map((thumb) => (
                  <button
                    key={thumb.filename}
                    onClick={() => handleThumbnailClick(thumb)}
                    className="group relative aspect-video rounded-lg overflow-hidden bg-gray-900 border border-gray-700 hover:border-blue-500 transition-all hover:scale-105"
                  >
                    <img
                      src={thumb.url}
                      alt={`Thumbnail at ${formatTime(thumb.timestamp)}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                      <p className="text-xs text-white font-mono">
                        {formatTime(thumb.timestamp)}
                      </p>
                    </div>
                    <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors flex items-center justify-center">
                      <Icon name="videoToScript" className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
            </div>
          </section>
        )}
      </main>

      {/* 모달 */}
      {showModal && selectedThumb && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {formatTime(selectedThumb.timestamp)}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Icon name="close" className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <video
                ref={modalVideoRef}
                src={previewUrl}
                controls
                className="w-full rounded-lg bg-black"
              />
            </div>
          </div>
        </div>
      )}

      {/* 숨겨진 비디오 및 캔버스 (썸네일 추출용) */}
      <video
        ref={hiddenVideoRef}
        style={{ display: 'none' }}
        preload="metadata"
      />
      <canvas
        ref={hiddenCanvasRef}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default VideoToGridPage;
