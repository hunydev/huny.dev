import React from 'react';

export type IconDefinition = {
  viewBox: string;
  nodes: React.ReactNode;
  defaultClassName?: string;
  attrs?: React.SVGAttributes<SVGSVGElement>;
};

const ICON_DEFS = {
  activityExplorer: {
    viewBox: '0 0 24 24',
    nodes: <path d="M17.5 0h-9L7 1.5V6H2.5L1 7.5v15.07L2.5 24h12.07L16 22.57V18h4.7l1.3-1.43V4.5L17.5 0zm0 2.12l2.38 2.38H17.5V2.12zm-3 20.38h-12v-15H7v9.07L8.5 18h6v4.5zm6-6h-12v-15H16V6h4.5v10.5z" />,
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'currentColor' },
  },
  activitySearch: {
    viewBox: '0 0 24 24',
    nodes: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 },
  },
  activityDocs: {
    viewBox: '0 0 24 24',
    nodes: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
      />
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 },
  },
  activityAppsPrimary: {
    viewBox: '0 0 24 24',
    nodes: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25zm0 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18zm9.75-9.75a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25zm0 9.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18z"
      />
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 },
  },
  activityMedia: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <path d="M21 7.6v12.8a.6.6 0 0 1-.6.6H7.6a.6.6 0 0 1-.6-.6V7.6a.6.6 0 0 1 .6-.6h12.8a.6.6 0 0 1 .6.6" />
        <path d="M18 4H4.6a.6.6 0 0 0-.6.6V18m3-1.2l5.444-1.8L21 18m-4.5-5a1.5 1.5 0 1 1 0-3a1.5 1.5 0 0 1 0 3" />
      </g>
    ),
    defaultClassName: 'w-7 h-7',
  },
  activityPlayground: {
    viewBox: '0 0 512 512',
    nodes: (
      <>
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
          d="M448 341.37V170.61A32 32 0 0 0 432.11 143l-152-88.46a47.94 47.94 0 0 0-48.24 0L79.89 143A32 32 0 0 0 64 170.61v170.76A32 32 0 0 0 79.89 369l152 88.46a48 48 0 0 0 48.24 0l152-88.46A32 32 0 0 0 448 341.37"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={32}
          d="m69 153.99 187 110 187-110m-187 310v-200"
        />
        <ellipse cx={256} cy={152} fill="currentColor" rx={24} ry={16} />
        <ellipse cx={208} cy={296} fill="currentColor" rx={16} ry={24} />
        <ellipse cx={112} cy={328} fill="currentColor" rx={16} ry={24} />
        <ellipse cx={304} cy={296} fill="currentColor" rx={16} ry={24} />
        <ellipse cx={400} cy={240} fill="currentColor" rx={16} ry={24} />
        <ellipse cx={304} cy={384} fill="currentColor" rx={16} ry={24} />
        <ellipse cx={400} cy={328} fill="currentColor" rx={16} ry={24} />
      </>
    ),
    defaultClassName: 'w-7 h-7',
  },
  activityBookmark: {
    viewBox: '0 0 24 24',
    nodes: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 17.98V9.709c0-3.634 0-5.45 1.172-6.58S8.229 2 12 2s5.657 0 6.828 1.129C20 4.257 20 6.074 20 9.708v8.273c0 2.306 0 3.459-.773 3.871c-1.497.8-4.304-1.867-5.637-2.67c-.773-.465-1.16-.698-1.59-.698s-.817.233-1.59.698c-1.333.803-4.14 3.47-5.637 2.67C4 21.44 4 20.287 4 17.981"
      />
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 },
  },
  activityNotes: {
    viewBox: '0 0 48 48',
    nodes: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 9.5v22.9h10.1v10.1h22.9c2.2 0 4-1.8 4-4v-29c0-2.2-1.8-4-4-4h-29c-2.2 0-4 1.8-4 4m0 22.9 10.1 10.1"
      />
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'none', stroke: 'currentColor', strokeWidth: 3 },
  },
  activityBlog: {
    viewBox: '0 0 24 24',
    nodes: <path d="M3 3v18h18V3zm15 15H6v-1h12zm0-2H6v-1h12zm0-4H6V6h12z" />,
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'currentColor' },
  },
  activityAppsSecondary: {
    viewBox: '0 0 24 24',
    nodes: <path d="M11 20H3q-.425 0-.712-.288T2 19t.288-.712T3 18h8q.425 0 .713.288T12 19t-.288.713T11 20m-6-3q-.825 0-1.412-.587T3 15V6q0-.825.588-1.412T5 4h14q.825 0 1.413.588T21 6h-5.5q-1.45 0-2.475 1.025T12 9.5V16q0 .425-.288.713T11 17zm10.5 3q-.625 0-1.062-.437T14 18.5v-9q0-.625.438-1.062T15.5 8h5q.625 0 1.063.438T22 9.5v9q0 .625-.437 1.063T20.5 20zm2.5-7.5q.325 0 .538-.225t.212-.525q0-.325-.213-.537T18 11q-.3 0-.525.213t-.225.537q0 .3.225.525T18 12.5" />,
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'currentColor' },
  },
  activitySites: {
    viewBox: '0 0 48 48',
    nodes: (
      <g fill="none" stroke="currentColor" strokeWidth={4}>
        <circle cx="22" cy="40" r="4" fill="currentColor" />
        <circle cx="26" cy="8" r="4" fill="currentColor" />
        <circle cx="36" cy="24" r="4" fill="currentColor" />
        <circle cx="12" cy="24" r="4" fill="currentColor" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M32 24H16m7-13-8 10" />
        <path d="m33 27-8.001 10" />
      </g>
    ),
    defaultClassName: 'w-7 h-7',
  },
  activityGitHub: {
    viewBox: '0 0 15 15',
    nodes: <path d="M9.358 2.145a8.2 8.2 0 0 0-3.716 0c-.706-.433-1.245-.632-1.637-.716a2.2 2.2 0 0 0-.51-.053a1.3 1.3 0 0 0-.232.028l-.01.002-.004.002h-.003l.137.481-.137-.48a.5.5 0 0 0-.32.276a3.12 3.12 0 0 0-.159 2.101A3.35 3.35 0 0 0 2 5.93c0 1.553.458 2.597 1.239 3.268c.547.47 1.211.72 1.877.863a2.3 2.3 0 0 0-.116.958v.598c-.407.085-.689.058-.89-.008c-.251-.083-.444-.25-.629-.49a5 5 0 0 1-.27-.402l-.057-.093a9 9 0 0 0-.224-.354c-.19-.281-.472-.633-.928-.753l-.484-.127-.254.968.484.127c.08.02.184.095.355.346a7 7 0 0 1 .19.302l.068.11c.094.152.202.32.327.484c.253.33.598.663 1.11.832c.35.116.748.144 1.202.074V14.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-3.562c0-.316-.014-.605-.103-.874c.663-.14 1.322-.39 1.866-.86c.78-.676 1.237-1.73 1.237-3.292v-.001a3.35 3.35 0 0 0-.768-2.125a3.12 3.12 0 0 0-.159-2.1a.5.5 0 0 0-.319-.277l-.137.48.135-.48.002-.001-.004-.002-.009-.002-.075-.015a1 1 0 0 0-.158-.013a2.2 2.2 0 0 0-.51.053c-.391.084-.93.283-1.636.716" />,
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'currentColor' },
  },
  activityDiscord: {
    viewBox: '0 0 24 24',
    nodes: <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.1.1 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.1 16.1 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02M8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12m6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12" />,
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'currentColor' },
  },
  activityX: {
    viewBox: '0 0 24 24',
    nodes: <path d="m17.687 3.063-4.996 5.711-4.32-5.711H2.112l7.477 9.776-7.086 8.099h3.034l5.469-6.25 4.78 6.25h6.102l-7.794-10.304 6.625-7.571zm-1.064 16.06L5.654 4.782h1.803l10.846 14.34z" />,
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'currentColor' },
  },
  activityEmail: {
    viewBox: '0 0 24 24',
    nodes: <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5-8-5V6l8 5 8-5z" />,
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'currentColor' },
  },
  addSquare: {
    viewBox: '0 0 24 24',
    nodes: <path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" />,
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  bookmarkRibbon: {
    viewBox: '0 0 24 24',
    nodes: <path d="M6 3.5C6 2.67 6.67 2 7.5 2h9A1.5 1.5 0 0 1 18 3.5v16.77c0 .57-.63.92-1.11.6l-4.78-3.2a1.5 1.5 0 0 0-1.64 0l-4.78 3.2c-.48.32-1.11-.03-1.11-.6z" />,
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  caretDown: {
    viewBox: '0 0 24 24',
    nodes: <path d="M7 10l5 5l5-5z" />,
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  checkBadge: {
    viewBox: '0 0 24 24',
    nodes: <path d="m9 20.42-6.21-6.21 2.83-2.83L9 14.77l9.88-9.89 2.83 2.83z" />,
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  clipboard: {
    viewBox: '0 0 24 24',
    nodes: <path d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z" />,
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  close: {
    viewBox: '0 0 24 24',
    nodes: <path d="M20 6.91 17.09 4 12 9.09 6.91 4 4 6.91 9.09 12 4 17.09 6.91 20 12 14.91 17.09 20 20 17.09 14.91 12z" />,
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  documentText: {
    viewBox: '0 0 24 24',
    nodes: <path d="M3 3v18h18V3zm15 15H6v-1h12zm0-2H6v-1h12zm0-4H6V6h12z" />,
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  edit: {
    viewBox: '0 0 24 24',
    nodes: <path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" />,
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  externalLink: {
    viewBox: '0 0 16 16',
    nodes: (
      <>
        <path d="M10.5 2h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V3.707l-6.146 6.147a.5.5 0 0 1-.708-.708L12.293 3H10.5a.5.5 0 0 1 0-1Z" />
        <path d="M13 7.5v6A1.5 1.5 0 0 1 11.5 15h-8A1.5 1.5 0 0 1 2 13.5v-8A1.5 1.5 0 0 1 3.5 4h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-6a.5.5 0 0 1 1 0Z" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  file: {
    viewBox: '0 0 24 24',
    nodes: <path d="M13 9V3.5L18.5 9M6 2c-1.11 0-2 .89-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />,
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'currentColor' },
  },
  favicon: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
        <path d="M2 8a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3zm4 2v4" />
        <path d="M11 10a2 2 0 1 0 0 4m3-2a2 2 0 1 0 4 0a2 2 0 1 0-4 0" />
      </g>
    ),
    defaultClassName: 'w-4 h-4',
  },
  avatar: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="currentColor">
        <path d="M12 2a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11" />
        <path d="M4 20.5C4 17.462 7.582 15 12 15s8 2.462 8 5.5V22H4z" opacity=".6" />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  globe: {
    viewBox: '0 0 24 24',
    nodes: <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10s10-4.486 10-10S17.514 2 12 2m7.931 9h-2.764a14.7 14.7 0 0 0-1.792-6.243A8.01 8.01 0 0 1 19.931 11M12.53 4.027c1.035 1.364 2.427 3.78 2.627 6.973H9.03c.139-2.596.994-5.028 2.451-6.974c.172-.01.344-.026.519-.026c.179 0 .354.016.53.027m-3.842.7C7.704 6.618 7.136 8.762 7.03 11H4.069a8.01 8.01 0 0 1 4.619-6.273M4.069 13h2.974c.136 2.379.665 4.478 1.556 6.23A8.01 8.01 0 0 1 4.069 13m7.381 6.973C10.049 18.275 9.222 15.896 9.041 13h6.113c-.208 2.773-1.117 5.196-2.603 6.972c-.182.012-.364.028-.551.028c-.186 0-.367-.016-.55-.027m4.011-.772c.955-1.794 1.538-3.901 1.691-6.201h2.778a8 8 0 0 1-4.469 6.201" />,
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  image: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <path d="M21 3.6v16.8a.6.6 0 0 1-.6.6H3.6a.6.6 0 0 1-.6-.6V3.6a.6.6 0 0 1 .6-.6h16.8a.6.6 0 0 1 .6.6" />
        <path d="m3 16l7-3l11 5m-5-8a2 2 0 1 1 0-4a2 2 0 0 1 0 4" />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  video: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <path d="M21 3.6v16.8a.6.6 0 0 1-.6.6H3.6a.6.6 0 0 1-.6-.6V3.6a.6.6 0 0 1 .6-.6h16.8a.6.6 0 0 1 .6.6" />
        <path d="M9.898 8.513a.6.6 0 0 0-.898.52v5.933a.6.6 0 0 0 .898.521l5.19-2.966a.6.6 0 0 0 0-1.042z" />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  appsGrid: {
    viewBox: '0 0 24 24',
    nodes: <path d="M3 5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm9 0a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2zM3 14a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm9 0a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2z" />,
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'currentColor' },
  },
  todoGenerator: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
        <path d="M13 5h8m-8 7h8m-8 7h8M3 17l2 2l4-4" />
        <rect width={6} height={6} x={3} y={4} rx={1} />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  textToPhoneme: {
    viewBox: '0 0 24 24',
    nodes: <path d="M5.4 12.575q.65 0 1.113-.287t.462-.863t-.462-.875t-1.113-.3t-1.112.3t-.463.875t.463.863t1.112.287M1.875 8.8V7.7h2.85V6.3h1.3v1.4H8.9v1.1zM5.4 13.675q-1.175 0-2.013-.587t-.837-1.663q0-1.1.838-1.675T5.4 9.175q1.2 0 2.038.575t.837 1.675t-.837 1.675t-2.038.575M3.575 17.7v-3.5H4.9v2.4h6.6v1.1zM9.7 15.075V6.3h1.275v3.75H12.7v1.1H11v3.925zm7.85.575q.7 0 1.363-.325t1.212-.925v-2.65q-.575.075-1.062.175t-.913.225q-1.125.35-1.687.875T15.9 14.25q0 .65.45 1.025t1.2.375m-.575 1.7q-1.425 0-2.25-.812t-.825-2.213q0-1.3.825-2.125t2.65-1.325q.575-.15 1.263-.275t1.487-.225q-.05-1.175-.55-1.713t-1.55-.537q-.65 0-1.287.238T15.1 9.2l-.8-1.4q.825-.625 1.938-1.012T18.5 6.4q1.775 0 2.7 1.1t.925 3.2v6.425H20.45L20.3 16q-.7.625-1.537.988t-1.788.362" />,
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'currentColor' },
  },
  webWorker: {
    viewBox: '0 0 32 32',
    nodes: (
      <>
        <path d="m20.17 19-2.59 2.59L19 23l4-4l-4-4l-1.42 1.41zm-8.34 0l2.59-2.59L13 15l-4 4l4 4l1.42-1.41z" />
        <circle cx={9} cy={8} r={1} />
        <circle cx={6} cy={8} r={1} />
        <path d="M28 4H4c-1.103 0-2 .898-2 2v20c0 1.103.897 2 2 2h24c1.103 0 2-.897 2-2V6c0-1.102-.897-2-2-2m0 2v4H4V6zM4 26V12h24v14z" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'currentColor' },
  },
  textCleaning: {
    viewBox: '0 0 24 24',
    nodes: <path d="m14.1 22l-4.25-4.25l1.4-1.4l2.85 2.85l5.65-5.65l1.4 1.4zM3 16L7.85 3h2.35l4.85 13h-2.3l-1.15-3.3H6.35L5.2 16zm4.05-5.2h3.9l-1.9-5.4h-.1z" />,
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'currentColor' },
  },
  aiBusinessCard: {
    viewBox: '0 0 24 24',
    nodes: <path d="M3 5h18v14H3zm2 2v10h14V7zM6 9h6v2H6zm0 3h8v2H6z" />,
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'currentColor' },
  },
  stickerGenerator: {
    viewBox: '0 0 24 24',
    nodes: <path d="M18.5 2h-13C3.6 2 2 3.6 2 5.5v13C2 20.4 3.6 22 5.5 22H16l6-6V5.5C22 3.6 20.4 2 18.5 2M15 20v-1.5c0-1.9 1.6-3.5 3.5-3.5H20z" />,
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'currentColor' },
  },
  comicRestyler: {
    viewBox: '0 0 24 24',
    nodes: (
      <path fill="currentColor" d="M11 3.925L8.925 6H6v2.925L3.925 11L6 13.075V16h2.925L11 18.075l2.5-2.5l4.2 2.125l-2.15-4.175L18.075 11L16 8.925V6h-2.925zM11 1.1L13.9 4H18v4.1l2.9 2.9l-2.9 2.9l2.875 5.65q.175.325.1.638t-.275.512t-.512.275t-.638-.1L13.9 18L11 20.9L8.1 18H4v-4.1L1.1 11L4 8.1V4h4.1zm0 9.9" />
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  uiClone: {
    viewBox: '0 0 24 24',
    nodes: <path d="M11 22q-.825 0-1.412-.587T9 20v-7q0-.825.588-1.412T11 11h7q.825 0 1.413.588T20 13v7q0 .825-.587 1.413T18 22zM4 15q-.825 0-1.412-.587T2 13V6q0-.825.588-1.412T4 4h7q.825 0 1.413.588T13 6v1H6q-.825 0-1.412.588T4 9z" />,
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'currentColor' },
  },
  coverCrafter: {
    viewBox: '0 0 24 24',
    nodes: (
      <path fill="currentColor" d="m20.713 8.128l-.246.566a.506.506 0 0 1-.934 0l-.246-.566a4.36 4.36 0 0 0-2.22-2.25l-.759-.339a.53.53 0 0 1 0-.963l.717-.319a4.37 4.37 0 0 0 2.251-2.326l.253-.611a.506.506 0 0 1 .942 0l.253.61a4.37 4.37 0 0 0 2.25 2.327l.718.32a.53.53 0 0 1 0 .962l-.76.338a4.36 4.36 0 0 0-2.219 2.251M2.992 3H14v2H4v14L14 9l6 6v-4h2v9.007a1 1 0 0 1-.992.993H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3M20 17.828l-6-6L6.828 19H20zM8 11a2 2 0 1 1 0-4a2 2 0 0 1 0 4" />
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  download: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <path d="M12 4v12" />
        <path d="m7 11l5 5l5-5" />
        <path d="M5 20h14" />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-300',
  },
  splitSpeaker: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path d="M2 5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H9l-4 3v-3H5a3 3 0 0 1-3-3z" />
        <path d="M14 10a3 3 0 0 0 3-3v-.5h2a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-1l-3 2.25V16h-1a3 3 0 0 1-3-3v-1z" opacity={0.65} />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'currentColor' },
  },
  bird: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" fillRule="evenodd">
        <path d="m12.594 23.258-.012.002-.071.035-.02.004-.014-.004-.071-.036q-.016-.004-.024.006l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427q-.004-.016-.016-.018m.264-.113-.014.002-.184.093-.01.01-.003.011.018.43.005.012.008.008.201.092q.019.005.029-.008l.004-.014-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014-.034.614q.001.018.017.024l.015-.002.201-.093.01-.008.003-.011.018-.43-.003-.012-.01-.01z" />
        <path fill="currentColor" d="M15 2a5 5 0 0 1 4.49 2.799l.094.201H21a1 1 0 0 1 .9 1.436l-.068.119-1.552 2.327a1 1 0 0 0-.166.606l.014.128.141.774c.989 5.438-3.108 10.451-8.593 10.606l-.262.004H3a1 1 0 0 1-.9-1.436l.068-.119L9.613 8.277A2.3 2.3 0 0 0 10 7a5 5 0 0 1 5-5m-3.5 9c-.271 0-.663.07-1.036.209-.375.14-.582.295-.654.378l-3.384 5.077c.998-.287 2.065-.603 3.063-.994 1.067-.417 1.978-.892 2.609-1.446.612-.537.902-1.092.902-1.724a1.5 1.5 0 0 0-1.5-1.5M15 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2" />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  multiVoiceReader: {
    viewBox: '0 0 24 24',
    nodes: <path d="M4 22q-.825 0-1.412-.587T2 20V4q0-.825.588-1.412T4 2h8.15l-2 2H4v16h11v-2h2v2q0 .825-.587 1.413T15 22zm2-4v-2h7v2zm0-3v-2h5v2zm9 0-4-4H8V6h3l4-4zm2-3.05v-6.9q.9.525 1.45 1.425T19 8.5t-.55 2.025T17 11.95m0 4.3v-2.1q1.75-.625 2.875-2.162T21 8.5t-1.125-3.488T17 2.85V.75q2.6.675 4.3 2.813T23 8.5t-1.7 4.938T17 16.25" />,
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'currentColor' },
  },
  monitor: {
    viewBox: '0 0 24 24',
    nodes: <path d="M20 3H4c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h7v2H8v2h8v-2h-3v-2h7c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2M4 14V5h16l.002 9z" />,
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  layoutGrid: {
    viewBox: '0 0 24 24',
    nodes: <path d="M3 4h8v7H3zM13 4h8v7h-8zM3 13h8v7H3zM13 13h8v7h-8z" />,
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  layoutList: {
    viewBox: '0 0 24 24',
    nodes: <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />,
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  mobile: {
    viewBox: '0 0 24 24',
    nodes: <path d="M17 2H7c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h10c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2M7 16.999V5h10l.002 11.999z" />,
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  note: {
    viewBox: '0 0 16 16',
    nodes: (
      <>
        <path d="M2.5 2A1.5 1.5 0 0 0 1 3.5v9A1.5 1.5 0 0 0 2.5 14h7.793l3.354-3.354A.5.5 0 0 0 14 10.293V3.5A1.5 1.5 0 0 0 12.5 2h-10Z" />
        <path d="M10.5 13.5V11a1 1 0 0 1 1-1h2.5" opacity={0.6} />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  trash: {
    viewBox: '0 0 24 24',
    nodes: <path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" />,
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  checklist: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
        <path d="M13 5h8m-8 7h8m-8 7h8M3 17l2 2l4-4" />
        <rect width={6} height={6} x={3} y={4} rx={1} />
      </g>
    ),
    defaultClassName: 'w-4 h-4',
  },
  info: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="currentColor">
        <path d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16a8 8 0 0 1 0-16Z" opacity={0.4} />
        <path d="M12 10a1 1 0 0 1 1 1v5.5a1 1 0 1 1-2 0V11a1 1 0 0 1 1-1Zm0-3a1.25 1.25 0 1 1 0 2.5a1.25 1.25 0 0 1 0-2.5Z" />
      </g>
    ),
    defaultClassName: 'w-4 h-4',
  },
} satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICON_DEFS;

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: IconName;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className, ...rest }) => {
  const def = ICON_DEFS[name];
  if (!def) return null;
  const baseClass = typeof def.defaultClassName === 'string' ? def.defaultClassName.trim() : '';
  const extraClass = typeof className === 'string' ? className.trim() : '';
  const mergedClass = [baseClass, extraClass].filter(Boolean).join(' ');
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={def.viewBox}
      className={mergedClass || undefined}
      {...def.attrs}
      {...rest}
    >
      {def.nodes}
    </svg>
  );
};

export { ICON_DEFS };
