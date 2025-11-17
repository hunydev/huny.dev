import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Icon } from '../constants';

interface UpdateToastProps {
  updateAvailable: boolean;
  onReload: () => void;
}

export const UpdateToast: React.FC<UpdateToastProps> = ({ updateAvailable, onReload }) => {
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<'available' | 'info'>('available');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const infoToastTimeoutRef = useRef<number | null>(null);

  const handleDismiss = useCallback(() => {
    if (infoToastTimeoutRef.current) {
      window.clearTimeout(infoToastTimeoutRef.current);
      infoToastTimeoutRef.current = null;
    }
    setVisible(false);
    setCountdown(0);
    if (type === 'info') {
      setMessage('');
    }
  }, [type]);

  const showInfoToast = useCallback((msg: string, autoDismiss: boolean = true) => {
    if (infoToastTimeoutRef.current) {
      window.clearTimeout(infoToastTimeoutRef.current);
      infoToastTimeoutRef.current = null;
    }
    setType('info');
    setMessage(msg);
    setCountdown(0);
    setVisible(true);
    if (autoDismiss) {
      infoToastTimeoutRef.current = window.setTimeout(() => {
        setVisible(false);
        infoToastTimeoutRef.current = null;
      }, 3200);
    }
  }, []);

  // Show update available toast
  useEffect(() => {
    if (!updateAvailable) return;
    if (infoToastTimeoutRef.current) {
      window.clearTimeout(infoToastTimeoutRef.current);
      infoToastTimeoutRef.current = null;
    }
    setType('available');
    setMessage('새로운 버전이 준비되었습니다.');
    setVisible(true);
    setCountdown(10);
  }, [updateAvailable]);

  // Countdown timer for auto reload
  useEffect(() => {
    if (!visible || type !== 'available') return;
    if (countdown <= 0) return;

    const timer = window.setTimeout(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onReload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [visible, type, countdown, onReload]);

  // Expose showInfoToast via window global for hooks to use
  useEffect(() => {
    (window as any).__showInfoToast = showInfoToast;
    return () => {
      delete (window as any).__showInfoToast;
    };
  }, [showInfoToast]);

  if (!visible) return null;

  return (
    <div
      className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom,0)+4rem)] md:bottom-[calc(env(safe-area-inset-bottom,0)+3.5rem)] z-50 max-w-sm rounded-md border border-amber-500/70 bg-[#1e1e1e] shadow-lg text-amber-100 p-4 flex flex-col gap-3"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {type === 'available' ? (
            <Icon name="alert" className="w-5 h-5" />
          ) : (
            <Icon name="info" className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 text-sm leading-5">
          <p className="font-semibold text-amber-300">
            {type === 'available' ? '새로운 버전이 준비되었습니다.' : '업데이트 확인'}
          </p>
          <p className="mt-1 text-amber-100/80">
            {type === 'available'
              ? (countdown > 0 ? `${countdown}초 후 자동으로 새로고침됩니다.` : '잠시 후 자동으로 새로고침됩니다.')
              : (message || '현재 최신 버전입니다.')}
          </p>
        </div>
      </div>
      {type === 'available' ? (
        <div className="flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-1 rounded border border-amber-400/60 text-amber-200 hover:bg-amber-500/10"
          >
            나중에 알림 숨기기
          </button>
          <button
            type="button"
            onClick={onReload}
            className="px-3 py-1 rounded bg-amber-400 text-black font-semibold hover:bg-amber-300"
          >
            지금 업데이트
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-3 py-1 rounded border border-amber-400/60 text-amber-200 hover:bg-amber-500/10"
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function for other components to show info toast
export const showInfoToast = (message: string, autoDismiss?: boolean) => {
  const fn = (window as any).__showInfoToast;
  if (typeof fn === 'function') {
    fn(message, autoDismiss);
  }
};
