import React, { useMemo } from 'react';
import { PageProps } from '../../types';
import { getAppById, APPS } from './appsData';
import { Icon } from '../../constants';

const AppDetailPage: React.FC<PageProps> = ({ routeParams, onOpenFile }) => {
  const appId = routeParams?.appId as string | undefined;
  const app = useMemo(() => getAppById(appId || ''), [appId]);

  if (!app) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-400">앱을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-start gap-4">
        <div className="shrink-0 mt-1">
          {app.iconUrl ? (
            <img src={app.iconUrl} alt="" className="w-16 h-16 rounded-md" decoding="async" />
          ) : (
            <span className="text-5xl" aria-hidden>{app.iconEmoji || '📦'}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-white">{app.name}</h1>
          {app.description && (
            <p className="mt-2 text-gray-300">{app.description}</p>
          )}
          
          <div className="mt-4 text-sm text-gray-300">
            <div className="grid grid-cols-[120px,1fr] gap-x-4 gap-y-2 items-start">
              <div className="text-right text-gray-400">카테고리</div>
              <div className="text-gray-200">{app.categoryId}</div>

              {app.platforms.desktop && app.platforms.desktop.length > 0 && (
                <>
                  <div className="text-right text-gray-400 inline-flex items-center gap-1 justify-end">
                    <Icon name="monitor" className="w-4 h-4" aria-hidden />
                    <span>Desktop</span>
                  </div>
                  <div className="text-gray-200">{app.platforms.desktop.join(', ')}</div>
                </>
              )}
              
              {app.platforms.mobile && app.platforms.mobile.length > 0 && (
                <>
                  <div className="text-right text-gray-400 inline-flex items-center gap-1 justify-end">
                    <Icon name="mobile" className="w-4 h-4" aria-hidden />
                    <span>Mobile</span>
                  </div>
                  <div className="text-gray-200">{app.platforms.mobile.join(', ')}</div>
                </>
              )}
              
              {app.platforms.web && (
                <>
                  <div className="text-right text-gray-400 inline-flex items-center gap-1 justify-end">
                    <Icon name="globe" className="w-4 h-4" aria-hidden />
                    <span>Web</span>
                  </div>
                  <div className="text-gray-200">Available</div>
                </>
              )}
            </div>
          </div>

          {app.link && (
            <div className="mt-6">
              <a
                href={app.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/50"
              >
                바로가기
                <Icon name="externalLink" className="w-4 h-4" aria-hidden />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 같은 카테고리의 다른 앱들 */}
      <div className="mt-8 pt-8 border-t border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">같은 카테고리의 다른 앱</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
          {APPS.filter(a => a.categoryId === app.categoryId && a.id !== app.id).map(relatedApp => (
            <button
              key={relatedApp.id}
              onClick={() => onOpenFile(`app:${relatedApp.id}`)}
              className="relative group bg-white/5 border border-white/10 hover:border-white/20 rounded-md p-2 flex flex-col items-center justify-between h-28 md:h-32 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <div className="flex flex-col items-center gap-1">
                <div>
                  {relatedApp.iconUrl ? (
                    <img src={relatedApp.iconUrl} alt="" className="w-8 h-8 rounded-sm" loading="lazy" decoding="async" />
                  ) : (
                    <span className="text-2xl" aria-hidden>{relatedApp.iconEmoji || '📦'}</span>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xs text-white font-medium truncate max-w-[8rem]">{relatedApp.name}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppDetailPage;
