import React from 'react';
import type { PageProps } from '../../types';
import { ErrorMessage, LoadingButton } from '../ui';
import { Icon } from '../../constants';
import { useApiCall } from '../../hooks/useApiCall';

const TextToPhonemePage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [text, setText] = React.useState('');
  const [normalized, setNormalized] = React.useState('');
  const [g2p, setG2p] = React.useState('');

  type PhonemeResponse = { normalized?: string; normalized_text?: string; g2p?: string; g2p_text?: string };
  const api = useApiCall<PhonemeResponse>({
    url: '/api/text-to-phoneme',
    method: 'POST',
    tabId: 'text-to-phoneme',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      const n = data?.normalized || data?.normalized_text || '';
      const p = data?.g2p || data?.g2p_text || '';
      setNormalized(n);
      setG2p(p);
    },
  });

  const run = async () => {
    if (!text.trim()) return;
    setNormalized('');
    setG2p('');
    await api.execute({
      body: { text, lang: 'ko' },
    });
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <Icon name="textToPhoneme" className="w-6 h-6" aria-hidden />
          </span>
          Text to Phoneme
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">입력한 텍스트를 노말라이즈하고, 그 결과를 G2P(발음)로 변환합니다.</p>
      </header>

      <section className="space-y-3">
        {/* Input */}
        <div className="rounded border border-white/10 bg-[#1e1e1e] p-3">
          <label className="block text-xs text-gray-400 mb-1">입력 텍스트</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="예: 국밥 10번 말아줘"
            rows={4}
            className="w-full resize-y px-3 py-2 rounded bg-[#1e1e1e] border border-white/10 text-gray-200 placeholder:text-gray-500"
          />
          <div className="mt-2 flex items-center gap-2">
            <LoadingButton
              loading={api.loading}
              disabled={!text.trim()}
              onClick={run}
              loadingText="변환 중…"
              idleText="변환"
              variant="primary"
            />
            <ErrorMessage error={api.error} />
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center" aria-hidden>
          <Icon name="triangleDown" className="text-gray-400" />
        </div>

        {/* Normalized Result */}
        <div className="rounded border border-white/10 bg-[#1e1e1e] p-3">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs text-gray-400">텍스트 노말라이즈 결과</label>
          </div>
          <textarea
            value={normalized}
            readOnly
            rows={3}
            placeholder="예: 국밥 열 번 말아줘"
            className="w-full resize-y px-3 py-2 rounded bg-[#111215] border border-white/10 text-gray-200 placeholder:text-gray-600"
          />
        </div>

        {/* Arrow */}
        <div className="flex justify-center" aria-hidden>
          <Icon name="triangleDown" className="text-gray-400" />
        </div>

        {/* G2P Result */}
        <div className="rounded border border-white/10 bg-[#1e1e1e] p-3">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs text-gray-400">G2P 결과</label>
          </div>
          <textarea
            value={g2p}
            readOnly
            rows={3}
            placeholder="예: 국빱 열뻔 마라줘"
            className="w-full resize-y px-3 py-2 rounded bg-[#111215] border border-white/10 text-gray-200 placeholder:text-gray-600"
          />
        </div>
      </section>
    </div>
  );
};

export default TextToPhonemePage;
