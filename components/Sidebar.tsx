import React, { useState } from 'react';
import { ViewId } from '../types';
import { FileIcon, ImageIcon, VideoIcon } from '../constants';
import { BOOKMARK_CATEGORIES, BOOKMARKS, type Bookmark } from './pages/bookmarksData';
import { NOTE_GROUPS, getNoteCountByGroup } from './pages/notesData';
import { CATEGORIES } from './pages/appsData';
import { DOCS } from './pages/docsData';
import logoImg from '../logo.png';
import logo128 from '../logo_128x128.png';
import welcomeIcon from '../icon_32x32.png';
import { fetchNotionBookmarks } from '../utils/notionClient';

type SidebarProps = {
  activeView: ViewId;
  onOpenFile: (fileId: string) => void;
  width?: number;
};

const DocsView: React.FC<{ onOpenFile: (fileId: string) => void }> = ({ onOpenFile }) => {
  type Node = { type: 'folder'; name: string; children: Node[]; path: string } | { type: 'doc'; name: string; title: string; slug: string; path: string };

  // Build a tree from DOCS path (relative to extra/docs)
  const buildTree = React.useCallback(() => {
    const root: Node = { type: 'folder', name: '', children: [], path: '' } as any;
    const ensureFolder = (parent: Node, name: string, path: string): Node => {
      if (parent.type !== 'folder') return parent;
      const existing = parent.children.find(ch => ch.type === 'folder' && (ch as any).name === name) as Node | undefined;
      if (existing) return existing;
      const node: Node = { type: 'folder', name, children: [], path } as any;
      parent.children.push(node);
      return node;
    };
    DOCS.forEach(d => {
      const idx = d.path.lastIndexOf('extra/docs/');
      const rel = idx >= 0 ? d.path.substring(idx + 'extra/docs/'.length) : d.path;
      const parts = rel.split('/');
      const file = parts.pop() || d.slug + '.html';
      let cursor = root;
      let acc = '';
      for (const dir of parts) {
        acc = acc ? `${acc}/${dir}` : dir;
        cursor = ensureFolder(cursor, dir, acc);
      }
      if ((cursor as any).type === 'folder') {
        (cursor as any).children.push({ type: 'doc', name: file, title: d.title, slug: d.slug, path: rel });
      }
    });

    const sortTree = (node: Node) => {
      if (node.type === 'folder') {
        node.children.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
          const an = a.type === 'folder' ? (a as any).name : (a as any).title;
          const bn = b.type === 'folder' ? (b as any).name : (b as any).title;
          return an.localeCompare(bn);
        });
        node.children.forEach(sortTree);
      }
    };
    sortTree(root);
    return root;
  }, []);

  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const toggle = (path: string) => setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  const isOpen = (path: string, depth: number) => {
    if (path === '' && depth === 0) return true; // root open
    return !!expanded[path];
  };

  const tree = React.useMemo(buildTree, [buildTree]);

  const renderNode = (node: Node, path: string, depth = 0): React.ReactNode => {
    if (node.type === 'folder') {
      const curr = path ? `${path}/${node.name}` : node.name;
      const open = isOpen(curr, depth);
      return (
        <div key={`folder:${curr}`}>
          {node.name !== '' && (
            <button
              onClick={() => toggle(curr)}
              className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1"
              style={{ paddingLeft: depth * 12 }}
            >
              <svg className={`w-3 h-3 mr-1 transition-transform ${open ? 'rotate-90' : ''}`} viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M6 3l5 5-5 5V3z" />
              </svg>
              <span className="mr-2">
                <svg className="w-4 h-4 inline text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 4a2 2 0 0 1 2-2h3l2 2h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z" />
                </svg>
              </span>
              <span className="text-sm truncate">{node.name}</span>
            </button>
          )}
          {open && (
            <div>
              {node.children.map((child) => renderNode(child, curr || node.name, depth + (node.name === '' ? 0 : 1)))}
            </div>
          )}
        </div>
      );
    }
    // doc
    const filePath = path ? `${path}/${node.name}` : node.name;
    return (
      <button
        key={`doc:${filePath}`}
        onClick={() => onOpenFile(`docs:${node.slug}`)}
        className={`flex items-center text-left w-full rounded px-2 py-1 hover:bg-white/10`}
        style={{ paddingLeft: depth * 12 + 12 }}
        title={node.name}
      >
        <FileIcon />
        <span className="text-sm truncate" title={node.title}>{node.title}</span>
      </button>
    );
  };

  return (
    <div className="p-2">
      <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-2">Docs</h2>
      {DOCS.length === 0 ? (
        <p className="text-sm text-gray-500">No docs yet. Put HTML files in <code className="bg-white/10 px-1 py-0.5 rounded">extra/docs/</code>.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {renderNode(tree, '')}
        </div>
      )}
    </div>
  );
};

