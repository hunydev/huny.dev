
import React from 'react';
import { ViewId } from '../types';
import { ACTIVITY_BAR_ITEMS, EXTERNAL_LINKS, Icon } from '../constants';

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
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollUp, setCanScrollUp] = React.useState(false);
  const [canScrollDown, setCanScrollDown] = React.useState(false);
  const isDraggingRef = React.useRef(false);
  const lastYRef = React.useRef(0);
  const dragStartedRef = React.useRef(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const DRAG_THRESHOLD = 8; // px
  const topGroupRef = React.useRef<HTMLDivElement | null>(null);
  const bottomGroupRef = React.useRef<HTMLDivElement | null>(null);
  const bottomHeightRef = React.useRef<number>(0);
  const [hideBottom, setHideBottom] = React.useState(false);

  const recalcScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atTop = el.scrollTop <= 0;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1; // tolerance 1px
    setCanScrollUp(!atTop);
    setCanScrollDown(!atBottom);
  }, []);

  const recalcHideBottom = React.useCallback(() => {
    const el = scrollRef.current;
    const topEl = topGroupRef.current;
    const bottomEl = bottomGroupRef.current;
    if (!el || !topEl || !bottomEl) return;

    // Cache bottom group height the first time it's measured to avoid feedback loop when hidden
    if (!bottomHeightRef.current) {
      bottomHeightRef.current = bottomEl.offsetHeight;
    }

    const clientH = el.clientHeight;
    const topH = topEl.offsetHeight;
    const bottomH = bottomHeightRef.current;
    const paddingV = 16; // top pb-2 and bottom pt-2 total
    const needed = topH + bottomH + paddingV;

    const tolerance = 8; // px hysteresis band
    const diff = needed - clientH;
    setHideBottom(prev => {
      if (diff > tolerance) return true;   // not enough space -> hide bottom SNS
      if (diff < -tolerance) return false; // enough space -> show bottom SNS
      return prev;                          // within band -> keep
    });
  }, []);

  const recalcAll = React.useCallback(() => {
    recalcHideBottom();
    recalcScroll();
  }, [recalcHideBottom, recalcScroll]);

  React.useEffect(() => {
    // Initial measurement after mount
    recalcAll();
    const ro = (window as any).ResizeObserver ? new ResizeObserver(recalcAll) : null;
    if (ro && scrollRef.current) ro.observe(scrollRef.current);
    const onResize = () => recalcAll();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro && scrollRef.current) ro.unobserve(scrollRef.current);
    };
  }, [recalcAll]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    // Left button or touch
    if (e.button !== 0 && e.pointerType !== 'touch') return;
    dragStartedRef.current = false;
    isDraggingRef.current = true;
    lastYRef.current = e.clientY;
    // Defer pointer capture until an actual drag is detected
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || !isDraggingRef.current) return;
    const dy = e.clientY - lastYRef.current;
    if (!dragStartedRef.current && Math.abs(dy) > DRAG_THRESHOLD) {
      dragStartedRef.current = true;
      setIsDragging(true);
      el.setPointerCapture?.(e.pointerId);
    }
    if (dragStartedRef.current) {
      el.scrollTop -= dy;
      lastYRef.current = e.clientY;
      e.preventDefault();
      e.stopPropagation();
      recalcScroll();
    }
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (el && isDraggingRef.current && dragStartedRef.current) {
      el.releasePointerCapture?.(e.pointerId);
    }
    isDraggingRef.current = false;
    if (dragStartedRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
    dragStartedRef.current = false;
    setIsDragging(false);
  };

  const onPointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      endDrag(e);
    }
  };

  return (
    <div ref={containerRef} className="w-12 bg-[#333333] flex flex-col items-center py-2 border-r border-black/30 relative z-40 overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={recalcScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={onPointerLeave}
        className={`flex-1 w-full overflow-y-auto no-scrollbar ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      >
        <div className="min-h-full flex flex-col justify-between">
          <div ref={topGroupRef} className="flex flex-col items-center gap-2 pb-2">
            {topItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (isDragging) return;
                  (isSidebarPinned ? setActiveView(item.id) : onItemClick(item.id));
                }}
                className={`p-2 rounded-md transition-colors duration-200 relative ${
                  isSidebarPinned && activeView === item.id ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                title={item.title}
                aria-label={item.ariaLabel ?? item.title}
              >
                {isSidebarPinned && activeView === item.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500"></div>}
                <Icon name={item.icon} />
              </button>
            ))}
          </div>

          <div ref={bottomGroupRef} className={`flex flex-col items-center gap-2 pt-2 ${hideBottom ? 'hidden' : ''}`}>
            {bottomItems.map(item => {
              const link = EXTERNAL_LINKS[item.id as keyof typeof EXTERNAL_LINKS];
              if (!link) return null;
              const asAnchor = item.id === ViewId.Blog || item.id === ViewId.Apps || item.id === ViewId.Sites;
              if (asAnchor) {
                const href = link.url;
                const isMail = href.startsWith('mailto:');
                return (
                  <a
                    key={item.id}
                    href={href}
                    target={isMail ? undefined : '_blank'}
                    rel={isMail ? undefined : 'noopener'}
                    className={`p-2 rounded-md transition-colors duration-200 relative text-gray-400 hover:text-white hover:bg-white/10`}
                    title={item.title}
                    aria-label={item.ariaLabel ?? link.title}
                  >
                    <Icon name={item.icon} />
                    <span className="sr-only">{link.title}</span>
                  </a>
                );
              }
              // Fallback: keep button behavior for the rest (GitHub, Discord, X, Email)
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isDragging) return;
                    const href = link.url;
                    if (href.startsWith('mailto:')) {
                      window.location.href = href;
                    } else {
                      window.open(href, '_blank');
                    }
                  }}
                  className={`p-2 rounded-md transition-colors duration-200 relative text-gray-400 hover:text-white hover:bg-white/10`}
                  title={item.title}
                  aria-label={item.ariaLabel ?? link.title}
                >
                  <Icon name={item.icon} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {canScrollUp && (
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-7 flex items-center justify-center bg-gradient-to-b from-black/60 to-transparent">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 text-white/70">
            <path d="M3.22 9.78a.75.75 0 0 0 1.06 0L8 6.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L8.53 4.47a.75.75 0 0 0-1.06 0L3.22 8.72a.75.75 0 0 0 0 1.06Z" />
          </svg>
        </div>
      )}
      {canScrollDown && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-7 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 text-white/70">
            <path d="M12.78 6.22a.75.75 0 0 0-1.06 0L8 9.94L4.28 6.22a.75.75 0 1 0-1.06 1.06l4.24 4.25a.75.75 0 0 0 1.06 0l4.24-4.25a.75.75 0 0 0 0-1.06Z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ActivityBar;
