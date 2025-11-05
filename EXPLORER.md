# Explorer 아이템 가이드

> HunyDev Works Explorer 탭의 모든 아이템 정리 및 신규 아이템 추가 가이드

---

## 📋 현재 아이템 목록

| # | 파일명 | 페이지 ID | 설명 |
|---|--------|-----------|------|
| 1 | Welcome | `welcome` | 포트폴리오 메인 랜딩 페이지 |
| 2 | works.md | `works` | 업무 내용 및 기술 스택 |
| 3 | about.json | `about` | 자기소개 및 전문성 |
| 4 | stack-huny.dev | `stack` | 기술 스택 상세 정보 |
| 5 | digital-shelf.json | `digital-shelf` | 구독 서비스 및 구매 내역 |
| 6 | tts-history.md | `domain` | TTS 도메인 경험 히스토리 |
| 7 | mascot.gallery | `mascot` | 마스코트 이미지 갤러리 |
| 8 | project.js | `project` | GitHub 프로젝트 포트폴리오 |
| 9 | extensions.txt | `extensions` | VSCode 확장 프로그램 목록 |
| 10 | gear.json | `gear` | 개발 장비 및 기어 |
| 11 | inspiration.gallery | `inspiration` | 영감을 주는 디자인 갤러리 |
| 12 | youtube-channels.json | `youtube-channels` | 즐겨보는 YouTube 채널 |

---

## 🎯 추천 TODO 아이템

### 개인/커리어
- **resume.pdf** - 이력서 (⭐⭐⭐⭐⭐)
- **timeline.md** - 커리어 타임라인 (⭐⭐⭐⭐)
- **achievements.json** - 성과 및 수상 이력 (⭐⭐⭐)

### 학습/지식
- **reading-list.json** - 읽은/읽을 책 목록 (⭐⭐⭐⭐)
- **blog-posts.md** - 블로그 글 모음 (⭐⭐⭐⭐)
- **til.log** - Today I Learned (⭐⭐⭐)

### 크리에이티브
- **design-system.json** - 개인 디자인 시스템 (⭐⭐⭐)
- **portfolio.gallery** - 작업물 포트폴리오 (⭐⭐⭐⭐)
- **music-playlist.json** - 작업용 음악 (⭐⭐)

### 개발
- **snippets.code** - 자주 쓰는 코드 (⭐⭐⭐⭐)
- **api-collection.json** - API 모음 (⭐⭐⭐)
- **dotfiles.sh** - 개발 환경 설정 (⭐⭐⭐)

### 데이터/분석
- **stats.dashboard** - 개인 통계 대시보드 (⭐⭐⭐⭐)
- **goals.roadmap** - 커리어 로드맵 (⭐⭐⭐⭐)

---

## 🛠️ 구현 가이드

### 1단계: 페이지 컴포넌트 생성

**파일**: `components/pages/YourPage.tsx`

```tsx
import React from 'react';
import { PageProps } from '../../types';

const YourPage: React.FC<PageProps> = () => {
  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#1b1b1b] p-5 md:p-7">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-semibold text-white">Title</h1>
          <p className="text-sm md:text-base text-gray-400">Description</p>
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {/* 컨텐츠 */}
      </div>
    </div>
  );
};

export default YourPage;
```

### 2단계: 페이지 등록

**파일**: `constants/pages.tsx`

```tsx
// Import
const YourPage = React.lazy(() => import('../components/pages/YourPage'));

// PAGES 객체에 추가
export const PAGES = {
  'your-id': {
    title: 'your-file.ext',
    component: YourPage,
    icon: <Icon name="file" className="mr-2" />,
  },
};
```

### 3단계: Sidebar에 추가

**파일**: `components/Sidebar.tsx`

```tsx
// ExplorerView 함수 내부
<button onClick={() => onOpenFile('your-id')} 
  className="flex items-center text-left w-full hover:bg-white/10 rounded px-2 py-1">
  <Icon name="file" className="mr-2" />
  <span>your-file.ext</span>
</button>
```

---

## 🎨 디자인 가이드라인

### 컬러 팔레트
```css
--bg-primary: #1e1e1e      /* 메인 배경 */
--bg-card: #2a2d2e         /* 카드 */
--text-primary: #ffffff    /* 제목 */
--text-secondary: #cccccc  /* 본문 */
--accent-blue: #007acc     /* 강조 */
```

### 카드 디자인
```tsx
<div className="bg-[#2a2d2e] p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all">
```

### 호버 효과
```tsx
<div className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
```

### 타이포그래피
```tsx
<h1 className="text-3xl font-bold text-white">         /* 메인 */
<h2 className="text-xl font-semibold text-white">      /* 서브 */
<p className="text-sm text-gray-400">                  /* 본문 */
```

### 태그/칩
```tsx
<span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
```

### 버튼
```tsx
/* Primary */
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded">

/* Ghost */
<button className="border border-gray-700 hover:border-blue-500 px-4 py-2 rounded">
```

### 반응형 그리드
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### 애니메이션
```tsx
// Fade In
const [mounted, setMounted] = React.useState(false);
React.useEffect(() => setMounted(true), []);

<div className={`transition-all ${mounted ? 'opacity-100' : 'opacity-0'}`}>

// Stagger
style={{ transitionDelay: `${index * 80}ms` }}
```

---

## ✅ 체크리스트

- [ ] Hero Section 구현
- [ ] 반응형 디자인 (모바일/데스크톱)
- [ ] 호버 효과 및 트랜지션
- [ ] 통일된 컬러 팔레트
- [ ] 페이지 로딩 애니메이션
- [ ] TypeScript 타입 정의
- [ ] 접근성 (aria-label, alt)
- [ ] SEO (title, description)

---

## 📚 참고 파일

- `components/Sidebar.tsx` - Explorer 구조
- `constants/pages.tsx` - 페이지 등록
- `components/pages/ProjectPage.tsx` - 참고 예제
- `components/pages/DigitalShelfPage.tsx` - 데이터 시각화 예제
