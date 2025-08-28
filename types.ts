import type React from 'react';

export enum ViewId {
  Explorer = 'EXPLORER',
  Search = 'SEARCH',
  Docs = 'DOCS',
  Apps = 'APPS',
  GitHub = 'GITHUB',
  Discord = 'DISCORD',
  X = 'X',
  Email = 'EMAIL'
}

export type Tab = {
  id: string;
  title: string;
  icon: React.ReactNode;
};

export type PageProps = {
  onOpenFile: (fileId: string) => void;
  setActiveView: (viewId: ViewId) => void;
};
