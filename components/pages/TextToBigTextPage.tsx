import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, ApiProviderBadge, PlaygroundGuideModal } from '../ui';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';
import { downloadCanvasAsImage } from '../../utils/download';

const TextToBigTextPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  // State
  const [sourceText, setSourceText] = React.useState<string>('');
  const [paddingText, setPaddingText] = React.useState<string>('');
  const [bigText, setBigText] = React.useState<string>('');
  const [fontFamily, setFontFamily] = React.useState<string>('Arial');
  const [initialFontSize, setInitialFontSize] = React.useState<number>(100);
  const [resultText, setResultText] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState<boolean>(false);
  
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = React.useRef<HTMLCanvasElement>(null);

  // Playground 가이드 훅
  const playgroundGuide = usePlaygroundGuide('text-to-big-text', isActiveTab);

  // 라인 브레이킹 문자를 스페이스로 치환
  const normalizeText = (text: string): string => {
    return text.replace(/[\r\n]/g, ' ');
  };

  // Canvas에 Big Text 렌더링 및 픽셀 데이터 추출
  const generateBigText = async () => {
    if (!sourceText.trim()) {
      setError('소스 텍스트를 입력해주세요.');
      return;
    }
    
    if (!bigText.trim()) {
      setError('Big Text를 입력해주세요.');
      return;
    }

    setError(null);
    setProcessing(true);
    
    try {
      const normalizedSource = normalizeText(sourceText);
      const normalizedPadding = normalizeText(paddingText);
      
      // 폰트 크기를 조정하면서 충분한 검은 픽셀을 확보
      let fontSize = initialFontSize;
      let pixelMap: { isBlack: boolean; x: number; y: number }[] = [];
      let attempts = 0;
      const maxAttempts = 50;
      
      while (attempts < maxAttempts) {
        pixelMap = extractPixelMap(bigText, fontSize, fontFamily);
        
        // 검은색 픽셀 수 카운트
        const blackPixelCount = pixelMap.filter(p => p.isBlack).length;
        
        // 검은색 픽셀 수가 소스 텍스트보다 많으면 성공
        if (blackPixelCount >= normalizedSource.length) {
          break;
        }
        
        // 폰트 크기를 증가시켜 재시도
        fontSize += 20;
        attempts++;
      }
      
      if (pixelMap.length === 0) {
        setError(`Big Text를 렌더링할 수 없습니다. Big Text: "${bigText}"가 너무 작거나 비어있습니다.`);
        setProcessing(false);
        return;
      }
      
      const blackPixelCount = pixelMap.filter(p => p.isBlack).length;
      if (blackPixelCount === 0) {
        setError(`Big Text "${bigText}"에 검은색 픽셀이 없습니다. 다른 텍스트를 시도해보세요.`);
        setProcessing(false);
        return;
      }
      
      // 소스 텍스트를 검은색 픽셀에 매핑
      let result = '';
      let sourceIndex = 0;
      
      // 픽셀 맵을 행별로 정렬
      pixelMap.sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
      });
      
      // 소스 텍스트를 순차적으로 삽입
      let currentY = -1;
      for (let i = 0; i < pixelMap.length; i++) {
        const pixel = pixelMap[i];
        
        // 새로운 줄 시작
        if (pixel.y !== currentY) {
          if (currentY !== -1) {
            result += '\n';
          }
          currentY = pixel.y;
        }
        
        // 검은색 픽셀에는 소스 텍스트/패딩 텍스트 삽입
        if (pixel.isBlack) {
          // 소스 텍스트가 남아있으면 삽입
          if (sourceIndex < normalizedSource.length) {
            result += normalizedSource[sourceIndex];
            sourceIndex++;
          } else {
            // 패딩 텍스트로 채우기
            if (normalizedPadding) {
              const paddingIndex = (sourceIndex - normalizedSource.length) % normalizedPadding.length;
              result += normalizedPadding[paddingIndex];
              sourceIndex++;
            } else {
              result += '.';
            }
          }
        } else {
          // 흰색 영역은 공백으로
          result += ' ';
        }
      }
      
      setResultText(result);
      
      // 결과를 캔버스에 렌더링
      renderResultToCanvas(result, fontSize, fontFamily);
      
      // Big Text 원본을 displayCanvas에 복사
      copyCanvasToDisplay();
      
    } catch (err: any) {
      setError(err?.message || '처리 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  // Canvas에 텍스트를 그리고 픽셀 맵 추출
  const extractPixelMap = (text: string, fontSize: number, font: string): { isBlack: boolean; x: number; y: number }[] => {
    const canvas = canvasRef.current;
    if (!canvas) return [];
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [];
    
    // 캔버스 크기 설정 (큰 텍스트를 담기 위해 충분히 크게)
    canvas.width = 2400;
    canvas.height = 1200;
    
    // 배경을 흰색으로
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 텍스트 스타일 설정 (bold로 두껍게)
    ctx.fillStyle = 'black';
    ctx.font = `bold ${fontSize}px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 텍스트 렌더링
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // 픽셀 데이터 추출
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Big Text의 바운딩 박스 찾기
    let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
    const step = 3; // 픽셀 샘플링 간격 (성능 개선)
    let hasBlackPixel = false;
    
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const index = (y * canvas.width + x) * 4;
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        
        // 검은색 픽셀인 경우 바운딩 박스 업데이트 (더 관대한 임계값)
        if (r + g + b < 200 * 3) {
          hasBlackPixel = true;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    // 검은색 픽셀이 없으면 빈 배열 반환
    if (!hasBlackPixel) return [];
    
    // 바운딩 박스 내의 모든 픽셀 추출 (검은색/흰색 모두)
    const pixelMap: { isBlack: boolean; x: number; y: number }[] = [];
    for (let y = minY; y <= maxY; y += step) {
      for (let x = minX; x <= maxX; x += step) {
        const index = (y * canvas.width + x) * 4;
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        
        const isBlack = r + g + b < 200 * 3;
        pixelMap.push({ isBlack, x, y });
      }
    }
    
    return pixelMap;
  };

  // Big Text Canvas를 Display Canvas에 복사
  const copyCanvasToDisplay = () => {
    const sourceCanvas = canvasRef.current;
    const displayCanvas = displayCanvasRef.current;
    
    if (!sourceCanvas || !displayCanvas) return;
    
    displayCanvas.width = sourceCanvas.width;
    displayCanvas.height = sourceCanvas.height;
    
    const ctx = displayCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(sourceCanvas, 0, 0);
  };

  // 결과 텍스트를 캔버스에 렌더링
  const renderResultToCanvas = (text: string, fontSize: number, font: string) => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const lines = text.split('\n');
    const monoFontSize = 10; // 고정폭 폰트 크기
    const charWidth = monoFontSize * 0.6; // 고정폭 문자 너비
    const lineHeight = monoFontSize * 1.2; // 줄 높이
    
    // 캔버스 크기 계산
    const maxLineLength = Math.max(...lines.map(line => line.length));
    canvas.width = Math.max(800, maxLineLength * charWidth + 20);
    canvas.height = Math.max(400, lines.length * lineHeight + 20);
    
    // 배경을 흰색으로
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 텍스트 스타일 설정 (고정폭 폰트, 한글 지원)
    ctx.fillStyle = 'black';
    ctx.font = `${monoFontSize}px "Courier New", Consolas, monospace`;
    ctx.textBaseline = 'top';
    
    // 각 줄 렌더링
    lines.forEach((line, i) => {
      ctx.fillText(line, 10, i * lineHeight + 10);
    });
  };

  // 텍스트 복사
  const handleCopyText = async () => {
    if (!resultText) {
      setError('복사할 결과가 없습니다.');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(resultText);
      setError('텍스트가 클립보드에 복사되었습니다.');
      setTimeout(() => setError(null), 2000);
    } catch (err) {
      setError('클립보드 복사에 실패했습니다.');
    }
  };

  // 이미지 다운로드
  const handleDownloadImage = () => {
    const canvas = resultCanvasRef.current;
    if (!canvas) {
      setError('다운로드할 이미지가 없습니다.');
      return;
    }
    
    downloadCanvasAsImage(canvas, `text-to-big-text-${Date.now()}.png`);
  };

  // 초기화
  const resetAll = () => {
    setSourceText('');
    setPaddingText('');
    setBigText('');
    setInitialFontSize(100);
    setResultText('');
    setError(null);
    setProcessing(false);
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <Icon name="textMorph" className="w-6 h-6" />
          </span>
          Text to Big Text
          <button
            type="button"
            onClick={playgroundGuide.openGuide}
            className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
            aria-label="사용 가이드 보기"
            title="사용 가이드 보기"
          >
            ?
          </button>
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          입력한 텍스트를 대형 텍스트 형태의 아스키 아트로 변환합니다. 소스 텍스트가 Big Text의 글자 영역을 채웁니다.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            클라이언트 전용
          </span>
        </div>
      </header>

      {/* Playground 가이드 모달 */}
      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="Text to Big Text"
        playgroundId="text-to-big-text"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

      {/* 입력 섹션 */}
      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            소스 텍스트 (Big Text를 채울 텍스트)
          </label>
          <textarea
            rows={4}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Big Text 형태로 표현할 텍스트를 입력하세요..."
            className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-sm resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            패딩 텍스트 (부족한 영역을 채울 텍스트, 선택사항)
          </label>
          <input
            type="text"
            value={paddingText}
            onChange={(e) => setPaddingText(e.target.value)}
            placeholder="예: . , - 등"
            className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Big Text (큰 글자로 표현할 텍스트)
          </label>
          <input
            type="text"
            value={bigText}
            onChange={(e) => setBigText(e.target.value)}
            placeholder="예: HELLO"
            className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              폰트
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-sm"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Georgia">Georgia</option>
              <option value="Verdana">Verdana</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Impact">Impact</option>
              <option value="Trebuchet MS">Trebuchet MS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              초기 폰트 크기 (px)
            </label>
            <input
              type="number"
              min="50"
              max="500"
              step="10"
              value={initialFontSize}
              onChange={(e) => setInitialFontSize(Number(e.target.value))}
              className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <LoadingButton
            loading={processing}
            disabled={!sourceText.trim() || !bigText.trim()}
            onClick={generateBigText}
            loadingText="생성 중..."
            idleText="생성"
            variant="primary"
          />
          <LoadingButton
            loading={false}
            onClick={resetAll}
            loadingText=""
            idleText="초기화"
            variant="secondary"
          />
          {error && <ErrorMessage error={error} />}
        </div>
      </section>

      {/* 숨겨진 Canvas (픽셀 추출용 - 항상 DOM에 존재해야 함) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Big Text Canvas (비교용) */}
      {resultText && (
        <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
          <h2 className="text-sm font-medium text-white mb-2">Big Text (원본)</h2>
          <div className="p-3 rounded bg-white border border-white/10 flex items-center justify-center overflow-auto">
            <canvas ref={displayCanvasRef} className="max-w-full" style={{ imageRendering: 'crisp-edges' }} />
          </div>
        </section>
      )}

      {/* 결과 섹션 */}
      {resultText && (
        <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-white">결과 (Text로 구성된 Big Text)</h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopyText}
                className="px-3 py-1.5 text-xs rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 transition"
              >
                텍스트 복사
              </button>
              <button
                onClick={handleDownloadImage}
                className="px-3 py-1.5 text-xs rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 transition"
              >
                PNG 다운로드
              </button>
            </div>
          </div>
          
          {/* 텍스트 결과 */}
          <div className="mt-3 p-3 rounded bg-black/40 border border-white/10 overflow-x-auto">
            <pre 
              className="text-[6px] md:text-[8px] leading-[1] whitespace-pre" 
              style={{ 
                fontFamily: '"Courier New", Consolas, "맑은 고딕", monospace',
                letterSpacing: '0',
                wordSpacing: '0',
                fontFeatureSettings: '"halt"'
              }}
            >
{resultText}
            </pre>
          </div>

          {/* 캔버스 결과 (이미지 다운로드용) */}
          <div className="mt-3">
            <h3 className="text-xs font-medium text-gray-400 mb-2">이미지 미리보기 (PNG 다운로드용)</h3>
            <div className="p-3 rounded bg-white border border-white/10">
              <canvas ref={resultCanvasRef} className="max-w-full" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default TextToBigTextPage;
