import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: isSsrBuild
      ? {
          ssr: path.resolve(__dirname, 'entry-server.tsx'),
          outDir: path.resolve(__dirname, 'dist/server'),
          target: 'esnext',
          rollupOptions: {
            input: path.resolve(__dirname, 'entry-server.tsx'),
          },
        }
      : {
          outDir: path.resolve(__dirname, 'dist/client'),
          manifest: true,
          rollupOptions: {
            input: path.resolve(__dirname, 'index.html'),
          },
        },
  };
});
