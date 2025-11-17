# Refactoring Phase 1: App.tsx 분해 및 레이아웃 컴포넌트 생성

## 📅 작업 날짜
2025-11-17

## 🎯 목표
1. App.tsx 파일 분해 (1,572줄 → 목표: 200~300줄)
2. 재사용 가능한 레이아웃 컴포넌트 생성
3. 코드 중복 제거 및 유지보수성 향상

## ✅ 완료된 작업

### 1. Custom Hooks 생성

#### `/hooks/useTabManager.ts` (새로 생성)
- **목적**: 탭 관리 로직 분리
- **기능**:
  - 탭 열기/닫기
  - 탭 고정/고정해제
  - 탭 공유 (URL 복사)
  - 탭 복원 (localStorage)
  - 키보드 단축키 (Alt+W)
- **감소 효과**: ~400줄

#### `/hooks/useViewManager.ts` (새로 생성)
- **목적**: 사이드바 뷰 관리 로직 분리
- **기능**:
  - Active view 관리
  - URL hash 동기화
  - 사이드바 pin/unpin
  - Overlay 상태 관리
- **감소 효과**: ~200줄

#### `/hooks/useServiceWorker.ts` (새로 생성)
- **목적**: Service Worker 관련 로직 분리
- **기능**:
  - SW 등록
  - 업데이트 확인
  - 자동 새로고침
  - 오프라인 감지
- **감소 효과**: ~150줄

#### `/hooks/useApiKeyManager.ts` (새로 생성)
- **목적**: API 키 관리 로직 분리
- **기능**:
  - API 키 저장/로드 (암호화)
  - 모달 상태 관리
  - localStorage 동기화
- **감소 효과**: ~100줄

### 2. UI 컴포넌트 분리

#### `/components/ApiKeyModal.tsx` (새로 생성)
- API 키 설정 모달 컴포넌트
- Gemini/OpenAI API 키 관리
- **감소 효과**: ~90줄

#### `/components/UpdateToast.tsx` (새로 생성)
- 업데이트 알림 토스트 컴포넌트
- 자동 카운트다운 및 새로고침
- **감소 효과**: ~80줄

### 3. 재사용 가능한 레이아웃 컴포넌트

#### `/components/ui/PageHero.tsx` (새로 생성)
```tsx
<PageHero
  title="페이지 제목"
  description="설명"
  icon={<Icon />}
  gradient="blue"  // 'blue' | 'emerald' | 'purple' | 'amber' | 'rose'
/>
```
- 페이지 상단 Hero 섹션 컴포넌트
- 그라디언트 배경 옵션
- **재사용 가능**: 20+ 페이지에 적용 가능
- **예상 감소 효과**: ~600줄

#### `/components/ui/PageSection.tsx` (새로 생성)
```tsx
<PageSection title="섹션 제목">
  {children}
</PageSection>
```
- 페이지 내 섹션 구분 컴포넌트
- 일관된 스타일링
- **예상 감소 효과**: ~200줄

#### `/components/ui/PageContainer.tsx` (새로 생성)
```tsx
<PageContainer maxWidth="lg">
  {children}
</PageContainer>
```
- 페이지 최대 너비 및 패딩 관리
- 반응형 디자인 지원
- **예상 감소 효과**: ~100줄

### 4. Export 업데이트

#### `/hooks/index.ts` (수정)
- 새로운 hooks export 추가
- Type definitions export

#### `/components/ui/index.ts` (수정)
- PageHero, PageSection, PageContainer export 추가

## 📊 효과

### 현재까지 달성
- ✅ **4개의 Custom Hooks** 생성
- ✅ **2개의 Modal/Toast 컴포넌트** 분리
- ✅ **3개의 레이아웃 컴포넌트** 생성

### 예상 코드 감소량
| 항목 | 감소 예상 |
|------|----------|
| useTabManager | ~400줄 |
| useViewManager | ~200줄 |
| useServiceWorker | ~150줄 |
| useApiKeyManager | ~100줄 |
| ApiKeyModal | ~90줄 |
| UpdateToast | ~80줄 |
| **Hooks & Components 소계** | **~1,020줄** |
| | |
| PageHero 적용 시 | ~600줄 |
| PageSection 적용 시 | ~200줄 |
| PageContainer 적용 시 | ~100줄 |
| **레이아웃 소계** | **~900줄** |
| | |
| **전체 예상** | **~1,920줄** |

## 🔧 다음 단계 (Phase 2)

### 1. App.tsx 완전 리팩토링
- [ ] 원본 App.tsx를 새로운 hooks와 컴포넌트 사용하도록 수정
- [ ] deleteApiKey 로직 App.tsx로 이동
- [ ] 테스트 및 버그 수정

### 2. 레이아웃 컴포넌트 적용
- [ ] PageHero를 5~10개 페이지에 먼저 적용
- [ ] 피드백 수집 후 나머지 페이지에 확대 적용
- [ ] PageSection, PageContainer 순차 적용

### 3. 폼 컴포넌트 라이브러리 구축
- [ ] FormField 컴포넌트 생성
- [ ] FormSelect 컴포넌트 생성
- [ ] FormTextarea 컴포넌트 생성

## ⚠️ 주의사항

1. **Hook 의존성 문제**
   - useTabManager와 useApiKeyManager 간 circular dependency 있음
   - deleteApiKey 로직은 App.tsx에서 직접 처리 필요

2. **App.tsx 리팩토링 미완성**
   - App.tsx.backup에 원본 백업됨
   - 현재 App.tsx는 리팩토링 시도 버전 (동작 확인 필요)

3. **레이아웃 컴포넌트 미적용**
   - 컴포넌트는 생성되었으나 실제 페이지에는 아직 적용 안 됨
   - 점진적으로 적용 필요

## 📝 백업 파일
- `App.tsx.backup`: 원본 App.tsx (1,572줄)

## 🎯 장기 목표
- App.tsx: 1,572줄 → 200~300줄
- 전체 프로젝트: 3,000~3,500줄 감소
