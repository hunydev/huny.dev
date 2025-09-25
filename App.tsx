import React, { useState, useCallback, useEffect, useRef } from 'react';
import ActivityBar from './components/ActivityBar';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import { ViewId, Tab, PageProps } from './types';
import { PAGES, ACTIVITY_BAR_ITEMS, EXTERNAL_LINKS, Icon } from './constants';
import logo from './logo_128x128.png';
import { getCategoryById } from './components/pages/bookmarksData';
import { getNoteGroupById } from './components/pages/notesData';
import { getAppCategoryById } from './components/pages/appsData';
import { getDocBySlug } from './components/pages/docsData';
import { extractBaseId, viewForTabId } from './utils/navigation';

const TABS_STORAGE_KEY = 'app.openTabs.v1';
const DEFAULT_TAB_IDS: readonly string[] = ['welcome', 'works', 'domain', 'about'];

const App: React.FC = () => {
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
  const restoredRef = useRef<boolean>(false);
  const restoringRef = useRef<boolean>(false);

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

  // Map a tab id (e.g., 'docs:intro', 'bookmark:all', 'split-speaker') to the corresponding left sidebar view
  // Default: on small screens, start with sidebar unpinned for better mobile UX
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setIsSidebarPinned(false);
      }
    } catch {}
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

    const pageInfo = PAGES[baseId] || PAGES[fileId];
    if (!pageInfo) return;

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
    } else if (baseId === 'media' && arg) {
      try {
        const payload = JSON.parse(atob(arg)) as { type?: 'image' | 'video'; name?: string; src?: string };
        const mType = payload?.type ?? 'image';
        const mName = payload?.name ?? 'file';
        tabTitle = `media (${mName})`;
        tabIcon = mType === 'image' ? <Icon name="image" /> : <Icon name="video" />;
      } catch { }
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
    } else if (baseId === 'docs') {
      const slug = arg || '';
      const doc = getDocBySlug(slug);
      const title = doc?.title || slug || 'docs';
      tabTitle = `docs – ${title}`;
      tabIcon = <Icon name="file" />;
    }

    setOpenTabs(prevTabs => {
      const exists = prevTabs.some(tab => tab.id === originalId);
      if (exists) return prevTabs;
      const newTab: Tab = {
        id: originalId,
        title: tabTitle,
        icon: tabIcon,
        pinned: false,
      };
      return [...prevTabs, newTab];
    });
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
    // Restore tabs from localStorage on initial load; fallback to Welcome
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
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
    // Fallback: open default tabs if no saved state
    DEFAULT_TAB_IDS.forEach(id => handleOpenFile(id));
    setActiveTabId(DEFAULT_TAB_IDS[0]);
  }, [handleOpenFile]);

  // Keep left sidebar selection in sync with the active tab
  useEffect(() => {
    if (!activeTabId) return;
    const v = viewForTabId(activeTabId);
    setActiveView(v);
  }, [activeTabId]);

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


  const handleCloseTab = (tabId: string) => {
    const tabIndex = openTabs.findIndex(tab => tab.id === tabId);
    const newTabs = openTabs.filter(tab => tab.id !== tabId);
    setOpenTabs(newTabs);

    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        // Activate the previous tab or the first one
        const newActiveIndex = Math.max(0, tabIndex - 1);
        setActiveTabId(newTabs[newActiveIndex].id);
      } else {
        setActiveTabId('');
      }
    }
  };

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
  };

  return (
    <div className="flex w-full flex-col bg-[#1e1e1e] text-gray-300 font-sans overflow-hidden" style={{ height: 'var(--app-height, 100vh)' }}>
      {/* Top title bar (VS Code style) */}
      <div className="h-8 bg-[#2d2d2d] border-b border-black/30 flex items-center px-2 shrink-0">
        <img src={logo} alt="HunyDev logo" className="h-5 w-5" decoding="async" />
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
              <div className="absolute right-0 top-full mt-1 w-40 bg-[#2d2d2d] border border-black/30 rounded shadow-lg z-50">
                <ul className="py-1">
                  <li className="w-full">
                    <button type="button" className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-white/10 text-gray-300" disabled>
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

export default App;
