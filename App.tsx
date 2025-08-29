import React, { useState, useCallback, useEffect, useRef } from 'react';
import ActivityBar from './components/ActivityBar';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import { ViewId, Tab, PageProps } from './types';
import { PAGES, ACTIVITY_BAR_ITEMS, EXTERNAL_LINKS } from './constants';
import logo from './logo_128x128.png';

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

  const handleOpenFile = useCallback((fileId: string) => {
    const pageInfo = PAGES[fileId];
    if (!pageInfo) return;
    setOpenTabs(prevTabs => {
      const exists = prevTabs.some(tab => tab.id === fileId);
      if (exists) return prevTabs;
      const newTab: Tab = {
        id: fileId,
        title: pageInfo.title,
        icon: pageInfo.icon,
      };
      return [...prevTabs, newTab];
    });
    setActiveTabId(fileId);
  }, []);

  useEffect(() => {
    // Open welcome tab on initial load (deduped inside handleOpenFile)
    handleOpenFile('welcome');
  }, [handleOpenFile]);

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
      if (target && !socialRef.current.contains(target)) {
        setSocialOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSocialOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const pageProps: PageProps = {
    onOpenFile: handleOpenFile,
    setActiveView: setActiveView,
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#1e1e1e] text-gray-300 font-sans overflow-hidden">
      {/* Top title bar (VS Code style) */}
      <div className="h-8 bg-[#2d2d2d] border-b border-black/30 flex items-center px-2">
        <img src={logo} alt="HunyDev logo" className="h-5 w-5" />
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5s-5 2.239-5 5s2.239 5 5 5m0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z" />
              </svg>
            </button>

            {socialOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-[#2d2d2d] border border-black/30 rounded shadow-lg z-50">
                <ul className="py-1">
                  {ACTIVITY_BAR_ITEMS.filter((i: any) => i.section === 'bottom').map(item => {
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
                          <span className="text-gray-300">{item.icon}</span>
                          <span>{link.title}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 min-w-0 min-h-0 relative">
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
      </div>

      {/* Bottom status bar (VS Code style) */}
      <div className="bg-[#252526] text-gray-300 text-[11px] border-t border-black/30 flex flex-col items-start px-3 py-1.5 gap-1 md:h-7 md:flex-row md:items-center md:py-0 md:gap-0">
        <div className="flex-1 min-w-0">
          <span className="block truncate">This site is inspired by the Visual Studio Code UI. Not affiliated with or endorsed by Microsoft.</span>
        </div>
        <span className="w-full text-right md:w-auto">© 2025 HunyDev · All rights reserved.</span>
      </div>
    </div>
  );
};

export default App;