const PlaygroundView: React.FC<{ onOpenFile: (fileId: string) => void }> = ({ onOpenFile }) => (
  <div className="p-2">
    <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-2">Playground</h2>
    <div className="flex flex-col gap-1">
      <button
        onClick={() => onOpenFile('split-speaker')}
        className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1"
      >
        <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-gray-400">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M2 5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-4 3v-3H5a3 3 0 0 1-3-3z"/><path d="M14 10a3 3 0 0 0 3-3v-.5h2a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-1l-3 2.25V16h-1a3 3 0 0 1-3-3v-1z" opacity=".65"/></svg>
        </span>
        <span className="text-sm">Split Speaker</span>
      </button>
      <button
        onClick={() => onOpenFile('bird-generator')}
        className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1"
      >
        <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
            <g fill="none" fillRule="evenodd">
              <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />
              <path fill="currentColor" d="M15 2a5 5 0 0 1 4.49 2.799l.094.201H21a1 1 0 0 1 .9 1.436l-.068.119l-1.552 2.327a1 1 0 0 0-.166.606l.014.128l.141.774c.989 5.438-3.108 10.451-8.593 10.606l-.262.004H3a1 1 0 0 1-.9-1.436l.068-.119L9.613 8.277A2.3 2.3 0 0 0 10 7a5 5 0 0 1 5-5m-3.5 9c-.271 0-.663.07-1.036.209c-.375.14-.582.295-.654.378l-3.384 5.077c.998-.287 2.065-.603 3.063-.994c1.067-.417 1.978-.892 2.609-1.446c.612-.537.902-1.092.902-1.724a1.5 1.5 0 0 0-1.5-1.5M15 6a1 1 0 1 0 0 2a1 1 0 0 0 0-2" />
            </g>
          </svg>
        </span>
        <span className="text-sm">Bird Generator</span>
      </button>
      <button
        onClick={() => onOpenFile('multi-voice-reader')}
        className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1"
      >
        <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M4 22q-.825 0-1.412-.587T2 20V4q0-.825.588-1.412T4 2h8.15l-2 2H4v16h11v-2h2v2q0 .825-.587 1.413T15 22zm2-4v-2h7v2zm0-3v-2h5v2zm9 0l-4-4H8V6h3l4-4zm2-3.05v-6.9q.9.525 1.45 1.425T19 8.5t-.55 2.025T17 11.95m0 4.3v-2.1q1.75-.625 2.875-2.162T21 8.5t-1.125-3.488T17 2.85V.75q2.6.675 4.3 2.813T23 8.5t-1.7 4.938T17 16.25"/></svg>
        </span>
        <span className="text-sm">MultiVoice Reader</span>
      </button>
    </div>
  </div>
);

