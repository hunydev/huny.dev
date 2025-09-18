import React from 'react';
import { PageProps, ViewId } from '../../types';
import { ACTIVITY_BAR_ITEMS, EXTERNAL_LINKS, FileIcon, ImageIcon, VideoIcon } from '../../constants';
import { DOCS } from './docsData';
import { BOOKMARK_CATEGORIES, getBookmarkCountByCategory } from './bookmarksData';
import { NOTE_GROUPS, getNoteCountByGroup } from './notesData';
import { CATEGORIES } from './appsData';
import logoImg from '../../logo.png';
import logo128 from '../../logo_128x128.png';
import welcomeIcon from '../../icon_32x32.png';

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

const SitemapPage: React.FC<PageProps> = ({ onOpenFile }) => {
  const openWelcome = () => onOpenFile('welcome');


  const bottomItems = ACTIVITY_BAR_ITEMS.filter((i: any) => i.section === 'bottom');

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
          {/* Explorer */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Explorer</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <button onClick={() => onOpenFile('welcome')} className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left">
                  <img src={welcomeIcon} alt="Welcome" className="w-4 h-4 mr-2 rounded-sm" />
                  <span>Welcome</span>
                </button>
              </li>
              <li>
                <button onClick={() => onOpenFile('works')} className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left">
                  <FileIcon />
                  <span>works.md</span>
                </button>
              </li>
              <li>
                <button onClick={() => onOpenFile('about')} className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left">
                  <FileIcon />
                  <span>about.json</span>
                </button>
              </li>
              <li>
                <button onClick={() => onOpenFile('stack')} className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left">
                  <FileIcon />
                  <span>stack-huny.dev</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Media */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Media <span className="text-xs text-gray-400">({MEDIA_ITEMS.length})</span></h3>
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
                      {item.type === 'image' ? ImageIcon() : VideoIcon()}
                    </span>
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Docs */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Docs <span className="text-xs text-gray-400">({DOCS.length})</span></h3>
            <ul className="space-y-1 text-sm max-h-48 overflow-auto pr-1">
              {DOCS.map(d => (
                <li key={d.slug}>
                  <button onClick={() => onOpenFile(`docs:${d.slug}`)} className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left" title={`${d.slug}.html`}>
                    <FileIcon />
                    <span className="truncate" title={d.title}>{d.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Apps */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Apps <span className="text-xs text-gray-400">({CATEGORIES.length})</span></h3>
            <ul className="space-y-1 text-sm">
              {CATEGORIES.map(c => (
                <li key={c.id}>
                  <button onClick={() => onOpenFile(`apps:${c.id}`)} className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left">
                    {c.iconUrl ? (
                      <img src={c.iconUrl} alt="" className="w-4 h-4 rounded-sm" />
                    ) : c.emoji ? (
                      <span className="text-base leading-4" aria-hidden>{c.emoji}</span>
                    ) : (
                      <span className="w-4 h-4" />
                    )}
                    <span>{c.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Bookmarks */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Bookmarks</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <button onClick={() => onOpenFile('bookmark:all')} className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left">
                  <span className="inline-flex items-center justify-center w-5 h-5">
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                      <path d="M4 2.5A1.5 1.5 0 0 1 5.5 1h5A1.5 1.5 0 0 1 12 2.5v11.086a.5.5 0 0 1-.777.416L8 11.972l-3.223 2.03A.5.5 0 0 1 4 13.586z" />
                    </svg>
                  </span>
                  <span>All</span>
                  <span className="ml-auto text-xs text-gray-400">{getBookmarkCountByCategory('all')}</span>
                </button>
              </li>
              {BOOKMARK_CATEGORIES.map(c => (
                <li key={c.id}>
                  <button onClick={() => onOpenFile(`bookmark:${c.id}`)} className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left">
                    <span className="inline-flex items-center justify-center w-5 h-5">
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" style={{ color: c.color }} aria-hidden>
                        <path d="M4 2.5A1.5 1.5 0 0 1 5.5 1h5A1.5 1.5 0 0 1 12 2.5v11.086a.5.5 0 0 1-.777.416L8 11.972l-3.223 2.03A.5.5 0 0 1 4 13.586z" />
                      </svg>
                    </span>
                    <span>{c.name}</span>
                    <span className="ml-auto text-xs text-gray-400">{getBookmarkCountByCategory(c.id)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Notes</h3>
            <ul className="space-y-1 text-sm">
              {NOTE_GROUPS.map(g => (
                <li key={g.id}>
                  <button onClick={() => onOpenFile(`notes:${g.id}`)} className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm" style={{ background: g.color }} />
                    <span>{g.name}</span>
                    <span className="ml-auto text-xs text-gray-400">{getNoteCountByGroup(g.id)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Bottom: SNS */}
      <Section title="SNS">
        <ul className="flex flex-wrap gap-2">
          {bottomItems.map(item => {
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
                  <span className="text-gray-300">{item.icon}</span>
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
