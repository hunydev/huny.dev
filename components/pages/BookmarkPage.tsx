import React, { useEffect, useMemo, useState } from 'react';
import type { PageProps } from '../../types';
import { BOOKMARK_CATEGORIES, BOOKMARKS, getCategoryById, type Bookmark } from './bookmarksData';
import { fetchNotionBookmarks } from '../../utils/notionClient';
import { Icon } from '../../constants';

const formatDate = (iso?: string) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toISOString().slice(0, 10);
  } catch {
    return '-';
  }
};

const BookmarkPage: React.FC<PageProps> = ({ routeParams, onOpenFile }) => {
  const categoryId = routeParams?.categoryId ?? 'all';
  const [view, setView] = useState<'card' | 'list'>(() => {
    const v = typeof window !== 'undefined' ? window.localStorage.getItem('bookmark.view') : null;
    return v === 'list' ? 'list' : 'card';
  });

  const category = useMemo(() => (categoryId === 'all' ? undefined : getCategoryById(categoryId)), [categoryId]);
  const [all, setAll] = useState<Bookmark[]>(() => []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local filter that mirrors bookmarksData.ts logic (including 'uncategorized').
  const filtered = useMemo(() => {
    if (categoryId === 'all') return all;
    if (categoryId === 'uncategorized') {
      const known = new Set(BOOKMARK_CATEGORIES.map(c => c.id).filter(id => id !== 'uncategorized'));
      return all.filter(b => !b.categoryId || !known.has(b.categoryId));
    }
    return all.filter(b => b.categoryId === categoryId);
  }, [all, categoryId]);

  // Fetch once on mount from Notion via Worker proxy; fallback to static if fails.
  useEffect(() => {
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

  const onToggleView = (next: 'card' | 'list') => {
    setView(next);
    try { window.localStorage.setItem('bookmark.view', next); } catch {}
  };

  const headerTitle = useMemo(() => {
    if (categoryId === 'all') return 'Bookmarks · All';
    if (category) return `Bookmarks · ${category.name}`;
    return 'Bookmarks · Unknown';
  }, [categoryId, category]);

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-white">{headerTitle}</h1>
          <p className="text-sm text-gray-400">{loading ? '…' : `${filtered.length} items`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1.5 rounded text-sm border border-white/10 ${view === 'card' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10'}`}
            onClick={() => onToggleView('card')}
            aria-pressed={view === 'card'}
            title="Card view"
          >
            <span className="inline-flex items-center gap-1">
              <Icon name="layoutGrid" className="w-4 h-4" aria-hidden />
              Card
            </span>
          </button>
          <button
            className={`px-3 py-1.5 rounded text-sm border border-white/10 ${view === 'list' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10'}`}
            onClick={() => onToggleView('list')}
            aria-pressed={view === 'list'}
            title="List view"
          >
            <span className="inline-flex items-center gap-1">
              <Icon name="layoutList" className="w-4 h-4" aria-hidden />
              List
            </span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="mb-3 text-sm text-gray-400">Notion에서 불러오는 중…</div>
      )}
      {error && (
        <div className="mb-3 text-xs text-amber-300">Notion 로드 실패: {error} — 로컬 데이터로 표시합니다.</div>
      )}
      {view === 'card' ? (
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-80">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 rounded bg-[#252526] border border-black/30 animate-pulse h-28" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onReset={() => onOpenFile?.('bookmark:all')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((b) => (
              <CardItem key={b.id} bm={b} />
            ))}
          </div>
        )
      ) : (
        loading ? (
          <div className="divide-y divide-white/10 rounded border border-white/10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-3 py-3 bg-[#1e1e1e] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onReset={() => onOpenFile?.('bookmark:all')} />
        ) : (
          <div className="divide-y divide-white/10 rounded border border-white/10">
            {filtered.map((b) => (
              <ListItem key={b.id} bm={b} />)
            )}
          </div>
        )
      )}
    </div>
  );
};

const Tag: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">{text}</span>
);

const EmptyState: React.FC<{ onReset?: () => void }> = ({ onReset }) => (
  <div className="border border-white/10 rounded p-6 text-center text-gray-400 bg-[#1e1e1e]">
    <p className="mb-3">No bookmarks to show in this category.</p>
    {onReset && (
      <button onClick={onReset} className="px-3 py-1.5 text-sm rounded bg-white/10 hover:bg-white/15 border border-white/10 text-gray-200">
        View All
      </button>
    )}
  </div>
);

const Thumb: React.FC<{ src?: string; alt: string }> = ({ src }) => (
  <div className="w-14 h-14 rounded overflow-hidden bg-[#2d2d2d] border border-white/10 shrink-0">
    {src ? (
      <img src={src} alt="" aria-hidden="true" className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full grid place-items-center text-gray-500">—</div>
    )}
  </div>
);

const CardItem: React.FC<{ bm: Bookmark }> = ({ bm }) => {
  const cat = getCategoryById(bm.categoryId);
  return (
    <div className="p-4 rounded bg-[#252526] border border-black/30 hover:border-white/20 transition-colors">
      <div className="flex items-start gap-3">
        <Thumb src={bm.thumbnail} alt={bm.name} />
        <div className="min-w-0">
          <a href={bm.url} target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:underline break-all">{bm.name}</a>
          {bm.description && <p className="text-sm text-gray-400 mt-0.5">{bm.description}</p>}
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: cat?.color || '#6b7280' }} />
              {cat?.name || 'Uncategorized'}
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-400">Created {formatDate(bm.createdAt)}</span>
            {bm.updatedAt && <span className="text-xs text-gray-400">· Updated {formatDate(bm.updatedAt)}</span>}
          </div>
          {bm.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {bm.tags.map(t => <Tag key={t} text={t} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ListItem: React.FC<{ bm: Bookmark }> = ({ bm }) => {
  const cat = getCategoryById(bm.categoryId);
  return (
    <div className="px-3 py-2 flex items-center gap-3 bg-[#1e1e1e] hover:bg-white/5">
      <div className="w-1.5 h-5 rounded" style={{ backgroundColor: cat?.color || '#6b7280' }} />
      <div className="min-w-0 flex-1">
        <a href={bm.url} target="_blank" rel="noopener noreferrer" className="text-white hover:underline break-all">{bm.name}</a>
        {bm.description && <p className="text-xs text-gray-400 truncate">{bm.description}</p>}
      </div>
      {bm.tags?.length > 0 && (
        <div className="hidden md:flex flex-wrap gap-1.5 max-w-[40%]">
          {bm.tags.map(t => <Tag key={t} text={t} />)}
        </div>
      )}
      <div className="text-[11px] text-gray-400 whitespace-nowrap">
        {formatDate(bm.createdAt)}
        {bm.updatedAt && <span className="text-gray-500"> · {formatDate(bm.updatedAt)}</span>}
      </div>
    </div>
  );
};

export default BookmarkPage;
