import React from 'react';
import { Icon } from '../../constants';

export type PlaygroundGuideModalProps = {
  isOpen: boolean;
  onClose: () => void;
  playgroundTitle: string;
  playgroundId: string;
  showDontShowAgain?: boolean;
  onDontShowAgainChange?: (checked: boolean) => void;
};

export const PlaygroundGuideModal: React.FC<PlaygroundGuideModalProps> = ({
  isOpen,
  onClose,
  playgroundTitle,
  playgroundId,
  showDontShowAgain = false,
  onDontShowAgainChange,
}) => {
  const [dontShowAgain, setDontShowAgain] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setDontShowAgain(false);
    }
  }, [isOpen]);

  const handleDontShowAgainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setDontShowAgain(checked);
    onDontShowAgainChange?.(checked);
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  // Try common image extensions
  const imageSrc = `/extra/playground/capture/${playgroundId}.png`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-[#1a1a1a] rounded-lg border border-white/10 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-lg font-semibold text-white">
            사용 가이드 - {playgroundTitle}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition"
            aria-label="닫기"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="rounded border border-white/10 bg-black/20 overflow-hidden">
            <img 
              src={imageSrc} 
              alt={`${playgroundTitle} 사용 가이드`}
              className="w-full h-auto"
              onError={(e) => {
                // Fallback: try other extensions or show placeholder
                const target = e.target as HTMLImageElement;
                if (target.src.endsWith('.png')) {
                  target.src = `/extra/playground/capture/${playgroundId}.jpg`;
                } else if (target.src.endsWith('.jpg')) {
                  target.src = `/extra/playground/capture/${playgroundId}.jpeg`;
                } else {
                  target.alt = '가이드 이미지를 불러올 수 없습니다.';
                  target.className = 'w-full h-64 flex items-center justify-center text-gray-500 bg-black/40';
                }
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          {showDontShowAgain ? (
            <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={handleDontShowAgainChange}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <span>더 이상 보지 않기</span>
            </label>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
