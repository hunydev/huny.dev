import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { getMetaFromUrl } from './seo';

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

  // Resolve meta info from URL using shared SEO helper
  const meta = getMetaFromUrl(url);

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
    <link rel="canonical" href="${meta.canonical}" />
    <meta name="robots" content="index, follow" />
    <meta name="googlebot" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
    <link rel="dns-prefetch" href="https://pb.huny.dev" />
    <link rel="preconnect" href="https://pb.huny.dev" crossorigin />
    <link rel="dns-prefetch" href="https://r2.huny.dev" />
    <link rel="preconnect" href="https://r2.huny.dev" crossorigin />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${meta.canonical}" />
    <meta property="og:site_name" content="HunyDev" />
    <meta property="og:locale" content="ko_KR" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:description" content="${meta.description}" />
    <meta property="og:image" content="${meta.image}" />
    <meta property="og:image:alt" content="${meta.imageAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@janghun2722" />
    <meta name="twitter:title" content="${meta.title}" />
    <meta name="twitter:description" content="${meta.description}" />
    <meta name="twitter:image" content="${meta.image}" />
    <meta name="twitter:image:alt" content="${meta.imageAlt}" />
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="modulepreload" href="/${jsFile}" crossorigin />
    ${cssLinks}
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'HunyDev',
      url: 'https://huny.dev/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://huny.dev/logo_128x128.png',
      },
      sameAs: [
        'https://github.com/hunydev',
        'https://x.com/janghun2722',
        'https://discord.huny.dev',
        'https://blog.huny.dev',
        'https://apps.huny.dev',
        'https://sites.huny.dev',
      ],
    })}</script>
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'HunyDev',
      alternateName: ['Huny', 'Huny Dev'],
      url: 'https://huny.dev/',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://huny.dev/?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
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
