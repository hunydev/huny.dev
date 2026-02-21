import React, { useState, useCallback, useEffect, useRef } from 'react';
import ActivityBar from './components/ActivityBar';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import { ViewId, Tab, PageProps, ApiRequirement } from './types';
import { PAGES, ACTIVITY_BAR_ITEMS, EXTERNAL_LINKS, Icon } from './constants';
import logo from './logo_128x128.png';
import { getCategoryById } from './components/pages/bookmarksData';
import { getNoteGroupById } from './components/pages/notesData';
import { getAppCategoryById, getAppById } from './components/pages/appsData';
import { getDocBySlug } from './components/pages/docsData';
import { MONITOR_GROUPS, getMonitorItemById } from './components/pages/monitorData';
import { extractBaseId, viewForTabId } from './utils/navigation';
import { ApiTaskProvider, useApiTask } from './contexts/ApiTaskContext';

const APP_VERSION = '2026.02.21.1';

const TABS_STORAGE_KEY = 'app.openTabs.v1';
const DEFAULT_TAB_IDS: readonly string[] = ['welcome', 'works', 'about'];

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

const App: React.FC = () => {
  const apiTaskContext = useApiTask();
  const [activeView, setActiveView] = useState<ViewId>(ViewId.Explorer);
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [sidebarWidth, setSidebarWidth] = useState<number>(256);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState<boolean>(true);
  const [overlayOpen, setOverlayOpen] = useState<boolean>(false);
  const [overlayView, setOverlayView] = useState<ViewId | null>(null);
  const [socialOpen, setSocialOpen] = useState<boolean>(false);
  const socialRef = useRef<HTMLDivElement | null>(null);
  const [ossOpen, setOssOpen] = useState<boolean>(false);
  const ossModalRef = useRef<HTMLDivElement | null>(null);
  const [signInOpen, setSignInOpen] = useState<boolean>(false);
  const signInModalRef = useRef<HTMLDivElement | null>(null);
  const restoredRef = useRef<boolean>(false);
  const restoringRef = useRef<boolean>(false);
  const shortcutHandledRef = useRef<boolean>(false);
  const initialShortcutIdsRef = useRef<string[]>([]);
  const initialHashViewRef = useRef<ViewId | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [updateToastVisible, setUpdateToastVisible] = useState(false);
  const [updateToastType, setUpdateToastType] = useState<'available' | 'info'>('available');
  const [updateToastMessage, setUpdateToastMessage] = useState<string>('');
  const [updateCountdown, setUpdateCountdown] = useState<number>(0);

  // Settings dropdown & API Key modal state
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const [apiModalOpen, setApiModalOpen] = useState<boolean>(false);
  const apiModalRef = useRef<HTMLDivElement | null>(null);
  const [apiSaving, setApiSaving] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>('');
  // API key 상태를 localStorage에서 동기적으로 초기화 (탭 복원보다 먼저 실행되도록)
  const [apiHasGemini, setApiHasGemini] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('secure.apikeys.meta.v1');
      if (raw) {
        const meta = JSON.parse(raw) as { gemini?: boolean; openai?: boolean };
        return !!meta?.gemini;
      }
    } catch {}
    return false;
  });
  const [apiHasOpenAI, setApiHasOpenAI] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('secure.apikeys.meta.v1');
      if (raw) {
        const meta = JSON.parse(raw) as { gemini?: boolean; openai?: boolean };
        return !!meta?.openai;
      }
    } catch {}
    return false;
  });
  const [apiNewGemini, setApiNewGemini] = useState<string>('');
  const [apiNewOpenAI, setApiNewOpenAI] = useState<string>('');
  const infoToastTimeoutRef = useRef<number | null>(null);

  // Map a tab id (e.g., 'docs:intro', 'bookmark:all', 'split-speaker') to the corresponding left sidebar view
  // Default: on small screens, start with sidebar unpinned for better mobile UX
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setIsSidebarPinned(false);
      }
    } catch {}
  }, []);

  const handleDismissUpdateToast = useCallback(() => {
    if (infoToastTimeoutRef.current) {
      window.clearTimeout(infoToastTimeoutRef.current);
      infoToastTimeoutRef.current = null;
    }
    setUpdateToastVisible(false);
    setUpdateCountdown(0);
    if (updateToastType === 'info') {
      setUpdateToastMessage('');
    }
  }, [updateToastType]);

  const showInfoToast = useCallback((message: string, autoDismiss: boolean = true) => {
    if (infoToastTimeoutRef.current) {
      window.clearTimeout(infoToastTimeoutRef.current);
      infoToastTimeoutRef.current = null;
    }
    setUpdateToastType('info');
    setUpdateToastMessage(message);
    setUpdateCountdown(0);
    setUpdateToastVisible(true);
    if (autoDismiss) {
      infoToastTimeoutRef.current = window.setTimeout(() => {
        setUpdateToastVisible(false);
        infoToastTimeoutRef.current = null;
      }, 3200);
    }
  }, []);

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

  const handleOpenFile = useCallback((fileId: string) => {
    const originalId = fileId;
    let baseId = fileId;
    let arg: string | undefined;

    // Parse dynamic routes, e.g. bookmark:<categoryId>
    const baseFromId = extractBaseId(fileId);
    if (baseFromId !== fileId) {
      baseId = baseFromId;
      arg = fileId.slice(baseFromId.length + 1);
    }

    const pageInfo = PAGES[baseId];
    if (!pageInfo) {
      return;
    }

    // API 요구사항 체크
    if (pageInfo.apiRequirement) {
      const check = checkApiRequirement(pageInfo.apiRequirement);
      if (!check.available) {
        const providerName = pageInfo.apiRequirement.provider === 'openai' ? 'OpenAI' : 'Gemini';
        const message = `${pageInfo.title}는 ${providerName} API 키가 필요합니다.\n\n${check.reason || ''}`;
        if (window.confirm(`${message}\n\nAPI 키 설정 화면으로 이동하시겠습니까?`)) {
          openApiKeyModal();
        }
        return;
      }
    }

    let tabTitle = pageInfo.title;
    let tabIcon: React.ReactNode = pageInfo.icon;
    if (baseId === 'bookmark') {
      const categoryId = arg || 'all';
      const cat = categoryId === 'all' ? undefined : getCategoryById(categoryId);
      const catName = categoryId === 'all' ? 'All' : (cat?.name ?? categoryId);
      tabTitle = `bookmarks (${catName})`;
      const color = categoryId === 'all' ? '#9ca3af' : (cat?.color ?? '#9ca3af');
      tabIcon = (
        <Icon name="bookmarkRibbon" className="w-4 h-4 mr-2" style={{ color }} />
      );
    }
    else if (baseId === 'notes' && arg) {
      const group = getNoteGroupById(arg);
      const groupName = group?.name ?? arg;
      const color = group?.color ?? '#9ca3af';
      tabTitle = `notes – ${groupName}`;
      tabIcon = (
        <Icon name="note" className="w-4 h-4 mr-2" style={{ color }} />
      );
    } else if (baseId === 'apps') {
      const categoryId = arg || 'huny';
      const category = getAppCategoryById(categoryId);
      const catName = category?.name ?? categoryId;
      tabTitle = `apps – ${catName}`;
      if (category?.iconUrl) {
        tabIcon = <img src={category.iconUrl} alt="" className="w-4 h-4 mr-2 rounded-sm" />;
      } else if (category?.iconName) {
        tabIcon = <Icon name={category.iconName as any} className="w-4 h-4 mr-2" />;
      } else if (category?.emoji) {
        tabIcon = <span className="mr-2 text-sm" aria-hidden>{category.emoji}</span>;
      }
    } else if (baseId === 'app') {
      // Individual app detail tab (app:<appId>)
      const appId = arg || '';
      const app = getAppById(appId);
      if (app) {
        tabTitle = app.name;
        if (app.iconUrl) {
          tabIcon = <img src={app.iconUrl} alt="" className="w-4 h-4 mr-2 rounded-sm" />;
        } else if (app.iconEmoji) {
          tabIcon = <span className="mr-2 text-sm" aria-hidden>{app.iconEmoji}</span>;
        }
      } else {
        tabTitle = 'app – unknown';
      }
    } else if (baseId === 'docs') {
      const slug = arg || '';
      const doc = getDocBySlug(slug);
      const title = doc?.title || slug || 'docs';
      tabTitle = `docs – ${title}`;
      tabIcon = <Icon name="file" />;
    } else if (baseId === 'monitor') {
      if (arg) {
        const monitorItem = getMonitorItemById(arg);
        if (monitorItem) {
          const group = MONITOR_GROUPS.find(g => g.items.some(item => item.id === monitorItem.id));
          tabTitle = `monitor – ${monitorItem.name}`;
          if (group?.icon) {
            tabIcon = <Icon name={group.icon} className="w-4 h-4 mr-2" />;
          }
        } else {
          tabTitle = 'monitor – detail';
        }
      } else {
        tabTitle = 'monitor overview';
      }
    }

    setOpenTabs(prevTabs => {
      const exists = prevTabs.some(tab => tab.id === originalId);
      if (exists) {
        // 이미 존재하는 탭이면 추가하지 않음
        return prevTabs;
      }
      const newTab: Tab = {
        id: originalId,
        title: tabTitle,
        icon: tabIcon,
        pinned: false,
      };
      return [...prevTabs, newTab];
    });
    // 새 탭이든 기존 탭이든 항상 활성화
    setActiveTabId(originalId);
    // Update session-based recent list (exclude 'welcome', max 5)
    try {
      const raw = sessionStorage.getItem('recentTabs');
      const arr: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      const next = [originalId, ...arr.filter(id => id !== originalId)];
      const trimmed = next.filter(id => id !== 'welcome').slice(0, 5);
      sessionStorage.setItem('recentTabs', JSON.stringify(trimmed));
    } catch { }
  }, [apiHasGemini, apiHasOpenAI]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const openParams = params.getAll('open');
    if (openParams.length === 0) return;
    const ids = openParams
      .flatMap(value => value.split(','))
      .map(id => id.trim())
      .filter(Boolean)
      .filter(id => Boolean(PAGES[id]));
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;
    shortcutHandledRef.current = true;
    initialShortcutIdsRef.current = uniqueIds;
  }, []);

  useEffect(() => {
    // Restore tabs from localStorage on initial load; fallback to Welcome
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      // Check if hash is #hello for special handling
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      const isHelloRoute = hash === '#hello';
      
      if (isHelloRoute) {
        // #hello: Open default tabs and redirect to #explorer
        DEFAULT_TAB_IDS.forEach(id => handleOpenFile(id));
        setActiveTabId(DEFAULT_TAB_IDS[0]);
        // Redirect to #explorer
        if (typeof window !== 'undefined' && window.history) {
          window.history.replaceState(null, '', '#explorer');
          setActiveView(ViewId.Explorer);
        }
        return;
      }
      
      if (shortcutHandledRef.current) {
        const ids = initialShortcutIdsRef.current ?? [];
        if (ids.length > 0) {
          ids.forEach(id => handleOpenFile(id));
          setActiveTabId(ids[ids.length - 1]);
          // Remove ?open query parameter from URL after opening tabs
          if (typeof window !== 'undefined' && window.history && window.location.search) {
            const url = new URL(window.location.href);
            url.search = ''; // Remove all query parameters
            window.history.replaceState({}, '', url.pathname + url.hash);
          }
        }
        return;
      }
      const raw = localStorage.getItem(TABS_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { tabs?: Array<{ id: string; pinned?: boolean }>; activeTabId?: string };
        const tabs = Array.isArray(saved?.tabs) ? saved.tabs : [];
        if (tabs.length > 0) {
          restoringRef.current = true;
          // Open tabs in saved order
          tabs.forEach(t => handleOpenFile(t.id));
          // Apply pinned states and keep pinned tabs on the left
          setOpenTabs(prev => {
            const mapped = prev.map(tab => {
              const s = tabs.find(tt => tt.id === tab.id);
              return s ? { ...tab, pinned: !!s.pinned } : tab;
            });
            const pinned = mapped.filter(t => t.pinned);
            const others = mapped.filter(t => !t.pinned);
            return [...pinned, ...others];
          });
          if (saved.activeTabId) setActiveTabId(saved.activeTabId);
          // Defer to end of task to avoid saving intermediate states
          setTimeout(() => { restoringRef.current = false; }, 0);
          return;
        }
      }
    } catch {}
    if (!shortcutHandledRef.current) {
      // Fallback: open default tabs if no saved state or shortcut
      DEFAULT_TAB_IDS.forEach(id => handleOpenFile(id));
      setActiveTabId(DEFAULT_TAB_IDS[0]);
    }
  }, [handleOpenFile]);

  useEffect(() => {
    if (!updateAvailable) return;
    if (infoToastTimeoutRef.current) {
      window.clearTimeout(infoToastTimeoutRef.current);
      infoToastTimeoutRef.current = null;
    }
    setUpdateToastType('available');
    setUpdateToastMessage('새로운 버전이 준비되었습니다.');
    setUpdateToastVisible(true);
    setUpdateCountdown(10);
  }, [updateAvailable]);

  useEffect(() => {
    if (!updateToastVisible || updateToastType !== 'available') return;
    if (updateCountdown <= 0) return;
    const timer = window.setTimeout(() => {
      setUpdateCountdown(prev => {
        if (prev <= 1) {
          handleReloadForUpdate();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [updateToastVisible, updateToastType, updateCountdown, handleReloadForUpdate]);

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

  // Keep session-based recent list in sync with last visited tab
  useEffect(() => {
    if (!activeTabId) return;
    try {
      const raw = sessionStorage.getItem('recentTabs');
      const arr: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      const next = [activeTabId, ...arr.filter(id => id !== activeTabId)];
      const trimmed = next.filter(id => id !== 'welcome').slice(0, 5);
      sessionStorage.setItem('recentTabs', JSON.stringify(trimmed));
    } catch { }
  }, [activeTabId]);

  // Persist open tabs and active tab to localStorage for restoration on reload
  useEffect(() => {
    if (!restoredRef.current || restoringRef.current) return;
    try {
      if (openTabs.length === 0) {
        localStorage.removeItem(TABS_STORAGE_KEY);
        return;
      }
      const data = {
        tabs: openTabs.map(t => ({ id: t.id, pinned: t.pinned })),
        activeTabId: activeTabId || (openTabs[openTabs.length - 1]?.id ?? ''),
      };
      localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [openTabs, activeTabId]);

  // Sync document.title with active tab for better UX (SEO handled by SSR)
  useEffect(() => {
    try {
      const base = 'HunyDev';
      const active = openTabs.find(t => t.id === activeTabId);
      const tabTitle = (active?.title || '').trim();
      const finalTitle = tabTitle ? `${base} — ${tabTitle}` : 'HunyDev · Works & Digital Playground';
      if (typeof document !== 'undefined') {
        document.title = finalTitle;
      }
    } catch {}
  }, [activeTabId, openTabs]);

  const handleSidebarResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const newWidth = Math.min(480, Math.max(180, startWidth + delta));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);


  const handleCloseTab = useCallback((tabId: string) => {
    // API 작업 진행 중인지 확인
    const taskStatus = apiTaskContext.getTaskStatus(tabId);
    if (taskStatus === 'pending') {
      const confirmed = window.confirm('API 요청이 진행 중입니다. 탭을 닫으시겠습니까?');
      if (!confirmed) return;
    }

    setOpenTabs(prevTabs => {
      const tabIndex = prevTabs.findIndex(tab => tab.id === tabId);
      if (tabIndex === -1) return prevTabs;

      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      setActiveTabId(currActive => {
        if (currActive !== tabId) return currActive;
        if (newTabs.length === 0) return '';
        const newActiveIndex = Math.max(0, tabIndex - 1);
        return newTabs[newActiveIndex]?.id ?? '';
      });
      return newTabs;
    });
  }, [apiTaskContext]);

  const handleCloseAllTabs = useCallback(() => {
    setOpenTabs(prev => {
      const remaining = prev.filter(t => t.pinned);
      // If active tab was removed, pick first remaining as active
      setActiveTabId(curr => {
        if (remaining.length === 0) return '';
        const stillExists = remaining.some(t => t.id === curr);
        return stillExists ? curr : remaining[0].id;
      });
      return remaining;
    });
  }, []);

  const handleOpenInNewWindow = useCallback((tabId: string) => {
    // Open in new window and close current tab
    const baseId = extractBaseId(tabId);
    const url = `${window.location.origin}${window.location.pathname}?open=${baseId}`;
    window.open(url, '_blank');
    handleCloseTab(tabId);
  }, [handleCloseTab]);

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

  const handleShareTab = useCallback(async (tabId: string) => {
    const baseId = extractBaseId(tabId);
    const url = `${window.location.origin}${window.location.pathname}?open=${baseId}`;
    try {
      await navigator.clipboard.writeText(url);
      showInfoToast('탭 링크가 클립보드에 복사되었습니다.');
    } catch {
      showInfoToast('링크 복사에 실패했습니다.');
    }
  }, [showInfoToast]);

  const handleShareAllTabs = useCallback(async () => {
    const tabIds = openTabs.map(t => extractBaseId(t.id)).join(',');
    const url = `${window.location.origin}${window.location.pathname}?open=${tabIds}`;
    try {
      await navigator.clipboard.writeText(url);
      showInfoToast(`${openTabs.length}개 탭 링크가 클립보드에 복사되었습니다.`);
    } catch {
      showInfoToast('링크 복사에 실패했습니다.');
    }
  }, [openTabs, showInfoToast]);

  const handleCloseTabsToRight = useCallback((tabId: string) => {
    setOpenTabs(prev => {
      const idx = prev.findIndex(t => t.id === tabId);
      if (idx === -1) return prev;
      
      // Keep tabs up to and including the selected tab
      const remaining = prev.slice(0, idx + 1);
      
      // If active tab was removed, select the rightmost remaining tab
      setActiveTabId(curr => {
        const stillExists = remaining.some(t => t.id === curr);
        return stillExists ? curr : remaining[remaining.length - 1]?.id || '';
      });
      
      return remaining;
    });
  }, []);

  const handleCloseOtherTabs = useCallback((tabId: string) => {
    setOpenTabs(prev => {
      // 선택한 탭과 고정된 탭만 유지
      const remaining = prev.filter(t => t.id === tabId || t.pinned);
      
      // 선택한 탭을 활성화
      setActiveTabId(tabId);
      
      return remaining;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey || e.metaKey || e.ctrlKey) return;
      const key = e.key?.toLowerCase();
      if (key !== 'w') return;

      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement) {
        const tagName = activeElement.tagName?.toLowerCase();
        const isEditable = activeElement.isContentEditable;
        if (isEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
          return;
        }
      }

      e.preventDefault();
      if (e.shiftKey) {
        handleCloseAllTabs();
      } else if (activeTabId) {
        handleCloseTab(activeTabId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCloseAllTabs, handleCloseTab, activeTabId]);

  const handleActivityItemClick = (view: ViewId) => {
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
  };

  const toggleSidebarPinned = () => {
    setIsSidebarPinned(prev => {
      const next = !prev;
      if (next) {
        // When pinning back, close overlay
        setOverlayOpen(false);
        setOverlayView(null);
      } else {
        // When unpinned, clear overlay state; Activity highlights are hidden via ActivityBar prop
        setOverlayOpen(false);
        setOverlayView(null);
      }
      return next;
    });
  };

  // Close social dropdown on outside click or ESC
  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!socialRef.current) return;
      const target = e.target as Node | null;
      if (target) {
        if (socialRef.current && !socialRef.current.contains(target)) setSocialOpen(false);
        if (settingsRef.current && !settingsRef.current.contains(target)) setSettingsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSocialOpen(false);
        setOssOpen(false);
        setSettingsOpen(false);
        setSignInOpen(false);
        setApiModalOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

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

  const openApiKeyModal = () => {
    setApiError('');
    setApiNewGemini('');
    setApiNewOpenAI('');
    setApiModalOpen(true);
    setSettingsOpen(false);
  };

  const saveApiKeys = async () => {
    try {
      setApiSaving(true);
      setApiError('');
      const existing = localStorage.getItem('secure.apikeys.v1') || '';
      const payload: any = { existing };
      if (apiNewGemini.trim()) payload.gemini = apiNewGemini.trim();
      if (apiNewOpenAI.trim()) payload.openai = apiNewOpenAI.trim();
      const res = await fetch('/api/secure-apikeys', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `Failed: ${res.status}`);
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}
      const cipher = String(data?.cipher || '');
      const meta = data?.meta && typeof data.meta === 'object' ? data.meta : {};
      if (cipher) localStorage.setItem('secure.apikeys.v1', cipher);
      localStorage.setItem('secure.apikeys.meta.v1', JSON.stringify({
        gemini: !!meta?.gemini,
        openai: !!meta?.openai,
      }));
      setApiHasGemini(!!meta?.gemini);
      setApiHasOpenAI(!!meta?.openai);
      setApiModalOpen(false);
      setApiNewGemini('');
      setApiNewOpenAI('');
    } catch (e: any) {
      setApiError(e?.message || String(e));
    } finally {
      setApiSaving(false);
    }
  };

  const deleteApiKey = async (keyType: 'gemini' | 'openai') => {
    const keyName = keyType === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY';
    const provider = keyType === 'gemini' ? 'gemini' : 'openai';
    
    // 해당 API key를 사용하는 열린 탭 찾기
    const affectedTabs = openTabs.filter(tab => {
      const baseId = extractBaseId(tab.id);
      const pageInfo = PAGES[baseId];
      if (!pageInfo?.apiRequirement) return false;
      
      // provider가 일치하고, 사용자 키가 필요한 경우만 영향을 받음
      if (pageInfo.apiRequirement.provider !== provider) return false;
      
      if (provider === 'openai') {
        // OpenAI는 무조건 사용자 키 필요
        return true;
      } else {
        // Gemini는 TTS/이미지 기능에만 사용자 키 필요
        const requiresUserKey = pageInfo.apiRequirement.features.some(f => f === 'tts' || f === 'image');
        return requiresUserKey;
      }
    });
    
    // 확인 메시지 구성
    let confirmMessage = `${keyName}를 삭제하시겠습니까?`;
    if (affectedTabs.length > 0) {
      const tabTitles = affectedTabs.map(t => `• ${t.title}`).join('\n');
      confirmMessage = `${keyName}를 삭제하시겠습니까?\n\n다음 탭들이 함께 닫힙니다:\n${tabTitles}`;
    }
    
    if (!confirm(confirmMessage)) return;
    
    try {
      setApiSaving(true);
      setApiError('');
      const existing = localStorage.getItem('secure.apikeys.v1') || '';
      const payload: any = { existing };
      // 삭제할 키는 빈 문자열로 전송
      payload[keyType] = '';
      
      const res = await fetch('/api/secure-apikeys', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `Failed: ${res.status}`);
      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}
      const cipher = String(data?.cipher || '');
      const meta = data?.meta && typeof data.meta === 'object' ? data.meta : {};
      
      if (cipher) localStorage.setItem('secure.apikeys.v1', cipher);
      localStorage.setItem('secure.apikeys.meta.v1', JSON.stringify({
        gemini: !!meta?.gemini,
        openai: !!meta?.openai,
      }));
      setApiHasGemini(!!meta?.gemini);
      setApiHasOpenAI(!!meta?.openai);
      
      // 영향받는 탭들 닫기
      if (affectedTabs.length > 0) {
        const affectedTabIds = new Set(affectedTabs.map(t => t.id));
        setOpenTabs(prev => prev.filter(tab => !affectedTabIds.has(tab.id)));
        
        // 활성 탭이 닫히면 다른 탭으로 전환
        if (affectedTabIds.has(activeTabId)) {
          const remainingTabs = openTabs.filter(tab => !affectedTabIds.has(tab.id));
          if (remainingTabs.length > 0) {
            setActiveTabId(remainingTabs[remainingTabs.length - 1].id);
          }
        }
      }
      
      const closedCount = affectedTabs.length;
      const message = closedCount > 0 
        ? `${keyName}가 삭제되었습니다. (${closedCount}개 탭 닫힘)`
        : `${keyName}가 삭제되었습니다.`;
      showInfoToast(message);
    } catch (e: any) {
      setApiError(e?.message || String(e));
    } finally {
      setApiSaving(false);
    }
  };

  // API 키 요구사항 체크 함수
  const checkApiRequirement = (requirement?: ApiRequirement): { available: boolean; reason?: string } => {
    if (!requirement) return { available: true };

    const { provider, features } = requirement;
    const requiresUserKey = features.some(f => f === 'tts' || f === 'image');

    if (provider === 'openai') {
      // OpenAI는 무조건 사용자 키 필수
      if (!apiHasOpenAI) {
        return { available: false, reason: 'OpenAI API 키를 설정해야 사용할 수 있습니다.' };
      }
    } else if (provider === 'gemini') {
      // Gemini는 TTS/이미지 기능에만 사용자 키 필요
      if (requiresUserKey && !apiHasGemini) {
        return { available: false, reason: 'Gemini API 키를 설정해야 사용할 수 있습니다.' };
      }
    }

    return { available: true };
  };

  const pageProps: PageProps = {
    onOpenFile: handleOpenFile,
    setActiveView: setActiveView,
    onActivityClick: handleActivityItemClick,
    apiTask: {
      startTask: apiTaskContext.startTask,
      completeTask: apiTaskContext.completeTask,
      errorTask: apiTaskContext.errorTask,
      getTaskStatus: apiTaskContext.getTaskStatus,
      clearTaskIfCompleted: apiTaskContext.clearTaskIfCompleted,
    },
  };

  return (
    <div className="flex w-full flex-col bg-[#1e1e1e] text-gray-300 font-sans overflow-hidden" style={{ height: 'var(--app-height, 100vh)' }}>
      {isOffline && (
        <div className="bg-amber-500/90 text-black text-sm px-3 py-2 flex items-center justify-between">
          <span>현재 오프라인입니다. 연결이 복구되면 자동으로 다시 시도합니다.</span>
        </div>
      )}
      {updateToastVisible && (
        <div
          className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom,0)+4rem)] md:bottom-[calc(env(safe-area-inset-bottom,0)+3.5rem)] z-50 max-w-sm rounded-md border border-amber-500/70 bg-[#1e1e1e] shadow-lg text-amber-100 p-4 flex flex-col gap-3"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {updateToastType === 'available' ? (
                <Icon name="alert" className="w-5 h-5"/>
              ) : (
                <Icon name="info" className="w-5 h-5"/>
              )}
            </div>
            <div className="flex-1 text-sm leading-5">
              <p className="font-semibold text-amber-300">{updateToastType === 'available' ? '새로운 버전이 준비되었습니다.' : '업데이트 확인'}</p>
              <p className="mt-1 text-amber-100/80">
                {updateToastType === 'available'
                  ? (updateCountdown > 0 ? `${updateCountdown}초 후 자동으로 새로고침됩니다.` : '잠시 후 자동으로 새로고침됩니다.')
                  : (updateToastMessage || '현재 최신 버전입니다.')}
              </p>
            </div>
          </div>
          {updateToastType === 'available' ? (
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={handleDismissUpdateToast}
                className="px-3 py-1 rounded border border-amber-400/60 text-amber-200 hover:bg-amber-500/10"
              >
                나중에 알림 숨기기
              </button>
              <button
                type="button"
                onClick={handleReloadForUpdate}
                className="px-3 py-1 rounded bg-amber-400 text-black font-semibold hover:bg-amber-300"
              >
                지금 업데이트
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={handleDismissUpdateToast}
                className="px-3 py-1 rounded border border-amber-400/60 text-amber-200 hover:bg-amber-500/10"
              >
                닫기
              </button>
            </div>
          )}
        </div>
      )}
      {/* Top title bar (VS Code style) */}
      <div className="h-8 bg-[#2d2d2d] border-b border-black/30 flex items-center px-2 shrink-0">
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center justify-center h-5 w-5 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
          aria-label="홈으로 이동 및 새로고침"
        >
          <img
            src={logo}
            alt="HunyDev logo"
            className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`}
            decoding="async"
          />
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-pressed={isSidebarPinned}
            onClick={toggleSidebarPinned}
            className={`p-1.5 rounded hover:bg-white/10 text-gray-300 ${isSidebarPinned ? 'text-white' : 'text-gray-300'}`}
            title={isSidebarPinned ? '기본 사이드바: 설정됨' : '기본 사이드바: 해제됨'}
          >
            {isSidebarPinned ? (
              // Pinned: filled left panel icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 3a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h12zm0 2h-9v14h9a1 1 0 0 0 .993 -.883l.007 -.117v-12a1 1 0 0 0 -.883 -.993l-.117 -.007zm-2.293 4.293a1 1 0 0 1 .083 1.32l-.083 .094l-1.292 1.293l1.292 1.293a1 1 0 0 1 .083 1.32l-.083 .094a1 1 0 0 1 -1.32 .083l-.094 -.083l-2 -2a1 1 0 0 1 -.083 -1.32l.083 -.094l2 -2a1 1 0 0 1 1.414 0z" />
              </svg>
            ) : (
              // Unpinned: outline left panel icon
              <svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="currentColor"  className="w-5 h-5">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 3a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-12a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h12zm0 2h-9v14h9a1 1 0 0 0 .993 -.883l.007 -.117v-12a1 1 0 0 0 -.883 -.993l-.117 -.007zm-4.387 4.21l.094 .083l2 2a1 1 0 0 1 .083 1.32l-.083 .094l-2 2a1 1 0 0 1 -1.497 -1.32l.083 -.094l1.292 -1.293l-1.292 -1.293a1 1 0 0 1 -.083 -1.32l.083 -.094a1 1 0 0 1 1.32 -.083z" />
              </svg>
            )}
            {/* Settings and modals are declared outside the header */}
          </button>

          {/* Close all tabs */}
          <button
            type="button"
            onClick={handleCloseAllTabs}
            className="p-1.5 rounded hover:bg-white/10 text-gray-300 disabled:opacity-40"
            aria-label="모든 탭 닫기"
            title="Close all tabs"
            disabled={!openTabs.some(t => !t.pinned)}
          >
            <svg  xmlns="http://www.w3.org/2000/svg"  className="w-5 h-5" viewBox="0 0 24 24"  fill="currentColor"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18.333 6a3.667 3.667 0 0 1 3.667 3.667v8.666a3.667 3.667 0 0 1 -3.667 3.667h-8.666a3.667 3.667 0 0 1 -3.667 -3.667v-8.666a3.667 3.667 0 0 1 3.667 -3.667zm-3.333 -4c1.094 0 1.828 .533 2.374 1.514a1 1 0 1 1 -1.748 .972c-.221 -.398 -.342 -.486 -.626 -.486h-10c-.548 0 -1 .452 -1 1v9.998c0 .32 .154 .618 .407 .805l.1 .065a1 1 0 1 1 -.99 1.738a3 3 0 0 1 -1.517 -2.606v-10c0 -1.652 1.348 -3 3 -3zm.8 8.786l-1.837 1.799l-1.749 -1.785a1 1 0 0 0 -1.319 -.096l-.095 .082a1 1 0 0 0 -.014 1.414l1.749 1.785l-1.835 1.8a1 1 0 0 0 -.096 1.32l.082 .095a1 1 0 0 0 1.414 .014l1.836 -1.8l1.75 1.786a1 1 0 0 0 1.319 .096l.095 -.082a1 1 0 0 0 .014 -1.414l-1.75 -1.786l1.836 -1.8a1 1 0 0 0 .096 -1.319l-.082 -.095a1 1 0 0 0 -1.414 -.014" /></svg>
          </button>

          {/* OSS info (Open Source Notices) */}
          <button
            type="button"
            onClick={() => setOssOpen(true)}
            className="p-1.5 rounded hover:bg-white/10 text-gray-300"
            aria-label="Open Source Notices"
            title="Open Source Notices"
          >
            <svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="currentColor"  className="w-5 h-5"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12.283 2.004a10 10 0 0 1 3.736 19.155a1 1 0 0 1 -1.332 -.551l-2.193 -5.602a1 1 0 0 1 .456 -1.245a2 2 0 1 0 -1.9 0a1 1 0 0 1 .457 1.244l-2.193 5.603a1 1 0 0 1 -1.332 .552a10 10 0 0 1 4.018 -19.16z" /></svg>
          </button>

          {/* SNS dropdown trigger */}
          <div className="relative" ref={socialRef}>
            <button
              type="button"
              onClick={() => setSocialOpen(v => !v)}
              className="p-1.5 rounded hover:bg-white/10 text-gray-300"
              title="연락처 · SNS"
              aria-haspopup="menu"
              aria-expanded={socialOpen}
            >
              {/* User icon */}
              <svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="currentColor"  className="w-5 h-5"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18.5 3a2.5 2.5 0 1 1 -.912 4.828l-4.556 4.555a5.475 5.475 0 0 1 .936 3.714l2.624 .787a2.5 2.5 0 1 1 -.575 1.916l-2.623 -.788a5.5 5.5 0 0 1 -10.39 -2.29l-.004 -.222l.004 -.221a5.5 5.5 0 0 1 2.984 -4.673l-.788 -2.624a2.498 2.498 0 0 1 -2.194 -2.304l-.006 -.178l.005 -.164a2.5 2.5 0 1 1 4.111 2.071l.787 2.625a5.475 5.475 0 0 1 3.714 .936l4.555 -4.556a2.487 2.487 0 0 1 -.167 -.748l-.005 -.164l.005 -.164a2.5 2.5 0 0 1 2.495 -2.336z" /></svg>
            </button>

            {socialOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[#2d2d2d] border border-black/30 rounded shadow-lg z-50">
                <ul className="py-1">
                  {(() => {
                    const items = ACTIVITY_BAR_ITEMS.filter((i: any) => i.section === 'bottom');
                    // Featured links at the top of the menu, in order: Blog, Apps, Sites
                    const featuredOrder = [ViewId.Blog, ViewId.Apps, ViewId.Sites];
                    const featured = featuredOrder
                      .map((id) => items.find((i: any) => i.id === id))
                      .filter(Boolean) as any[];
                    const featuredIds = new Set(featured.map((i: any) => i.id));
                    const rest = items.filter((i: any) => !featuredIds.has(i.id));

                    const renderItem = (item: any) => {
                      const link = EXTERNAL_LINKS[item.id as keyof typeof EXTERNAL_LINKS];
                      if (!link) return null;
                      const href = link.url;
                      const isMail = href.startsWith('mailto:');
                      return (
                        <li key={item.id} className="w-full">
                          <a
                            href={href}
                            target={isMail ? undefined : '_blank'}
                            rel={isMail ? undefined : 'noopener'}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/10"
                          >
                            <span className="text-gray-300">
                              <Icon name={item.icon} className="w-4 h-4" aria-label={item.ariaLabel ?? link.title} />
                            </span>
                            <span>{link.title}</span>
                          </a>
                        </li>
                      );
                    };

                    return (
                      <>
                        {featured.map(renderItem)}
                        {featured.length > 0 && (
                          <li role="separator" aria-hidden className="my-1 border-t border-white/10" />
                        )}
                        {rest.map(renderItem)}
                      </>
                    );
                  })()}
                </ul>
              </div>
            )}
          </div>

          {/* Settings dropdown trigger */}
          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={() => setSettingsOpen(v => !v)}
              className="p-1.5 rounded hover:bg-white/10 text-gray-300"
              title="설정"
              aria-haspopup="menu"
              aria-expanded={settingsOpen}
            >
              <svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="currentColor"  className="w-5 h-5"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z" /></svg>
            </button>
            {settingsOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[#2d2d2d] border border-black/30 rounded shadow-lg z-50">
                <ul className="py-1">
                  <li className="w-full px-3 py-1.5 text-xs uppercase tracking-wide text-gray-400 font-semibold select-none pointer-events-none">
                    버전 {APP_VERSION}
                  </li>
                  <li role="separator" aria-hidden className="my-1 border-t border-white/10" />
                  <li className="w-full">
                    {updateAvailable ? (
                      <button
                        type="button"
                        className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/10 text-amber-200"
                        onClick={() => {
                          setSettingsOpen(false);
                          handleReloadForUpdate();
                        }}
                      >
                        <span className="inline-flex w-4 h-4 items-center justify-center" aria-hidden>
                        <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="w-4 h-4"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /><path d="M12 9l0 3" /><path d="M12 15l.01 0" /></svg>
                        </span>
                        <span>지금 업데이트</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/10 text-gray-300"
                        onClick={() => {
                          setSettingsOpen(false);
                          checkForUpdates();
                        }}
                      >
                        <span className="inline-flex w-4 h-4 items-center justify-center" aria-hidden>
                        <svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="w-4 h-4"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 20.777a8.942 8.942 0 0 1 -2.48 -.969" /><path d="M14 3.223a9.003 9.003 0 0 1 0 17.554" /><path d="M4.579 17.093a8.961 8.961 0 0 1 -1.227 -2.592" /><path d="M3.124 10.5c.16 -.95 .468 -1.85 .9 -2.675l.169 -.305" /><path d="M6.907 4.579a8.954 8.954 0 0 1 3.093 -1.356" /><path d="M9 12l2 2l4 -4" /></svg>
                        </span>
                        <span>업데이트 확인</span>
                      </button>
                    )}
                  </li>
                  <li role="separator" aria-hidden className="my-1 border-t border-white/10" />
                  <li className="w-full">
                    <button
                      type="button"
                      className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/10 text-gray-300"
                      onClick={() => {
                        setSettingsOpen(false);
                        setSignInOpen(true);
                      }}
                    >
                      <span className="inline-flex w-4 h-4 items-center justify-center" aria-hidden>
                        <svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="w-4 h-4"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M21 12h-13l3 -3" /><path d="M11 15l-3 -3" /></svg>
                      </span>
                      <span>Sign In</span>
                    </button>
                  </li>
                  <li role="separator" aria-hidden className="my-1 border-t border-white/10" />
                  <li className="w-full">
                    <button type="button" className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/10 text-gray-200" onClick={() => { setSettingsOpen(false); openApiKeyModal(); }}>
                      <span className="inline-flex w-4 h-4 items-center justify-center" aria-hidden>
                        <svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="w-4 h-4"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z" /><path d="M15 9h.01" /></svg>
                      </span>
                      <span>API Key</span>
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 min-w-0 min-h-0 relative overflow-hidden" style={{ minHeight: 0 }}>
        <ActivityBar
          activeView={activeView}
          setActiveView={setActiveView}
          isSidebarPinned={isSidebarPinned}
          onItemClick={handleActivityItemClick}
        />
        {isSidebarPinned && (
          <>
            <Sidebar activeView={activeView} onOpenFile={handleOpenFile} width={sidebarWidth} apiHasGemini={apiHasGemini} apiHasOpenAI={apiHasOpenAI} />
            <div
              className={`w-1 cursor-col-resize bg-transparent hover:bg-white/10 ${isResizing ? 'bg-blue-500/40' : ''}`}
              onMouseDown={handleSidebarResizeStart}
            />
          </>
        )}
        <MainPanel
          openTabs={openTabs}
          activeTabId={activeTabId}
          onTabClick={setActiveTabId}
          onCloseTab={handleCloseTab}
          pageProps={pageProps}
          onTogglePin={(id) => {
            setOpenTabs(prev => {
              const idx = prev.findIndex(t => t.id === id);
              if (idx === -1) return prev;
              const next = [...prev];
              const target = { ...next[idx], pinned: !next[idx].pinned };
              next[idx] = target;
              if (target.pinned) {
                // Move to left-most position
                next.splice(idx, 1);
                next.unshift(target);
              }
              return next;
            });
          }}
          onOpenInNewWindow={handleOpenInNewWindow}
          onShowInMenu={handleShowInMenu}
          onShareTab={handleShareTab}
          onShareAllTabs={handleShareAllTabs}
          onCloseTabsToRight={handleCloseTabsToRight}
          onCloseOtherTabs={handleCloseOtherTabs}
          onCloseAllTabs={handleCloseAllTabs}
        />
        {/* Overlay sidebar when unpinned */}
        {!isSidebarPinned && (
          <div
            className={`absolute inset-y-0 left-12 z-30 transform transition-transform duration-200 ${overlayOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'}`}
            style={{ width: sidebarWidth }}
          >
            {overlayView && (
              <Sidebar activeView={overlayView} onOpenFile={handleOpenFile} width={sidebarWidth} apiHasGemini={apiHasGemini} apiHasOpenAI={apiHasOpenAI} />
            )}
          </div>
        )}
        {/* Click-outside mask: close overlay when clicking main panel area */}
        {!isSidebarPinned && overlayOpen && (
          <div
            className="absolute inset-0 left-12 z-20"
            onClick={() => setOverlayOpen(false)}
            aria-hidden
          />
        )}
      </div>

      {/* Open Source Notices Modal */}
      {ossOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setOssOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="oss-modal-title"
            ref={ossModalRef}
            className="relative mx-auto mt-24 w-[min(92vw,560px)] max-h-[80vh] overflow-hidden bg-[#252526] border border-white/10 rounded-lg shadow-xl p-4 text-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="shrink-0 p-1.5 rounded bg-white/10">
                <svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="w-5 h-5"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3a9 9 0 0 1 3.618 17.243l-2.193 -5.602a3 3 0 1 0 -2.849 0l-2.193 5.603a9 9 0 0 1 3.617 -17.244z" /></svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="oss-modal-title" className="text-lg font-semibold text-white">Open Source Notices</h2>
                <p className="text-sm text-gray-400">huny.dev는 다음과 같은 오픈소스 프로젝트 위에서 동작합니다. 각 프로젝트의 라이선스를 준수하며 감사의 마음을 전합니다.</p>
              </div>
              <button onClick={() => setOssOpen(false)} className="ml-2 p-1.5 rounded hover:bg-white/10 text-gray-300" aria-label="닫기" title="닫기">
                <Icon name="close" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto pr-1 text-sm space-y-4">
              <section>
                <h3 className="text-sm font-semibold text-white mb-2">Frontend Runtime</h3>
                <ul className="space-y-1 text-gray-300">
                  <li><span className="font-medium text-white">React 19.1.1 / React DOM 19.1.1</span> — MIT License</li>
                  <li><span className="font-medium text-white">highlight.js 11.9.0</span> — BSD 3-Clause License</li>
                  <li><span className="font-medium text-white">Iconography & UI reference</span> — Inspired by VS Code (Microsoft)</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-white mb-2">Media & Document Processing</h3>
                <ul className="space-y-1 text-gray-300">
                  <li><span className="font-medium text-white">@ffmpeg/ffmpeg 0.12.15 / @ffmpeg/util 0.12.2</span> — LGPL-3.0-or-later License</li>
                  <li><span className="font-medium text-white">jspdf 2.5.2</span> — MIT License</li>
                  <li><span className="font-medium text-white">pdf-lib 1.17.1</span> — MIT License</li>
                  <li><span className="font-medium text-white">pdfjs-dist 5.4.394</span> — Apache-2.0 License</li>
                  <li><span className="font-medium text-white">dom-to-image-more 3.7.2</span> — MIT License</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-white mb-2">Maps & Visualization</h3>
                <ul className="space-y-1 text-gray-300">
                  <li><span className="font-medium text-white">Leaflet 1.9.4</span> — BSD 2-Clause License</li>
                  <li><span className="font-medium text-white">react-leaflet 5.0.0</span> — Hippocratic-2.1 License</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-white mb-2">Utilities</h3>
                <ul className="space-y-1 text-gray-300">
                  <li><span className="font-medium text-white">cron-parser 5.4.0 / cronstrue 3.9.0</span> — MIT License</li>
                  <li><span className="font-medium text-white">dommatrix 0.1.1</span> — MIT License</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-white mb-2">Build & Tooling</h3>
                <ul className="space-y-1 text-gray-300">
                  <li><span className="font-medium text-white">Vite 6.2.0</span> — MIT License</li>
                  <li><span className="font-medium text-white">@vitejs/plugin-react 4.3.4</span> — MIT License</li>
                  <li><span className="font-medium text-white">TypeScript ~5.8.2</span> — Apache-2.0 License</li>
                  <li><span className="font-medium text-white">Tailwind CSS 3.4.17</span> — MIT License</li>
                  <li><span className="font-medium text-white">PostCSS 8.4.40 / Autoprefixer 10.4.20</span> — MIT License</li>
                  <li><span className="font-medium text-white">Wrangler 4.35.0</span> — Apache-2.0 License</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-white mb-2">Runtime Infrastructure</h3>
                <ul className="space-y-1 text-gray-300">
                  <li><span className="font-medium text-white">Cloudflare Workers</span> — Terms of Service</li>
                  <li><span className="font-medium text-white">@cloudflare/workers-types 4.20250204.0</span> — Apache-2.0 License</li>
                  <li><span className="font-medium text-white">@types/node 22.14.0</span> — MIT License</li>
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-white mb-2">소스 코드</h3>
                <p className="text-gray-300">이 프로젝트의 맞춤형 코드와 에셋은 별도 고지되지 않은 한 MIT License로 배포됩니다. 자세한 내용은 <a href="https://github.com/hunydev/huny.dev" className="text-blue-300 hover:text-blue-200" target="_blank" rel="noopener noreferrer">GitHub 저장소</a>를 참고하세요.</p>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      {signInOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setSignInOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="signin-modal-title"
            ref={signInModalRef}
            className="relative mx-auto mt-24 w-[min(92vw,460px)] bg-[#252526] border border-white/10 rounded-lg shadow-xl p-5 text-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="shrink-0 p-1.5 rounded bg-white/10">
                <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="w-5 h-5"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /></svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="signin-modal-title" className="text-lg font-semibold text-white">Sign In</h2>
                <p className="text-sm text-gray-400">계정 로그인 기능은 준비 중입니다. 아래 정보를 입력하고 필요한 경우 계정/비밀번호 찾기를 이용하세요.</p>
              </div>
              <button onClick={() => setSignInOpen(false)} className="ml-2 p-1.5 rounded hover:bg-white/10 text-gray-300" aria-label="닫기" title="닫기">
                <Icon name="close" />
              </button>
            </div>

            <form className="space-y-4 text-sm" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="signin-email" className="block text-gray-300 mb-1">이메일</label>
                <input
                  id="signin-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="signin-password" className="block text-gray-300 mb-1">비밀번호</label>
                <input
                  id="signin-password"
                  type="password"
                  required
                  placeholder="비밀번호"
                  className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-xs text-blue-300">
                <button type="button" className="hover:text-blue-200" onClick={() => window.open('mailto:hi@huny.dev?subject=Account%20Help', '_blank')}>
                  아이디 찾기
                </button>
                <button type="button" className="hover:text-blue-200" onClick={() => window.open('mailto:hi@huny.dev?subject=Password%20Reset', '_blank')}>
                  비밀번호 찾기
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" className="px-3 py-2 rounded text-sm border border-white/10 text-gray-300 hover:bg-white/10" onClick={() => setSignInOpen(false)}>
                  취소
                </button>
                <button type="submit" className="px-3 py-2 rounded text-sm border border-white/10 text-white opacity-50 cursor-not-allowed" disabled>
                  로그인 (준비 중)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {apiModalOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setApiModalOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="apikey-modal-title"
            ref={apiModalRef}
            className="relative mx-auto mt-24 w-[min(92vw,560px)] bg-[#252526] border border-white/10 rounded-lg shadow-xl p-4 text-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="shrink-0 p-1.5 rounded bg-white/10">
              <svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="w-5 h-5"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z" /><path d="M15 9h.01" /></svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="apikey-modal-title" className="text-lg font-semibold text-white">API Key 설정</h2>
                <p className="text-sm text-gray-400 mb-2">Playground AI 도구를 사용하기 위한 API 키를 설정합니다. 값은 암호화되어 브라우저에 저장됩니다.</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• <span className="text-amber-300">OpenAI API</span>: 모든 기능에 사용자 키 필수 (서버 기본값 사용 불가)</p>
                  <p>• <span className="text-blue-300">Gemini API</span>: TTS 및 이미지 생성 기능에만 사용자 키 필수</p>
                </div>
              </div>
              <button onClick={() => setApiModalOpen(false)} className="ml-2 p-1.5 rounded hover:bg-white/10 text-gray-300" aria-label="닫기" title="닫기">
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
                      onClick={() => deleteApiKey('gemini')}
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
                      onClick={() => deleteApiKey('openai')}
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
                <button type="button" className="px-3 py-2 rounded text-sm border border-white/10 text-gray-300 hover:bg-white/10" onClick={() => setApiModalOpen(false)} disabled={apiSaving}>취소</button>
                <button type="button" className="px-3 py-2 rounded text-sm border border-white/10 text-white hover:bg-white/10 disabled:opacity-60" onClick={saveApiKeys} disabled={apiSaving}>{apiSaving ? '저장 중…' : '저장'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom status bar (VS Code style) */}
      <div className="bg-[#252526] text-gray-300 text-[11px] border-t border-black/30 flex flex-col items-start px-3 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] gap-1 md:h-7 md:flex-row md:items-center md:py-0 md:pb-[env(safe-area-inset-bottom)] md:gap-0 relative z-50 shrink-0">
        <div className="flex-1 min-w-0">
          <span className="block truncate">This site is inspired by the Visual Studio Code UI. Not affiliated with or endorsed by Microsoft.</span>
        </div>
        <span className="w-full text-right md:w-auto">© 2025 HunyDev · All rights reserved.</span>
      </div>
    </div>
  );
};

const AppWithProvider: React.FC = () => {
  return (
    <ApiTaskProvider>
      <App />
    </ApiTaskProvider>
  );
};

export default AppWithProvider;
