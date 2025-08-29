import React, { useState, useCallback, useEffect } from 'react';
import ActivityBar from './components/ActivityBar';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import { ViewId, Tab, PageProps } from './types';
import { PAGES } from './constants';
import logo from './logo_128x128.png';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewId>(ViewId.Explorer);
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [sidebarWidth, setSidebarWidth] = useState<number>(256);
  const [isResizing, setIsResizing] = useState<boolean>(false);

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
  
  const pageProps: PageProps = {
    onOpenFile: handleOpenFile,
    setActiveView: setActiveView,
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#1e1e1e] text-gray-300 font-sans overflow-hidden">
      {/* Top title bar (VS Code style) */}
      <div className="h-8 bg-[#2d2d2d] border-b border-black/30 flex items-center px-2">
        <img src={logo} alt="HunyDev logo" className="h-5 w-5" />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 min-w-0 min-h-0">
        <ActivityBar activeView={activeView} setActiveView={setActiveView} />
        <Sidebar activeView={activeView} onOpenFile={handleOpenFile} width={sidebarWidth} />
        <div
          className={`w-1 cursor-col-resize bg-transparent hover:bg-white/10 ${isResizing ? 'bg-blue-500/40' : ''}`}
          onMouseDown={handleSidebarResizeStart}
        />
        <MainPanel
          openTabs={openTabs}
          activeTabId={activeTabId}
          onTabClick={setActiveTabId}
          onCloseTab={handleCloseTab}
          pageProps={pageProps}
        />
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
