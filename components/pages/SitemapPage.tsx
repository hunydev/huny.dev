import React from 'react';
import { PageProps, ViewId } from '../../types';
import { ACTIVITY_BAR_ITEMS, EXTERNAL_LINKS, Icon, PAGES } from '../../constants';
import { DOCS } from './docsData';
import { BOOKMARK_CATEGORIES, getBookmarkCountByCategory } from './bookmarksData';
import { NOTE_GROUPS, getNoteCountByGroup } from './notesData';
import { CATEGORIES } from './appsData';
import logoImg from '../../logo.png';
import logo128 from '../../logo_128x128.png';
import welcomeIcon from '../../icon_32x32.png';
import { viewForTabId } from '../../utils/navigation';

const Section: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-6">
    <h2 className="text-sm uppercase text-gray-400 tracking-wider mb-2">{title}</h2>
    <div className="bg-white/[0.03] border border-white/10 rounded p-3">
      {children}
    </div>
  </section>
);

const MEDIA_ITEMS = [
  { type: 'image' as const, name: 'logo.png', src: logoImg },
  { type: 'image' as const, name: 'logo_128x128.png', src: logo128 },
  { type: 'video' as const, name: 'flower.mp4', src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
];

type PageSummary = {
  id: string;
  title: string;
  icon?: React.ReactNode;
};

type LazySectionProps = {
  item: (typeof ACTIVITY_BAR_ITEMS)[number];
  index: number;
  onActivate: () => void;
  renderContent: () => React.ReactNode;
};

const SkeletonPlaceholder: React.FC = () => (
  <div className="space-y-2 animate-pulse">
    <div className="h-4 rounded bg-white/5" />
    <div className="h-4 rounded bg-white/5 w-3/4" />
    <div className="h-4 rounded bg-white/5 w-11/12" />
    <div className="h-4 rounded bg-white/5 w-2/3" />
  </div>
);

const LazyViewSection: React.FC<LazySectionProps> = ({ item, index, onActivate, renderContent }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [shouldRender, setShouldRender] = React.useState(index < 2);

  React.useEffect(() => {
    if (shouldRender) return;
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
      setShouldRender(true);
      return;
    }
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setShouldRender(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '160px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldRender]);

  const content = React.useMemo(() => (shouldRender ? renderContent() : null), [renderContent, shouldRender]);

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 text-gray-300">
            <Icon name={item.icon} aria-label={item.ariaLabel ?? item.title} />
          </span>
          {item.title}
        </h3>
        <button onClick={onActivate} className="text-xs text-gray-400 hover:text-white">
          패널 이동
        </button>
      </div>
      <div>{content ?? <SkeletonPlaceholder />}</div>
    </div>
  );
};

const SitemapPage: React.FC<PageProps> = ({ onOpenFile, setActiveView, onActivityClick }) => {
  const openWelcome = () => onOpenFile('welcome');

  const topItems = React.useMemo(
    () => ACTIVITY_BAR_ITEMS.filter(item => item.section === 'top'),
    []
  );
  const bottomItems = React.useMemo(
    () => ACTIVITY_BAR_ITEMS.filter(item => item.section === 'bottom'),
    []
  );

  const pageSummariesByView = React.useMemo(() => {
    const map = new Map<ViewId, PageSummary[]>();
    Object.entries(PAGES).forEach(([id, info]) => {
      const view = viewForTabId(id);
      const list = map.get(view) ?? [];
      list.push({ id, title: info.title, icon: info.icon });
      map.set(view, list);
    });
    return map;
  }, []);

  const handleActivateView = (viewId: ViewId) => {
    setActiveView(viewId);
    onActivityClick?.(viewId);
  };

  const renderViewContent = (viewId: ViewId) => {
    switch (viewId) {
      case ViewId.Explorer: {
        const explorerPages = (pageSummariesByView.get(ViewId.Explorer) ?? []).filter(page => !page.id.includes(':'));
        const orderedIds = ['welcome', 'project', 'works', 'about', 'stack', 'digital-shelf', 'mascot', 'domain'];
        const sorted = explorerPages.sort((a, b) => {
          const ai = orderedIds.indexOf(a.id);
          const bi = orderedIds.indexOf(b.id);
          if (ai === -1 && bi === -1) return a.title.localeCompare(b.title);
          if (ai === -1) return 1;
          if (bi === -1) return -1;
          return ai - bi;
        });
        return (
          <ul className="space-y-1 text-sm">
            {sorted.map(page => (
              <li key={page.id}>
                <button
                  onClick={() => onOpenFile(page.id)}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 text-gray-400">
                    {page.icon ?? <Icon name="file" />}
                  </span>
                  <span>{page.title}</span>
                </button>
              </li>
            ))}
          </ul>
        );
      }
      case ViewId.Search:
        return (
          <div className="text-sm text-gray-400 space-y-3">
            <p>전체 리소스를 빠르게 찾아보려면 검색 패널을 열어보세요.</p>
            <button
              onClick={() => handleActivateView(ViewId.Search)}
              className="inline-flex items-center gap-2 rounded border border-white/20 px-3 py-1.5 text-white hover:border-white/40 hover:bg-white/10 text-sm"
            >
              <Icon name="search" className="w-4 h-4" aria-hidden />
              검색 패널 열기
            </button>
          </div>
        );
      case ViewId.Docs:
        return (
          <ul className="space-y-1 text-sm max-h-48 overflow-auto pr-1">
            {DOCS.map(doc => (
              <li key={doc.slug}>
                <button
                  onClick={() => onOpenFile(`docs:${doc.slug}`)}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left"
                  title={`${doc.slug}.html`}
                >
                  <Icon name="file" className="mr-2" />
                  <span className="truncate" title={doc.title}>{doc.title}</span>
                </button>
              </li>
            ))}
          </ul>
        );
      case ViewId.Apps:
        return (
          <ul className="space-y-1 text-sm">
            {CATEGORIES.map(cat => (
              <li key={cat.id}>
                <button
                  onClick={() => onOpenFile(`apps:${cat.id}`)}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left"
                >
                  {cat.iconUrl ? (
                    <img src={cat.iconUrl} alt="" className="w-4 h-4 rounded-sm" loading="lazy" decoding="async" />
                  ) : cat.emoji ? (
                    <span className="text-base leading-4" aria-hidden>{cat.emoji}</span>
                  ) : (
                    <span className="w-4 h-4" />
                  )}
                  <span>{cat.name}</span>
                </button>
              </li>
            ))}
          </ul>
        );
      case ViewId.Media:
        return (
          <ul className="space-y-1 text-sm">
            {MEDIA_ITEMS.map(item => (
              <li key={item.name}>
                <button
                  onClick={() => {
                    try {
                      const encoded = btoa(JSON.stringify(item));
                      onOpenFile(`media:${encoded}`);
                    } catch {}
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left"
                  title={item.name}
                >
                  <span className="mr-1">
                    {item.type === 'image' ? <Icon name="image" /> : <Icon name="video" />}
                  </span>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        );
      case ViewId.Playground: {
        const playgroundPages = (pageSummariesByView.get(ViewId.Playground) ?? []).sort((a, b) => a.title.localeCompare(b.title));
        return (
          <ul className="space-y-1 text-sm max-h-48 overflow-auto pr-1">
            {playgroundPages.map(page => (
              <li key={page.id}>
                <button
                  onClick={() => onOpenFile(page.id)}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 text-gray-400">
                    {page.icon ?? <Icon name="appsGrid" />}
                  </span>
                  <span>{page.title}</span>
                </button>
              </li>
            ))}
          </ul>
        );
      }
      case ViewId.Bookmark:
        return (
          <ul className="space-y-1 text-sm">
            <li>
              <button
                onClick={() => onOpenFile('bookmark:all')}
                className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left"
              >
                <span className="inline-flex items-center justify-center w-5 h-5">
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <path d="M4 2.5A1.5 1.5 0 0 1 5.5 1h5A1.5 1.5 0 0 1 12 2.5v11.086a.5.5 0 0 1-.777.416L8 11.972l-3.223 2.03A.5.5 0 0 1 4 13.586z" />
                  </svg>
                </span>
                <span>All</span>
                <span className="ml-auto text-xs text-gray-400">{getBookmarkCountByCategory('all')}</span>
              </button>
            </li>
            {BOOKMARK_CATEGORIES.map(cat => (
              <li key={cat.id}>
                <button
                  onClick={() => onOpenFile(`bookmark:${cat.id}`)}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5">
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" style={{ color: cat.color }} aria-hidden>
                      <path d="M4 2.5A1.5 1.5 0 0 1 5.5 1h5A1.5 1.5 0 0 1 12 2.5v11.086a.5.5 0 0 1-.777.416L8 11.972l-3.223 2.03A.5.5 0 0 1 4 13.586z" />
                    </svg>
                  </span>
                  <span>{cat.name}</span>
                  <span className="ml-auto text-xs text-gray-400">{getBookmarkCountByCategory(cat.id)}</span>
                </button>
              </li>
            ))}
          </ul>
        );
      case ViewId.Notes:
        return (
          <ul className="space-y-1 text-sm">
            {NOTE_GROUPS.map(group => (
              <li key={group.id}>
                <button
                  onClick={() => onOpenFile(`notes:${group.id}`)}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm" style={{ background: group.color }} />
                  <span>{group.name}</span>
                  <span className="ml-auto text-xs text-gray-400">{getNoteCountByGroup(group.id)}</span>
                </button>
              </li>
            ))}
          </ul>
        );
      default:
        return (
          <div className="text-sm text-gray-500">
            이 뷰는 사이트맵에서 표시할 항목이 없습니다. 활동 바에서 직접 확인해 보세요.
          </div>
        );
    }
  };

  const hubIds = new Set<ViewId>([ViewId.Blog, ViewId.Apps, ViewId.Sites]);
  const hubLinks = bottomItems.filter(item => hubIds.has(item.id as ViewId));
  const socialLinks = bottomItems.filter(item => !hubIds.has(item.id as ViewId));

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Top: Welcome shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-white mb-1">Welcome</h1>
          <p className="text-sm text-gray-400">탭이 모두 닫힌 상태입니다. 아래 사이트맵에서 원하는 항목을 열어보세요.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={openWelcome}
            className="flex-1 sm:flex-none w-full sm:w-auto whitespace-nowrap text-center px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm"
          >
            Welcome 열기
          </button>
        </div>
      </div>

      {/* Middle: Sitemap */}
      <Section title="Sitemap">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {topItems.map((item, index) => (
            <LazyViewSection
              key={item.id}
              item={item}
              index={index}
              onActivate={() => handleActivateView(item.id as ViewId)}
              renderContent={() => renderViewContent(item.id as ViewId)}
            />
          ))}
        </div>
      </Section>

      {/* Hubs & SNS */}
      {hubLinks.length > 0 && (
        <Section title="Hub">
          <ul className="flex flex-wrap gap-2">
            {hubLinks.map(item => {
              const link = EXTERNAL_LINKS[item.id as ViewId];
              if (!link) return null;
              const href = link.url;
              const isMail = href.startsWith('mailto:');
              return (
                <li key={item.id}>
                  <a
                    href={href}
                    target={isMail ? undefined : '_blank'}
                    rel={isMail ? undefined : 'noopener'}
                    className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/12 hover:bg-white/20 text-sm"
                  >
                    <span className="text-gray-300">
                      <Icon name={item.icon} aria-label={item.ariaLabel ?? link.title} />
                    </span>
                    <span>{link.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <Section title="SNS">
        <ul className="flex flex-wrap gap-2">
          {socialLinks.map(item => {
            const link = EXTERNAL_LINKS[item.id as ViewId];
            if (!link) return null;
            const href = link.url;
            const isMail = href.startsWith('mailto:');
            return (
              <li key={item.id}>
                <a
                  href={href}
                  target={isMail ? undefined : '_blank'}
                  rel={isMail ? undefined : 'noopener'}
                  className="flex items-center gap-2 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-sm"
                >
                  <span className="text-gray-300">
                    <Icon name={item.icon} aria-label={item.ariaLabel ?? link.title} />
                  </span>
                  <span>{link.title}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
};

export default SitemapPage;
