import React from 'react';

export type IconDefinition = {
  viewBox: string;
  nodes: React.ReactNode;
  defaultClassName?: string;
  attrs?: React.SVGAttributes<SVGSVGElement>;
  style?: React.CSSProperties;
};

const ICON_DEFS = {
  activityExplorer: { //tabler
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
  activitySearch: { //tabler
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
  activityDocs: { //tabler
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
  activityAppsPrimary: { //tabler
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
  activityMonitor: { //tabler
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
  activityPlayground: { //tabler
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
  activityBookmark: { //tabler
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
  activityNotes: { //tabler
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
  favicon: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M2 5m0 3a3 3 0 0 1 3 -3h14a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3 -3z" />
        <path d="M6 10v4" />
        <path d="M11 10a2 2 0 1 0 0 4" />
        <path d="M16 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  avatar: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
        <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
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
  geoVision: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13s-7-8-7-13a7 7 0 0 1 7-7z" />
        <circle cx={12} cy={9} r={2.5} />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
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
  todoGenerator: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M13 5h8" />
        <path d="M13 9h5" />
        <path d="M13 15h8" />
        <path d="M13 19h5" />
        <path d="M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
        <path d="M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: {fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round'},
  },
  textToPhoneme: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 17v-10l7 10v-10" />
        <path d="M15 17h5" />
        <path d="M17.5 10m-2.5 0a2.5 3 0 1 0 5 0a2.5 3 0 1 0 -5 0" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  webWorker: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M3 15h3v4.5a1.5 1.5 0 0 1 -3 0" /><path d="M9 20.25c0 .414 .336 .75 .75 .75h1.25a1 1 0 0 0 1 -1v-1a1 1 0 0 0 -1 -1h-1a1 1 0 0 1 -1 -1v-1a1 1 0 0 1 1 -1h1.25a.75 .75 0 0 1 .75 .75" /><path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-1" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
    textCleaning: { //tabler
      viewBox: '0 0 24 24',
      nodes: (
        <>
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M5 15v-7.5a3.5 3.5 0 0 1 7 0v7.5" />
          <path d="M5 10h7" />
          <path d="M10 18l3 3l7 -7" />
        </>
      ),
      defaultClassName: 'w-4 h-4 text-gray-400',
      attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    },
    hiddenPrompt: { // custom eye-off
      viewBox: '0 0 24 24',
      nodes: (
        <>
          <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
          <path d="M4.458 12c2.055 -3.467 4.6 -5.5 7.542 -5.5c1.27 0 2.478 .33 3.626 .961" />
          <path d="M19.542 12c-2.055 3.467 -4.6 5.5 -7.542 5.5c-1.58 0 -3.083 -.548 -4.506 -1.641" />
          <path d="M12 9a3 3 0 1 1 0 6a3 3 0 0 1 0 -6z" />
          <path d="M3 3l18 18" />
        </>
      ),
      defaultClassName: 'w-4 h-4 text-gray-400',
      attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    },
  aiBusinessCard: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M3 4m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z" />
        <path d="M9 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M15 8l2 0" />
        <path d="M15 12l2 0" />
        <path d="M7 16l10 0" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  stickerGenerator: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M6 4h12a2 2 0 0 1 2 2v7h-5a2 2 0 0 0 -2 2v5h-7a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2z" />
        <path d="M20 13v.172a2 2 0 0 1 -.586 1.414l-4.828 4.828a2 2 0 0 1 -1.414 .586h-.172" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  comicRestyler: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12.4 3a5.34 5.34 0 0 1 4.906 3.239a5.333 5.333 0 0 1 -1.195 10.6a4.26 4.26 0 0 1 -5.28 1.863l-3.831 2.298v-3.134a2.668 2.668 0 0 1 -1.795 -3.773a4.8 4.8 0 0 1 2.908 -8.933a5.33 5.33 0 0 1 4.287 -2.16" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  uiClone: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
        <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  coverCrafter: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
        <path d="M4 16l16 0" />
        <path d="M4 12l3 -3c.928 -.893 2.072 -.893 3 0l4 4" />
        <path d="M13 12l2 -2c.928 -.893 2.072 -.893 3 0l2 2" />
        <path d="M14 7l.01 0" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  download: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
        <path d="M7 11l5 5l5 -5" />
        <path d="M12 4l0 12" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-300',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  splitSpeaker: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10" />
        <path d="M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  bird: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 20l10 -10m0 -5v5h5m-9 -1v5h5m-9 -1v5h5m-5 -5l4 -4l4 -4" />
        <path d="M19 10c.638 -.636 1 -1.515 1 -2.486a3.515 3.515 0 0 0 -3.517 -3.514c-.97 0 -1.847 .367 -2.483 1m-3 13l4 -4l4 -4" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  multiVoiceReader: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
        <path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
        <path d="M3 12l18 0" />
        <path d="M6 16l0 2" />
        <path d="M10 16l0 6" />
        <path d="M14 16l0 2" />
        <path d="M18 16l0 4" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  nonNativeKoreanTts: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 21v-13a3 3 0 0 1 3 -3h10a3 3 0 0 1 3 3v6a3 3 0 0 1 -3 3h-9l-4 4" />
        <path d="M10 14v-4a2 2 0 1 1 4 0v4" />
        <path d="M14 12h-4" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  textToEmoji: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M20.955 11.104a9 9 0 1 0 -9.895 9.847" />
        <path d="M9 10h.01" />
        <path d="M15 10h.01" />
        <path d="M9.5 15c.658 .672 1.56 1 2.5 1c.126 0 .251 -.006 .376 -.018" />
        <path d="M18.42 15.61a2.1 2.1 0 0 1 2.97 2.97l-3.39 3.42h-3v-3l3.42 -3.39z" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  sceneToScript: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
        <path d="M10 4l4 16" />
        <path d="M12 12l-8 2" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  imageToSpeech: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z" />
        <path d="M9.5 9h.01" />
        <path d="M14.5 9h.01" />
        <path d="M9.5 13a3.5 3.5 0 0 0 5 0" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
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
  note: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M18 3a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3z" />
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
  alert: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 9v4" />
        <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
        <path d="M12 16h.01" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  bookmark: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M14 2a5 5 0 0 1 5 5v14a1 1 0 0 1 -1.555 .832l-5.445 -3.63l-5.444 3.63a1 1 0 0 1 -1.55 -.72l-.006 -.112v-14a5 5 0 0 1 5 -5h4z" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  link: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M17 7l-10 10" />
        <path d="M8 7l9 0l0 9" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  star: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'currentColor' },
  },
  loader: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 3a9 9 0 1 0 9 9" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  aiTierList: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M11 6h9" />
        <path d="M11 12h9" />
        <path d="M11 18h9" />
        <path d="M4 10v-4.5a1.5 1.5 0 0 1 3 0v4.5" />
        <path d="M4 8h3" />
        <path d="M4 20h1.5a1.5 1.5 0 0 0 0 -3h-1.5h1.5a1.5 1.5 0 0 0 0 -3h-1.5v6z" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  add: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 5l0 14" />
        <path d="M5 12l14 0" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  arrowUp: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 5l0 14" />
        <path d="M18 11l-6 -6" />
        <path d="M6 11l6 -6" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  arrowDown: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 5l0 14" />
        <path d="M18 13l-6 6" />
        <path d="M6 13l6 6" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  cronify: { //tabler - calendar-time
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M11.795 21h-6.795a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4" />
        <path d="M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
        <path d="M15 3v4" />
        <path d="M7 3v4" />
        <path d="M3 11h16" />
        <path d="M18 16.496v1.504l1 1" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  textMorph: { //tabler - text-scan2
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
        <path d="M4 16v2a2 2 0 0 0 2 2h2" />
        <path d="M16 4h2a2 2 0 0 1 2 2v2" />
        <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
        <path d="M7 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-2v-6z" />
        <path d="M14 14v-4" />
        <path d="M14 10l2 2l-2 2" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  deobfuscateHangul: { //tabler - lock-open + language
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M5 11m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" />
        <path d="M12 16m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M8 11v-4a4 4 0 0 1 8 0" />
        <path d="M4 5h7" />
        <path d="M7 4c0 4.846 0 7 .5 8" />
        <path d="M10 8.5a4 4 0 0 0 2 -.5" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  dialectTts: { //tabler - volume + map-pin
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M15 8a5 5 0 0 1 0 8" />
        <path d="M17.7 5a9 9 0 0 1 0 14" />
        <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a0.8 .8 0 0 1 1.5 .5v14a0.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
        <path d="M19 9l-2 3h4l-2 3" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  reStyler: { //tabler - palette
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25" />
        <path d="M8.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M12.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        <path d="M16.5 10.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  apps: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
        <path d="M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
        <path d="M14 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
        <path d="M14 7l0 .01" />
        <path d="M17 7l0 .01" />
        <path d="M20 7l0 .01" />
      </>
    ),
    defaultClassName: 'w-4 h-4 text-gray-400',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  check: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M5 12l5 5l10 -10" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  copy: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
        <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  search: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
        <path d="M21 21l-6 -6" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  },
  history: { //tabler
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M12 8l0 4l2 2" />
        <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
      </>
    ),
    defaultClassName: 'w-4 h-4',
    attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
  }
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
