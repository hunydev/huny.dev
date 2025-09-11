import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export type ViteManifest = Record<string, {
  file: string;
  src?: string;
  isEntry?: boolean;
  css?: string[];
  assets?: string[];
}>;

export async function render(url: string, manifest?: ViteManifest) {
  const appHtml = renderToString(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Resolve entry chunk from manifest
  let entry = manifest?.['entry-client.tsx'];
  if (!entry && manifest) {
    const found = Object.values(manifest).find((m) => (m as any).isEntry);
    if (found) entry = found as any;
  }
  const jsFile = entry?.file || 'entry-client.js';
  const cssFiles = entry?.css || [];

  const cssLinks = cssFiles
    .map((href) => `<link rel="stylesheet" href="/${href}" />`)
    .join('');

  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HunyDev</title>
    <meta name="description" content="HunyDev · Works & Digital Playground — TTS/AI/Full‑stack engineering works, notes, docs, and apps." />
    <link rel="canonical" href="https://huny.dev/" />
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://huny.dev/" />
    <meta property="og:site_name" content="HunyDev" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:title" content="HunyDev · Works & Digital Playground" />
    <meta property="og:description" content="TTS/AI/Full‑stack engineering works, notes, docs, and apps." />
    <meta property="og:image" content="https://huny.dev/og-image.svg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@janghun2722" />
    <meta name="twitter:title" content="HunyDev · Works & Digital Playground" />
    <meta name="twitter:description" content="TTS/AI/Full‑stack engineering works, notes, docs, and apps." />
    <script src="https://cdn.tailwindcss.com"></script>
    ${cssLinks}
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root">${appHtml}</div>
    <script type="module" src="/${jsFile}"></script>
  </body>
</html>`;
}
