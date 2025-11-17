import React, { useRef, useEffect } from 'react';
import { Icon } from '../constants';

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  apiHasGemini: boolean;
  apiHasOpenAI: boolean;
  apiNewGemini: string;
  setApiNewGemini: (value: string) => void;
  apiNewOpenAI: string;
  setApiNewOpenAI: (value: string) => void;
  apiSaving: boolean;
  apiError: string;
  onSave: () => void;
  onDelete: (keyType: 'gemini' | 'openai') => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  open,
  onClose,
  apiHasGemini,
  apiHasOpenAI,
  apiNewGemini,
  setApiNewGemini,
  apiNewOpenAI,
  setApiNewOpenAI,
  apiSaving,
  apiError,
  onSave,
  onDelete,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apikey-modal-title"
        ref={modalRef}
        className="relative mx-auto mt-24 w-[min(92vw,560px)] bg-[#252526] border border-white/10 rounded-lg shadow-xl p-4 text-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-2">
          <div className="shrink-0 p-1.5 rounded bg-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z" />
              <path d="M15 9h.01" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="apikey-modal-title" className="text-lg font-semibold text-white">API Key 설정</h2>
            <p className="text-sm text-gray-400 mb-2">Playground AI 도구를 사용하기 위한 API 키를 설정합니다. 값은 암호화되어 브라우저에 저장됩니다.</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• <span className="text-amber-300">OpenAI API</span>: 모든 기능에 사용자 키 필수 (서버 기본값 사용 불가)</p>
              <p>• <span className="text-blue-300">Gemini API</span>: TTS 및 이미지 생성 기능에만 사용자 키 필수</p>
            </div>
          </div>
          <button onClick={onClose} className="ml-2 p-1.5 rounded hover:bg-white/10 text-gray-300" aria-label="닫기" title="닫기">
            <Icon name="close" />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm text-gray-300" htmlFor="gemini-key">GEMINI_API_KEY</label>
              {apiHasGemini && (
                <button
                  type="button"
                  onClick={() => onDelete('gemini')}
                  disabled={apiSaving}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                  </svg>
                  삭제
                </button>
              )}
            </div>
            <input
              id="gemini-key"
              type="password"
              value={apiNewGemini}
              onChange={(e) => setApiNewGemini(e.target.value)}
              placeholder={apiHasGemini && !apiNewGemini ? '********' : '예: AIza...'}
              className="w-full px-2 py-2 rounded bg-black/40 border border-white/10 text-sm"
              autoComplete="off"
            />
            <p className="text-xs text-gray-500 mt-1">TTS/이미지 생성 기능에 필요. 텍스트 분석 기능은 서버 무료 키 사용 가능.</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm text-gray-300" htmlFor="openai-key">OPENAI_API_KEY</label>
              {apiHasOpenAI && (
                <button
                  type="button"
                  onClick={() => onDelete('openai')}
                  disabled={apiSaving}
                  className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z" clipRule="evenodd" />
                  </svg>
                  삭제
                </button>
              )}
            </div>
            <input
              id="openai-key"
              type="password"
              value={apiNewOpenAI}
              onChange={(e) => setApiNewOpenAI(e.target.value)}
              placeholder={apiHasOpenAI && !apiNewOpenAI ? '********' : '예: sk-...'}
              className="w-full px-2 py-2 rounded bg-black/40 border border-white/10 text-sm"
              autoComplete="off"
            />
            <p className="text-xs text-amber-300 mt-1">필수 입력. OpenAI API를 사용하는 모든 기능에 필요합니다.</p>
          </div>
          {apiError && <div className="text-xs text-amber-300">{apiError}</div>}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-3 py-2 rounded text-sm border border-white/10 text-gray-300 hover:bg-white/10"
              onClick={onClose}
              disabled={apiSaving}
            >
              취소
            </button>
            <button
              type="button"
              className="px-3 py-2 rounded text-sm border border-white/10 text-white hover:bg-white/10 disabled:opacity-60"
              onClick={onSave}
              disabled={apiSaving}
            >
              {apiSaving ? '저장 중…' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