const AppsView: React.FC<{ onOpenFile: (fileId: string) => void }> = ({ onOpenFile }) => {
  const ORDER: Array<'huny' | 'dev' | 'ai' | 'tools' | 'design'> = ['huny', 'dev', 'ai', 'tools', 'design'];
  const items = ORDER.map(id => CATEGORIES.find(c => c.id === id)!).filter(Boolean);

  return (
    <div className="p-2">
      <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-2">Apps</h2>
      <div className="flex flex-col gap-1">
        {items.map(cat => (
          <button
            key={cat.id}
            onClick={() => onOpenFile(`apps:${cat.id}`)}
            className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1"
          >
            {cat.iconUrl ? (
              <img src={cat.iconUrl} alt="" className="w-4 h-4 mr-2 rounded-sm" />
            ) : cat.emoji ? (
              <span className="w-4 h-4 mr-2 text-base leading-4" aria-hidden>{cat.emoji}</span>
            ) : (
              <span className="w-4 h-4 mr-2" />
            )}
            <span className="text-sm">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const ExplorerView: React.FC<{ onOpenFile: (fileId: string) => void }> = ({ onOpenFile }) => (
  <div className="p-2">
    <h2 className="text-xs uppercase text-gray-400 tracking-wider">Explorer</h2>
    <div className="mt-4">
        <div className="flex items-center cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 mr-1">
                <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
            <h3 className="text-sm font-bold uppercase tracking-wide">HunyDev</h3>
        </div>
        <div className="mt-2 pl-4 flex flex-col gap-1">
            <button onClick={() => onOpenFile('welcome')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
                <img src={welcomeIcon} alt="Welcome" className="w-4 h-4 mr-2 rounded-sm" />
                <span>Welcome</span>
            </button>
            <button onClick={() => onOpenFile('works')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
              <FileIcon />
              <span>works.md</span>
            </button>
            <button onClick={() => onOpenFile('about')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
              <FileIcon />
              <span>about.json</span>
            </button>
            <button onClick={() => onOpenFile('stack')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
              <FileIcon />
              <span>stack-huny.dev</span>
            </button>
            <button onClick={() => onOpenFile('digital-shelf')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
              <FileIcon />
              <span>digital-shelf.json</span>
            </button>
            <button onClick={() => onOpenFile('domain')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
                <FileIcon />
                <span>tts-history.md</span>
            </button>
            <button onClick={() => onOpenFile('mascot')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
              <FileIcon />
              <span>mascot.gallery</span>
            </button>
            <button onClick={() => onOpenFile('project')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
                <FileIcon />
                <span>project.js</span>
            </button>
        </div>
    </div>
  </div>
);

const GenericView: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
    <div className="p-2">
        <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-4">{title}</h2>
        {children}
    </div>
);

type MediaNode =
  | { type: 'folder'; name: string; children: MediaNode[] }
  | { type: 'image' | 'video'; name: string; src: string };

const MEDIA_TREE: MediaNode[] = [
  {
    type: 'folder',
    name: 'Images',
    children: [
      {
        type: 'folder',
        name: 'logos',
        children: [
          { type: 'image', name: 'logo.png', src: logoImg },
          { type: 'image', name: 'logo_128x128.png', src: logo128 },
        ],
      },
    ],
  },
  {
    type: 'folder',
    name: 'Videos',
    children: [
      { type: 'video', name: 'flower.mp4', src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' },
    ],
  },
];

const MediaView: React.FC<{ onOpenFile: (fileId: string) => void }> = ({ onOpenFile }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'Images': true, 'Images/logos': true });

  const toggle = (path: string) => setExpanded(prev => ({ ...prev, [path]: !prev[path] }));

  const renderNode = (node: MediaNode, path: string, depth = 0): React.ReactNode => {
    if (node.type === 'folder') {
      const currPath = path ? `${path}/${node.name}` : node.name;
      const isOpen = !!expanded[currPath];
      return (
        <div key={currPath}>
          <button
            onClick={() => toggle(currPath)}
            className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1"
            style={{ paddingLeft: depth * 12 }}
          >
            <svg className={`w-3 h-3 mr-1 transition-transform ${isOpen ? 'rotate-90' : ''}`} viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M6 3l5 5-5 5V3z" />
            </svg>
            <span className="mr-2">
              <svg className="w-4 h-4 inline text-gray-400" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 4a2 2 0 0 1 2-2h3l2 2h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z" />
              </svg>
            </span>
            <span className="text-sm">{node.name}</span>
          </button>
          {isOpen && (
            <div>
              {node.children.map((child) => renderNode(child, currPath, depth + 1))}
            </div>
          )}
        </div>
      );
    } else {
      const filePath = path ? `${path}/${node.name}` : node.name;
      return (
        <button
          key={filePath}
          onClick={() => {
            try {
              const payload = { type: node.type, name: node.name, src: node.src };
              const encoded = btoa(JSON.stringify(payload));
              onOpenFile(`media:${encoded}`);
            } catch {
              // noop
            }
          }}
          className={`flex items-center text-left w-full rounded px-2 py-1 hover:bg-white/10`}
          style={{ paddingLeft: depth * 12 + 12 }}
        >
          <span className="mr-2">
            {node.type === 'image' ? ImageIcon() : VideoIcon() }
          </span>
          <span className="text-sm">{node.name}</span>
        </button>
      );
    }
  };

  return (
    <div className="p-2">
      <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-2">Media</h2>
      <div className="flex flex-col gap-1">
        {MEDIA_TREE.map((node) => renderNode(node, ''))}
      </div>
    </div>
  );
};

const BookmarkView: React.FC<{ onOpenFile: (fileId: string) => void }> = ({ onOpenFile }) => {
  const Item: React.FC<{ id: string; name: string; color: string; count: number }>
    = ({ id, name, color, count }) => (
    <button
      onClick={() => onOpenFile(`bookmark:${id}`)}
      className="flex items-center justify-between text-left w-full hover:bg-white/10 rounded px-2 py-1.5"
    >
      <span className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-5 h-5">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor" style={{ color }} aria-hidden>
            <path d="M4 2.5A1.5 1.5 0 0 1 5.5 1h5A1.5 1.5 0 0 1 12 2.5v11.086a.5.5 0 0 1-.777.416L8 11.972l-3.223 2.03A.5.5 0 0 1 4 13.586z" />
          </svg>
        </span>
        <span className="text-sm">{name}</span>
      </span>
      <span className="text-xs text-gray-400">{count}</span>
    </button>
  );

  // Load counts from Notion once; fallback to static BOOKMARKS on error.
  const [all, setAll] = React.useState<Bookmark[]>(() => BOOKMARKS);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const items = await fetchNotionBookmarks({});
        if (!alive) return;
        setAll(items);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || String(e));
        setAll(BOOKMARKS);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const known = React.useMemo(() => new Set(BOOKMARK_CATEGORIES.map(c => c.id).filter(id => id !== 'uncategorized')), []);
  const count = React.useCallback((categoryId: string) => {
    if (categoryId === 'all') return all.length;
    if (categoryId === 'uncategorized') return all.filter(b => !b.categoryId || !known.has(b.categoryId)).length;
    return all.filter(b => b.categoryId === categoryId).length;
  }, [all, known]);

  const total = count('all');

  return (
    <div className="p-2">
      <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-2">Bookmarks</h2>
      <div className="flex flex-col gap-1">
        <Item id="all" name="All" color="#9ca3af" count={total} />
        {BOOKMARK_CATEGORIES.map(c => (
          <Item key={c.id} id={c.id} name={c.name} color={c.color} count={count(c.id)} />
        ))}
      </div>
    </div>
  );
};

const NotesView: React.FC<{ onOpenFile: (fileId: string) => void }> = ({ onOpenFile }) => {
  const Item: React.FC<{ id: string; name: string; color: string; count: number }>
    = ({ id, name, color, count }) => (
    <button
      onClick={() => onOpenFile(`notes:${id}`)}
      className="flex items-center justify-between text-left w-full hover:bg-white/10 rounded px-2 py-1.5"
    >
      <span className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm" style={{ background: color }} />
        <span className="text-sm">{name}</span>
      </span>
      <span className="text-xs text-gray-400">{count}</span>
    </button>
  );

  return (
    <div className="p-2">
      <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-2">Notes</h2>
      <div className="flex flex-col gap-1">
        {NOTE_GROUPS.map(g => (
          <Item key={g.id} id={g.id} name={g.name} color={g.color} count={getNoteCountByGroup(g.id)} />
        ))}
      </div>
    </div>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ activeView, onOpenFile, width = 256 }) => {

  const renderView = () => {
    switch (activeView) {
      case ViewId.Explorer:
        return <ExplorerView onOpenFile={onOpenFile} />;
      case ViewId.Search:
        return <GenericView title="Search"><p className="text-sm text-gray-400">Search functionality coming soon.</p></GenericView>;
      case ViewId.Docs:
        return <DocsView onOpenFile={onOpenFile} />;
      case ViewId.Apps:
        return <AppsView onOpenFile={onOpenFile} />;
      case ViewId.Media:
        return <MediaView onOpenFile={onOpenFile} />;
      case ViewId.Playground:
        return <PlaygroundView onOpenFile={onOpenFile} />;
      case ViewId.Bookmark:
        return <BookmarkView onOpenFile={onOpenFile} />;
      case ViewId.Notes:
        return <NotesView onOpenFile={onOpenFile} />;
      default:
        return <ExplorerView onOpenFile={onOpenFile} />;
    }
  };

  return <div className="bg-[#252526] border-r border-black/30 shrink-0 min-h-0 h-full overflow-y-auto" style={{ width }}>{renderView()}</div>;
};

export default Sidebar;