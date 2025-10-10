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
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M15 3v4a1 1 0 0 0 1 1h4" />
        <path d="M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2z" />
        <path d="M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2" />
      </>
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" },
  },
  activitySearch: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
        <path d="M21 21l-6 -6" />
      </>
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'none', stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" },
  },
  activityDocs: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
        <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
        <path d="M3 6l0 13" />
        <path d="M12 6l0 13" />
        <path d="M21 6l0 13" />
      </>
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" },
  },
  activityAppsPrimary: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
        <path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
        <path d="M14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
        <path d="M14 7l6 0" />
        <path d="M17 4l0 6" />
      </>
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" },
  },
  activityMonitor: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M3 4m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z" />
        <path d="M7 20h10" />
        <path d="M9 16v4" />
        <path d="M15 16v4" />
        <path d="M9 12v-4" />
        <path d="M12 12v-1" />
        <path d="M15 12v-2" />
        <path d="M12 12v-1" />
      </>
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" },
  },
  activityPlayground: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M6.1 15h11.8" />
        <path d="M14 3v7.342a6 6 0 0 1 1.318 10.658h-6.635a6 6 0 0 1 1.317 -10.66v-7.34h4z" />
        <path d="M9 3h6" />
      </>
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" },
  },
  activityBookmark: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z" />
      </>
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" },
  },
  activityNotes: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M13 20l7 -7" />
        <path d="M13 20v-6a1 1 0 0 1 1 -1h6v-7a2 2 0 0 0 -2 -2h-12a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7" />
      </>
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill:"none", stroke:"currentColor", strokeWidth:"2", strokeLinecap:"round", strokeLinejoin:"round" },
  },
  activityBlog: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19 3a3 3 0 0 1 2.995 2.824l.005 .176v12a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-12a3 3 0 0 1 2.824 -2.995l.176 -.005h14zm-2 12h-10l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h10l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm0 -4h-10l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h10l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm0 -4h-10l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h10l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" />
      </>
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'currentColor' },
  },
  activityAppsSecondary: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M19 4a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3 -3v-10a3 3 0 0 1 3 -3zm-12.99 3l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm3 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z" />
      </>
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'currentColor' },
  },
  activitySites: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M2 16.667a2.667 2.667 0 0 1 2.667 -2.667h2.666a2.667 2.667 0 0 1 2.667 2.667v2.666a2.667 2.667 0 0 1 -2.667 2.667h-2.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
        <path d="M14 16.667a2.667 2.667 0 0 1 2.667 -2.667h2.666a2.667 2.667 0 0 1 2.667 2.667v2.666a2.667 2.667 0 0 1 -2.667 2.667h-2.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
        <path d="M8 4.667a2.667 2.667 0 0 1 2.667 -2.667h2.666a2.667 2.667 0 0 1 2.667 2.667v2.666a2.667 2.667 0 0 1 -2.667 2.667h-2.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
        <path d="M12 8a1 1 0 0 0 -1 1v2h-3c-1.645 0 -3 1.355 -3 3v1a1 1 0 0 0 1 1a1 1 0 0 0 1 -1v-1c0 -.564 .436 -1 1 -1h8c.564 0 1 .436 1 1v1a1 1 0 0 0 1 1a1 1 0 0 0 1 -1v-1c0 -1.645 -1.355 -3 -3 -3h-3v-2a1 1 0 0 0 -1 -1z" />
      </>
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'currentColor' },
  },
  activityGitHub: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M5.315 2.1c.791 -.113 1.9 .145 3.333 .966l.272 .161l.16 .1l.397 -.083a13.3 13.3 0 0 1 4.59 -.08l.456 .08l.396 .083l.161 -.1c1.385 -.84 2.487 -1.17 3.322 -1.148l.164 .008l.147 .017l.076 .014l.05 .011l.144 .047a1 1 0 0 1 .53 .514a5.2 5.2 0 0 1 .397 2.91l-.047 .267l-.046 .196l.123 .163c.574 .795 .93 1.728 1.03 2.707l.023 .295l.007 .272c0 3.855 -1.659 5.883 -4.644 6.68l-.245 .061l-.132 .029l.014 .161l.008 .157l.004 .365l-.002 .213l-.003 3.834a1 1 0 0 1 -.883 .993l-.117 .007h-6a1 1 0 0 1 -.993 -.883l-.007 -.117v-.734c-1.818 .26 -3.03 -.424 -4.11 -1.878l-.535 -.766c-.28 -.396 -.455 -.579 -.589 -.644l-.048 -.019a1 1 0 0 1 .564 -1.918c.642 .188 1.074 .568 1.57 1.239l.538 .769c.76 1.079 1.36 1.459 2.609 1.191l.001 -.678l-.018 -.168a5.03 5.03 0 0 1 -.021 -.824l.017 -.185l.019 -.12l-.108 -.024c-2.976 -.71 -4.703 -2.573 -4.875 -6.139l-.01 -.31l-.004 -.292a5.6 5.6 0 0 1 .908 -3.051l.152 -.222l.122 -.163l-.045 -.196a5.2 5.2 0 0 1 .145 -2.642l.1 -.282l.106 -.253a1 1 0 0 1 .529 -.514l.144 -.047l.154 -.03z" />
      </>
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'currentColor' },
  },
  activityDiscord: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M14.983 3l.123 .006c2.014 .214 3.527 .672 4.966 1.673a1 1 0 0 1 .371 .488c1.876 5.315 2.373 9.987 1.451 12.28c-1.003 2.005 -2.606 3.553 -4.394 3.553c-.732 0 -1.693 -.968 -2.328 -2.045a21.512 21.512 0 0 0 2.103 -.493a1 1 0 1 0 -.55 -1.924c-3.32 .95 -6.13 .95 -9.45 0a1 1 0 0 0 -.55 1.924c.717 .204 1.416 .37 2.103 .494c-.635 1.075 -1.596 2.044 -2.328 2.044c-1.788 0 -3.391 -1.548 -4.428 -3.629c-.888 -2.217 -.39 -6.89 1.485 -12.204a1 1 0 0 1 .371 -.488c1.439 -1.001 2.952 -1.459 4.966 -1.673a1 1 0 0 1 .935 .435l.063 .107l.651 1.285l.137 -.016a12.97 12.97 0 0 1 2.643 0l.134 .016l.65 -1.284a1 1 0 0 1 .754 -.54l.122 -.009zm-5.983 7a2 2 0 0 0 -1.977 1.697l-.018 .154l-.005 .149l.005 .15a2 2 0 1 0 1.995 -2.15zm6 0a2 2 0 0 0 -1.977 1.697l-.018 .154l-.005 .149l.005 .15a2 2 0 1 0 1.995 -2.15z" />
      </>
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'currentColor' },
  },
  activityX: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M8.267 3a1 1 0 0 1 .73 .317l.076 .092l4.274 5.828l5.946 -5.944a1 1 0 0 1 1.497 1.32l-.083 .094l-6.163 6.162l6.262 8.54a1 1 0 0 1 -.697 1.585l-.109 .006h-4.267a1 1 0 0 1 -.73 -.317l-.076 -.092l-4.276 -5.829l-5.944 5.945a1 1 0 0 1 -1.497 -1.32l.083 -.094l6.161 -6.163l-6.26 -8.539a1 1 0 0 1 .697 -1.585l.109 -.006h4.267z" />
      </>
    ),
    defaultClassName: 'w-7 h-7',
    attrs: { fill: 'currentColor' },
  },
  activityEmail: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M22 7.535v9.465a3 3 0 0 1 -2.824 2.995l-.176 .005h-14a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-9.465l9.445 6.297l.116 .066a1 1 0 0 0 .878 0l.116 -.066l9.445 -6.297z" />
        <path d="M19 4c1.08 0 2.027 .57 2.555 1.427l-9.555 6.37l-9.555 -6.37a2.999 2.999 0 0 1 2.354 -1.42l.201 -.007h14z" />
      </>
    ),
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
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005h5z" />
        <path d="M19 7h-4l-.001 -4.001z" />
      </>
    ),
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
  monitorStatus: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <rect x={3} y={4} width={18} height={14} rx={2} />
        <path d="M4 15.5 8.5 11l3 3l4-6L20 15.5" />
        <path d="M10 22h4" />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  monitorLatency: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <path d="M4 5h16v9H4z" />
        <path d="M4 12l4-3l4 4l3-5l5 6" />
        <path d="M12 19v3" />
        <path d="M9 22h6" />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  monitorNews: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <rect x={4} y={5} width={16} height={14} rx={2} />
        <path d="M8 9h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
        <circle cx={16.5} cy={9} r={2.5} />
        <path d="M5 5V3" />
        <path d="M19 5V3" />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  monitorNewsletter: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        <path d="M6 7l6 4l6-4" />
        <path d="M6 15h4" />
        <path d="M6 11h4" />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  monitorUsage: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <path d="M4 19h16" />
        <rect x={5} y={5} width={4} height={10} rx={1} />
        <rect x={10} y={8} width={4} height={7} rx={1} />
        <rect x={15} y={11} width={4} height={4} rx={1} />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  monitorBilling: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <circle cx={12} cy={12} r={8} />
        <path d="M12 7v10" />
        <path d="M9 9c.5-.667 1.5-1 3-1s2.5.333 3 1" />
        <path d="M9 15c.5.667 1.5 1 3 1s2.5-.333 3-1" />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  monitorSecurity: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <path d="M12 2l7 3v6c0 5-3.5 9-7 11c-3.5-2-7-6-7-11V5z" />
        <path d="M9.5 11.5l2 2l3-3" />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  monitorAutomation: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <circle cx={12} cy={12} r={3} />
        <path d="M5.6 5.6l2.1 2.1" />
        <path d="M16.3 16.3l2.1 2.1" />
        <path d="M4 12h3" />
        <path d="M17 12h3" />
        <path d="M5.6 18.4l2.1-2.1" />
        <path d="M16.3 7.7l2.1-2.1" />
        <path d="M12 4V1.5" />
        <path d="M12 22.5V20" />
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
  nonNativeKoreanTts: {
    viewBox: '0 0 16 16',
    nodes: (
      <path fill="currentColor" d="M10.044 1.498a.75.75 0 0 1 .958-.454c.214.09.001 0 .001 0h.001l.003.001l.005.003l.015.005a2 2 0 0 1 .19.08c.118.056.28.138.47.253c.379.23.876.596 1.37 1.143C14.057 3.636 15 5.44 15 8.249a.75.75 0 0 1-1.5 0c0-2.44-.807-3.885-1.556-4.715a4.7 4.7 0 0 0-1.036-.865a3 3 0 0 0-.401-.209l-.014-.005a.75.75 0 0 1-.45-.957M7.198 3.475a.75.75 0 0 0-1.395 0l-3.75 9.5a.75.75 0 0 0 1.395.55l.898-2.275h4.308l.898 2.275a.75.75 0 1 0 1.396-.55zm.864 6.275H4.938L6.5 5.793zm2.668-6.076a.75.75 0 0 0-.962 1.15l.006.006l.034.03q.049.045.139.136c.12.123.28.304.44.53c.327.463.613 1.063.613 1.724a.75.75 0 0 0 1.5 0c0-1.088-.464-1.989-.887-2.588a6 6 0 0 0-.853-.962l-.02-.017l-.006-.005l-.002-.002zm-.962 1.15l.001.002Z"/>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  textToEmoji: {
    viewBox: '0 0 24 24',
    nodes: (
      <path fill="currentColor" d="M14.74 5.457a2.84 2.84 0 0 1 1.8 1.803l.448 1.377A.544.544 0 0 0 18 8.671l.001-.003l.012-.021l.049-.151l-.001-.005l.4-1.23c.128-.385.336-.737.611-1.033l.013-.007a2.9 2.9 0 0 1 .676-.53l-.004-.005q.24-.135.502-.222l1.378-.448a.544.544 0 0 0 0-1.025l-.028-.007l-1.378-.448a2.84 2.84 0 0 1-1.798-1.796L17.987.363a.544.544 0 0 0-1.027 0l-.448 1.377l-.011.034a2.84 2.84 0 0 1-1.76 1.76l-1.377.448a.543.543 0 0 0 0 1.027zm9.043 4.756l-.766-.248a1.58 1.58 0 0 1-.998-.999l-.25-.764a.302.302 0 0 0-.57 0l-.248.764a1.58 1.58 0 0 1-.984.999l-.096.03h-.004l-.667.217a.3.3 0 0 0-.202.286a.3.3 0 0 0 .204.285l.763.248a1.58 1.58 0 0 1 .83.643q.106.166.17.357l.249.765a.3.3 0 0 0 .111.149a.302.302 0 0 0 .46-.147l.249-.764a1.58 1.58 0 0 1 .999-.999l.765-.248a.302.302 0 0 0 0-.57zM12 22.001c4.85 0 8.895-3.453 9.808-8.036a1.3 1.3 0 0 1-1.545-.856l-.248-.762a.57.57 0 0 0-.358-.363l-.79-.257a1.3 1.3 0 0 1-.692-1.881a1.546 1.546 0 0 1-2.14-.9l-.447-1.373a1.8 1.8 0 0 0-.443-.721a1.84 1.84 0 0 0-.714-.444l-1.4-.455a1.544 1.544 0 0 1 .023-2.92l1.36-.442q.21-.073.397-.192a10 10 0 0 0-2.811-.4c-5.524-.001-10.002 4.477-10.002 10c0 5.524 4.478 10.002 10.002 10.002m-4.592-7.343a.75.75 0 0 1 1.053.125A4.5 4.5 0 0 0 12 16.5a4.49 4.49 0 0 0 3.534-1.714a.75.75 0 1 1 1.178.93A5.99 5.99 0 0 1 12 18a5.99 5.99 0 0 1-4.717-2.29a.75.75 0 0 1 .125-1.053M7.751 10a1.25 1.25 0 1 1 2.498 0a1.25 1.25 0 0 1-2.498 0m6 0a1.25 1.25 0 1 1 2.498 0a1.25 1.25 0 0 1-2.498 0"/>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  sceneToScript: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <rect x={3} y={3} width={18} height={18} rx={2} />
        <path d="M7 8h7" />
        <path d="M7 12h4" />
        <path d="M7 16h5" />
        <path d="M16 10c1.105 0 2 .672 2 1.5S17.105 13 16 13m0 0v3m0-3l1.5-1.5" />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
  },
  imageToSpeech: {
    viewBox: '0 0 24 24',
    nodes: (
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <rect x={3} y={3} width={10} height={10} rx={2} />
        <path d="m3 13 3-3l6 3" />
        <circle cx={9} cy={7} r={1.5} />
        <path d="M15 10v6a2 2 0 0 0 2 2h1.5" />
        <path d="M15 14h2.5a2.5 2.5 0 0 0 0-5H15" />
      </g>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
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
