import React from 'react';
import { Tab, PageProps } from '../types';
import { PAGES } from '../constants';

type TabBarProps = {
  openTabs: Tab[];
  activeTabId: string;
  onTabClick: (id: string) => void;
  onCloseTab: (id: string) => void;
};

const TabBar: React.FC<TabBarProps> = ({ openTabs, activeTabId, onTabClick, onCloseTab }) => {
  return (
    <div className="flex bg-[#252526] overflow-x-auto">
      {openTabs.map(tab => (
        <div
          key={tab.id}
          onClick={() => onTabClick(tab.id)}
          className={`flex items-center justify-between cursor-pointer px-4 py-2 border-r border-black/30 ${
            activeTabId === tab.id
              ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500'
              : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#3e3e3e]'
          }`}
        >
          <div className="flex items-center">
            {tab.icon}
            <span className="text-sm">{tab.title}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseTab(tab.id);
            }}
            className="ml-4 p-0.5 rounded hover:bg-white/20"
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
};

const MainPanel: React.FC<MainPanelProps> = ({ openTabs, activeTabId, onTabClick, onCloseTab, pageProps }) => {
  const activeTab = openTabs.find(tab => tab.id === activeTabId);
  
  let ActiveComponentContent: React.ReactNode = null;
  if (activeTab) {
    const pageInfo = PAGES[activeTab.id];
    if (pageInfo) {
      ActiveComponentContent = React.createElement(pageInfo.component, pageProps);
    }
  }

  return (
    <div className="flex-1 min-w-0 flex flex-col">
      <TabBar
        openTabs={openTabs}
        activeTabId={activeTabId}
        onTabClick={onTabClick}
        onCloseTab={onCloseTab}
      />
      <div className="flex-1 min-w-0 bg-[#1e1e1e] p-4 md:p-8 overflow-y-auto overflow-x-hidden">
        {ActiveComponentContent ? ActiveComponentContent : 
            <div className="flex items-center justify-center h-full text-gray-500">
                <p>Open a file to start editing.</p>
            </div>
        }
      </div>
    </div>
  );
};

export default MainPanel;
