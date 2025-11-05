export interface ColorItem {
  name: string;
  value: string;
  description: string;
  usage: string;
}

export interface TypographyItem {
  name: string;
  className: string;
  example: string;
}

export interface ComponentPattern {
  name: string;
  category: string;
  code: string;
  preview?: string;
}

export const COLORS = {
  backgrounds: [
    { name: 'Primary', value: '#1e1e1e', description: '메인 배경', usage: 'bg-[#1e1e1e] / bg-gray-900' },
    { name: 'Secondary', value: '#252526', description: '사이드바, 카드', usage: 'bg-[#252526] / bg-gray-800' },
    { name: 'Tertiary', value: '#2a2d2e', description: '카드 내부', usage: 'bg-[#2a2d2e] / bg-gray-800' },
    { name: 'Code Block', value: '#1b1b1b', description: '코드 블록', usage: 'bg-[#1b1b1b]' },
  ],
  text: [
    { name: 'Primary', value: '#ffffff', description: '제목, 강조', usage: 'text-white' },
    { name: 'Secondary', value: '#cccccc', description: '본문', usage: 'text-gray-300' },
    { name: 'Muted', value: '#6a737d', description: '보조 텍스트', usage: 'text-gray-500' },
    { name: 'Disabled', value: '#464647', description: '비활성화', usage: 'text-gray-600' },
  ],
  accents: [
    { name: 'Blue', value: '#007acc', description: '링크, 주요 액션', usage: 'text-blue-500 / bg-blue-500' },
    { name: 'Green', value: '#4ec9b0', description: '성공, 활성', usage: 'text-emerald-400 / bg-emerald-500' },
    { name: 'Yellow', value: '#dcdcaa', description: '경고', usage: 'text-yellow-300 / bg-yellow-500' },
    { name: 'Red', value: '#f48771', description: '에러, 삭제', usage: 'text-red-400 / bg-red-500' },
    { name: 'Purple', value: '#a78bfa', description: '특별 강조', usage: 'text-purple-400 / bg-purple-500' },
  ],
  borders: [
    { name: 'Default', value: 'rgba(255, 255, 255, 0.1)', description: '기본 테두리', usage: 'border-white/10' },
    { name: 'Hover', value: 'rgba(255, 255, 255, 0.2)', description: '호버 상태', usage: 'border-white/20' },
    { name: 'Focus', value: '#007acc', description: '포커스 상태', usage: 'border-blue-500' },
  ],
};

export const TYPOGRAPHY: TypographyItem[] = [
  { name: 'H1 Main', className: 'text-3xl md:text-4xl font-bold text-white', example: 'Main Heading' },
  { name: 'H2 Section', className: 'text-2xl md:text-3xl font-semibold text-white', example: 'Section Heading' },
  { name: 'H3 Subsection', className: 'text-xl md:text-2xl font-semibold text-white', example: 'Subsection Heading' },
  { name: 'H4 Card Title', className: 'text-lg font-medium text-gray-200', example: 'Card Title' },
  { name: 'Body Large', className: 'text-base md:text-lg text-gray-300', example: 'Large body text for emphasis' },
  { name: 'Body Default', className: 'text-sm md:text-base text-gray-400', example: 'Default body text for content' },
  { name: 'Body Small', className: 'text-xs md:text-sm text-gray-500', example: 'Small text for captions' },
  { name: 'Code Inline', className: 'font-mono text-sm bg-black/30 px-2 py-1 rounded text-emerald-400', example: 'const value = 123;' },
  { name: 'Label', className: 'text-xs font-semibold uppercase tracking-wide text-gray-400', example: 'Field Label' },
];

export const COMPONENT_PATTERNS: ComponentPattern[] = [
  {
    name: 'Primary Button',
    category: 'Buttons',
    code: '<button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">\n  Button\n</button>',
  },
  {
    name: 'Ghost Button',
    category: 'Buttons',
    code: '<button className="px-4 py-2 border border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white rounded transition-all">\n  Button\n</button>',
  },
  {
    name: 'Icon Button',
    category: 'Buttons',
    code: '<button className="p-2 hover:bg-white/10 rounded transition-colors">\n  <Icon className="w-5 h-5" />\n</button>',
  },
  {
    name: 'Basic Card',
    category: 'Cards',
    code: '<div className="bg-[#2a2d2e] p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all">\n  Card Content\n</div>',
  },
  {
    name: 'Interactive Card',
    category: 'Cards',
    code: '<div className="group bg-gradient-to-br from-[#2a2d2e] to-[#1f2223] p-6 rounded-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">\n  Card Content\n</div>',
  },
  {
    name: 'Text Input',
    category: 'Forms',
    code: '<input\n  type="text"\n  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded text-white placeholder-gray-500 outline-none transition-all"\n  placeholder="Enter text..."\n/>',
  },
  {
    name: 'Chip/Tag',
    category: 'Elements',
    code: '<span className="bg-gray-700 text-gray-300 text-xs font-mono px-2 py-1 rounded">\n  Tag\n</span>',
  },
  {
    name: 'Badge',
    category: 'Elements',
    code: '<span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-500/30">\n  New\n</span>',
  },
  {
    name: 'Progress Bar',
    category: 'Elements',
    code: '<div className="h-2 bg-gray-800 rounded-full overflow-hidden">\n  <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: "60%" }} />\n</div>',
  },
  {
    name: 'Divider',
    category: 'Layout',
    code: '<hr className="border-gray-700 my-4" />',
  },
];

export const SPACING = [
  { name: 'xs', value: '0.25rem', class: 'gap-1 / p-1 / m-1' },
  { name: 'sm', value: '0.5rem', class: 'gap-2 / p-2 / m-2' },
  { name: 'md', value: '1rem', class: 'gap-4 / p-4 / m-4' },
  { name: 'lg', value: '1.5rem', class: 'gap-6 / p-6 / m-6' },
  { name: 'xl', value: '2rem', class: 'gap-8 / p-8 / m-8' },
  { name: '2xl', value: '3rem', class: 'gap-12 / p-12 / m-12' },
];

export const SHADOWS = [
  { name: 'Subtle', class: 'shadow-sm', usage: '앱 카드, 버튼 등 미묘한 깊이' },
  { name: 'Card', class: 'shadow-md', usage: '포스트잇, 기본 카드' },
  { name: 'Modal', class: 'shadow-xl', usage: '모달, 다이얼로그' },
  { name: 'Emphasis', class: 'shadow-2xl', usage: '최상위 레이어' },
  { name: 'Hover Effect', class: 'hover:shadow-2xl hover:shadow-blue-500/10', usage: '호버 시 강조 (프로젝트 카드)' },
];

export const ANIMATIONS = [
  { name: 'Fade In', code: 'transition-all duration-500\nopacity-0 → opacity-100' },
  { name: 'Slide Up', code: 'transition-all duration-500\ntranslate-y-2 → translate-y-0' },
  { name: 'Hover Lift', code: 'hover:-translate-y-1\ntransition-transform duration-300' },
  { name: 'Scale', code: 'hover:scale-105\ntransition-transform duration-300' },
];

export const ICON_SYSTEM = {
  library: 'Tabler Icons',
  url: 'https://tabler.io/icons',
  license: 'MIT',
  count: '4900+',
  strokeWidth: '2px',
  description: '깔끔하고 일관된 디자인의 오픈소스 아이콘 라이브러리',
};
