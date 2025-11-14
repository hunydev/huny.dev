import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode, isSsrBuild }) => {
  return {
    plugins: [react()],
    // Dev proxy: forward /api to local Cloudflare Worker (wrangler dev)
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8787',
          changeOrigin: true,
        },
      },
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
          chunkSizeWarningLimit: 1024,
          rollupOptions: {
            input: path.resolve(__dirname, 'index.html'),
            output: {
              manualChunks(id) {
                if (id.includes('node_modules')) {
                  if (id.includes('highlight.js')) return 'hljs';
                  if (id.includes('leaflet')) return 'leaflet';
                  if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';
                  return 'vendor';
                }
              },
            },
          },
        },
  };
});

