import React from 'react';
import { ViewId, PageProps } from './types';
import WelcomePage from './components/pages/WelcomePage';
import welcomeIcon from './icon_32x32.png';
import ProjectPage from './components/pages/ProjectPage';
import AboutPage from './components/pages/AboutPage';
import BookmarkPage from './components/pages/BookmarkPage';
import MediaPreviewPage from './components/pages/MediaPreviewPage';
import NotesBoardPage from './components/pages/NotesBoardPage';
import DomainPage from './components/pages/DomainPage';
import AppsPage from './components/pages/AppsPage';
import DocsPage from './components/pages/DocsPage';
import WorksPage from './components/pages/WorksPage';
import DigitalShelfPage from './components/pages/DigitalShelfPage';
import StackHunyDevPage from './components/pages/StackHunyDevPage';
import MascotGalleryPage from './components/pages/MascotGalleryPage';

export const FileIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4 mr-2 text-gray-400"
  >
    <path d="M13 9V3.5L18.5 9M6 2c-1.11 0-2 .89-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
  </svg>
);

export const PAGES: {
  [key: string]: {
    title: string;
    component: React.FC<PageProps>;
    icon: React.ReactNode;
  };
} = {
  welcome: {
    title: 'Welcome',
    component: WelcomePage,
    icon: <img src={welcomeIcon} alt="Welcome" className="w-4 h-4 mr-2 rounded-sm" />,
  },
  docs: {
    title: 'docs',
    component: DocsPage,
    icon: <FileIcon />,
  },
  domain: {
    title: 'tts-history.md',
    component: DomainPage,
    icon: <FileIcon />,
  },
  works: {
    title: 'works.md',
    component: WorksPage,
    icon: <FileIcon />,
  },
  stack: {
    title: 'stack-huny.dev',
    component: StackHunyDevPage,
    icon: <FileIcon />,
  },
  'digital-shelf': {
    title: 'digital-shelf.json',
    component: DigitalShelfPage,
    icon: <FileIcon />,
  },
  mascot: {
    title: 'mascot.gallery',
    component: MascotGalleryPage,
    icon: <FileIcon />,
  },
  apps: {
    title: 'apps',
    component: AppsPage,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4 mr-2 text-gray-400"
      >
        <path d="M3 5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm9 0a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2zM3 14a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm9 0a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  media: {
    title: 'media',
    component: MediaPreviewPage,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="w-4 h-4 mr-2 text-gray-400"
      >
        <path d="M1.5 3A1.5 1.5 0 0 0 0 4.5v7A1.5 1.5 0 0 0 1.5 13h13a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 3h-13Zm2 2 3 4 2-2 4 5h-11l2-7Z" />
      </svg>
    ),
  },
  project: {
    title: 'project.js',
    component: ProjectPage,
    icon: <FileIcon />,
  },
  about: {
    title: 'about.json',
    component: AboutPage,
    icon: <FileIcon />,
  },
  bookmark: {
    title: 'bookmarks.json',
    component: BookmarkPage,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4 mr-2 text-gray-400"
      >
        <path d="M6 3.5C6 2.67 6.67 2 7.5 2h9A1.5 1.5 0 0 1 18 3.5v16.77c0 .57-.63.92-1.11.6l-4.78-3.2a1.5 1.5 0 0 0-1.64 0l-4.78 3.2c-.48.32-1.11-.03-1.11-.6z" />
      </svg>
    ),
  },
  notes: {
    title: 'notes',
    component: NotesBoardPage,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="w-4 h-4 mr-2 text-gray-400"
      >
        <path d="M2.5 2A1.5 1.5 0 0 0 1 3.5v9A1.5 1.5 0 0 0 2.5 14h7.793l3.354-3.354A.5.5 0 0 0 14 10.293V3.5A1.5 1.5 0 0 0 12.5 2h-10Z" />
        <path d="M10.5 13.5V11a1 1 0 0 1 1-1h2.5" opacity="0.6" />
      </svg>
    ),
  },
};

