import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages에서 /<repo>/ 하위 경로 배포를 쉽게 맞추기 위한 옵션
const base = process.env.CV_BASE_PATH || '/';

export default defineConfig({
  plugins: [react()],
  base,
});
