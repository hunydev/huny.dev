import type React from 'react';

export enum ViewId {
  Explorer = 'EXPLORER',
  Search = 'SEARCH',
  Docs = 'DOCS',
  Apps = 'APPS',
  Media = 'MEDIA',
  Playground = 'PLAYGROUND',
  Bookmark = 'BOOKMARK',
  Notes = 'NOTES',
  GitHub = 'GITHUB',
  Discord = 'DISCORD',
  X = 'X',
  Email = 'EMAIL'
}

export type Tab = {
  id: string;
  title: string;
  icon: React.ReactNode;
  pinned: boolean;
};

export type PageProps = {
  onOpenFile: (fileId: string) => void;
  setActiveView: (viewId: ViewId) => void;
  onActivityClick?: (viewId: ViewId) => void;
  routeParams?: Record<string, string>;
};
