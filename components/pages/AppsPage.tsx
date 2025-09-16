import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PageProps } from '../../types';
import {
  AppItem,
  CATEGORIES,
  getAppCategoryById,
  getAppsByCategoryId,
  AppCategoryId,
} from './appsData';
import { fetchAppsByCategory } from '../../utils/pbClient';

const DesktopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20 3H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h7v2H8v2h8v-2h-3v-2h7c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2M4 14V5h16l.002 9z" />
  </svg>
);

const MobileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17 2H7c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2M7 16.999V5h10l.002 11.999z" />
  </svg>
);

const WebIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10s10-4.486 10-10S17.514 2 12 2m7.931 9h-2.764a14.7 14.7 0 0 0-1.792-6.243A8.01 8.01 0 0 1 19.931 11M12.53 4.027c1.035 1.364 2.427 3.78 2.627 6.973H9.03c.139-2.596.994-5.028 2.451-6.974c.172-.01.344-.026.519-.026c.179 0 .354.016.53.027m-3.842.7C7.704 6.618 7.136 8.762 7.03 11H4.069a8.01 8.01 0 0 1 4.619-6.273M4.069 13h2.974c.136 2.379.665 4.478 1.556 6.23A8.01 8.01 0 0 1 4.069 13m7.381 6.973C10.049 18.275 9.222 15.896 9.041 13h6.113c-.208 2.773-1.117 5.196-2.603 6.972c-.182.012-.364.028-.551.028c-.186 0-.367-.016-.55-.027m4.011-.772c.955-1.794 1.538-3.901 1.691-6.201h2.778a8 8 0 0 1-4.469 6.201" />
  </svg>
);

