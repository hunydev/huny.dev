# Playground 가이드 이미지

이 폴더는 웹에서 접근 가능한 playground 가이드 이미지를 저장하는 곳입니다.

## 파일 추가 방법

각 playground의 가이드 이미지를 다음 형식으로 저장하세요:

```
{playground-id}.png
```

## 현재 저장된 이미지

- `sticker-generator.png` - Sticker Generator 가이드

## 새 이미지 추가하기

1. playground ID 확인 (예: `cover-crafter`, `to-do-generator`)
2. 가이드 이미지 준비 (PNG, JPG, JPEG 지원)
3. 이 폴더에 `{playground-id}.png` 형식으로 저장
4. 자동으로 해당 playground에서 사용됨

## 이미지 요구사항

- **형식**: PNG (권장), JPG, JPEG
- **권장 크기**: 최대 너비 1200px
- **내용**: playground의 주요 기능과 사용 방법을 보여주는 스크린샷

## 주의사항

⚠️ 이 폴더(`public/`)의 파일들은 웹에서 직접 접근 가능합니다.
- 접근 경로: `/extra/playground/capture/{playground-id}.png`
- Git에 커밋되어 배포됩니다.
