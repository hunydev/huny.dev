import React, { useState, useCallback, useEffect, useRef } from 'react';
import ActivityBar from './components/ActivityBar';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import { ViewId, Tab, PageProps } from './types';
import { PAGES, ACTIVITY_BAR_ITEMS, EXTERNAL_LINKS, Icon } from './constants';
import logo from './logo_128x128.png';
import { getCategoryById } from './components/pages/bookmarksData';
import { getNoteGroupById } from './components/pages/notesData';
import { getAppCategoryById, getAppById } from './components/pages/appsData';
import { getDocBySlug } from './components/pages/docsData';
import { MONITOR_GROUPS, getMonitorItemById } from './components/pages/monitorData';
import { extractBaseId, viewForTabId } from './utils/navigation';
import { ApiTaskProvider, useApiTask } from './contexts/ApiTaskContext';

const APP_VERSION = '2025.10.10.1';

const TABS_STORAGE_KEY = 'app.openTabs.v1';
const DEFAULT_TAB_IDS: readonly string[] = ['welcome', 'works', 'domain', 'about'];

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
  const [apiHasGemini, setApiHasGemini] = useState<boolean>(false);
  const [apiHasOpenAI, setApiHasOpenAI] = useState<boolean>(false);
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
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      registration.waiting.addEventListener('statechange', (event) => {
        const target = event.target as ServiceWorker;
        if (target.state === 'activated') {
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
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
  }, []);

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

  // Keep left sidebar selection in sync with the active tab
  useEffect(() => {
    if (!activeTabId) return;
    const v = viewForTabId(activeTabId);
    setActiveView(v);
  }, [activeTabId]);

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

  // Restore API key meta flags
  useEffect(() => {
    try {
      const raw = localStorage.getItem('secure.apikeys.meta.v1');
      if (raw) {
        const meta = JSON.parse(raw) as { gemini?: boolean; openai?: boolean };
        setApiHasGemini(!!meta?.gemini);
        setApiHasOpenAI(!!meta?.openai);
      }
    } catch {}
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <path d="M12 9v4m0 4h.01" />
                  <path d="M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.11 3.86a1 1 0 0 0-1.72 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <path d="M12 5a7 7 0 1 0 7 7a7 7 0 0 0-7-7m0 3a1 1 0 1 1-1 1a1 1 0 0 1 1-1m1 4.5V17h-2v-4.5z" />
                </svg>
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
                <rect x="3" y="4" width="6" height="16" rx="1" />
                <rect x="10" y="4" width="11" height="16" rx="1" fill="currentColor" opacity="0.3" />
              </svg>
            ) : (
              // Unpinned: outline left panel icon
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-5 h-5">
                <rect x="3" y="4" width="18" height="16" rx="1" />
                <line x1="9" y1="4" x2="9" y2="20" />
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-5 h-5"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"><path d="m8.621 8.086l-.707-.707L6.5 8.793L5.086 7.379l-.707.707L5.793 9.5l-1.414 1.414l.707.707L6.5 10.207l1.414 1.414l.707-.707L7.207 9.5z" /><path d="m5 3l1-1h7l1 1v7l-1 1h-2v2l-1 1H3l-1-1V6l1-1h2zm1 2h4l1 1v4h2V3H6zm4 1H3v7h7z" /></g></svg>
          </button>

          {/* OSS info (Open Source Notices) */}
          <button
            type="button"
            onClick={() => setOssOpen(true)}
            className="p-1.5 rounded hover:bg-white/10 text-gray-300"
            aria-label="Open Source Notices"
            title="Open Source Notices"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20m0 4a1.25 1.25 0 1 1 0 2.5A1.25 1.25 0 0 1 12 6m-1.5 4h3v8h-3z" />
            </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="currentColor" d="M21 2H6a2 2 0 0 0-2 2v3H2v2h2v2H2v2h2v2H2v2h2v3a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1m-8 2.999c1.648 0 3 1.351 3 3A3.01 3.01 0 0 1 13 11c-1.647 0-3-1.353-3-3.001c0-1.649 1.353-3 3-3M19 18H7v-.75c0-2.219 2.705-4.5 6-4.5s6 2.281 6 4.5z"/>
              </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                <path fill="currentColor" fill-rule="evenodd" d="M14.208 4.83q.68.21 1.3.54l1.833-1.1a1 1 0 0 1 1.221.15l1.018 1.018a1 1 0 0 1 .15 1.221l-1.1 1.833q.33.62.54 1.3l2.073.519a1 1 0 0 1 .757.97v1.438a1 1 0 0 1-.757.97l-2.073.519q-.21.68-.54 1.3l1.1 1.833a1 1 0 0 1-.15 1.221l-1.018 1.018a1 1 0 0 1-1.221.15l-1.833-1.1q-.62.33-1.3.54l-.519 2.073a1 1 0 0 1-.97.757h-1.438a1 1 0 0 1-.97-.757l-.519-2.073a7.5 7.5 0 0 1-1.3-.54l-1.833 1.1a1 1 0 0 1-1.221-.15L4.42 18.562a1 1 0 0 1-.15-1.221l1.1-1.833a7.5 7.5 0 0 1-.54-1.3l-2.073-.519A1 1 0 0 1 2 12.72v-1.438a1 1 0 0 1 .757-.97l2.073-.519q.21-.68.54-1.3L4.27 6.66a1 1 0 0 1 .15-1.221L5.438 4.42a1 1 0 0 1 1.221-.15l1.833 1.1q.62-.33 1.3-.54l.519-2.073A1 1 0 0 1 11.28 2h1.438a1 1 0 0 1 .97.757zM12 16a4 4 0 1 0 0-8a4 4 0 0 0 0 8"/>
              </svg>
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
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 6a1 1 0 0 1 1 1v3h3a1 1 0 1 1 0 2h-3v3a1 1 0 0 1-2 0v-3H8a1 1 0 1 1 0-2h3V7a1 1 0 0 1 1-1Z"/><path d="M4.222 4.222a1 1 0 0 1 1.414 0L7.05 5.636A7 7 0 0 1 18 9a1 1 0 1 1-2 0a5 5 0 0 0-8.536-3.536l1.414 1.414a1 1 0 0 1-1.414 1.414L4.222 5.636a1 1 0 0 1 0-1.414Zm15.556 15.556a1 1 0 0 1-1.414 0L16.95 18.364A7 7 0 0 1 6 15a1 1 0 1 1 2 0a5 5 0 0 0 8.536 3.536l-1.414-1.414a1 1 0 0 1 1.414-1.414l2.828 2.828a1 1 0 0 1 0 1.414Z"/></svg>
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
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 5c-.795 0-1.559.118-2.28.337l.915-.916L9.22 3l-3.01 3.011l3.01 3.01l1.415-1.414l-.845-.844A6.973 6.973 0 0 1 12 7c3.86 0 7 3.14 7 7a7 7 0 0 1-7 7a7.003 7.003 0 0 1-6.934-6H4a9 9 0 0 0 9 9a9 9 0 0 0 9-9a9 9 0 0 0-9-9Zm0 5a1 1 0 0 0-1 1v3.586l-1.293-1.293l-1.414 1.414L12 17.414l3.707-3.707l-1.414-1.414L13 14.586V11a1 1 0 0 0-1-1Z"/></svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M20 12a1 1 0 0 0-1-1h-7.59l2.3-2.29a1 1 0 1 0-1.42-1.42l-4 4a1 1 0 0 0-.21.33a1 1 0 0 0 0 .76a1 1 0 0 0 .21.33l4 4a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42L11.41 13H19a1 1 0 0 0 1-1M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-3a1 1 0 0 0-2 0v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3a1 1 0 0 0 2 0V5a3 3 0 0 0-3-3"/></svg>
                      </span>
                      <span>Sign In</span>
                    </button>
                  </li>
                  <li role="separator" aria-hidden className="my-1 border-t border-white/10" />
                  <li className="w-full">
                    <button type="button" className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/10 text-gray-200" onClick={() => { setSettingsOpen(false); openApiKeyModal(); }}>
                      <span className="inline-flex w-4 h-4 items-center justify-center" aria-hidden>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" fill-rule="evenodd" d="M22 8.293c0 3.476-2.83 6.294-6.32 6.294c-.636 0-2.086-.146-2.791-.732l-.882.878c-.519.517-.379.669-.148.919c.096.105.208.226.295.399c0 0 .735 1.024 0 2.049c-.441.585-1.676 1.404-3.086 0l-.294.292s.881 1.025.147 2.05c-.441.585-1.617 1.17-2.646.146l-1.028 1.024c-.706.703-1.568.293-1.91 0l-.883-.878c-.823-.82-.343-1.708 0-2.05l7.642-7.61s-.735-1.17-.735-2.78c0-3.476 2.83-6.294 6.32-6.294S22 4.818 22 8.293m-6.319 2.196a2.2 2.2 0 0 0 2.204-2.195a2.2 2.2 0 0 0-2.204-2.196a2.2 2.2 0 0 0-2.204 2.196a2.2 2.2 0 0 0 2.204 2.195" clip-rule="evenodd"/></svg>
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
            <Sidebar activeView={activeView} onOpenFile={handleOpenFile} width={sidebarWidth} />
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
              <Sidebar activeView={overlayView} onOpenFile={handleOpenFile} width={sidebarWidth} />
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m0 18a8 8 0 1 1 8-8a8.009 8.009 0 0 1-8 8m0-13a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 12 7m1.5 10h-3v-1.5h1V11.5h-1V10h2v5.5h1z" /></svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="oss-modal-title" className="text-lg font-semibold text-white">Open Source Notices</h2>
                <p className="text-sm text-gray-400">huny.dev는 다음과 같은 오픈소스 프로젝트 위에서 동작합니다. 각 프로젝트의 라이선스를 준수하며 감사의 마음을 전합니다.</p>
              </div>
              <button onClick={() => setOssOpen(false)} className="ml-2 p-1.5 rounded hover:bg-white/10 text-gray-300" aria-label="닫기" title="닫기">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M3.72 3.22a.75.75 0 0 1 1.06 0L8 6.44l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 7.5l3.22 3.22a.75.75 0 0 1-1.06 1.06L8 8.56l-3.22 3.22a.75.75 0 1 1-1.06-1.06L6.94 7.5L3.72 4.28a.75.75 0 0 1 0-1.06Z" /></svg>
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
                <h3 className="text-sm font-semibold text-white mb-2">Build & Tooling</h3>
                <ul className="space-y-1 text-gray-300">
                  <li><span className="font-medium text-white">Vite 6.2.0</span> — MIT License</li>
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="M12 2a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11m0 13c3.866 0 7 2.239 7 5v.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 20.5V20c0-2.761 3.134-5 7-5"/></svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="signin-modal-title" className="text-lg font-semibold text-white">Sign In</h2>
                <p className="text-sm text-gray-400">계정 로그인 기능은 준비 중입니다. 아래 정보를 입력하고 필요한 경우 계정/비밀번호 찾기를 이용하세요.</p>
              </div>
              <button onClick={() => setSignInOpen(false)} className="ml-2 p-1.5 rounded hover:bg-white/10 text-gray-300" aria-label="닫기" title="닫기">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M3.72 3.22a.75.75 0 0 1 1.06 0L8 6.44l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 7.5l3.22 3.22a.75.75 0 0 1-1.06 1.06L8 8.56l-3.22 3.22a.75.75 0 1 1-1.06-1.06L6.94 7.5L3.72 4.28a.75.75 0 0 1 0-1.06Z" /></svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" fill-rule="evenodd" d="M22 8.293c0 3.476-2.83 6.294-6.32 6.294c-.636 0-2.086-.146-2.791-.732l-.882.878c-.519.517-.379.669-.148.919c.096.105.208.226.295.399c0 0 .735 1.024 0 2.049c-.441.585-1.676 1.404-3.086 0l-.294.292s.881 1.025.147 2.05c-.441.585-1.617 1.17-2.646.146l-1.028 1.024c-.706.703-1.568.293-1.91 0l-.883-.878c-.823-.82-.343-1.708 0-2.05l7.642-7.61s-.735-1.17-.735-2.78c0-3.476 2.83-6.294 6.32-6.294S22 4.818 22 8.293m-6.319 2.196a2.2 2.2 0 0 0 2.204-2.195a2.2 2.2 0 0 0-2.204-2.196a2.2 2.2 0 0 0-2.204 2.196a2.2 2.2 0 0 0 2.204 2.195" clip-rule="evenodd"/></svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="apikey-modal-title" className="text-lg font-semibold text-white">API Key 설정</h2>
                <p className="text-sm text-gray-400">여기에 설정한 키는 서버 환경변수 대신 우선적으로 사용됩니다. 값은 암호화되어 브라우저에 저장됩니다. Playground AI 도구에 활용되며 서버 기본값은 무료 키를 사용합니다.</p>
              </div>
              <button onClick={() => setApiModalOpen(false)} className="ml-2 p-1.5 rounded hover:bg-white/10 text-gray-300" aria-label="닫기" title="닫기">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M3.72 3.22a.75.75 0 0 1 1.06 0L8 6.44l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 7.5l3.22 3.22a.75.75 0 0 1-1.06 1.06L8 8.56l-3.22 3.22a.75.75 0 1 1-1.06-1.06L6.94 7.5L3.72 4.28a.75.75 0 0 1 0-1.06Z" /></svg>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="gemini-key">GEMINI_API_KEY</label>
                <input
                  id="gemini-key"
                  type="password"
                  value={apiNewGemini}
                  onChange={(e) => setApiNewGemini(e.target.value)}
                  placeholder={apiHasGemini && !apiNewGemini ? '********' : '예: AIza...'}
                  className="w-full px-2 py-2 rounded bg-black/40 border border-white/10 text-sm"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">입력하지 않으면 서버 기본값을 사용합니다.</p>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1" htmlFor="openai-key">OPENAI_API_KEY</label>
                <input
                  id="openai-key"
                  type="password"
                  value={apiNewOpenAI}
                  onChange={(e) => setApiNewOpenAI(e.target.value)}
                  placeholder={apiHasOpenAI && !apiNewOpenAI ? '********' : '예: sk-...'}
                  className="w-full px-2 py-2 rounded bg-black/40 border border-white/10 text-sm"
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">입력하지 않으면 서버 기본값을 사용합니다.</p>
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
