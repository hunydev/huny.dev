import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants/icons';

interface InspirationItem {
  name: string;
  category: string;
  description: string;
  influence: string[];
  link?: string;
  color?: string;
}

const INSPIRATION_ITEMS: InspirationItem[] = [
  {
    name: 'Notion',
    category: 'Productivity Tool',
    description: '직관적이고 유연한 블록 기반 에디터와 데이터베이스 시스템',
    influence: [
      '계층적 사이드바 네비게이션',
      '모듈화된 콘텐츠 블록 구조',
      '다크 모드 컬러 팔레트',
      '미니멀하면서도 기능적인 UI',
    ],
    link: 'https://notion.so',
    color: '#000000',
  },
  {
    name: 'Visual Studio Code',
    category: 'Code Editor',
    description: '개발자를 위한 강력하고 확장 가능한 코드 에디터',
    influence: [
      '액티비티 바와 사이드바 레이아웃',
      '탭 기반 파일 관리',
      '명령 팔레트 (Ctrl+Shift+P)',
      '일관된 아이콘 시스템',
      '커맨드 라인 스타일의 인터페이스',
    ],
    link: 'https://code.visualstudio.com',
    color: '#007ACC',
  },
  {
    name: 'Semantic UI',
    category: 'UI Framework',
    description: '사람이 읽기 쉬운 HTML을 사용하는 개발자 친화적 UI 프레임워크',
    influence: [
      '시맨틱한 클래스명 철학',
      '일관된 컴포넌트 네이밍',
      '직관적인 그리드 시스템',
      '명확한 타이포그래피 계층',
    ],
    link: 'https://semantic-ui.com',
    color: '#35BDB2',
  },
  {
    name: 'Windows UI',
    category: 'Operating System',
    description: 'Windows 10/11의 모던한 디자인 언어 (Fluent Design)',
    influence: [
      '카드 기반 레이아웃',
      'Acrylic 반투명 효과',
      '그림자와 깊이감 표현',
      '파일 탐색기의 트리 구조',
      '컨텍스트 메뉴 디자인',
    ],
    link: 'https://www.microsoft.com/design/fluent',
    color: '#0078D4',
  },
];

const InspirationCard: React.FC<{ item: InspirationItem }> = ({ item }) => (
  <div className="rounded-lg border border-white/10 bg-[#202020] p-5 hover:border-white/20 transition-all duration-200 group">
    <div className="flex items-start gap-3 mb-4">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
        style={{ backgroundColor: item.color || '#555' }}
      >
        {item.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-semibold text-white mb-1">{item.name}</h3>
        <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
          {item.category}
        </span>
      </div>
    </div>

    <p className="text-sm text-gray-300 mb-4 leading-relaxed">
      {item.description}
    </p>

    <div className="space-y-3">
      <h4 className="text-xs uppercase tracking-wider text-gray-500 font-medium flex items-center gap-2">
      <svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className="w-3.5 h-3.5">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
        <path d="M4 14m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
      </svg>
        영향받은 요소
      </h4>
      <ul className="space-y-2">
        {item.influence.map((inf, idx) => (
          <li key={idx} className="text-sm text-gray-400 flex items-start gap-2 leading-relaxed">
            <span className="text-gray-600 shrink-0 mt-0.5">▪</span>
            <span>{inf}</span>
          </li>
        ))}
      </ul>
    </div>

    {item.link && (
      <div className="pt-4 mt-4 border-t border-white/5">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors group-hover:gap-2"
        >
          <span>방문하기</span>
          <Icon name="link" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"/>
        </a>
      </div>
    )}
  </div>
);

const InspirationGalleryPage: React.FC<PageProps> = () => {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] p-5 md:p-7">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold text-white">Inspiration Gallery</h1>
          <p className="mt-1 text-sm md:text-base text-gray-400">
            내 작업에 영향을 준 제품들과 디자인 영감의 원천
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="mt-6 grid gap-5 grid-cols-1 md:grid-cols-2">
        {INSPIRATION_ITEMS.map((item, idx) => (
          <InspirationCard key={idx} item={item} />
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-6 rounded-lg border border-white/10 bg-[#202020]/50 p-4">
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          <span className="text-gray-400">✨</span> 좋은 디자인은 영감에서 시작됩니다. 
          이 페이지는 제가 UI/UX를 설계할 때 참고하고 영감을 받은 제품들의 컬렉션입니다.
        </p>
      </div>
    </div>
  );
};

export default InspirationGalleryPage;
