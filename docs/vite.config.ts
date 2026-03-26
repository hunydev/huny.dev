import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

declare const process: {
  env: { CV_BASE_PATH?: string } & Record<string, string | undefined>;
};

// GitHub Pages에서 /<repo>/ 하위 경로 배포를 쉽게 맞추기 위한 옵션
const rawBase = process.env.CV_BASE_PATH;

const base = (() => {
  if (!rawBase || rawBase === '/') {
    return '/';
  }

  let normalized = rawBase.trim();

  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }

  if (!normalized.endsWith('/')) {
    normalized = normalized + '/';
  }

  return normalized;
})();

export default defineConfig({
  plugins: [react()],
  base,
});
