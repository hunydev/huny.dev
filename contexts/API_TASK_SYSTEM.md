# API Task Management System

## 개요

Playground의 다양한 API 호출 페이지에서 탭 전환 시에도 진행 상태를 유지하고, 완료 시 결과를 확인할 수 있도록 하는 전역 API 작업 상태 관리 시스템입니다.

## 주요 기능

### 1. **탭 전환 시 상태 유지**
- API 요청이 진행 중일 때 다른 탭으로 전환해도 요청은 계속 진행됨
- 탭으로 돌아왔을 때 완료된 결과를 확인 가능

### 2. **시각적 상태 표시**
- **진행 중**: 탭의 X 버튼이 회전하는 로딩 인디케이터로 변경
- **완료**: 탭 제목 옆에 초록색 점(badge) 표시
- **에러**: 내부적으로 추적 (필요시 확장 가능)

### 3. **안전장치**
- API 진행 중인 탭을 닫으려 하면 확인 다이얼로그 표시
- API 진행 중일 때 페이지를 나가려 하면 beforeunload 경고
- 완료된 작업 상태는 5초 후 자동 정리

## 아키텍처

```
App.tsx (ApiTaskProvider)
  ↓
  ├─ ApiTaskContext (전역 상태 관리)
  │   ├─ startTask(tabId)
  │   ├─ completeTask(tabId)
  │   ├─ errorTask(tabId, error)
  │   └─ getTaskStatus(tabId)
  │
  ├─ MainPanel → TabBar (탭 UI)
  │   └─ 상태에 따라 로딩/완료 표시
  │
  └─ Page Components
      └─ useApiCall hook
          └─ 자동으로 API 작업 추적
```

## 사용 방법

### 1. Page 컴포넌트에서 사용

```tsx
import { PageProps } from '../../types';
import { useApiCall } from '../../hooks/useApiCall';

const MyPage: React.FC<PageProps> = ({ apiTask }) => {
  type MyResponse = { result: string };
  
  const api = useApiCall<MyResponse>({
    url: '/api/my-endpoint',
    method: 'POST',
    tabId: 'my-page',  // 탭 ID (PAGES의 key와 일치)
    apiTask,           // PageProps에서 전달받은 apiTask
    onSuccess: (data) => {
      console.log('완료:', data);
    },
  });

  const handleSubmit = async () => {
    await api.execute({
      body: { input: 'test' }
    });
  };

  return (
    <div>
      <button onClick={handleSubmit} disabled={api.loading}>
        {api.loading ? '처리 중...' : '실행'}
      </button>
      {api.error && <p>에러: {api.error}</p>}
    </div>
  );
};
```

### 2. 수동으로 상태 관리 (고급)

필요한 경우 직접 API 작업 상태를 관리할 수 있습니다:

```tsx
const MyPage: React.FC<PageProps> = ({ apiTask }) => {
  const handleCustomApi = async () => {
    apiTask?.startTask('my-page');
    
    try {
      const response = await fetch('/api/custom');
      const data = await response.json();
      
      apiTask?.completeTask('my-page');
      console.log('완료:', data);
    } catch (error) {
      apiTask?.errorTask('my-page', error.message);
    }
  };

  return <button onClick={handleCustomApi}>실행</button>;
};
```

## 구현 세부사항

### ApiTaskContext

**상태 타입:**
```typescript
type ApiTaskStatus = 'pending' | 'completed' | 'error';

type ApiTask = {
  tabId: string;
  status: ApiTaskStatus;
  startedAt: number;
  completedAt?: number;
  error?: string;
};
```

**제공 함수:**
- `startTask(tabId)`: 작업 시작
- `completeTask(tabId)`: 작업 완료 (5초 후 자동 정리)
- `errorTask(tabId, error)`: 작업 실패
- `getTaskStatus(tabId)`: 현재 상태 조회
- `hasActiveTasks()`: 진행 중인 작업 존재 여부

### useApiCall Hook

`useApiCall`은 자동으로 API 작업을 추적합니다:

1. `execute()` 호출 시 → `startTask()` 자동 호출
2. 성공 시 → `completeTask()` 자동 호출
3. 실패 시 → `errorTask()` 자동 호출

## 적용 페이지

다음 페이지들이 이 시스템을 사용합니다:

- ✅ TextCleaningPage
- 🔄 AIBusinessCardPage
- 🔄 BirdGeneratorPage
- 🔄 ComicRestylerPage
- 🔄 CoverCrafterPage
- 🔄 FaviconDistillerPage
- 🔄 StickerGeneratorPage
- 🔄 TextToPhonemePage
- 🔄 ToDoGeneratorPage
- 🔄 UIClonePage
- 🔄 WebWorkerPage

> ✅ = 적용 완료, 🔄 = 적용 예정

## 확장 가능성

### 에러 상태 UI 표시

```tsx
// MainPanel.tsx에서 에러 상태도 표시 가능
{apiTask.getTaskStatus(tab.id) === 'error' && (
  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-red-400" title="API 작업 실패" />
)}
```

### 진행률 표시

```typescript
// ApiTask에 progress 추가
type ApiTask = {
  // ...
  progress?: number; // 0-100
};

// 사용 예
apiTask?.updateProgress('my-page', 50);
```

### 작업 취소

```typescript
// AbortController를 사용한 취소 기능
const abortController = new AbortController();

const api = useApiCall({
  url: '/api/endpoint',
  signal: abortController.signal,
  // ...
});

// 취소
abortController.abort();
apiTask?.cancelTask('my-page');
```

## 테스트

### 기본 플로우 테스트

1. Text Cleaning 페이지 열기
2. 텍스트 입력 후 "정제" 버튼 클릭
3. 즉시 다른 탭으로 전환 (예: Welcome)
4. Text Cleaning 탭에 로딩 인디케이터 확인
5. 작업 완료 후 초록색 점 표시 확인
6. Text Cleaning 탭으로 돌아가서 결과 확인

### 안전장치 테스트

1. API 진행 중인 탭의 X 버튼 클릭 → 확인 다이얼로그
2. API 진행 중일 때 페이지 새로고침 → beforeunload 경고

## 주의사항

1. **탭 ID 일관성**: `tabId`는 `PAGES`의 key와 일치해야 함
2. **메모리 관리**: 완료된 작업은 5초 후 자동 정리됨
3. **동시 요청**: 같은 탭에서 여러 API를 동시에 호출하면 마지막 상태만 추적됨
4. **SSR 호환성**: Context는 클라이언트 사이드에서만 작동

## 마이그레이션 가이드

기존 페이지를 새 시스템으로 마이그레이션:

```diff
- const MyPage: React.FC<PageProps> = () => {
+ const MyPage: React.FC<PageProps> = ({ apiTask }) => {
    
    const api = useApiCall<MyResponse>({
      url: '/api/endpoint',
      method: 'POST',
+     tabId: 'my-page',
+     apiTask,
      onSuccess: (data) => { /* ... */ },
    });
```

끝!