const AppsPage: React.FC<PageProps> = ({ routeParams }) => {
  const categoryId = (routeParams?.categoryId as AppCategoryId) || 'huny';
  const category = useMemo(() => getAppCategoryById(categoryId), [categoryId]);
  const [apps, setApps] = useState<AppItem[]>(() => getAppsByCategoryId(categoryId));
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [selected, setSelected] = useState<AppItem | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Map PB record to AppItem (tolerant to field naming)
  const mapPbRecordToAppItem = (rec: any): AppItem => {
    const toArr = (v: any): any[] => Array.isArray(v) ? v : [];
    const platformsObj = typeof rec?.platforms === 'object' && rec.platforms ? rec.platforms : {};
    const desktop = toArr(platformsObj.desktop ?? rec?.platformsDesktop ?? rec?.desktop);
    const mobile = toArr(platformsObj.mobile ?? rec?.platformsMobile ?? rec?.mobile);
    const web = Boolean(platformsObj.web ?? rec?.platformsWeb ?? rec?.web ?? rec?.isWeb);
    return {
      id: String(rec?.id ?? rec?.collectionId ?? crypto.randomUUID()),
      name: String(rec?.name ?? rec?.title ?? 'Unknown'),
      categoryId: (rec?.categoryId as AppCategoryId) || categoryId,
      iconEmoji: rec?.iconEmoji || undefined,
      iconUrl: rec?.iconUrl || undefined,
      link: rec?.link ?? rec?.url ?? undefined,
      description: rec?.description || '',
      platforms: {
        desktop: desktop.length ? desktop as any : undefined,
        mobile: mobile.length ? mobile as any : undefined,
        web: web || undefined,
      },
    };
  };

  // Load from PocketBase (with worker-issued token). Fallback to local static on error.
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const records = await fetchAppsByCategory(categoryId);
        if (!alive) return;
        const mapped = records.map(mapPbRecordToAppItem);
        setApps(mapped);
      } catch (e: any) {
        if (!alive) return;
        setLoadError(e?.message || String(e));
        setApps(getAppsByCategoryId(categoryId));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [categoryId]);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6 flex items-center gap-3">
        {category?.iconUrl ? (
          <img src={category.iconUrl} alt={category.name} className="w-6 h-6 rounded-sm" />
        ) : category?.emoji ? (
          <span className="text-xl" aria-hidden>{category.emoji}</span>
        ) : null}
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-white">Apps · {category?.name ?? 'Unknown'}</h1>
          <p className="text-sm text-gray-400">카테고리별로 내가 사용해본 앱들을 정리했습니다.</p>
        </div>
      </header>

      <section>
        {loading && (
          <div className="text-sm text-gray-400 mb-2">PocketBase에서 불러오는 중…</div>
        )}
        {loadError && (
          <div className="text-xs text-amber-300 mb-2">PB 로드 실패: {loadError} — 로컬 데이터로 표시합니다.</div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
          {apps.map(app => (
            <button
              key={app.id}
              onClick={() => setSelected(app)}
              className="relative group bg-white/5 border border-white/10 hover:border-white/20 rounded-md p-2 flex flex-col items-center justify-between h-28 md:h-32 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <div className="flex flex-col items-center gap-1">
                {/* App icon */}
                <div>
                  {app.iconUrl ? (
                    <img src={app.iconUrl} alt="" className="w-8 h-8 rounded-sm" />
                  ) : (
                    <span className="text-2xl" aria-hidden>{app.iconEmoji || '📦'}</span>
                  )}
                </div>
                {/* Name */}
                <div className="text-center">
                  <div className="text-xs text-white font-medium truncate max-w-[8rem]">{app.name}</div>
                </div>
              </div>
              {/* Platforms */}
              <div className="flex items-center gap-1">
                {app.platforms.desktop && app.platforms.desktop.length > 0 && (
                  <span className="relative group" title={app.platforms.desktop.join(', ')}>
                    <DesktopIcon className="w-4 h-4 text-gray-300" />
                    <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] bg-black/80 text-gray-200 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{app.platforms.desktop.join(', ')}</span>
                  </span>
                )}
                {app.platforms.mobile && app.platforms.mobile.length > 0 && (
                  <span className="relative group" title={app.platforms.mobile.join(', ')}>
                    <MobileIcon className="w-4 h-4 text-gray-300" />
                    <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] bg-black/80 text-gray-200 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{app.platforms.mobile.join(', ')}</span>
                  </span>
                )}
                {app.platforms.web && (
                  <span className="relative group" title="Web">
                    <WebIcon className="w-4 h-4 text-gray-300" />
                    <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] bg-black/80 text-gray-200 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Web</span>
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            role="dialog"
            aria-modal="true"
            className="relative mx-auto mt-16 w-[min(92vw,760px)] bg-[#252526] border border-white/10 rounded-lg shadow-xl p-4 text-gray-200"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {selected.iconUrl ? (
                  <img src={selected.iconUrl} alt="" className="w-8 h-8 rounded-sm" />
                ) : (
                  <span className="text-3xl" aria-hidden>{selected.iconEmoji || '📦'}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-white">{selected.name}</h3>
                {selected.description && (
                  <p className="mt-2 text-sm text-gray-300">{selected.description}</p>
                )}
                <div className="mt-3 text-sm text-gray-300">
                  <div className="grid grid-cols-[92px,1fr] gap-x-4 gap-y-1 items-start">
                    {selected.platforms.desktop && selected.platforms.desktop.length > 0 && (
                      <>
                        <div className="text-right text-gray-400 inline-flex items-center gap-1 pr-2"><DesktopIcon className="w-4 h-4" /><span>Desktop</span></div>
                        <div className="text-gray-200">{selected.platforms.desktop.join(', ')}</div>
                      </>
                    )}
                    {selected.platforms.mobile && selected.platforms.mobile.length > 0 && (
                      <>
                        <div className="text-right text-gray-400 inline-flex items-center gap-1 pr-2"><MobileIcon className="w-4 h-4" /><span>Mobile</span></div>
                        <div className="text-gray-200">{selected.platforms.mobile.join(', ')}</div>
                      </>
                    )}
                    {selected.platforms.web && (
                      <>
                        <div className="text-right text-gray-400 inline-flex items-center gap-1 pr-2"><WebIcon className="w-4 h-4" /><span>Web</span></div>
                        <div className="text-gray-200">—</div>
                      </>
                    )}
                  </div>
                </div>
                {selected.link && (
                  <div className="mt-4">
                    <a
                      href={selected.link}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-white/10 hover:bg-white/15 border border-white/10"
                    >
                      바로가기
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                        <path d="M10.5 2h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V3.707l-6.146 6.147a.5.5 0 0 1-.708-.708L12.293 3H10.5a.5.5 0 0 1 0-1Z" />
                        <path d="M13 7.5v6A1.5 1.5 0 0 1 11.5 15h-8A1.5 1.5 0 0 1 2 13.5v-8A1.5 1.5 0 0 1 3.5 4h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 1 1 0Z" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="ml-2 p-1.5 rounded hover:bg-white/10 text-gray-300"
                aria-label="닫기"
                title="닫기"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path d="M3.72 3.22a.75.75 0 0 1 1.06 0L8 6.44l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 7.5l3.22 3.22a.75.75 0 0 1-1.06 1.06L8 8.56l-3.22 3.22a.75.75 0 1 1-1.06-1.06L6.94 7.5L3.72 4.28a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppsPage;