export const ACTIVITY_BAR_ITEMS = [
  // Top section
  {
    id: ViewId.Explorer,
    section: 'top',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-7 h-7">
        <path d="M17.5 0h-9L7 1.5V6H2.5L1 7.5v15.07L2.5 24h12.07L16 22.57V18h4.7l1.3-1.43V4.5L17.5 0zm0 2.12l2.38 2.38H17.5V2.12zm-3 20.38h-12v-15H7v9.07L8.5 18h6v4.5zm6-6h-12v-15H16V6h4.5v10.5z"/>
      </svg>
    ),
    title: 'Explorer',
  },
  {
    id: ViewId.Search,
    section: 'top',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
    title: 'Search',
  },
  {
    id: ViewId.Docs,
    section: 'top',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: 'Docs',
  },
  {
    id: ViewId.Apps,
    section: 'top',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
    title: 'Apps',
  },
  {
    id: ViewId.Media,
    section: 'top',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="M21 7.6v12.8a.6.6 0 0 1-.6.6H7.6a.6.6 0 0 1-.6-.6V7.6a.6.6 0 0 1 .6-.6h12.8a.6.6 0 0 1 .6.6"/><path d="M18 4H4.6a.6.6 0 0 0-.6.6V18m3-1.2l5.444-1.8L21 18m-4.5-5a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3"/></g>
      </svg>
    ),
    title: 'Media',
  },
  {
    id: ViewId.Playground,
    section: 'top',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-7 h-7">
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M448 341.37V170.61A32 32 0 0 0 432.11 143l-152-88.46a47.94 47.94 0 0 0-48.24 0L79.89 143A32 32 0 0 0 64 170.61v170.76A32 32 0 0 0 79.89 369l152 88.46a48 48 0 0 0 48.24 0l152-88.46A32 32 0 0 0 448 341.37"/>
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="m69 153.99l187 110l187-110m-187 310v-200"/>
        <ellipse cx="256" cy="152" fill="currentColor" rx="24" ry="16"/>
        <ellipse cx="208" cy="296" fill="currentColor" rx="16" ry="24"/>
        <ellipse cx="112" cy="328" fill="currentColor" rx="16" ry="24"/>
        <ellipse cx="304" cy="296" fill="currentColor" rx="16" ry="24"/>
        <ellipse cx="400" cy="240" fill="currentColor" rx="16" ry="24"/>
        <ellipse cx="304" cy="384" fill="currentColor" rx="16" ry="24"/>
        <ellipse cx="400" cy="328" fill="currentColor" rx="16" ry="24"/>
      </svg>
    ),
    title: 'Playground',
  },
  {
    id: ViewId.Bookmark,
    section: 'top',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 17.98V9.709c0-3.634 0-5.45 1.172-6.58S8.229 2 12 2s5.657 0 6.828 1.129C20 4.257 20 6.074 20 9.708v8.273c0 2.306 0 3.459-.773 3.871c-1.497.8-4.304-1.867-5.637-2.67c-.773-.465-1.16-.698-1.59-.698s-.817.233-1.59.698c-1.333.803-4.14 3.47-5.637 2.67C4 21.44 4 20.287 4 17.981"/>
      </svg>
    ),
    title: 'Bookmark',
  },
  {
    id: ViewId.Notes,
    section: 'top',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none" strokeWidth={3.0} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 9.5v22.9h10.1v10.1h22.9c2.2 0 4-1.8 4-4v-29c0-2.2-1.8-4-4-4h-29c-2.2 0-4 1.8-4 4m0 22.9l10.1 10.1"/>
      </svg>
    ),
    title: 'Notes',
  },

  // Bottom section (social/external)
  {
    id: ViewId.GitHub,
    section: 'bottom',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" fill="currentColor" className="w-7 h-7">
        <path d="M9.358 2.145a8.2 8.2 0 0 0-3.716 0c-.706-.433-1.245-.632-1.637-.716a2.2 2.2 0 0 0-.51-.053a1.3 1.3 0 0 0-.232.028l-.01.002l-.004.002h-.003l.137.481l-.137-.48a.5.5 0 0 0-.32.276a3.12 3.12 0 0 0-.159 2.101A3.35 3.35 0 0 0 2 5.93c0 1.553.458 2.597 1.239 3.268c.547.47 1.211.72 1.877.863a2.3 2.3 0 0 0-.116.958v.598c-.407.085-.689.058-.89-.008c-.251-.083-.444-.25-.629-.49a5 5 0 0 1-.27-.402l-.057-.093a9 9 0 0 0-.224-.354c-.19-.281-.472-.633-.928-.753l-.484-.127l-.254.968l.484.127c.08.02.184.095.355.346a7 7 0 0 1 .19.302l.068.11c.094.152.202.32.327.484c.253.33.598.663 1.11.832c.35.116.748.144 1.202.074V14.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-3.562c0-.316-.014-.605-.103-.874c.663-.14 1.322-.39 1.866-.86c.78-.676 1.237-1.73 1.237-3.292v-.001a3.35 3.35 0 0 0-.768-2.125a3.12 3.12 0 0 0-.159-2.1a.5.5 0 0 0-.319-.277l-.137.48c.137-.48.136-.48.135-.48l-.002-.001l-.004-.002l-.009-.002l-.075-.015a1 1 0 0 0-.158-.013a2.2 2.2 0 0 0-.51.053c-.391.084-.93.283-1.636.716"/>
      </svg>
    ),
    title: 'GitHub',
  },
  {
    id: ViewId.Discord,
    section: 'bottom',
    icon: (
       <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.1.1 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.1 16.1 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02M8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12m6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12"/>
      </svg>
    ),
    title: 'Discord',
  },
  {
    id: ViewId.X,
    section: 'bottom',
    icon: (
       <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="m17.687 3.063l-4.996 5.711l-4.32-5.711H2.112l7.477 9.776l-7.086 8.099h3.034l5.469-6.25l4.78 6.25h6.102l-7.794-10.304l6.625-7.571zm-1.064 16.06L5.654 4.782h1.803l10.846 14.34z"/>
      </svg>
    ),
    title: 'X / Twitter',
  },
  {
    id: ViewId.Email,
    section: 'bottom',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-7 h-7">
        <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"/>
      </svg>
    ),
    title: 'Email',
  },
];

export const EXTERNAL_LINKS: Partial<Record<ViewId, { title: string; url: string }>> = {
  [ViewId.GitHub]: { title: 'GitHub', url: 'https://github.com/hunydev' },
  [ViewId.Discord]: { title: 'Discord', url: 'https://discord.gg/2NWa39bU' },
  [ViewId.X]: { title: 'X / Twitter', url: 'https://x.com/janghun2722' },
  [ViewId.Email]: { title: 'Email', url: 'mailto:jang@huny.dev' },
};