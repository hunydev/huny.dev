import React from 'react';
import { PageProps } from '../../types';

const MediaPreviewPage: React.FC<PageProps> = ({ routeParams }) => {
  const type = (routeParams?.type as 'image' | 'video' | undefined) ?? undefined;
  const name = routeParams?.name ?? '';
  const src = routeParams?.src ?? '';

  if (!type || !src) {
    return (
      <div className="text-sm text-gray-400">
        No media selected or invalid source.
      </div>
    );
  }

  const isHttp = typeof src === 'string' && /^(https?:)?\/\//.test(src);

  return (
    <div className="max-w-full">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm text-gray-300 truncate" title={name}>{name}</div>
        {isHttp && (
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-200"
            title="Open original in new tab"
          >
            Open original
          </a>
        )}
      </div>

      {type === 'image' ? (
        <img
          src={src}
          alt={name}
          className="rounded border border-white/10 shadow max-w-full"
          style={{ height: 'auto' }}
        />
      ) : (
        <video
          src={src}
          controls
          className="rounded border border-white/10 shadow max-w-full"
          style={{ height: 'auto' }}
        />
      )}
    </div>
  );
};

export default MediaPreviewPage;
