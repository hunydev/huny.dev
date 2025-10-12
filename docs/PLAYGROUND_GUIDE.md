# Playground 가이드 기능 사용법

각 Playground 페이지에 사용 가이드 모달을 추가하는 방법을 설명합니다.

## 개요

- **목적**: 각 playground에 물음표(?) 아이콘 버튼을 추가하여 사용자가 기능 설명 이미지를 볼 수 있도록 함
- **자동 표시**: 첫 방문 시 자동으로 가이드 모달 표시
- **"더 이상 보지 않기"**: localStorage를 사용하여 사용자 설정 저장
- **물음표 클릭**: 언제든지 가이드를 다시 볼 수 있음 (체크박스는 표시되지 않음)

## 구성 요소

### 1. PlaygroundGuideModal 컴포넌트
**위치**: `components/ui/PlaygroundGuideModal.tsx`

모달 컴포넌트로, 가이드 이미지를 표시하고 닫기/더 이상 보지 않기 기능을 제공합니다.

```tsx
<PlaygroundGuideModal
  isOpen={playgroundGuide.isModalOpen}
  onClose={playgroundGuide.closeGuide}
  playgroundTitle="Sticker Generator"
  playgroundId="sticker-generator"
  showDontShowAgain={playgroundGuide.showDontShowAgain}
  onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
/>
```

### 2. usePlaygroundGuide 훅
**위치**: `hooks/usePlaygroundGuide.ts`

Playground 가이드 상태 관리 훅입니다.

```tsx
const playgroundGuide = usePlaygroundGuide('sticker-generator');
```

**반환값**:
- `isModalOpen`: 모달 표시 여부
- `showDontShowAgain`: "더 이상 보지 않기" 체크박스 표시 여부
- `openGuide()`: 모달 열기 (물음표 버튼 클릭 시)
- `closeGuide()`: 모달 닫기
- `handleDontShowAgain(checked)`: "더 이상 보지 않기" 처리

### 3. 가이드 이미지
**위치**: `extra/playground/capture/{playground-id}.png`

각 playground ID에 해당하는 이미지 파일을 저장합니다.

**지원 형식**: PNG, JPG, JPEG

## Playground 페이지에 추가하는 방법

### Step 1: Import 추가

```tsx
import { PlaygroundGuideModal } from '../ui';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';
```

### Step 2: 훅 초기화

컴포넌트 함수 시작 부분에서 훅을 호출합니다:

```tsx
const YourPlaygroundPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  // ... 기존 state들
  
  const playgroundGuide = usePlaygroundGuide('your-playground-id');
  
  // ... 나머지 로직
```

### Step 3: Header에 물음표 버튼 추가

기존 header를 flex 레이아웃으로 감싸고 물음표 버튼을 추가합니다:

```tsx
<header className="mb-6">
  <div className="flex items-start justify-between gap-4">
    <div className="flex-1">
      {/* 기존 h1, p, ApiProviderBadge 등 */}
      <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
        {/* ... */}
      </h1>
      <p className="mt-2 text-gray-400 text-sm md:text-base">
        {/* ... */}
      </p>
      <div className="mt-2">
        <ApiProviderBadge provider="gemini" />
      </div>
    </div>
    <button
      type="button"
      onClick={playgroundGuide.openGuide}
      className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
      aria-label="사용 가이드 보기"
      title="사용 가이드 보기"
    >
      <Icon name="info" className="w-5 h-5" />
    </button>
  </div>
</header>
```

### Step 4: Modal 컴포넌트 추가

Header 바로 다음에 모달 컴포넌트를 추가합니다:

```tsx
<header className="mb-6">
  {/* ... */}
</header>

<PlaygroundGuideModal
  isOpen={playgroundGuide.isModalOpen}
  onClose={playgroundGuide.closeGuide}
  playgroundTitle="Your Playground Title"
  playgroundId="your-playground-id"
  showDontShowAgain={playgroundGuide.showDontShowAgain}
  onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
/>

{/* 나머지 섹션들 */}
```

