
import React from 'react';
import { ViewId } from '../types';
import { ACTIVITY_BAR_ITEMS } from '../constants';

type ActivityBarProps = {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
  isSidebarPinned: boolean;
  onItemClick: (view: ViewId) => void;
};

const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, setActiveView, isSidebarPinned, onItemClick }) => {
  const topItems = ACTIVITY_BAR_ITEMS.filter((i: any) => i.section === 'top');
  const bottomItems = ACTIVITY_BAR_ITEMS.filter((i: any) => i.section === 'bottom');

  const externalLinks: Partial<Record<ViewId, string>> = {
    [ViewId.GitHub]: 'https://github.com',
    [ViewId.Discord]: 'https://discord.com',
    [ViewId.X]: 'https://x.com',
    [ViewId.Email]: 'mailto:example@huny.dev',
  };

  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center justify-between py-2 border-r border-black/30 relative z-40">
        <div className="flex flex-col items-center gap-2">
            {topItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => (isSidebarPinned ? setActiveView(item.id) : onItemClick(item.id))}
                    className={`p-2 rounded-md transition-colors duration-200 relative ${
                        isSidebarPinned && activeView === item.id ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={item.title}
                >
                    {isSidebarPinned && activeView === item.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500"></div>}
                    {item.icon}
                </button>
            ))}
        </div>

        <div className="flex flex-col items-center gap-2">
             {bottomItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => {
                      const url = externalLinks[item.id as keyof typeof externalLinks];
                      if (url) window.open(url, '_blank');
                    }}
                    className={`p-2 rounded-md transition-colors duration-200 relative ${
                        'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={item.title}
                >
                    {item.icon}
                </button>
            ))}
        </div>
    </div>
  );
};

export default ActivityBar;
