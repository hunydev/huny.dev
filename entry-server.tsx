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
  // Build app HTML
  const appHtml = renderToString(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Parse URL for dynamic head
  let origin = 'https://huny.dev';
  let pathname = '/';
  try {
    const u = new URL(url);
    origin = u.origin || origin;
    pathname = u.pathname || '/';
  } catch {
    try {
      const u2 = new URL(origin + (url.startsWith('/') ? url : `/${url}`));
      origin = u2.origin || origin;
      pathname = u2.pathname || '/';
    } catch {}
  }
  const canonical = `${origin}${pathname}`;

  // Dynamic head meta by path
  const meta = (() => {
    const base = {
      title: 'HunyDev · Works & Digital Playground',
      description:
        'More than a portfolio — a personal playground of apps, works, docs, and notes. Built with TypeScript, React, and Cloudflare Workers.',
      image: `${origin}/og-image.png`,
    };
    if (pathname === '/bird-generator') {
      return {
        title: 'Bird Generator · HunyDev',
        description: 'Generate bird images with OpenAI. Play with prompts and edits.',
        image: `${origin}/og-image.png`,
      };
    }
    if (pathname === '/multi-voice-reader') {
      return {
        title: 'Multi‑Voice Reader · HunyDev',
        description: 'Turn text into multi‑speaker TTS with Gemini. Narration and dialogues.',
        image: `${origin}/og-image.png`,
      };
    }
    if (pathname === '/split-speaker') {
      return {
        title: 'Split Speaker · HunyDev',
        description: 'Experiment with speaker‑segmented TTS pipelines.',
        image: `${origin}/og-image.png`,
      };
    }
    return base;
  })();

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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    <link rel="canonical" href="${canonical}" />
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:site_name" content="HunyDev" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:image" content="${meta.image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@janghun2722" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.description}" />
    <meta name="twitter:image" content="${meta.image}" />
    <script src="https://cdn.tailwindcss.com"></script>
    ${cssLinks}
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Huny',
      url: 'https://huny.dev/',
      email: 'mailto:jang@huny.dev',
      sameAs: [
        'https://github.com/hunydev',
        'https://x.com/janghun2722',
        'https://discord.gg/2NWa39bU',
      ],
    })}</script>
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'HunyDev',
      url: 'https://huny.dev/',
    })}</script>
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SiteNavigationElement',
      name: ['Blog', 'Apps', 'Sites'],
      url: ['https://blog.huny.dev', 'https://apps.huny.dev', 'https://sites.huny.dev'],
    })}</script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root">${appHtml}</div>
    <script type="module" src="/${jsFile}"></script>
  </body>
</html>`;
}
