
import React from 'react';
import { ViewId } from '../types';
import { ACTIVITY_BAR_ITEMS } from '../constants';

type ActivityBarProps = {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
};

const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, setActiveView }) => {
  return (
    <div className="w-12 bg-[#333333] flex flex-col items-center justify-between py-2 border-r border-black/30">
        <div className="flex flex-col items-center gap-2">
            {ACTIVITY_BAR_ITEMS.slice(0, 4).map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`p-2 rounded-md transition-colors duration-200 relative ${
                        activeView === item.id ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={item.title}
                >
                    {activeView === item.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500"></div>}
                    {item.icon}
                </button>
            ))}
        </div>

        <div className="flex flex-col items-center gap-2">
             {ACTIVITY_BAR_ITEMS.slice(4).map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`p-2 rounded-md transition-colors duration-200 relative ${
                        activeView === item.id ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={item.title}
                >
                    {activeView === item.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500"></div>}
                    {item.icon}
                </button>
            ))}
        </div>
    </div>
  );
};

export default ActivityBar;
