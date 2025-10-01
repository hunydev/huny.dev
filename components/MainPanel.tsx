import React from 'react';
import { Tab, PageProps } from '../types';
import { PAGES } from '../constants';
import SitemapPage from './pages/SitemapPage';
import { useApiTask } from '../contexts/ApiTaskContext';

type TabBarProps = {
  openTabs: Tab[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onCloseTab: (id: string) => void;
  onTogglePin: (id: string) => void;
  onOpenInNewWindow: (tabId: string) => void;
  onShowInMenu: (tabId: string) => void;
  onShareTab: (tabId: string) => void;
  onShareAllTabs: () => void;
  onCloseTabsToRight: (tabId: string) => void;
  onCloseAllTabs: () => void;
};

const TabBar: React.FC<TabBarProps> = ({ openTabs, activeTabId, onTabClick, onCloseTab, onTogglePin, onOpenInNewWindow, onShowInMenu, onShareTab, onShareAllTabs, onCloseTabsToRight, onCloseAllTabs }) => {
  const apiTask = useApiTask();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const tabRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number; tabId: string } | null>(null);
  const contextMenuRef = React.useRef<HTMLDivElement | null>(null);

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    // Only translate vertical wheel to horizontal when horizontal overflow exists
    if (el.scrollWidth <= el.clientWidth) return;
    const { deltaX, deltaY } = e;
    // Choose the dominant axis; if user scrolls vertically, map it to horizontal
    const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    if (delta !== 0) {
      el.scrollLeft += delta;
      e.preventDefault();
    }
  };

  const orderedTabs = React.useMemo(() => {
    const pinned = openTabs.filter(t => t.pinned);
    const others = openTabs.filter(t => !t.pinned);
    return [...pinned, ...others];
  }, [openTabs]);

  // Auto-scroll to active tab when it changes
  React.useEffect(() => {
    const container = containerRef.current;
    const activeTabElement = tabRefs.current[activeTabId];
    
    if (container && activeTabElement) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTabElement.getBoundingClientRect();
      
      // Check if tab is not fully visible
      if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
        activeTabElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [activeTabId]);

  // Close context menu on outside click or escape
  React.useEffect(() => {
    if (!contextMenu) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  };

  const handleMenuAction = (action: () => void) => {
    setContextMenu(null);
    action();
  };

  const tabIndex = contextMenu ? openTabs.findIndex(t => t.id === contextMenu.tabId) : -1;
  const hasTabsToRight = tabIndex >= 0 && tabIndex < openTabs.length - 1;

  return (
    <>
      <div ref={containerRef} onWheel={onWheel} className="flex bg-[#252526] overflow-x-auto overflow-y-hidden shrink-0">
        {orderedTabs.map(tab => (
          <div
            key={tab.id}
            ref={(el) => { tabRefs.current[tab.id] = el; }}
            onClick={() => onTabClick(tab.id)}
            onContextMenu={(e) => handleContextMenu(e, tab.id)}
            className={`flex items-center justify-between cursor-pointer px-4 py-2 border-r border-black/30 flex-shrink-0 whitespace-nowrap ${
              activeTabId === tab.id
                ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500'
                : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#3e3e3e]'
            }`}
            title={tab.title}
          >
            <div className="flex items-center min-w-0 gap-2">
              {/* Icon wrapper with pin overlay */}
              <span className="relative inline-flex items-center justify-center group">
                {/* original icon */}
                <span className="pointer-events-none">{tab.icon}</span>
                {/* pin overlay: always visible when pinned; otherwise visible on hover */}
                <button
                  onClick={(e) => { e.stopPropagation(); onTogglePin(tab.id); }}
                  className={`${tab.pinned ? 'opacity-100 pointer-events-auto text-yellow-300' : 'opacity-0 pointer-events-none text-gray-300 group-hover:opacity-100 group-hover:pointer-events-auto'} absolute -top-1 -left-1 rotate-[-40deg] transition-opacity hover:text-yellow-200`}
                  aria-label={tab.pinned ? 'Unpin tab' : 'Pin tab'}
                  title={tab.pinned ? 'Unpin' : 'Pin'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M11 12h6v-1l-3-1V2l3-1V0H3v1l3 1v8l-3 1v1h6v7l1 1l1-1z"/>
                  </svg>
                </button>
              </span>
              <span className="text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px] md:max-w-[240px]">
                {tab.title}
              </span>
              {/* API Task Status Badge */}
              {apiTask.getTaskStatus(tab.id) === 'completed' && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-green-400" title="API 작업 완료" />
              )}
            </div>
            {/* Close button or loading indicator */}
            {apiTask.getTaskStatus(tab.id) === 'pending' ? (
              <div className="ml-4 w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" title="API 작업 중..." />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="ml-4 p-0.5 rounded hover:bg-white/20"
                aria-label={`Close tab ${tab.title}`}
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-[#252526] border border-white/10 rounded shadow-lg py-1 z-50 min-w-[200px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
            onClick={() => handleMenuAction(() => onOpenInNewWindow(contextMenu.tabId))}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
              <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
            </svg>
            새 창에서 열기
          </button>

          <button
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
            onClick={() => handleMenuAction(() => onShowInMenu(contextMenu.tabId))}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Zm0 3.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
            해당 메뉴 열기
          </button>

          <div className="h-px bg-white/10 my-1" />

          <button
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
            onClick={() => handleMenuAction(() => onShareTab(contextMenu.tabId))}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
            </svg>
            이 탭 공유
          </button>

          <button
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
            onClick={() => handleMenuAction(() => onShareAllTabs())}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3.75 2h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 12.25 14h-8.5A1.75 1.75 0 0 1 2 12.25v-8.5C2 2.784 2.784 2 3.75 2Zm6.854-1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1Z" clipRule="evenodd" />
            </svg>
            모든 탭 공유
          </button>

          <div className="h-px bg-white/10 my-1" />

          <button
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
            onClick={() => handleMenuAction(() => onCloseTab(contextMenu.tabId))}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
            </svg>
            이 탭 닫기
          </button>

          <button
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleMenuAction(() => onCloseTabsToRight(contextMenu.tabId))}
            disabled={!hasTabsToRight}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M12.78 7.595a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06l2.72-2.72-2.72-2.72a.75.75 0 0 1 1.06-1.06l3.25 3.25ZM6.28 7.595a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06l2.72-2.72-2.72-2.72a.75.75 0 0 1 1.06-1.06l3.25 3.25Z" clipRule="evenodd" />
            </svg>
            우측 탭 닫기
          </button>

          <button
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
            onClick={() => handleMenuAction(() => onCloseAllTabs())}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
            모든 탭 닫기
          </button>
        </div>
      )}
    </>
  );
};

type MainPanelProps = {
  openTabs: Tab[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onCloseTab: (id: string) => void;
  pageProps: PageProps;
  onTogglePin: (id: string) => void;
  onOpenInNewWindow: (tabId: string) => void;
  onShowInMenu: (tabId: string) => void;
  onShareTab: (tabId: string) => void;
  onShareAllTabs: () => void;
  onCloseTabsToRight: (tabId: string) => void;
  onCloseAllTabs: () => void;
};

// Helper to support dynamic tab ids, e.g. `bookmark:<categoryId>`
const parseTabRoute = (tabId: string): { baseId: string; routeParams?: Record<string, string> } => {
  const [baseId, arg] = tabId.split(':');
  if (baseId === 'bookmark') {
    return { baseId, routeParams: { categoryId: arg || 'all' } };
  }
  if (baseId === 'notes') {
    return { baseId, routeParams: { groupId: arg || '' } };
  }
  if (baseId === 'apps') {
    return { baseId, routeParams: { categoryId: arg || 'huny' } };
  }
  if (baseId === 'app') {
    return { baseId, routeParams: { appId: arg || '' } };
  }
  if (baseId === 'docs') {
    return { baseId, routeParams: { slug: arg || '' } };
  }
  if (baseId === 'monitor') {
    return { baseId, routeParams: { itemId: arg || '' } };
  }
  return { baseId };
};

const MainPanel: React.FC<MainPanelProps> = ({ openTabs, activeTabId, onTabClick, onCloseTab, pageProps, onTogglePin, onOpenInNewWindow, onShowInMenu, onShareTab, onShareAllTabs, onCloseTabsToRight, onCloseAllTabs }) => {
  const apiTask = useApiTask();

  // 활성 탭이 변경될 때 완료된 작업 정리
  React.useEffect(() => {
    if (activeTabId) {
      apiTask.clearTaskIfCompleted(activeTabId);
    }
  }, [activeTabId, apiTask]);

  // 모든 탭의 컴포넌트를 렌더링하되 활성 탭만 표시
  const tabComponents = React.useMemo(() => {
    return openTabs.map(tab => {
      const { baseId, routeParams } = parseTabRoute(tab.id);
      const pageInfo = PAGES[baseId];
      if (!pageInfo) return null;

      const isActive = tab.id === activeTabId;
      const finalProps: PageProps = { 
        ...pageProps, 
        routeParams,
        currentTabId: tab.id,
        isActiveTab: isActive,
      };
      const Comp = pageInfo.component as React.ComponentType<PageProps>;

      return (
        <div
          key={tab.id}
          className={`flex-1 min-w-0 min-h-0 bg-[#1e1e1e] p-4 md:p-8 overflow-y-auto overflow-x-hidden ${isActive ? '' : 'hidden'}`}
          style={{ minHeight: 0 }}
        >
          <React.Suspense fallback={<div className="text-sm text-gray-400">Loading…</div>}>
            <Comp {...finalProps} />
          </React.Suspense>
        </div>
      );
    });
  }, [openTabs, activeTabId, pageProps]);

  const hasActiveTab = openTabs.some(tab => tab.id === activeTabId);

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col" style={{ minHeight: 0 }}>
      <TabBar
        openTabs={openTabs}
        activeTabId={activeTabId}
        onTabClick={onTabClick}
        onCloseTab={onCloseTab}
        onTogglePin={onTogglePin}
        onOpenInNewWindow={onOpenInNewWindow}
        onShowInMenu={onShowInMenu}
        onShareTab={onShareTab}
        onShareAllTabs={onShareAllTabs}
        onCloseTabsToRight={onCloseTabsToRight}
        onCloseAllTabs={onCloseAllTabs}
      />
      {tabComponents}
      {!hasActiveTab && (
        <div className="flex-1 min-w-0 min-h-0 bg-[#1e1e1e] p-4 md:p-8 overflow-y-auto overflow-x-hidden" style={{ minHeight: 0 }}>
          <SitemapPage {...pageProps} />
        </div>
      )}
    </div>
  );
};

export default MainPanel;
