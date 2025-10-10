import React from 'react';
import { Tab, PageProps } from '../types';
import { PAGES } from '../constants';
import SitemapPage from './pages/SitemapPage';
import { useApiTask } from '../contexts/ApiTaskContext';
import { Icon } from '../constants';

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
  onCloseOtherTabs: (tabId: string) => void;
  onCloseAllTabs: () => void;
};

const TabBar: React.FC<TabBarProps> = ({ openTabs, activeTabId, onTabClick, onCloseTab, onTogglePin, onOpenInNewWindow, onShowInMenu, onShareTab, onShareAllTabs, onCloseTabsToRight, onCloseOtherTabs, onCloseAllTabs }) => {
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
            className={`flex items-center justify-between cursor-pointer px-4 py-2 border-r border-black/30 flex-shrink-0 whitespace-nowrap select-none ${
              activeTabId === tab.id
                ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500'
                : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#3e3e3e]'
            }`}
            title={tab.title}
          >
            <div className="flex items-center min-w-0 gap-2">
              {/* Icon wrapper with pin overlay and badge */}
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
                  <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  fill="currentColor"  className="w-3.5 h-3.5">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
                  </svg>
                </button>
                {/* API Task Status Badge */}
                {apiTask.getTaskStatus(tab.id) === 'completed' && (
                  <span 
                    className="absolute -top-1 -right-1" 
                    title="API 작업 완료"
                  >
                    <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  fill="none" stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="w-2.5 h-2.5 text-white">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" fill="#22c55e" />
                    </svg>
                  </span>
                )}
              </span>
              <span className="text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px] md:max-w-[240px]">
                {tab.title}
              </span>
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
                <Icon name="close" />
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
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10"
            onClick={() => handleMenuAction(() => onOpenInNewWindow(contextMenu.tabId))}
          >
            새 창에서 열기
          </button>

          <button
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10"
            onClick={() => handleMenuAction(() => onShowInMenu(contextMenu.tabId))}
          >
            해당 메뉴 열기
          </button>

          <div className="h-px bg-white/10 my-1" />

          <button
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 flex items-center justify-between"
            onClick={() => handleMenuAction(() => onShareTab(contextMenu.tabId))}
          >
            <span>이 탭 공유</span>
            <span className="text-xs text-gray-500">Alt+S</span>
          </button>

          <button
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 flex items-center justify-between"
            onClick={() => handleMenuAction(() => onShareAllTabs())}
          >
            <span>모든 탭 공유</span>
            <span className="text-xs text-gray-500">Alt+Shift+S</span>
          </button>

          <div className="h-px bg-white/10 my-1" />

          <button
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 flex items-center justify-between"
            onClick={() => handleMenuAction(() => onCloseTab(contextMenu.tabId))}
          >
            <span>이 탭 닫기</span>
            <span className="text-xs text-gray-500">Alt+W</span>
          </button>

          <button
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleMenuAction(() => onCloseTabsToRight(contextMenu.tabId))}
            disabled={!hasTabsToRight}
          >
            우측 탭 닫기
          </button>

          <button
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-white/10 flex items-center justify-between"
            onClick={() => handleMenuAction(() => onCloseAllTabs())}
          >
            <span>모든 탭 닫기</span>
            <span className="text-xs text-gray-500">Alt+Shift+W</span>
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
  onCloseOtherTabs: (tabId: string) => void;
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

const MainPanel: React.FC<MainPanelProps> = ({ openTabs, activeTabId, onTabClick, onCloseTab, pageProps, onTogglePin, onOpenInNewWindow, onShowInMenu, onShareTab, onShareAllTabs, onCloseTabsToRight, onCloseOtherTabs, onCloseAllTabs }) => {
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
        onCloseOtherTabs={onCloseOtherTabs}
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
