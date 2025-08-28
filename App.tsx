import React, { useState, useCallback, useEffect } from 'react';
import ActivityBar from './components/ActivityBar';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';
import { ViewId, Tab, PageProps } from './types';
import { PAGES } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewId>(ViewId.Explorer);
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');

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
    <div className="flex h-screen w-screen bg-[#1e1e1e] text-gray-300 font-sans">
      <ActivityBar activeView={activeView} setActiveView={setActiveView} />
      <Sidebar activeView={activeView} onOpenFile={handleOpenFile} />
      <MainPanel
        openTabs={openTabs}
        activeTabId={activeTabId}
        onTabClick={setActiveTabId}
        onCloseTab={handleCloseTab}
        pageProps={pageProps}
      />
    </div>
  );
};

export default App;
