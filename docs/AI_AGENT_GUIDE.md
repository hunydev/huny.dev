# Playground AI 에이전트 가이드

이 문서는 AI 에이전트가 Playground 프로젝트에 새로운 아이템을 추가하는 방법을 안내합니다.

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [프로젝트 구조](#프로젝트-구조)
3. [새로운 Playground 추가하기](#새로운-playground-추가하기)
4. [파일별 상세 가이드](#파일별-상세-가이드)
5. [API 엔드포인트 작성](#api-엔드포인트-작성)
6. [체크리스트](#체크리스트)
7. [예제 템플릿](#예제-템플릿)

---

## 프로젝트 개요

### 기본 정보
- **프로젝트명**: HunyDev Works (Playground)
- **목적**: Gemini/OpenAI API를 활용한 다양한 AI 기능 실험 및 구현
- **기술 스택**: 
  - Frontend: React 19, TypeScript, Tailwind CSS, Vite
  - Backend: Cloudflare Workers (Serverless)
  - API: Google Gemini API, OpenAI API

### Playground란?
- 사용자 아이디어를 빠르게 실현하는 AI 기반 도구 모음
- 각 Playground는 독립적인 탭으로 작동
- Gemini/OpenAI API를 활용하여 텍스트, 이미지, 음성 생성/변환 기능 제공

### 주요 특징
- **탭 기반 UI**: VSCode 스타일의 탭 인터페이스
- **API 작업 추적**: 탭 전환 시에도 API 작업 상태 유지
- **가이드 모달**: 각 Playground별 사용 가이드 제공
- **SSR 지원**: Cloudflare Workers에서 서버사이드 렌더링

---

## 프로젝트 구조

```
huny.dev/
├── components/
│   ├── pages/           # 각 Playground 페이지 컴포넌트
│   │   ├── StickerGeneratorPage.tsx
│   │   ├── TextCleaningPage.tsx
│   │   └── ...
│   ├── ui/              # 재사용 가능한 UI 컴포넌트
│   │   ├── ApiProviderBadge.tsx
│   │   ├── LoadingButton.tsx
│   │   ├── FileDropZone.tsx
│   │   ├── PlaygroundGuideModal.tsx
│   │   └── ...
│   ├── ActivityBar.tsx  # 좌측 액티비티 바
│   ├── Sidebar.tsx      # 파일 탐색기
│   └── MainPanel.tsx    # 메인 탭 패널
├── constants/
│   ├── pages.tsx        # 페이지 등록 및 라우팅
│   ├── icons.tsx        # 아이콘 정의
│   └── activityBar.tsx  # 액티비티 바 설정
├── contexts/
│   └── ApiTaskContext.tsx  # API 작업 상태 관리
├── hooks/
│   ├── useApiCall.ts       # API 호출 훅
│   ├── useFileUpload.ts    # 파일 업로드 훅
│   └── usePlaygroundGuide.ts  # 가이드 모달 훅
├── server/
│   └── worker.ts        # Cloudflare Workers API 엔드포인트
├── docs/
│   ├── PLAYGROUND_GUIDE.md    # 가이드 기능 사용법
│   ├── API_TASK_SYSTEM.md     # API 작업 관리 시스템
│   └── AI_AGENT_GUIDE.md      # 이 문서
├── types.ts             # TypeScript 타입 정의
└── package.json
```

---

## 새로운 Playground 추가하기

### 단계별 프로세스

#### Step 1: 아이콘 추가 (선택)
새로운 Playground를 위한 아이콘을 추가합니다.

**파일**: `constants/icons.tsx`

```tsx
// ICON_DEFS 객체에 추가
myNewPlayground: {
  viewBox: '0 0 24 24',
  nodes: (
    <>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      {/* SVG path 데이터 */}
    </>
  ),
  defaultClassName: 'w-6 h-6',
  attrs: { fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
},
```

**참고**: 기존 아이콘(`file`, `apps` 등)을 재사용할 수도 있습니다.

---

#### Step 2: 페이지 컴포넌트 생성
새로운 Playground 페이지를 생성합니다.

**파일**: `components/pages/MyNewPlaygroundPage.tsx`

```tsx
import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { 
  ErrorMessage, 
  LoadingButton, 
  ApiProviderBadge, 
  PlaygroundGuideModal,
  FileDropZone // 필요시
} from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { useFileUpload } from '../../hooks/useFileUpload'; // 필요시
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

const MyNewPlaygroundPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  // 1. State 정의
  const [inputText, setInputText] = React.useState<string>('');
  const [outputText, setOutputText] = React.useState<string>('');

  // 2. Playground 가이드 훅 (활성 탭일 때만 이미지 로드)
  const playgroundGuide = usePlaygroundGuide('my-new-playground', isActiveTab);

  // 3. API 호출 훅
  type MyResponse = { result: string };
  const api = useApiCall<MyResponse>({
    url: '/api/my-endpoint',
    method: 'POST',
    tabId: 'my-new-playground',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      setOutputText(data?.result || '');
    },
  });

  // 4. 이벤트 핸들러
  const handleSubmit = async () => {
    if (!inputText.trim()) {
      api.setError('입력을 입력해주세요.');
      return;
    }
    setOutputText('');
    await api.execute({
      body: { text: inputText }
    });
  };

  const resetAll = () => {
    setInputText('');
    setOutputText('');
    api.reset();
  };

  // 5. UI 렌더링
  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <Icon name="myNewPlayground" className="w-6 h-6" />
          </span>
          My New Playground
          {/* 물음표 가이드 버튼 */}
          <button
            type="button"
            onClick={playgroundGuide.openGuide}
            className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
            aria-label="사용 가이드 보기"
            title="사용 가이드 보기"
          >
            ?
          </button>
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">
          이 Playground에 대한 설명을 작성합니다.
        </p>
        <div className="mt-2">
          <ApiProviderBadge provider="gemini" />
        </div>
      </header>

      {/* Playground 가이드 모달 */}
      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="My New Playground"
        playgroundId="my-new-playground"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

      {/* 입력 섹션 */}
      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">입력</h2>
        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="텍스트를 입력하세요..."
          className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-sm resize-y"
        />
        <div className="flex items-center gap-2 mt-3">
          <LoadingButton
            loading={api.loading}
            disabled={!inputText.trim()}
            onClick={handleSubmit}
            loadingText="처리 중…"
            idleText="실행"
            variant="primary"
          />
          <LoadingButton
            loading={false}
            onClick={resetAll}
            loadingText=""
            idleText="초기화"
            variant="secondary"
          />
          <ErrorMessage error={api.error} />
        </div>
      </section>

      {/* 결과 섹션 */}
      <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">결과</h2>
        {outputText ? (
          <pre className="whitespace-pre-wrap text-sm">{outputText}</pre>
        ) : (
          <div className="text-sm text-gray-500">아직 결과가 없습니다.</div>
        )}
      </section>
    </div>
  );
};

export default MyNewPlaygroundPage;
```

**핵심 패턴**:
- `PageProps`를 prop으로 받음 (`apiTask`, `isActiveTab`)
- `usePlaygroundGuide` 훅으로 가이드 모달 관리 (활성 탭 전달 필수)
- `useApiCall` 훅으로 API 호출 및 상태 관리
- Header에 아이콘, 제목, 가이드 버튼, API Provider Badge 포함
- 입력/결과 섹션을 `section` 태그로 구분
- Tailwind CSS를 사용한 다크 테마 스타일링

---

#### Step 3: 페이지 등록
새로운 페이지를 라우팅 시스템에 등록합니다.

**파일**: `constants/pages.tsx`

```tsx
// 1. Lazy import 추가
const MyNewPlaygroundPage = React.lazy(() => import('../components/pages/MyNewPlaygroundPage'));

// 2. PAGES 객체에 등록
export const PAGES: Record<string, { 
  title: string; 
  component: PageComponent; 
  icon: React.ReactNode; 
  apiRequirement?: ApiRequirement 
}> = {
  // ... 기존 페이지들
  
  'my-new-playground': {
    title: 'My New Playground',
    component: MyNewPlaygroundPage,
    icon: <Icon name="myNewPlayground" className="mr-2" />,
    apiRequirement: { provider: 'gemini', features: ['text'] },
  },
  
  // ... 나머지 페이지들
};
```

**ApiRequirement 설정**:
- `provider`: `'gemini'` 또는 `'openai'`
- `features`: 
  - `'text'`: 텍스트 생성 (무료 가능)
  - `'image'`: 이미지 생성/분석 (유료 키 필요)
  - `'tts'`: 음성 합성 (유료 키 필요)
  - 여러 기능: `['text', 'tts']`

---

#### Step 4: API 엔드포인트 추가
서버에 API 엔드포인트를 추가합니다.

**파일**: `server/worker.ts`

```typescript
// fetch 함수 내의 라우팅 로직에 추가
if (url.pathname === '/api/my-endpoint' && request.method === 'POST') {
  if (!env.GEMINI_API_KEY) {
    return errorJson(500, 'GEMINI_API_KEY가 설정되지 않았습니다.');
  }
  
  try {
    // 1. Request body 파싱
    const body = await safeJson<{ text: string }>(request, { text: '' });
    const inputText = body.text?.trim();
    
    if (!inputText) {
      return errorJson(400, '텍스트를 입력해주세요.');
    }
    
    // 2. Gemini API 호출
    const prompt = `다음 텍스트를 처리하세요: ${inputText}`;
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return errorJson(geminiResponse.status, 'Gemini API 오류', errorText);
    }
    
    const geminiData = await geminiResponse.json() as any;
    const result = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // 3. 응답 반환
    return jsonResponse(200, { result }, { cacheControl: NO_STORE_CACHE_CONTROL });
    
  } catch (error: any) {
    return errorJson(500, '서버 오류', error?.message || String(error));
  }
}
```

**이미지 처리 예시** (파일 업로드):
```typescript
if (url.pathname === '/api/image-process' && request.method === 'POST') {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    
    // 이미지 검증
    const validationError = validateImageFile(imageFile);
    if (validationError) {
      return errorJson(400, validationError);
    }
    
    // 이미지를 Base64로 변환
    const imageBytes = await imageFile.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBytes)));
    
    // Gemini Vision API 호출
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: '이미지를 분석하세요.' },
              { 
                inlineData: {
                  mimeType: imageFile.type,
                  data: base64Image
                }
              }
            ]
          }]
        }),
      }
    );
    
    // ... 응답 처리
  } catch (error) {
    return errorJson(500, '이미지 처리 오류');
  }
}
```

---

#### Step 5: 가이드 이미지 추가 (선택)
사용 가이드 스크린샷을 추가합니다.

**위치**: `public/extra/playground/capture/my-new-playground.png`

**권장 사항**:
- 파일명: `{playground-id}.png` (**png 형식만 지원**)
- 권장 크기: 최대 너비 1200px
- 내용: 주요 기능과 사용 방법 설명
- 이미지가 없어도 페이지는 정상 작동 (가이드 모달만 표시되지 않음)

---

#### Step 6: Activity Bar에 추가 (선택)
좌측 Activity Bar에 바로가기를 추가하려면:

**파일**: `constants/activityBar.tsx`

```tsx
export const ACTIVITY_BAR_ITEMS: ActivityBarItem[] = [
  // ... 기존 항목들
  
  {
    id: ViewId.Playground,
    icon: <Icon name="activityPlayground" />,
    label: 'Playground',
    onClick: (setActiveView, onOpenFile) => {
      setActiveView(ViewId.Playground);
      onOpenFile('my-new-playground'); // 여기에 추가
    },
  },
  
  // ... 나머지 항목들
];
```

---

## 파일별 상세 가이드

### 1. 페이지 컴포넌트 (`components/pages/*.tsx`)

#### 필수 Import
```tsx
import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, ApiProviderBadge, PlaygroundGuideModal } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';
```

#### Props 타입
```tsx
const MyPage: React.FC<PageProps> = ({ 
  apiTask,      // API 작업 관리 (필수)
  isActiveTab,  // 현재 활성 탭인지 여부 (필수)
  onOpenFile,   // 파일 열기 함수 (선택)
  setActiveView // View 전환 함수 (선택)
}) => {
  // ...
}
```

#### State 관리 패턴
```tsx
// 입력 상태
const [inputData, setInputData] = React.useState<string>('');

// 출력 상태
const [outputData, setOutputData] = React.useState<string>('');

// API 호출
type MyResponse = { result: string };
const api = useApiCall<MyResponse>({
  url: '/api/endpoint',
  method: 'POST',
  tabId: 'my-playground-id', // PAGES의 key와 동일
  isActiveTab,
  apiTask,
  onSuccess: (data) => {
    setOutputData(data?.result || '');
  },
});
```

#### 레이아웃 구조
```tsx
return (
  <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
    {/* 1. Header */}
    <header className="mb-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
          <Icon name="icon" className="w-6 h-6" />
        </span>
        Title
        <button /* 가이드 버튼 */>?</button>
      </h1>
      <p className="mt-2 text-gray-400 text-sm md:text-base">설명</p>
      <div className="mt-2">
        <ApiProviderBadge provider="gemini" />
      </div>
    </header>

    {/* 2. 가이드 모달 */}
    <PlaygroundGuideModal {...playgroundGuide} />

    {/* 3. 입력 섹션 */}
    <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
      {/* 입력 UI */}
    </section>

    {/* 4. 결과 섹션 */}
    <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
      {/* 결과 UI */}
    </section>
  </div>
);
```

---

### 2. API 엔드포인트 (`server/worker.ts`)

#### 기본 구조
```typescript
if (url.pathname === '/api/endpoint' && request.method === 'POST') {
  // 1. API 키 확인
  if (!env.GEMINI_API_KEY) {
    return errorJson(500, 'API 키가 설정되지 않았습니다.');
  }
  
  try {
    // 2. Request 파싱
    const body = await safeJson<RequestType>(request, defaultValue);
    
    // 3. 입력 검증
    if (/* validation */) {
      return errorJson(400, '잘못된 입력');
    }
    
    // 4. AI API 호출
    const aiResponse = await fetch(/* ... */);
    
    // 5. 응답 처리
    const result = /* ... */;
    
    // 6. 응답 반환
    return jsonResponse(200, { result }, { cacheControl: NO_STORE_CACHE_CONTROL });
    
  } catch (error: any) {
    return errorJson(500, '서버 오류', error?.message);
  }
}
```

#### Gemini API 호출 패턴

**텍스트 생성**:
```typescript
const geminiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  }
);
```

**이미지 + 텍스트**:
```typescript
const geminiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: '프롬프트' },
          { 
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64ImageData
            }
          }
        ]
      }]
    }),
  }
);
```

**TTS (음성 합성)**:
```typescript
const geminiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: '읽을 텍스트' }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Zephyr' // 또는 다른 음성 이름
            }
          }
        }
      }
    }),
  }
);

// 응답에서 오디오 데이터 추출
const audioData = geminiData?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
```

#### OpenAI API 호출 패턴

**이미지 생성 (DALL-E)**:
```typescript
const openaiResponse = await fetch(
  'https://api.openai.com/v1/images/generations',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
    }),
  }
);

const imageUrl = openaiData?.data?.[0]?.url;
```

#### 유틸리티 함수
```typescript
// JSON 응답
jsonResponse(200, { data: value }, { cacheControl: NO_STORE_CACHE_CONTROL });

// 에러 응답
errorJson(400, '에러 메시지', { detail: 'optional details' });

// 안전한 JSON 파싱
const body = await safeJson<MyType>(request, { default: 'value' });

// 이미지 검증
const error = validateImageFile(imageFile);
if (error) return errorJson(400, error);
```

---

### 3. 아이콘 정의 (`constants/icons.tsx`)

#### 아이콘 추가
```tsx
export const ICON_DEFS = {
  // ... 기존 아이콘들
  
  myIcon: {
    viewBox: '0 0 24 24',
    nodes: (
      <>
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        {/* Tabler Icons 등에서 가져온 SVG path */}
      </>
    ),
    defaultClassName: 'w-6 h-6',
    attrs: { 
      fill: 'none', 
      stroke: 'currentColor', 
      strokeWidth: '2', 
      strokeLinecap: 'round', 
      strokeLinejoin: 'round' 
    },
  },
};
```

**아이콘 소스**:
- [Tabler Icons](https://tabler.io/icons) (무료, MIT)
- [Lucide Icons](https://lucide.dev/) (무료, ISC)
- [Heroicons](https://heroicons.com/) (무료, MIT)

---

### 4. 재사용 가능한 UI 컴포넌트

#### LoadingButton
```tsx
<LoadingButton
  loading={api.loading}
  disabled={!inputText}
  onClick={handleSubmit}
  loadingText="처리 중…"
  idleText="실행"
  variant="primary" // 또는 "secondary"
/>
```

#### ErrorMessage
```tsx
<ErrorMessage error={api.error} />
```

#### ApiProviderBadge
```tsx
<ApiProviderBadge provider="gemini" /> {/* 또는 "openai" */}
```

#### FileDropZone
```tsx
const fileUpload = useFileUpload({
  accept: 'image/*',
  maxSize: 10 * 1024 * 1024, // 10MB
});

<FileDropZone
  file={fileUpload.file}
  previewUrl={fileUpload.previewUrl}
  error={fileUpload.error}
  isDragging={fileUpload.isDragging}
  accept="image/*"
  onDrop={fileUpload.onDrop}
  onDragOver={fileUpload.onDragOver}
  onDragEnter={fileUpload.onDragEnter}
  onDragLeave={fileUpload.onDragLeave}
  onInputChange={fileUpload.onInputChange}
  onReset={resetAll}
  label="이미지를 드래그&드롭하거나 클릭"
  previewClassName="max-h-64 object-contain"
/>
```

---

### 5. Hooks 상세 가이드

#### usePlaygroundGuide

사용자 가이드 모달을 관리하는 훅입니다. 활성 탭일 때만 가이드 이미지를 로드하여 성능을 최적화합니다.

**사용법**:
```tsx
const playgroundGuide = usePlaygroundGuide('playground-id', isActiveTab);
```

**파라미터**:
- `playgroundId` (string): Playground 고유 ID (PAGES의 key와 동일)
- `isActiveTab` (boolean): 현재 활성 탭 여부 (필수)

**반환값**:
```tsx
{
  isModalOpen: boolean;           // 모달 열림 상태
  showDontShowAgain: boolean;     // "더 이상 보지 않기" 체크박스 표시 여부
  openGuide: () => void;          // 모달 열기 (가이드 버튼 클릭 시)
  closeGuide: () => void;         // 모달 닫기
  handleDontShowAgain: (checked: boolean) => void; // "더 이상 보지 않기" 처리
}
```

**동작 방식**:
1. **활성 탭 체크**: `isActiveTab`이 `true`일 때만 이미지 존재 여부를 확인
2. **이미지 로드**: `/extra/playground/capture/{playground-id}.png`에 HEAD 요청
3. **첫 방문 자동 표시**: 이미지가 있고 사용자가 이전에 닫지 않았다면 자동으로 모달 표시
4. **로컬스토리지 저장**: "더 이상 보지 않기" 선택 시 `localStorage`에 저장

**중요 사항**:
- ⚠️ **반드시 `isActiveTab`을 전달해야 합니다** - 이를 통해 비활성 탭에서 불필요한 이미지 요청을 방지
- 가이드 이미지는 **png 형식만** 지원 (`{playground-id}.png`)
- 이미지가 없어도 에러가 발생하지 않음 (모달만 표시되지 않음)

**예제**:
```tsx
const MyPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const playgroundGuide = usePlaygroundGuide('my-playground', isActiveTab);

  return (
    <div>
      <header>
        <h1>
          My Playground
          <button onClick={playgroundGuide.openGuide}>?</button>
        </h1>
      </header>

      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="My Playground"
        playgroundId="my-playground"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />
      
      {/* 나머지 컨텐츠 */}
    </div>
  );
};
```

---

#### useApiCall

API 호출과 로딩/에러 상태를 관리하는 훅입니다. API 작업을 탭별로 추적하여 탭 전환 시에도 상태를 유지합니다.

**사용법**:
```tsx
type MyResponse = { result: string };
const api = useApiCall<MyResponse>({
  url: '/api/endpoint',
  method: 'POST',
  tabId: 'my-playground',
  isActiveTab,
  apiTask,
  onSuccess: (data) => {
    // 성공 처리
  },
});
```

**반환값**:
```tsx
{
  loading: boolean;              // 로딩 상태
  error: string | null;          // 에러 메시지
  execute: (options) => Promise<void>; // API 실행
  setError: (error: string | null) => void; // 에러 설정
  reset: () => void;             // 상태 초기화
}
```

---

#### useFileUpload

파일 업로드와 미리보기를 관리하는 훅입니다.

**사용법**:
```tsx
const fileUpload = useFileUpload({
  accept: 'image/*',
  maxSize: 10 * 1024 * 1024, // 10MB
});
```

---

## API 엔드포인트 작성

### 엔드포인트 네이밍 규칙
- URL: `/api/{playground-id}` 형식
- 예시: `/api/text-cleaning`, `/api/sticker-generator`

### 요청/응답 형식

#### 텍스트 입력
**Request**:
```json
{
  "text": "입력 텍스트"
}
```

**Response**:
```json
{
  "result": "결과 텍스트"
}
```

#### 이미지 입력 (FormData)
**Request**:
```
Content-Type: multipart/form-data

image: [File]
prompt: "옵션 프롬프트"
```

**Response**:
```json
{
  "image": "data:image/png;base64,..."
}
```

#### 오디오 출력
**Response**:
```json
{
  "audio": "data:audio/wav;base64,..."
}
```

### 에러 처리
```typescript
// 클라이언트 에러 (400번대)
if (!input) {
  return errorJson(400, '입력이 필요합니다.');
}

// 서버 에러 (500번대)
try {
  // ...
} catch (error: any) {
  return errorJson(500, '서버 오류', error?.message);
}

// API 키 없음
if (!env.GEMINI_API_KEY) {
  return errorJson(500, 'GEMINI_API_KEY가 설정되지 않았습니다.');
}
```

---

## 체크리스트

새로운 Playground를 추가할 때 다음 항목을 확인하세요:

### 필수 사항
- [ ] 페이지 컴포넌트 생성 (`components/pages/MyPlaygroundPage.tsx`)
- [ ] `constants/pages.tsx`에 페이지 등록
- [ ] `server/worker.ts`에 API 엔드포인트 추가
- [ ] `usePlaygroundGuide` 훅 사용하여 가이드 모달 추가 (isActiveTab 전달)
- [ ] `useApiCall` 훅 사용하여 API 호출 관리
- [ ] `ApiProviderBadge` 컴포넌트로 API 제공자 표시
- [ ] 에러 처리 구현 (`ErrorMessage` 컴포넌트 사용)
- [ ] 로딩 상태 관리 (`LoadingButton` 사용)

### 선택 사항
- [ ] 아이콘 추가 (`constants/icons.tsx`)
- [ ] 가이드 이미지 추가 (`public/extra/playground/capture/`)
- [ ] Activity Bar에 바로가기 추가 (`constants/activityBar.tsx`)
- [ ] 파일 업로드 기능 (`useFileUpload` 훅 사용)

### 테스트
- [ ] 페이지 로드 확인
- [ ] API 호출 성공 케이스 테스트
- [ ] 에러 케이스 테스트
- [ ] 탭 전환 중 API 작업 상태 유지 확인
- [ ] 가이드 모달 동작 확인
- [ ] 반응형 디자인 확인 (모바일/데스크톱)

---

## 예제 템플릿

### 최소 기능 템플릿

**파일**: `components/pages/MinimalPlaygroundPage.tsx`

```tsx
import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, ApiProviderBadge, PlaygroundGuideModal } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

const MinimalPlaygroundPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [input, setInput] = React.useState('');
  const [output, setOutput] = React.useState('');
  
  const playgroundGuide = usePlaygroundGuide('minimal-playground', isActiveTab);
  
  type Response = { result: string };
  const api = useApiCall<Response>({
    url: '/api/minimal',
    method: 'POST',
    tabId: 'minimal-playground',
    isActiveTab,
    apiTask,
    onSuccess: (data) => setOutput(data?.result || ''),
  });

  const handleSubmit = async () => {
    if (!input) {
      api.setError('입력을 입력하세요.');
      return;
    }
    await api.execute({ body: { text: input } });
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <Icon name="file" className="w-6 h-6" />
          </span>
          Minimal Playground
          <button
            type="button"
            onClick={playgroundGuide.openGuide}
            className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
          >?</button>
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">설명</p>
        <div className="mt-2"><ApiProviderBadge provider="gemini" /></div>
      </header>

      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="Minimal Playground"
        playgroundId="minimal-playground"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">입력</h2>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-sm"
        />
        <div className="flex items-center gap-2 mt-3">
          <LoadingButton
            loading={api.loading}
            onClick={handleSubmit}
            loadingText="처리 중"
            idleText="실행"
            variant="primary"
          />
          <ErrorMessage error={api.error} />
        </div>
      </section>

      <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">결과</h2>
        {output ? <p>{output}</p> : <p className="text-gray-500">결과 없음</p>}
      </section>
    </div>
  );
};

export default MinimalPlaygroundPage;
```

---

### 이미지 업로드 템플릿

**파일**: `components/pages/ImagePlaygroundPage.tsx`

```tsx
import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, FileDropZone, ApiProviderBadge, PlaygroundGuideModal } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { useFileUpload } from '../../hooks/useFileUpload';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

const ImagePlaygroundPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [result, setResult] = React.useState('');
  
  const playgroundGuide = usePlaygroundGuide('image-playground', isActiveTab);
  
  const fileUpload = useFileUpload({
    accept: 'image/*',
    maxSize: 10 * 1024 * 1024,
  });

  type Response = { result: string };
  const api = useApiCall<Response>({
    url: '/api/image-process',
    method: 'POST',
    tabId: 'image-playground',
    isActiveTab,
    apiTask,
    onSuccess: (data) => setResult(data?.result || ''),
  });

  React.useEffect(() => {
    window.addEventListener('paste', fileUpload.onPaste);
    return () => window.removeEventListener('paste', fileUpload.onPaste);
  }, [fileUpload.onPaste]);

  const handleProcess = async () => {
    if (!fileUpload.file) {
      api.setError('이미지를 업로드하세요.');
      return;
    }
    const fd = new FormData();
    fd.append('image', fileUpload.file);
    await api.execute({ body: fd });
  };

  const resetAll = () => {
    fileUpload.reset();
    setResult('');
    api.reset();
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
            <Icon name="file" className="w-6 h-6" />
          </span>
          Image Playground
          <button
            type="button"
            onClick={playgroundGuide.openGuide}
            className="ml-1 px-2 py-0.5 text-xs rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
          >?</button>
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">이미지 처리 Playground</p>
        <div className="mt-2"><ApiProviderBadge provider="gemini" /></div>
      </header>

      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="Image Playground"
        playgroundId="image-playground"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">이미지 업로드</h2>
        <FileDropZone
          file={fileUpload.file}
          previewUrl={fileUpload.previewUrl}
          error={fileUpload.error}
          isDragging={fileUpload.isDragging}
          accept="image/*"
          onDrop={fileUpload.onDrop}
          onDragOver={fileUpload.onDragOver}
          onDragEnter={fileUpload.onDragEnter}
          onDragLeave={fileUpload.onDragLeave}
          onInputChange={fileUpload.onInputChange}
          onReset={resetAll}
          label="이미지를 드래그&드롭 또는 클릭하여 업로드"
          previewClassName="max-h-64 object-contain"
        />
        <div className="flex items-center gap-2 mt-3">
          <LoadingButton
            loading={api.loading}
            disabled={!fileUpload.file}
            onClick={handleProcess}
            loadingText="처리 중"
            idleText="처리"
            variant="primary"
          />
          <LoadingButton
            loading={false}
            onClick={resetAll}
            idleText="초기화"
            variant="secondary"
          />
          <ErrorMessage error={api.error || fileUpload.error} />
        </div>
      </section>

      <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">결과</h2>
        {result ? <p>{result}</p> : <p className="text-gray-500">결과 없음</p>}
      </section>
    </div>
  );
};

export default ImagePlaygroundPage;
```

---

## 추가 참고 자료

### 기존 문서
- `docs/PLAYGROUND_GUIDE.md` - 가이드 기능 사용법
- `docs/API_TASK_SYSTEM.md` - API 작업 관리 시스템 (탭 전환 상태 유지)
- `README.md` - 프로젝트 개발/배포 가이드

### 기존 Playground 예시
- `StickerGeneratorPage.tsx` - 이미지 업로드 + 이미지 생성
- `TextCleaningPage.tsx` - 텍스트 입력 + 텍스트 출력
- `MultiVoiceReaderPage.tsx` - 텍스트 입력 + 오디오 출력
- `BirdGeneratorPage.tsx` - 텍스트 입력 + OpenAI DALL-E 이미지 생성

### 유용한 도구
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [React 19 문서](https://react.dev)
- [Gemini API 문서](https://ai.google.dev/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Cloudflare Workers 문서](https://developers.cloudflare.com/workers/)

---

## 주의사항

### 보안
- API 키는 절대 클라이언트에 노출하지 않음 (서버에서만 사용)
- `.dev.vars` 파일은 `.gitignore`에 포함되어 있음
- 프로덕션 배포 시 `wrangler secret put` 사용

### 성능
- 이미지 크기는 8MB 이하로 제한 (기본값)
- API 응답은 `NO_STORE_CACHE_CONTROL` 사용 (캐싱 방지)
- 긴 작업은 타임아웃 고려 (Cloudflare Workers 기본 30초)

### 사용자 경험
- 로딩 상태를 명확히 표시 (`LoadingButton` 사용)
- 에러 메시지는 사용자 친화적으로 작성
- 탭 전환 시 API 작업 상태 유지 (자동 처리됨)
- 첫 방문 시 가이드 모달 자동 표시

### 타입 안전성
- TypeScript를 적극 활용
- API 응답 타입 정의 (`type Response = { ... }`)
- Props는 `PageProps` 타입 사용

---

## 질문이 있나요?

이 가이드로 해결되지 않는 문제가 있다면:
1. 기존 Playground 컴포넌트 코드를 참고하세요
2. `docs/` 폴더의 다른 문서들을 확인하세요
3. 프로젝트 구조를 탐색하며 패턴을 파악하세요

**Happy Coding! 🚀**

