
import React from 'react';
import { ViewId } from '../types';
import { ACTIVITY_BAR_ITEMS, EXTERNAL_LINKS } from '../constants';

type ActivityBarProps = {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
  isSidebarPinned: boolean;
  onItemClick: (view: ViewId) => void;
};

const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, setActiveView, isSidebarPinned, onItemClick }) => {
  const topItems = ACTIVITY_BAR_ITEMS.filter((i: any) => i.section === 'top');
  const bottomItems = ACTIVITY_BAR_ITEMS.filter((i: any) => i.section === 'bottom');

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const topRef = React.useRef<HTMLDivElement | null>(null);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);
  const [hideBottom, setHideBottom] = React.useState(false);
  const bottomHeightRef = React.useRef<number>(0);

  const recalc = React.useCallback(() => {
    const container = containerRef.current;
    const topEl = topRef.current;
    const bottomEl = bottomRef.current;
    if (!container || !topEl || !bottomEl) return;

    // Cache bottom section height from first measurement to avoid feedback loop when toggling visibility
    if (!bottomHeightRef.current) {
      bottomHeightRef.current = bottomEl.offsetHeight;
    }

    const available = container.clientHeight;
    const paddingV = 16; // py-2 vertical paddings
    const topH = topEl.offsetHeight;
    const bottomH = bottomHeightRef.current;
    const neededWithBottom = topH + bottomH + paddingV;

    // Hysteresis to prevent flicker around the threshold
    const tolerance = 8; // px
    const diff = neededWithBottom - available; // >0 means not enough space

    setHideBottom(prev => {
      if (diff > tolerance) return true; // definitely hide
      if (diff < -tolerance) return false; // definitely show
      return prev; // within hysteresis band, keep current state
    });
  }, []);

  React.useEffect(() => {
    recalc();
    const ro = (window as any).ResizeObserver ? new ResizeObserver(recalc) : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    const onResize = () => recalc();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro && containerRef.current) ro.unobserve(containerRef.current);
    };
  }, [recalc]);

  return (
    <div ref={containerRef} className="w-12 bg-[#333333] flex flex-col items-center justify-between py-2 border-r border-black/30 relative z-40">
        <div ref={topRef} className="flex flex-col items-center gap-2">
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

        <div ref={bottomRef} className={`flex flex-col items-center gap-2 ${hideBottom ? 'hidden' : ''}`}>
             {bottomItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => {
                      const link = EXTERNAL_LINKS[item.id as keyof typeof EXTERNAL_LINKS];
                      if (!link) return;
                      const url = link.url;
                      if (url.startsWith('mailto:')) {
                        window.location.href = url;
                      } else {
                        window.open(url, '_blank');
                      }
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
