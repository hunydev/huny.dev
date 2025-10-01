import type React from 'react';

export enum ViewId {
  Explorer = 'EXPLORER',
  Search = 'SEARCH',
  Docs = 'DOCS',
  Apps = 'APPS',
  Monitor = 'MONITOR',
  Playground = 'PLAYGROUND',
  Bookmark = 'BOOKMARK',
  Notes = 'NOTES',
  Blog = 'BLOG',
  GitHub = 'GITHUB',
  Discord = 'DISCORD',
  X = 'X',
  Email = 'EMAIL',
  Sites = 'SITES'
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
  // API Task management
  apiTask?: {
    startTask: (tabId: string) => void;
    completeTask: (tabId: string) => void;
    errorTask: (tabId: string, error: string) => void;
    getTaskStatus: (tabId: string) => 'pending' | 'completed' | 'error' | null;
  };
};
