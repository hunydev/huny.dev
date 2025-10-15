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

// API 요구사항 타입
export type ApiRequirement = {
  provider: 'openai' | 'gemini';
  features: ('text' | 'tts' | 'image')[];  // text: 무료 가능, tts/image: 유료 키 필요
};

export type PageProps = {
  onOpenFile: (fileId: string) => void;
  setActiveView: (viewId: ViewId) => void;
  onActivityClick?: (viewId: ViewId) => void;
  routeParams?: Record<string, string>;
  // API Task management
  apiTask?: {
    startTask: (tabId: string) => void;
    completeTask: (tabId: string, isActiveTab?: boolean) => void;
    errorTask: (tabId: string, error: string) => void;
    getTaskStatus: (tabId: string) => 'pending' | 'completed' | 'error' | null;
    clearTaskIfCompleted: (tabId: string) => void;
  };
  // 현재 탭 정보
  currentTabId?: string;
  isActiveTab?: boolean;
};
