import React from 'react';
import { ViewId, ApiRequirement } from '../types';
import { Icon, PAGES } from '../constants';
import { BOOKMARK_CATEGORIES, BOOKMARKS, type Bookmark } from './pages/bookmarksData';
import { NOTE_GROUPS, getNoteCountByGroup, subscribeNotes } from './pages/notesData';
import { CATEGORIES } from './pages/appsData';
import { MONITOR_GROUPS } from './pages/monitorData';
import { DOCS } from './pages/docsData';
// DocsView now lists from R2 instead of local DOCS. The DocsPage can still use local data.
// Avoid bundling large images into main chunk: use static paths so they load only when rendered
import welcomeIcon from '../icon_32x32.png';
import { fetchNotionBookmarks } from '../utils/notionClient';

type SidebarProps = {
  activeView: ViewId;
  onOpenFile: (fileId: string) => void;
  width?: number;
  apiHasGemini?: boolean;
  apiHasOpenAI?: boolean;
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
        <Icon name="file" className="mr-2" />
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

const PlaygroundView: React.FC<{ onOpenFile: (fileId: string) => void; apiHasGemini?: boolean; apiHasOpenAI?: boolean }> = ({ onOpenFile, apiHasGemini, apiHasOpenAI }) => {
  const checkAvailability = (pageId: string): boolean => {
    const pageInfo = PAGES[pageId];
    if (!pageInfo?.apiRequirement) return true;

    const { provider, features } = pageInfo.apiRequirement;
    const requiresUserKey = features.some(f => f === 'tts' || f === 'image');

    if (provider === 'openai') {
      return !!apiHasOpenAI;
    } else if (provider === 'gemini') {
      if (requiresUserKey) {
        return !!apiHasGemini;
      }
    }
    return true;
  };

  const playgroundItems = [
    { id: 'sticker-generator', icon: 'stickerGenerator', label: 'Sticker Generator' },
    { id: 'comic-restyler', icon: 'comicRestyler', label: 'Comic Restyler' },
    { id: 'ai-business-card', icon: 'aiBusinessCard', label: 'AI Business Card' },
    { id: 'text-cleaning', icon: 'textCleaning', label: 'Text Cleaning' },
    { id: 'text-to-phoneme', icon: 'textToPhoneme', label: 'Text to Phoneme' },
    { id: 'text-to-emoji', icon: 'textToEmoji', label: 'Text to Emoji' },
    { id: 'ui-clone', icon: 'uiClone', label: 'UI Clone' },
    { id: 'web-worker', icon: 'webWorker', label: 'Web Worker' },
    { id: 'todo-generator', icon: 'todoGenerator', label: 'To-do Generator' },
    { id: 'ai-tier-list', icon: 'aiTierList', label: 'AI Tier List' },
    { id: 'split-speaker', icon: 'splitSpeaker', label: 'Split Speaker' },
    { id: 'bird-generator', icon: 'bird', label: 'Bird Generator' },
    { id: 'multi-voice-reader', icon: 'multiVoiceReader', label: 'MultiVoice Reader' },
    { id: 'image-to-speech', icon: 'imageToSpeech', label: 'Image to Speech' },
    { id: 'non-native-korean-tts', icon: 'nonNativeKoreanTts', label: 'Non-Native Korean TTS' },
    { id: 'scene-to-script', icon: 'sceneToScript', label: 'Scene to Script' },
    { id: 'favicon-distiller', icon: 'favicon', label: 'Favicon Distiller' },
    { id: 'avatar-distiller', icon: 'avatar', label: 'Avatar Distiller' },
    { id: 'cover-crafter', icon: 'coverCrafter', label: 'Cover Crafter' },
  ];

  return (
    <div className="p-2">
      <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-2">Playground</h2>
      <div className="flex flex-col gap-1">
        {playgroundItems.map(item => {
          const available = checkAvailability(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onOpenFile(item.id)}
              className={`flex items-center text-left w-full rounded px-2 py-1 ${
                available 
                  ? 'hover:bg-white/10' 
                  : 'opacity-40 cursor-not-allowed hover:bg-white/5'
              }`}
              title={available ? undefined : 'API 키 설정이 필요합니다'}
            >
              <span className="inline-flex items-center justify-center w-4 h-4 mr-2 text-gray-400">
                <Icon name={item.icon as any} className="w-4 h-4" aria-hidden />
              </span>
              <span className="text-sm">{item.label}</span>
              {!available && (
                <svg className="w-3 h-3 ml-auto text-amber-400" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

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
          <Icon name="file" className="mr-2" />
          <span>works.md</span>
        </button>
        <button onClick={() => onOpenFile('about')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
          <Icon name="file" className="mr-2" />
          <span>about.json</span>
        </button>
        <button onClick={() => onOpenFile('stack')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
          <Icon name="file" className="mr-2" />
          <span>stack-huny.dev</span>
        </button>
        <button onClick={() => onOpenFile('digital-shelf')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
          <Icon name="file" className="mr-2" />
          <span>digital-shelf.json</span>
        </button>
        <button onClick={() => onOpenFile('design-system')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
          <Icon name="file" className="mr-2" />
          <span>design-system.json</span>
        </button>
        <button onClick={() => onOpenFile('domain')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
          <Icon name="file" className="mr-2" />
          <span>tts-history.md</span>
        </button>
        <button onClick={() => onOpenFile('mascot')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
          <Icon name="file" className="mr-2" />
          <span>mascot.gallery</span>
        </button>
        <button onClick={() => onOpenFile('project')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
          <Icon name="file" className="mr-2" />
          <span>project.js</span>
        </button>
        <button onClick={() => onOpenFile('extensions')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
          <Icon name="file" className="mr-2" />
          <span>extensions.txt</span>
        </button>
        <button onClick={() => onOpenFile('gear')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
          <Icon name="file" className="mr-2" />
          <span>gear.json</span>
        </button>
        <button onClick={() => onOpenFile('inspiration')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
          <Icon name="file" className="mr-2" />
          <span>inspiration.gallery</span>
        </button>
        <button onClick={() => onOpenFile('youtube-channels')} className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
          <Icon name="file" className="mr-2" />
          <span>youtube-channels.json</span>
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

type SearchEntry = {
  id: string;
  group: string;
  label: string;
  description?: string;
  searchText: string;
  open: () => void;
};

const SearchView: React.FC<{ onOpenFile: (fileId: string) => void }> = ({ onOpenFile }) => {
  const [query, setQuery] = React.useState('');

  const entries = React.useMemo<SearchEntry[]>(() => {
    const list: SearchEntry[] = [];

    Object.entries(PAGES).forEach(([id, info]) => {
      list.push({
        id: `page:${id}`,
        group: 'Pages',
        label: info.title,
        searchText: `${info.title} ${id}`.toLowerCase(),
        open: () => onOpenFile(id),
      });
    });

    BOOKMARK_CATEGORIES.forEach(cat => {
      list.push({
        id: `bookmark-category:${cat.id}`,
        group: 'Bookmarks',
        label: cat.name,
        description: '북마크 카테고리',
        searchText: `${cat.name} bookmark ${cat.id}`.toLowerCase(),
        open: () => onOpenFile(`bookmark:${cat.id}`),
      });
    });

    NOTE_GROUPS.forEach(group => {
      list.push({
        id: `note-group:${group.id}`,
        group: 'Notes',
        label: group.name,
        description: '노트 그룹',
        searchText: `${group.name} note ${group.id}`.toLowerCase(),
        open: () => onOpenFile(`notes:${group.id}`),
      });
    });

    CATEGORIES.forEach(cat => {
      list.push({
        id: `apps-category:${cat.id}`,
        group: 'Apps',
        label: cat.name,
        description: '앱 카테고리',
        searchText: `${cat.name} apps ${cat.id}`.toLowerCase(),
        open: () => onOpenFile(`apps:${cat.id}`),
      });
    });

    MONITOR_GROUPS.forEach(group => {
      group.items.forEach(item => {
        list.push({
          id: `monitor-item:${item.id}`,
          group: 'Monitor',
          label: item.name,
          description: group.name,
          searchText: `${item.name} ${group.name}`.toLowerCase(),
          open: () => onOpenFile(`monitor:${item.id}`),
        });
      });
    });

    DOCS.forEach(doc => {
      list.push({
        id: `docs:${doc.slug}`,
        group: 'Docs',
        label: doc.title,
        description: doc.slug,
        searchText: `${doc.title} ${doc.slug}`.toLowerCase(),
        open: () => onOpenFile(`docs:${doc.slug}`),
      });
    });

    return list;
  }, [onOpenFile]);

  const normalized = query.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!normalized) {
      return entries.slice(0, 30);
    }
    return entries.filter(item => item.searchText.includes(normalized)).slice(0, 60);
  }, [entries, normalized]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, SearchEntry[]>();
    filtered.forEach(item => {
      const bucket = map.get(item.group);
      if (bucket) {
        bucket.push(item);
      } else {
        map.set(item.group, [item]);
      }
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="p-2">
      <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-2">Search</h2>
      <div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="w-full px-3 py-2 rounded bg-black/30 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60"
        />
      </div>

      <div className="mt-3 max-h-[calc(100vh-220px)] overflow-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-500 mt-4">검색 결과가 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {grouped.map(([group, items]) => (
              <div key={group}>
                <h3 className="text-xs uppercase text-gray-500 tracking-wider mb-1">{group}</h3>
                <ul className="space-y-1">
                  {items.map(item => (
                    <li key={item.id}>
                      <button
                        onClick={item.open}
                        className="w-full flex flex-col items-start gap-0.5 px-2 py-1 rounded hover:bg-white/10 text-left"
                      >
                        <span className="text-sm text-gray-100">{item.label}</span>
                        {item.description ? (
                          <span className="text-xs text-gray-500">{item.description}</span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MonitorView: React.FC<{ onOpenFile: (fileId: string) => void }> = ({ onOpenFile }) => {
  const entries = React.useMemo(() => (
    MONITOR_GROUPS.map(group => {
      const primaryItem = group.items[0];
      return {
        groupId: group.id,
        groupName: group.name,
        icon: group.icon,
        targetId: primaryItem?.id ?? '',
      };
    }).filter(entry => entry.targetId)
  ), []);

  return (
    <div className="p-2">
      <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-2">Monitor</h2>
      <div className="flex flex-col gap-1">
        {entries.map(entry => (
          <button
            key={entry.groupId}
            onClick={() => onOpenFile(`monitor:${entry.targetId}`)}
            className="flex items-center gap-2 text-left w-full rounded px-2 py-1 hover:bg-white/10"
          >
            {entry.icon ? <Icon name={entry.icon} className="w-4 h-4 text-gray-200" /> : null}
            <span className="text-[13px] text-gray-200">{entry.groupName}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const BookmarkItem: React.FC<{ id: string; name: string; color: string; count: number; loading: boolean; onOpenFile: (fileId: string) => void }> =
  React.memo(({ id, name, color, count, loading, onOpenFile }) => (
    <button
      onClick={() => {
        onOpenFile(`bookmark:${id}`);
      }}
      className="flex items-center justify-between text-left w-full hover:bg-white/10 rounded px-2 py-1.5"
    >
      <span className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-5 h-5">
          <Icon name="bookmark" className="w-4 h-4 text-gray-200" style={{ color }}/>
        </span>
        <span className="text-sm">{name}</span>
      </span>
      {!loading && <span className="text-xs text-gray-400">{count}</span>}
    </button>
  ));

const BookmarkView: React.FC<{ onOpenFile: (fileId: string) => void }> = ({ onOpenFile }) => {
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
        <BookmarkItem id="all" name="All" color="#9ca3af" count={total} loading={loading} onOpenFile={onOpenFile} />
        {BOOKMARK_CATEGORIES.map(c => (
          <BookmarkItem key={c.id} id={c.id} name={c.name} color={c.color} count={count(c.id)} loading={loading} onOpenFile={onOpenFile} />
        ))}
      </div>
    </div>
  );
};

const NotesItem: React.FC<{ id: string; name: string; color: string; count: number; onOpenFile: (fileId: string) => void }> =
  React.memo(({ id, name, color, count, onOpenFile }) => (
    <button
      onClick={() => {
        onOpenFile(`notes:${id}`);
      }}
      className="flex items-center justify-between text-left w-full hover:bg-white/10 rounded px-2 py-1.5"
    >
      <span className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm" style={{ background: color }} />
        <span className="text-sm">{name}</span>
      </span>
      <span className="text-xs text-gray-400">{count}</span>
    </button>
  ));

const NotesView: React.FC<{ onOpenFile: (fileId: string) => void }> = ({ onOpenFile }) => {
  const [counts, setCounts] = React.useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    NOTE_GROUPS.forEach(group => {
      initial[group.id] = getNoteCountByGroup(group.id);
    });
    return initial;
  });

  React.useEffect(() => {
    const unsubscribe = subscribeNotes(({ groupId, notes }) => {
      setCounts(prev => ({ ...prev, [groupId]: notes.length }));
    });
    return unsubscribe;
  }, []);

  return (
    <div className="p-2">
      <h2 className="text-xs uppercase text-gray-400 tracking-wider mb-2">Notes</h2>
      <div className="flex flex-col gap-1">
        {NOTE_GROUPS.map(g => (
          <NotesItem key={g.id} id={g.id} name={g.name} color={g.color} count={counts[g.id] ?? 0} onOpenFile={onOpenFile} />
        ))}
      </div>
    </div>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ activeView, onOpenFile, width = 256, apiHasGemini, apiHasOpenAI }) => {

  const renderView = () => {
    switch (activeView) {
      case ViewId.Explorer:
        return <ExplorerView onOpenFile={onOpenFile} />;
      case ViewId.Search:
        return <SearchView onOpenFile={onOpenFile} />;
      case ViewId.Docs:
        return <DocsView onOpenFile={onOpenFile} />;
      case ViewId.Apps:
        return <AppsView onOpenFile={onOpenFile} />;
      case ViewId.Monitor:
        return <MonitorView onOpenFile={onOpenFile} />;
      case ViewId.Playground:
        return <PlaygroundView onOpenFile={onOpenFile} apiHasGemini={apiHasGemini} apiHasOpenAI={apiHasOpenAI} />;
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