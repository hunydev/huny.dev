import React, { useState } from 'react';
import { ViewId } from '../types';
import { FileIcon, ImageIcon, VideoIcon } from '../constants';
import { BOOKMARK_CATEGORIES, BOOKMARKS, type Bookmark } from './pages/bookmarksData';
import { NOTE_GROUPS, getNoteCountByGroup } from './pages/notesData';
import { CATEGORIES } from './pages/appsData';
// DocsView now lists from R2 instead of local DOCS. The DocsPage can still use local data.
// Avoid bundling large images into main chunk: use static paths so they load only when rendered
import welcomeIcon from '../icon_32x32.png';
import { fetchNotionBookmarks } from '../utils/notionClient';

type SidebarProps = {
  activeView: ViewId;
  onOpenFile: (fileId: string) => void;
  width?: number;
};

const DocsView: React.FC<{ onOpenFile: (fileId: string) => void }> = ({ onOpenFile }) => {
  // Node definition for R2-based tree
  type Node = { type: 'folder'; name: string; children: Node[]; path: string } | { type: 'doc'; name: string; path: string; url: string };

  const R2_PUBLIC_BASE = 'https://r2.huny.dev';

  const [tree, setTree] = React.useState<Node>({ type: 'folder', name: '', children: [], path: '' } as any);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const toggle = (path: string) => setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
  const isOpen = (path: string, depth: number) => {
    if (path === '' && depth === 0) return true; // root open
    return !!expanded[path];
  };

  const buildTreeFromKeys = React.useCallback((keys: string[]) => {
    const root: Node = { type: 'folder', name: '', children: [], path: '' } as any;
    const ensureFolder = (parent: Node, name: string, path: string): Node => {
      if (parent.type !== 'folder') return parent;
      const existing = parent.children.find(ch => ch.type === 'folder' && (ch as any).name === name) as Node | undefined;
      if (existing) return existing;
      const node: Node = { type: 'folder', name, children: [], path } as any;
      parent.children.push(node);
      return node;
    };
    for (const fullKey of keys) {
      const rel = fullKey.startsWith('docs/') ? fullKey.substring('docs/'.length) : fullKey;
      const parts = rel.split('/');
      const file = parts.pop() || '';
      let cursor = root;
      let acc = '';
      for (const dir of parts) {
        acc = acc ? `${acc}/${dir}` : dir;
        cursor = ensureFolder(cursor, dir, acc);
      }
      if (cursor && (cursor as any).type === 'folder' && file) {
        const name = file.replace(/\.html$/i, '');
        const path = rel; // e.g., guides/intro.html
        const encodedPath = rel.split('/').map(encodeURIComponent).join('/');
        const url = `${R2_PUBLIC_BASE}/docs/${encodedPath}`;
        (cursor as any).children.push({ type: 'doc', name, path, url });
      }
    }
    const sortTree = (node: Node) => {
      if (node.type === 'folder') {
        node.children.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
          const an = a.type === 'folder' ? (a as any).name : (a as any).name;
          const bn = b.type === 'folder' ? (b as any).name : (b as any).name;
          return String(an).localeCompare(String(bn));
        });
        node.children.forEach(sortTree);
      }
    };
    sortTree(root);
    return root;
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/docs-tree');
        const js = (await res.json()) as { keys?: string[]; error?: string };
        if (!res.ok) throw new Error(js?.error || `Failed: ${res.status}`);
        const keys: string[] = Array.isArray(js?.keys) ? js.keys as string[] : [];
        const t = buildTreeFromKeys(keys);
        if (!alive) return;
        setTree(t);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || String(e));
        setTree({ type: 'folder', name: '', children: [], path: '' } as any);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [buildTreeFromKeys]);

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
    const filePath = path ? `${path}/${node.name}` : node.name;
    return (
      <button
        key={`doc:${filePath}`}
        onClick={() => onOpenFile(`docs:r2/${node.path}`)}
        className={`flex items-center text-left w-full rounded px-2 py-1 hover:bg-white/10`}
        style={{ paddingLeft: depth * 12 + 12 }}
        title={node.path}
      >
        <FileIcon />
        <span className="text-sm truncate" title={node.name}>{node.name}</span>
      </button>
    );
  };

  return (
    <div className="p-2">
      <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-2">Docs</h2>
      {loading && <p className="text-sm text-gray-500">Loading docs from R2…</p>}
      {error && <p className="text-xs text-amber-300 mb-2">{error}</p>}
      <div className="flex flex-col gap-1">
        {renderNode(tree, '')}
      </div>
    </div>
  );
};

const PlaygroundView: React.FC<{ onOpenFile: (fileId: string) => void }> = ({ onOpenFile }) => (
  <div className="p-2">
    <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-2">Playground</h2>
    <div className="flex flex-col gap-1">
      <button
        onClick={() => onOpenFile('web-worker')}
        className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1"
      >
        <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10m0-5a1 1 0 0 1 1 1v1.126a8.003 8.003 0 0 1 3.874 1.606l.796-.796a1 1 0 1 1 1.415 1.415l-.796.796A8.003 8.003 0 0 1 20.874 11H22a1 1 0 1 1 0 2h-1.126a8.003 8.003 0 0 1-1.606 3.874l.796.796a1 1 0 0 1-1.415 1.415l-.796-.796A8.003 8.003 0 0 1 13 20.874V22a1 1 0 1 1-2 0v-1.126a8.003 8.003 0 0 1-3.874-1.606l-.796.796a1 1 0 1 1-1.415-1.415l.796-.796A8.003 8.003 0 0 1 3.126 13H2a1 1 0 1 1 0-2h1.126a8.003 8.003 0 0 1 1.606-3.874l-.796-.796a1 1 0 1 1 1.415-1.415l.796.796A8.003 8.003 0 0 1 11 3.126V2a1 1 0 0 1 1-1"/></svg>
        </span>
        <span className="text-sm">Web Worker</span>
      </button>
      <button
        onClick={() => onOpenFile('todo-generator')}
        className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1"
      >
        <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="w-4 h-4"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M13 5h8m-8 7h8m-8 7h8M3 17l2 2l4-4"/><rect width="6" height="6" x="3" y="4" rx="1"/></g></svg>
        </span>
        <span className="text-sm">To-do Generator</span>
      </button>
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
              <img src={cat.iconUrl} alt="" className="w-4 h-4 mr-2 rounded-sm" loading="lazy" decoding="async" />
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
                <img src={welcomeIcon} alt="" aria-hidden="true" className="w-4 h-4 mr-2 rounded-sm" decoding="async" />
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
          { type: 'image', name: 'logo.png', src: '/logo.png' },
          { type: 'image', name: 'logo_128x128.png', src: '/logo_128x128.png' },
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
      {!loading && <span className="text-xs text-gray-400">{count}</span>}
    </button>
  );

  // Load counts from Notion once (remote-first); fallback to static BOOKMARKS on error.
  const [all, setAll] = React.useState<Bookmark[]>(() => []);
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