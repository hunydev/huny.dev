# huny.dev CV (React + Vite)

메인 포트폴리오에서 CV 성격 정보만 추려 별도 제출용 페이지로 구성한 앱입니다.

## 실행

```bash
cd docs
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## PDF Export

페이지 우측 상단 `PDF Export` 버튼을 누르면 브라우저 인쇄 창이 열리고,
`Save as PDF`로 A4 기준 내보내기가 가능합니다.

## GitHub Pages 배포

기본 base 경로는 `/`입니다. 저장소 하위 경로 배포 시:

```bash
CV_BASE_PATH=/<repo-name>/ npm run build
```

생성된 `docs/dist` 폴더를 Pages artifact로 배포하면 됩니다.

GitHub Actions(`.github/workflows/pages.yml`)를 통해 `main` 브랜치 푸시 시 자동 배포됩니다.
