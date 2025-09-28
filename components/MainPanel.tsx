import React from 'react';
import { Tab, PageProps } from '../types';
import { PAGES } from '../constants';
import SitemapPage from './pages/SitemapPage';

type TabBarProps = {
  openTabs: Tab[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onCloseTab: (id: string) => void;
  onTogglePin: (id: string) => void;
};

const TabBar: React.FC<TabBarProps> = ({ openTabs, activeTabId, onTabClick, onCloseTab, onTogglePin }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

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

  return (
    <div ref={containerRef} onWheel={onWheel} className="flex bg-[#252526] overflow-x-auto overflow-y-hidden shrink-0">
      {orderedTabs.map(tab => (
        <div
          key={tab.id}
          onClick={() => onTabClick(tab.id)}
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
          </div>
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
        </div>
      ))}
    </div>
  );
};

type MainPanelProps = {
  openTabs: Tab[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onCloseTab: (id: string) => void;
  pageProps: PageProps;
  onTogglePin: (id: string) => void;
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
  if (baseId === 'docs') {
    return { baseId, routeParams: { slug: arg || '' } };
  }
  if (baseId === 'monitor') {
    return { baseId, routeParams: { itemId: arg || '' } };
  }
  return { baseId };
};

const MainPanel: React.FC<MainPanelProps> = ({ openTabs, activeTabId, onTabClick, onCloseTab, pageProps, onTogglePin }) => {
  const activeTab = openTabs.find(tab => tab.id === activeTabId);
  
  let ActiveComponentContent: React.ReactNode = null;
  if (activeTab) {
    const { baseId, routeParams } = parseTabRoute(activeTab.id);
    const pageInfo = PAGES[baseId];
    if (pageInfo) {
      const finalProps: PageProps = { ...pageProps, routeParams };
      const Comp = pageInfo.component as React.ComponentType<PageProps>;
      ActiveComponentContent = (
        <React.Suspense fallback={<div className="text-sm text-gray-400">Loading…</div>}>
          <Comp {...finalProps} />
        </React.Suspense>
      );
    }
  }

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col" style={{ minHeight: 0 }}>
      <TabBar
        openTabs={openTabs}
        activeTabId={activeTabId}
        onTabClick={onTabClick}
        onCloseTab={onCloseTab}
        onTogglePin={onTogglePin}
      />
      <div className="flex-1 min-w-0 min-h-0 bg-[#1e1e1e] p-4 md:p-8 overflow-y-auto overflow-x-hidden" style={{ minHeight: 0 }}>
        {ActiveComponentContent ? (
          ActiveComponentContent
        ) : (
          <SitemapPage {...pageProps} />
        )}
      </div>
    </div>
  );
};

export default MainPanel;
