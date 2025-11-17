import { useState, useEffect, useRef, useCallback } from 'react';
import { ViewId } from '../types';
import { viewForTabId } from '../utils/navigation';

// Hash <-> ViewId 변환 helper 함수
const viewIdToHash = (viewId: ViewId): string => {
  return viewId.toLowerCase();
};

const hashToViewId = (hash: string): ViewId | null => {
  const cleanHash = hash.replace(/^#/, '').toUpperCase();
  const viewIdValues = Object.values(ViewId) as string[];
  if (viewIdValues.includes(cleanHash)) {
    return cleanHash as ViewId;
  }
  return null;
};

export interface UseViewManagerReturn {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
  isSidebarPinned: boolean;
  toggleSidebarPinned: () => void;
  overlayOpen: boolean;
  setOverlayOpen: (open: boolean) => void;
  overlayView: ViewId | null;
  setOverlayView: (view: ViewId | null) => void;
  handleActivityItemClick: (view: ViewId) => void;
  handleShowInMenu: (tabId: string) => void;
}

interface UseViewManagerOptions {
  activeTabId: string;
}

export const useViewManager = (options: UseViewManagerOptions): UseViewManagerReturn => {
  const { activeTabId } = options;
  const [activeView, setActiveView] = useState<ViewId>(ViewId.Explorer);
  const [isSidebarPinned, setIsSidebarPinned] = useState<boolean>(true);
  const [overlayOpen, setOverlayOpen] = useState<boolean>(false);
  const [overlayView, setOverlayView] = useState<ViewId | null>(null);
  const initialHashViewRef = useRef<ViewId | null>(null);
  const restoredRef = useRef<boolean>(false);

  // Default: on small screens, start with sidebar unpinned for better mobile UX
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setIsSidebarPinned(false);
      }
    } catch {}
  }, []);

  // 초기 로드 시 URL hash에서 activeView 설정
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash) {
      const viewId = hashToViewId(hash);
      if (viewId) {
        initialHashViewRef.current = viewId; // 초기 hash view 저장
        setActiveView(viewId);
      }
    }
  }, []);

  // Keep left sidebar selection in sync with the active tab
  useEffect(() => {
    if (!activeTabId) return;

    // 초기 hash view가 설정되어 있고 아직 탭 복원 전이라면 view 변경 무시
    if (initialHashViewRef.current && !restoredRef.current) {
      return;
    }

    // 탭 복원이 완료되었고 초기 hash view가 있다면, 한 번만 클리어하고 이번에는 view 변경하지 않음
    if (initialHashViewRef.current && restoredRef.current) {
      initialHashViewRef.current = null;
      return;
    }

    const v = viewForTabId(activeTabId);
    setActiveView(v);
  }, [activeTabId]);

  // Trigger restored flag after tab restoration
  useEffect(() => {
    const timer = setTimeout(() => {
      restoredRef.current = true;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // activeView 변경 시 URL hash 업데이트
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = `#${viewIdToHash(activeView)}`;
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash);
    }
  }, [activeView]);

  // 브라우저 뒤로가기/앞으로가기 처리
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const viewId = hashToViewId(hash);
        if (viewId) {
          setActiveView(viewId);
        }
      } else {
        // hash가 없으면 Explorer로
        setActiveView(ViewId.Explorer);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleActivityItemClick = useCallback((view: ViewId) => {
    if (isSidebarPinned) {
      setActiveView(view);
      return;
    }
    // Overlay behavior when unpinned
    if (overlayOpen && overlayView === view) {
      setOverlayOpen(false);
    } else {
      setOverlayView(view);
      setOverlayOpen(true);
    }
  }, [isSidebarPinned, overlayOpen, overlayView]);

  const toggleSidebarPinned = useCallback(() => {
    setIsSidebarPinned(prev => {
      const next = !prev;
      if (next) {
        // When pinning back, close overlay
        setOverlayOpen(false);
        setOverlayView(null);
      } else {
        // When unpinned, clear overlay state
        setOverlayOpen(false);
        setOverlayView(null);
      }
      return next;
    });
  }, []);

  const handleShowInMenu = useCallback((tabId: string) => {
    const view = viewForTabId(tabId);
    if (view) {
      setActiveView(view);
      if (!isSidebarPinned) {
        setOverlayOpen(true);
        setOverlayView(view);
      }
    }
  }, [isSidebarPinned]);

  return {
    activeView,
    setActiveView,
    isSidebarPinned,
    toggleSidebarPinned,
    overlayOpen,
    setOverlayOpen,
    overlayView,
    setOverlayView,
    handleActivityItemClick,
    handleShowInMenu,
  };
};
