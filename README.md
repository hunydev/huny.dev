<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# HunyDev Works – 개발/배포 가이드

아래 명령만 기억하세요.

```bash
# 로컬 테스트 (Vite Dev)
npx vite dev

# 배포 (Cloudflare Workers)
npx vite build
npx wrangler deploy
```

---

## 사전 준비
- Node.js (LTS 권장)
- Cloudflare 계정 및 Wrangler CLI 로그인: `npx wrangler login`

## 설치
```bash
npm install
```

## 로컬 테스트 (Vite Dev)
Vite 개발 서버에서 앱을 빠르게 확인합니다.

```bash
npx vite dev
# 기본: http://localhost:5173
```

## 배포 (Cloudflare Workers)
1) 정적 자산 빌드
```bash
npx vite build
```

2) Cloudflare에 배포
```bash
npx wrangler deploy
```

참고:
- 로컬에서 워커 런타임(SSR 포함)을 확인하려면 다음 명령을 사용할 수 있습니다.
  ```bash
  npx wrangler dev
  # 기본: http://127.0.0.1:8787
  ```

## 환경 변수
- 루트에 `.env.local` 파일을 만들고 필요한 값을 설정하세요.
  - 예: `GEMINI_API_KEY=...`
- Vite와 Wrangler 모두 `.env.local`를 인식하도록 구성되어 있습니다.

## 트러블슈팅
- `Unknown command: "vite"` 오류가 발생하면 `npx vite ...` 형태로 실행하세요.
- Cloudflare 배포 전에 로그인이 필요하면 `npx wrangler login`을 먼저 실행하세요.
