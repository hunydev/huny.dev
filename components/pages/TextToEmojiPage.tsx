import React from 'react';
import { PageProps } from '../../types';
import { ErrorMessage, LoadingButton } from '../ui';
import { Icon } from '../../constants';

type EmojiMode = 'full' | 'partial' | 'insert';

const MODE_OPTIONS: { value: EmojiMode; label: string; description: string }[] = [
  { value: 'full', label: '완전 치환', description: '텍스트 전체를 emoji로만 표현합니다.' },
  { value: 'partial', label: '부분 치환', description: '텍스트 일부를 emoji로 대치합니다.' },
  { value: 'insert', label: 'emoji 삽입', description: '텍스트는 그대로 두고 적절한 위치에 emoji를 추가합니다.' },
];

const TextToEmojiPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [inputText, setInputText] = React.useState<string>('');
  const [mode, setMode] = React.useState<EmojiMode>('insert');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [result, setResult] = React.useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setError('텍스트를 입력해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    apiTask?.startTask('text-to-emoji');

    try {
      const res = await fetch('/api/text-to-emoji', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim(), mode }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || '변환 요청에 실패했습니다.');
      }

      const json = (await res.json()) as { result?: string };
      const resultText = typeof json?.result === 'string' ? json.result : '';
      if (!resultText) {
        throw new Error('결과가 없습니다.');
      }

      setResult(resultText);
      apiTask?.completeTask('text-to-emoji', isActiveTab);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.message || '처리 중 오류가 발생했습니다.';
      setError(errorMsg);
      apiTask?.errorTask('text-to-emoji', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(
      () => alert('결과를 클립보드에 복사했습니다.'),
      () => alert('복사에 실패했습니다.')
    );
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <Icon name="textToEmoji" className="w-6 h-6" />
          </span>
          Text to Emoji
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          텍스트를 입력하면 선택한 모드에 따라 emoji로 변환된 결과를 보여줍니다.
        </p>
        <p className="mt-1 text-[12px] text-gray-500">
          Gemini Flash 모델을 사용하여 빠르고 간단하게 처리합니다.
        </p>
      </header>

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4 mb-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">입력 텍스트</label>
              <textarea
                className="w-full min-h-[120px] bg-[#1f1f1f] border border-white/10 rounded p-3 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="예: 오늘 날씨가 정말 좋네요! 커피 한잔 하고 싶어요."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">변환 모드</label>
              <div className="space-y-2 mb-3">
                {MODE_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value={opt.value}
                      checked={mode === opt.value}
                      onChange={() => setMode(opt.value)}
                      className="mt-0.5 mr-2"
                    />
                    <div>
                      <div className="text-sm text-white">{opt.label}</div>
                      <div className="text-xs text-gray-500">{opt.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              <LoadingButton
                onClick={handleSubmit}
                disabled={!inputText.trim() || loading}
                loading={loading}
                loadingText="변환 중…"
                idleText="변환"
                variant="primary"
                className="w-full px-4 py-2 text-sm"
              />
            </div>
          </div>
          <ErrorMessage error={error} className="mt-3" />
        </form>
      </section>

      {result && (
        <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-white">변환 결과</h2>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1 rounded text-xs bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1"
            >
              <Icon name="clipboard" className="w-3 h-3" />
              복사
            </button>
          </div>
          <div className="bg-[#1f1f1f] border border-white/10 rounded p-3 text-sm text-white whitespace-pre-wrap break-words">
            {result}
          </div>
        </section>
      )}
    </div>
  );
};

export default TextToEmojiPage;
