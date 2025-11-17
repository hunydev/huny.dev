import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseServiceWorkerReturn {
  updateAvailable: boolean;
  isOffline: boolean;
  refreshing: boolean;
  handleReloadForUpdate: () => void;
  handleLogoClick: () => void;
  checkForUpdates: () => Promise<void>;
}

interface UseServiceWorkerOptions {
  showInfoToast: (message: string, autoDismiss?: boolean) => void;
}

export const useServiceWorker = (options: UseServiceWorkerOptions): UseServiceWorkerReturn => {
  const { showInfoToast } = options;
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // Register service worker
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        });
        swRegistrationRef.current = registration;

        if (registration.waiting) {
          setUpdateAvailable(true);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });
      } catch (err) {
        console.error('service worker registration failed', err);
      }
    };

    registerServiceWorker();

    // Handle online/offline events
    const offlineHandler = () => setIsOffline(true);
    const onlineHandler = () => setIsOffline(false);
    window.addEventListener('offline', offlineHandler);
    window.addEventListener('online', onlineHandler);

    return () => {
      window.removeEventListener('offline', offlineHandler);
      window.removeEventListener('online', onlineHandler);
    };
  }, []);

  const handleReloadForUpdate = useCallback(() => {
    const registration = swRegistrationRef.current;
    if (!registration) {
      window.location.reload();
      return;
    }

    const waitingWorker = registration.waiting;
    if (waitingWorker) {
      const onStateChange = (event: Event) => {
        const target = event.target as ServiceWorker;
        if (target.state === 'activated') {
          waitingWorker.removeEventListener('statechange', onStateChange);
          window.location.reload();
        }
      };

      if (waitingWorker.state === 'activated') {
        window.location.reload();
        return;
      }

      waitingWorker.addEventListener('statechange', onStateChange, { once: false });
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      return;
    }

    window.location.reload();
  }, []);

  const handleLogoClick = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    if (typeof window !== 'undefined') {
      try {
        window.location.reload();
      } catch (err) {
        console.error('logo refresh failed', err);
        setTimeout(() => setRefreshing(false), 1200);
      }
    }
  }, [refreshing]);

  const checkForUpdates = useCallback(async () => {
    try {
      const resolveRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
        let registration = swRegistrationRef.current;
        if (registration) return registration;

        try {
          registration = await navigator.serviceWorker.ready;
        } catch {}

        if (!registration) {
          try {
            registration = await navigator.serviceWorker.getRegistration();
          } catch {}
        }

        if (registration) {
          swRegistrationRef.current = registration;
        }
        return registration;
      };

      const registration = await resolveRegistration();
      if (!registration) {
        showInfoToast('서비스 워커가 아직 초기화되지 않았습니다. 잠시 후 다시 시도하세요.', false);
        return;
      }

      try {
        await registration.update();
      } catch (updateError: any) {
        if (updateError?.name === 'InvalidStateError') {
          console.warn('Service worker registration invalid. attempting re-register.');
          try {
            const fresh = await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
            swRegistrationRef.current = fresh;
            if (fresh.waiting) {
              handleReloadForUpdate();
              return;
            }
            showInfoToast('서비스 워커 구성을 새로 고쳤습니다. 잠시 후 다시 시도하세요.', false);
            return;
          } catch (reRegisterError) {
            console.error('service worker re-registration failed', reRegisterError);
            throw reRegisterError;
          }
        }
        throw updateError;
      }

      if (registration.waiting) {
        handleReloadForUpdate();
        return;
      }

      const installing = registration.installing;
      if (installing) {
        const onStateChange = () => {
          if (registration.waiting) {
            installing.removeEventListener('statechange', onStateChange);
            handleReloadForUpdate();
          }
        };
        installing.addEventListener('statechange', onStateChange);
        return;
      }

      showInfoToast('현재 최신 버전입니다.');
    } catch (err) {
      console.error('manual update check failed', err);
      showInfoToast('업데이트 확인에 실패했습니다. 콘솔을 확인하세요.', false);
    }
  }, [handleReloadForUpdate, showInfoToast]);

  return {
    updateAvailable,
    isOffline,
    refreshing,
    handleReloadForUpdate,
    handleLogoClick,
    checkForUpdates,
  };
};
