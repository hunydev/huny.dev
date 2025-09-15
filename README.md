# HunyDev Works – 개발/배포 가이드

아래 명령만 기억하세요.

```bash
# 로컬 프론트엔드 (Vite Dev)
npx vite dev

# 로컬 SSR/Worker (Cloudflare Workers, SSR 필요)
npm run build        # client + ssr 빌드 (vite build && vite build --ssr)
npx wrangler dev     # http://127.0.0.1:8787

# 배포 (Cloudflare Workers)
npm run build
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
1) 클라이언트 + SSR 빌드 (워커가 SSR 엔트리를 로드합니다)
```bash
npm run build
```

2) Cloudflare에 배포
```bash
npx wrangler deploy
```

참고:
- 로컬에서 워커 런타임(SSR 포함)을 확인하려면 SSR 빌드가 선행되어야 합니다.
  ```bash
  npm run serve:ssr    # 내부적으로 npm run build && wrangler dev 실행
  # 또는
  npm run build && npx wrangler dev
  # 기본: http://127.0.0.1:8787
  ```

## 환경 변수
- 서버(Cloudflare Workers) 로컬 실행용: 루트에 `.dev.vars` 파일을 생성하여 설정합니다.
  - 예: 
    ```
    GEMINI_API_KEY=...
    OPENAI_API_KEY=...
    ```
- 프론트엔드(Vite Dev)용: 필요 시 루트에 `.env.local`를 사용할 수 있습니다.
- 프로덕션 배포 시에는 Cloudflare Secrets로 설정하세요.
  ```bash
  npx wrangler secret put GEMINI_API_KEY
  npx wrangler secret put OPENAI_API_KEY
  ```

## 트러블슈팅
- `Unknown command: "vite"` 오류가 발생하면 `npx vite ...` 형태로 실행하세요.
- Cloudflare 배포 전에 로그인이 필요하면 `npx wrangler login`을 먼저 실행하세요.
- `Error: Cannot find module '../dist/server/entry-server.js'` 또는 SSR 엔트리 관련 에러가 나는 경우:
  - 원인: 워커가 `server/worker.ts`에서 SSR 엔트리(`dist/server/entry-server.js`)를 임포트합니다. SSR 빌드가 없으면 오류가 발생합니다.
  - 해결: 아래 중 하나를 실행한 뒤 `wrangler dev` 또는 `wrangler deploy`를 수행하세요. (Vite v6에서는 `--ssr` 플래그를 사용)
    ```
    npm run build                # 권장 (client+ssr 동시 빌드)
    # 또는 (Vite v6)
    npx vite build && npx vite build --ssr
    ```
