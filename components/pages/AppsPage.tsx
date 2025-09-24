import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PageProps } from '../../types';
import {
  AppItem,
  APPS,
  getAppCategoryById,
  AppCategoryId,
} from './appsData';
import { fetchAllApps, buildPBFileUrl } from '../../utils/pbClient';
import { Icon } from '../../constants';

const AppsPage: React.FC<PageProps> = ({ routeParams }) => {
  const categoryId = (routeParams?.categoryId as AppCategoryId) || 'huny';
  const category = useMemo(() => getAppCategoryById(categoryId), [categoryId]);
  const [allApps, setAllApps] = useState<AppItem[]>(() => []);
  const apps = useMemo(() => allApps.filter(a => a.categoryId === categoryId), [allApps, categoryId]);
  const [loading, setLoading] = useState(true);
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
    // iconUrl: PocketBase 파일명만 오는 경우 실제 파일 URL 구성
    let iconUrl: string | undefined = rec?.iconUrl || undefined;
    if (iconUrl && !/^https?:/i.test(iconUrl)) {
      const colId = String(rec?.collectionId || rec?.collectionName || '');
      const recId = String(rec?.id || '');
      if (colId && recId) {
        iconUrl = buildPBFileUrl(colId, recId, iconUrl);
      }
    }
    return {
      id: String(rec?.id ?? rec?.collectionId ?? crypto.randomUUID()),
      name: String(rec?.name ?? rec?.title ?? 'Unknown'),
      categoryId: (rec?.categoryId as AppCategoryId) || categoryId,
      iconEmoji: rec?.iconEmoji || undefined,
      iconUrl,
      link: rec?.link ?? rec?.url ?? undefined,
      description: rec?.description || '',
      platforms: {
        desktop: desktop.length ? desktop as any : undefined,
        mobile: mobile.length ? mobile as any : undefined,
        web: web || undefined,
      },
    };
  };

  // Load ALL apps from PocketBase once on tab load, then filter locally per category.
  // Fallback to local static APPS on error.
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const records = await fetchAllApps();
        if (!alive) return;
        const mapped = records.map(mapPbRecordToAppItem);
        setAllApps(mapped);
      } catch (e: any) {
        if (!alive) return;
        setLoadError(e?.message || String(e));
        setAllApps(APPS);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6 flex items-center gap-3">
        {category?.iconUrl ? (
          <img src={category.iconUrl} alt={category.name} className="w-6 h-6 rounded-sm" decoding="async" />
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
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 opacity-80">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-md p-2 h-28 md:h-32 animate-pulse" />
            ))}
          </div>
        ) : (
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
                      <img src={app.iconUrl} alt="" className="w-8 h-8 rounded-sm" loading="lazy" decoding="async" />
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
                      <Icon name="monitor" className="w-4 h-4 text-gray-300" aria-hidden />
                      <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] bg-black/80 text-gray-200 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{app.platforms.desktop.join(', ')}</span>
                    </span>
                  )}
                  {app.platforms.mobile && app.platforms.mobile.length > 0 && (
                    <span className="relative group" title={app.platforms.mobile.join(', ')}>
                      <Icon name="mobile" className="w-4 h-4 text-gray-300" aria-hidden />
                      <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] bg-black/80 text-gray-200 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">{app.platforms.mobile.join(', ')}</span>
                    </span>
                  )}
                  {app.platforms.web && (
                    <span className="relative group" title="Web">
                      <Icon name="globe" className="w-4 h-4 text-gray-300" aria-hidden />
                      <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] bg-black/80 text-gray-200 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Web</span>
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
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
                  <img src={selected.iconUrl} alt="" className="w-8 h-8 rounded-sm" decoding="async" />
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
                        <div className="text-right text-gray-400 inline-flex items-center gap-1 pr-2"><Icon name="monitor" className="w-4 h-4" aria-hidden /><span>Desktop</span></div>
                        <div className="text-gray-200">{selected.platforms.desktop.join(', ')}</div>
                      </>
                    )}
                    {selected.platforms.mobile && selected.platforms.mobile.length > 0 && (
                      <>
                        <div className="text-right text-gray-400 inline-flex items-center gap-1 pr-2"><Icon name="mobile" className="w-4 h-4" aria-hidden /><span>Mobile</span></div>
                        <div className="text-gray-200">{selected.platforms.mobile.join(', ')}</div>
                      </>
                    )}
                    {selected.platforms.web && (
                      <>
                        <div className="text-right text-gray-400 inline-flex items-center gap-1 pr-2"><Icon name="globe" className="w-4 h-4" aria-hidden /><span>Web</span></div>
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
                      <Icon name="externalLink" className="w-4 h-4" aria-hidden />
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
                <Icon name="closeSmall" className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppsPage;
