# 리팩터링 2단계: API 호출 & 파일 업로드 Hook

## 목표
반복적인 API 호출 로직과 파일 업로드 처리를 공통 Hook으로 추상화하여 코드 중복 제거 및 일관성 향상

## 생성된 Hook & 컴포넌트

### 1. `useApiCall` Hook
**위치**: `/hooks/useApiCall.ts`

**기능**:
- API 호출의 공통 패턴(loading, error, data 관리)을 Hook으로 추상화
- FormData와 JSON 자동 처리
- 성공/실패 콜백 지원
- 응답 파싱 커스터마이징 가능

**사용 예시**:
```tsx
const api = useApiCall<ResponseType>({
  url: '/api/endpoint',
  method: 'POST',
  onSuccess: (data) => console.log(data),
});

// 호출
await api.execute({ body: { key: 'value' } });

// 상태
api.loading // boolean
api.error   // string
api.data    // ResponseType | null
```

**대체하는 패턴**:
```tsx
// Before (반복 코드)
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [data, setData] = useState(null);

const callApi = async () => {
  setLoading(true);
  setError('');
  try {
    const res = await fetch('/api/endpoint', {...});
    const text = await res.text();
    if (!res.ok) throw new Error(text);
    const json = JSON.parse(text);
    setData(json);
  } catch (e) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
};

// After (Hook 사용)
const api = useApiCall({ url: '/api/endpoint', method: 'POST' });
await api.execute({ body: data });
```

**코드 감소량**: 페이지당 ~20-30줄

---

### 2. `useFileUpload` Hook
**위치**: `/hooks/useFileUpload.ts`

**기능**:
- 파일 선택, 드래그앤드롭, 붙여넣기 통합 처리
- 파일 타입 및 크기 검증
- 이미지 미리보기 URL 자동 생성/정리
- 드래그 상태 관리

**사용 예시**:
```tsx
const fileUpload = useFileUpload({
  accept: 'image/*',
  maxSize: 10 * 1024 * 1024, // 10MB
  onFileSelect: (file) => console.log(file),
});

// 붙여넣기 지원
useEffect(() => {
  window.addEventListener('paste', fileUpload.onPaste);
  return () => window.removeEventListener('paste', fileUpload.onPaste);
}, []);

// 상태
fileUpload.file        // File | null
fileUpload.previewUrl  // string
fileUpload.error       // string
fileUpload.isDragging  // boolean
```

**대체하는 패턴**:
```tsx
// Before (반복 코드)
const [file, setFile] = useState<File | null>(null);
const [previewUrl, setPreviewUrl] = useState('');

useEffect(() => {
  const onPaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          setFile(file);
          setPreviewUrl(URL.createObjectURL(file));
        }
      }
    }
  };
  window.addEventListener('paste', onPaste);
  return () => window.removeEventListener('paste', onPaste);
}, []);

const onDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer.files?.[0];
  if (file) {
    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }
};

// After (Hook 사용)
const fileUpload = useFileUpload({ accept: 'image/*' });
```

**코드 감소량**: 페이지당 ~40-60줄

---

### 3. `FileDropZone` 컴포넌트
**위치**: `/components/ui/FileDropZone.tsx`

**기능**:
- 드래그앤드롭 영역 UI
- 파일 미리보기 자동 표시
- 에러 메시지 표시
- 파일명/크기 정보 표시

**사용 예시**:
```tsx
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
  onReset={reset}
/>
```

**대체하는 패턴**:
```tsx
// Before (반복 UI 코드 ~30-40줄)
<div className="border border-dashed ..." onDrop={onDrop} onDragOver={onDragOver}>
  {file ? (
    <>
      <img src={previewUrl} alt="preview" />
      <div>{file.name} · {(file.size / 1024).toFixed(1)} KB</div>
      <button onClick={reset}>다른 이미지 선택</button>
    </>
  ) : (
    <>
      <p>이미지를 드래그하거나 클릭하여 업로드</p>
      <label>
        <input type="file" accept="image/*" onChange={onPick} hidden />
        이미지 선택
      </label>
    </>
  )}
</div>

// After (컴포넌트 사용)
<FileDropZone {...props} />
```

**코드 감소량**: 페이지당 ~30-40줄

---

## 적용 대상 페이지

### useApiCall 적용 가능 (API 호출이 있는 페이지)
1. ✅ TextCleaningPage (검증 완료)
2. TextToPhonemePage
3. WebWorkerPage
4. ToDoGeneratorPage
5. UIClonePage
6. StickerGeneratorPage
7. ComicRestylerPage
8. AvatarDistillerPage
9. FaviconDistillerPage
10. CoverCrafterPage
11. BirdGeneratorPage
12. AIBusinessCardPage
13. MultiVoiceReaderPage
14. ImageToSpeechPage
15. SceneToScriptPage
16. SplitSpeakerPage

### useFileUpload + FileDropZone 적용 가능 (파일 업로드가 있는 페이지)
1. StickerGeneratorPage
2. ComicRestylerPage
3. AvatarDistillerPage
4. FaviconDistillerPage
5. BirdGeneratorPage
6. AIBusinessCardPage
7. MultiVoiceReaderPage
8. ImageToSpeechPage
9. SceneToScriptPage
10. UIClonePage

---

## 예상 효과

### 코드 감소량
- **useApiCall 적용**: 16개 페이지 × 25줄 = **~400줄 감소**
- **useFileUpload 적용**: 10개 페이지 × 50줄 = **~500줄 감소**
- **FileDropZone 적용**: 10개 페이지 × 35줄 = **~350줄 감소**
- **총 예상**: **~1,250줄 감소**

### 개선 효과
1. **일관성**: 모든 API 호출과 파일 업로드가 동일한 패턴 사용
2. **버그 감소**: 공통 로직에서 한 번만 검증하면 됨
3. **유지보수성**: Hook 한 곳만 수정하면 모든 페이지에 반영
4. **타입 안전성**: 제네릭으로 응답 타입 강제
5. **재사용성**: 새 페이지 추가 시 Hook만 가져다 쓰면 됨

---

## 진행 상황

### 완료
- [x] `useApiCall` Hook 생성 및 테스트
- [x] `useFileUpload` Hook 생성 및 테스트
- [x] `FileDropZone` 컴포넌트 생성
- [x] TextCleaningPage 적용 및 빌드 검증

### 진행 중
- [ ] 나머지 15개 페이지에 useApiCall 적용
- [ ] 10개 페이지에 useFileUpload + FileDropZone 적용

### 대기
- [ ] 빌드 테스트
- [ ] 런타임 테스트
- [ ] 문서화 업데이트

---

## 다음 단계 (3단계)

1. **페이지 레이아웃 컴포넌트**
   - `PageHeader` 컴포넌트 (제목 + 아이콘 + 설명)
   - `PageSection` 컴포넌트 (일관된 섹션 스타일)
   
2. **폼 컴포넌트**
   - `FormField` (label + input/select/textarea)
   - `FormRow` (label + value 가로 정렬)

3. **결과 표시 컴포넌트**
   - `ResultImage` (이미지 결과 표시 + 다운로드)
   - `ResultAudio` (오디오 플레이어 표준화)

**예상 추가 감소량**: ~600-800줄