### Step 5: 가이드 이미지 준비

`extra/playground/capture/` 폴더에 이미지를 추가합니다:

- 파일명: `{playground-id}.png` (또는 `.jpg`, `.jpeg`)
- 권장 크기: 최대 너비 1200px
- 내용: playground 주요 기능 및 사용 방법 설명

## 전체 예시

```tsx
import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, ApiProviderBadge, PlaygroundGuideModal } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

const YourPlaygroundPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [yourState, setYourState] = React.useState('');
  
  const playgroundGuide = usePlaygroundGuide('your-playground-id');
  
  // ... 나머지 로직

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-blue-300">
                <Icon name="yourIcon" className="w-6 h-6" />
              </span>
              Your Playground
            </h1>
            <p className="mt-2 text-gray-400 text-sm md:text-base">설명</p>
            <div className="mt-2">
              <ApiProviderBadge provider="gemini" />
            </div>
          </div>
          <button
            type="button"
            onClick={playgroundGuide.openGuide}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
            aria-label="사용 가이드 보기"
            title="사용 가이드 보기"
          >
            <Icon name="info" className="w-5 h-5" />
          </button>
        </div>
      </header>

      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        playgroundTitle="Your Playground"
        playgroundId="your-playground-id"
        showDontShowAgain={playgroundGuide.showDontShowAgain}
        onDontShowAgainChange={playgroundGuide.handleDontShowAgain}
      />

      {/* 나머지 페이지 내용 */}
    </div>
  );
};

export default YourPlaygroundPage;
```

## Playground ID 목록

| Playground | ID |
|------------|-----|
| Sticker Generator | `sticker-generator` |
| Text to Emoji | `text-to-emoji` |
| Text to Phoneme | `text-to-phoneme` |
| Split Speaker | `split-speaker` |
| MultiVoice Reader | `multi-voice-reader` |
| Text Cleaning | `text-cleaning` |
| Web Worker | `web-worker` |
| To-do Generator | `to-do-generator` |
| Bird Generator | `bird-generator` |
| AI Business Card | `ai-business-card` |
| Comic Restyler | `comic-restyler` |
| UI Clone | `ui-clone` |
| Favicon Distiller | `favicon-distiller` |
| Avatar Distiller | `avatar-distiller` |
| Cover Crafter | `cover-crafter` |
| Image to Speech | `image-to-speech` |
| Scene to Script | `scene-to-script` |
| Non-Native Korean TTS | `non-native-korean-tts` |

## 동작 방식

1. **첫 방문**: 페이지 로드 시 localStorage를 확인하여 `playground-guide-dismissed-{id}` 키가 없으면 자동으로 모달 표시
2. **"더 이상 보지 않기" 체크**: localStorage에 `playground-guide-dismissed-{id}=true` 저장
3. **물음표 클릭**: `showDontShowAgain`이 `false`인 상태로 모달 표시 (체크박스 숨김)
4. **다음 방문**: localStorage에 저장된 값이 있으면 자동 모달 표시 안 함

## 테스트

1. 페이지 첫 방문 시 모달이 자동으로 표시되는지 확인
2. "더 이상 보지 않기" 체크 후 닫기
3. 페이지 새로고침 시 모달이 표시되지 않는지 확인
4. localStorage 클리어 후 다시 방문 시 모달이 표시되는지 확인
5. 물음표 버튼 클릭 시 모달이 표시되고 체크박스가 없는지 확인

## 주의사항

- playground ID는 URL의 탭 ID와 동일하게 사용
- 이미지 파일명은 정확히 `{playground-id}.png` 형식으로 저장
- 이미지가 없으면 fallback 메시지 표시
- localStorage는 도메인별로 관리되므로 다른 도메인에서는 설정이 유지되지 않음
