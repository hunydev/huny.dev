# Playground 가이드 이미지

⚠️ **중요**: 이 폴더는 **개발 참고용**입니다. 

실제 서비스되는 이미지는 **`public/extra/playground/capture/`** 폴더에 있어야 합니다!

## 올바른 경로

웹에서 접근 가능한 위치에 이미지를 저장하세요:

```
public/extra/playground/capture/{playground-id}.png
```

예시:
- `public/extra/playground/capture/sticker-generator.png`
- `public/extra/playground/capture/cover-crafter.png`
- `public/extra/playground/capture/to-do-generator.png`

## 파일명 규칙

파일명은 playground ID와 동일하게 작성합니다:
- `sticker-generator.png`
- `text-to-emoji.png`
- `split-speaker.png`
- 등등...

## 이미지 요구사항

- **형식**: PNG, JPG, JPEG 지원
- **권장 크기**: 최대 너비 1200px (모달에서 적절히 표시됨)
- **내용**: 해당 playground의 주요 기능과 사용 방법을 보여주는 스크린샷 또는 설명 이미지

## Playground ID 목록

다음은 각 playground의 ID입니다:

- `sticker-generator` - Sticker Generator
- `text-to-emoji` - Text to Emoji
- `text-to-phoneme` - Text to Phoneme
- `split-speaker` - Split Speaker
- `multi-voice-reader` - MultiVoice Reader
- `text-cleaning` - Text Cleaning
- `web-worker` - Web Worker
- `to-do-generator` - To-do Generator
- `bird-generator` - Bird Generator
- `ai-business-card` - AI Business Card
- `comic-restyler` - Comic Restyler
- `ui-clone` - UI Clone
- `favicon-distiller` - Favicon Distiller
- `avatar-distiller` - Avatar Distiller
- `cover-crafter` - Cover Crafter
- `image-to-speech` - Image to Speech
- `scene-to-script` - Scene to Script
- `non-native-korean-tts` - Non-Native Korean TTS
