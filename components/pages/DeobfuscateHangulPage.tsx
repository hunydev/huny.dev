import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, PlaygroundGuideModal } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

interface DeobfuscationResult {
  original: string;
  deobfuscated: string;
  confidence: number;
  syllableCount: {
    original: number;
    deobfuscated: number;
  };
  detectedPatterns: string[];
  explanation: string;
  alternatives?: string[];
}

interface ApiResponse {
  result: DeobfuscationResult;
}

const DeobfuscateHangulPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [inputText, setInputText] = React.useState<string>('');
  const [result, setResult] = React.useState<DeobfuscationResult | null>(null);
  const [copiedSection, setCopiedSection] = React.useState<string>('');
  
  const playgroundGuide = usePlaygroundGuide('deobfuscate-hangul');

  type Response = ApiResponse;
  const api = useApiCall<Response>({
    url: '/api/deobfuscate-hangul',
    method: 'POST',
    tabId: 'deobfuscate-hangul',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      if (data?.result) {
        setResult(data.result);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      api.setError('난독화된 텍스트를 입력해주세요.');
      return;
    }
    setResult(null);
    await api.execute({
      body: { text: inputText }
    });
  };

  const resetAll = () => {
    setInputText('');
    setResult(null);
    api.setError(null);
  };

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  const renderConfidenceBar = (score: number) => {
    const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-300`} style={{ width: `${score}%` }} />
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        title="Deobfuscate Hangul 사용 가이드"
        content={
          <div className="space-y-4 text-sm text-gray-300">
            <section>
              <h3 className="font-semibold text-white mb-2">🔓 개요</h3>
              <p>
                난독화된 한글을 AI가 분석하여 원래의 한글로 복원합니다.
                연음법칙, 자모 변형, 의미없는 받침 등 다양한 난독화 패턴을 감지하고 해제합니다.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-white mb-2">📋 주요 기능</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>연음법칙 역변환</li>
                <li>중복 받침 제거</li>
                <li>자모 변형 복원 (ㅃ→ㅂ, ㅆ→ㅅ 등)</li>
                <li>의미없는 받침 제거</li>
                <li>음절 수 보존 확인</li>
                <li>신뢰도 점수 제공</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-white mb-2">💡 사용 예시</h3>
              <div className="bg-gray-800 p-3 rounded space-y-2">
                <div>
                  <span className="text-gray-400">입력:</span>
                  <code className="ml-2 text-blue-400">꺜켞 덆삅 캚끳햖 침굴륭왁</code>
                </div>
                <div>
                  <span className="text-gray-400">출력:</span>
                  <code className="ml-2 text-green-400">가격 대비 깨끗한 침구류와</code>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-semibold text-white mb-2">⚙️ 난독화 규칙</h3>
              <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                <li><strong>연음법칙:</strong> 받침이 다음 음절의 초성으로 이동 (책이→채기)</li>
                <li><strong>받침 중복:</strong> 뒤 글자의 초성을 앞 받침으로 복사 (후기를→후길를)</li>
                <li><strong>자모 변형:</strong> 비슷한 발음으로 변환 (방→빵, 숙박→쑥박)</li>
                <li><strong>받침 추가:</strong> 없던 받침을 임의로 추가 (해외여행→햇욍영행)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-white mb-2">⚠️ 유의사항</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>난독화 정도가 심할수록 정확도가 낮아질 수 있습니다</li>
                <li>음절 수가 유지되는지 확인하여 신뢰도를 판단하세요</li>
                <li>여러 대안이 제공되는 경우 문맥을 고려하여 선택하세요</li>
              </ul>
            </section>
          </div>
        }
      />

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Icon name="deobfuscateHangul" className="w-6 h-6 text-purple-400" />
          Deobfuscate Hangul
        </h1>
        <button
          onClick={playgroundGuide.openGuide}
          className="text-gray-400 hover:text-white transition-colors"
          title="사용 가이드"
        >
          <Icon name="help" className="w-5 h-5" />
        </button>
      </div>

      {api.error && <ErrorMessage message={api.error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            난독화된 한글 텍스트
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="예: 꺜켞 덆삅 캚끳햖 침굴륭왁 친쪓핬쒾 샺쨯뉨 덕분넹 쨜 쉳탸 갑닍다."
            className="w-full bg-gray-900 text-gray-200 rounded-lg p-3 min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={api.loading}
          />
          <div className="text-xs text-gray-500">
            음절 수: {inputText.replace(/\s/g, '').length}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={api.loading || !inputText.trim()}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {api.loading ? '복원 중...' : '난독화 해제'}
          </button>
          <button
            type="button"
            onClick={resetAll}
            disabled={api.loading}
            className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 px-4 py-2 rounded-lg transition-colors"
          >
            초기화
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-4">
          {/* 복원된 텍스트 */}
          <section className="bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Icon name="check" className="w-5 h-5 text-green-400" />
                복원된 텍스트
              </h2>
              <button
                onClick={() => handleCopy(result.deobfuscated, 'deobfuscated')}
                className="text-gray-400 hover:text-white transition-colors p-1"
                title="복사"
              >
                <Icon name={copiedSection === 'deobfuscated' ? 'check' : 'copy'} className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-xl text-green-400 font-medium break-words">
                {result.deobfuscated}
              </p>
            </div>
          </section>

          {/* 분석 정보 */}
          <section className="bg-gray-800 rounded-lg p-4 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Icon name="info" className="w-5 h-5 text-blue-400" />
              분석 정보
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">원본 음절 수:</span>
                <span className="ml-2 text-white font-semibold">{result.syllableCount.original}</span>
              </div>
              <div>
                <span className="text-gray-400">복원 음절 수:</span>
                <span className="ml-2 text-white font-semibold">{result.syllableCount.deobfuscated}</span>
              </div>
            </div>

            {result.syllableCount.original !== result.syllableCount.deobfuscated && (
              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded p-3 text-sm text-yellow-300">
                ⚠️ 음절 수가 일치하지 않습니다. 복원 정확도가 낮을 수 있습니다.
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">신뢰도:</span>
                <span className="text-white font-semibold">{result.confidence}%</span>
              </div>
              {renderConfidenceBar(result.confidence)}
            </div>

            {result.detectedPatterns.length > 0 && (
              <div>
                <span className="text-sm text-gray-400 block mb-2">감지된 난독화 패턴:</span>
                <div className="flex flex-wrap gap-2">
                  {result.detectedPatterns.map((pattern, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-purple-900/30 border border-purple-500/30 rounded text-xs text-purple-300"
                    >
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 설명 */}
          <section className="bg-gray-800 rounded-lg p-4 space-y-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Icon name="file" className="w-5 h-5 text-yellow-400" />
              AI 분석 설명
            </h2>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {result.explanation}
            </p>
          </section>

          {/* 대안 */}
          {result.alternatives && result.alternatives.length > 0 && (
            <section className="bg-gray-800 rounded-lg p-4 space-y-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Icon name="list" className="w-5 h-5 text-orange-400" />
                다른 가능성
              </h2>
              <ul className="space-y-2">
                {result.alternatives.map((alt, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-gray-500 text-sm">{idx + 1}.</span>
                    <span className="text-gray-300">{alt}</span>
                    <button
                      onClick={() => handleCopy(alt, `alt-${idx}`)}
                      className="ml-auto text-gray-400 hover:text-white transition-colors p-1"
                      title="복사"
                    >
                      <Icon name={copiedSection === `alt-${idx}` ? 'check' : 'copy'} className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 원본 텍스트 (참고용) */}
          <section className="bg-gray-800 rounded-lg p-4 space-y-3">
            <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Icon name="file" className="w-4 h-4" />
              입력한 난독화 텍스트
            </h2>
            <div className="bg-gray-900 p-3 rounded-lg">
              <p className="text-sm text-gray-500 break-words">
                {result.original}
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default DeobfuscateHangulPage;
