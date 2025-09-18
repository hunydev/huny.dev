export type ResolvedMeta = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  canonical: string;
  pathname: string;
  origin: string;
};

const DEFAULT_TITLE = 'HunyDev · Works & Digital Playground';
const DEFAULT_DESCRIPTION =
  'More than a portfolio — a personal playground of apps, works, docs, and notes. Built with TypeScript, React, and Cloudflare Workers.';
const DEFAULT_IMAGE_ALT = 'HunyDev — Works & Digital Playground';
const DEFAULT_ORIGIN = 'https://huny.dev';

// Route-specific overrides. Keys must be absolute pathnames.
const ROUTE_META: Record<string, Partial<Pick<ResolvedMeta, 'title' | 'description' | 'image' | 'imageAlt'>>> = {
  '/bird-generator': {
    title: 'Bird Generator · HunyDev',
    description: 'Generate bird images with OpenAI. Play with prompts and edits.',
  },
  '/multi-voice-reader': {
    title: 'Multi‑Voice Reader · HunyDev',
    description: 'Turn text into multi‑speaker TTS with Gemini. Narration and dialogues.',
  },
  '/split-speaker': {
    title: 'Split Speaker · HunyDev',
    description: 'Experiment with speaker‑segmented TTS pipelines.',
  },
};

export function getMetaFromUrl(urlStr: string): ResolvedMeta {
  let origin = DEFAULT_ORIGIN;
  let pathname = '/';
  try {
    const u = new URL(urlStr);
    origin = u.origin || origin;
    pathname = u.pathname || '/';
  } catch {
    // fallback if only a pathname was passed
    try {
      const u2 = new URL((urlStr.startsWith('/') ? urlStr : `/${urlStr}`), DEFAULT_ORIGIN);
      origin = u2.origin || origin;
      pathname = u2.pathname || '/';
    } catch {/* ignore */}
  }
  return getMetaFromPath(pathname, origin);
}

export function getMetaFromPath(pathname: string, origin = DEFAULT_ORIGIN): ResolvedMeta {
  const base = {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    imageAlt: DEFAULT_IMAGE_ALT,
  };
  const override = ROUTE_META[pathname] || {};
  const title = override.title ?? base.title;
  const description = override.description ?? base.description;
  const image = override.image ?? `${origin}/og-image.png`;
  const imageAlt = override.imageAlt ?? base.imageAlt;
  const canonical = `${origin}${pathname}`;
  return { title, description, image, imageAlt, canonical, pathname, origin };
}

export const DEFAULT_META = {
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  imageAlt: DEFAULT_IMAGE_ALT,
};
