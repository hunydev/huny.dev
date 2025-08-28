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
    const existingTab = openTabs.find(tab => tab.id === fileId);
    if (existingTab) {
      setActiveTabId(fileId);
    } else {
      const pageInfo = PAGES[fileId];
      if (pageInfo) {
        const newTab: Tab = {
          id: fileId,
          title: pageInfo.title,
          icon: pageInfo.icon,
        };
        setOpenTabs(prevTabs => [...prevTabs, newTab]);
        setActiveTabId(fileId);
      }
    }
  }, [openTabs]);

  useEffect(() => {
    // Open welcome tab on initial load
    if (openTabs.length === 0) {
      handleOpenFile('welcome');
    }
  }, [handleOpenFile, openTabs.length]);


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
