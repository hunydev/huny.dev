// Utilities to load and parse local HTML docs for the Docs section
// Uses Vite's import.meta.glob to import all html files in extra/docs as raw strings

export type DocItem = {
  slug: string;           // file name without extension
  title: string;          // from <title> element or fallback to slug
  contentHtml: string;    // sanitized inner HTML to render inside the app shell
  path: string;           // original path
};

function extractTitleAndBody(html: string): { title: string; body: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : html; // fallback: whole string
  return { title, body };
}

function sanitize(html: string): string {
  // Minimal sanitization for local trusted docs: strip <script> tags
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
}

// Eagerly import all docs as raw strings at build time (Vite: use query instead of deprecated `as`)
const modules = import.meta.glob('../../extra/docs/**/*.html', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const toSlug = (filePath: string) => {
  const name = filePath.split('/').pop() || filePath;
  return name.replace(/\.html$/i, '');
};

export const DOCS: DocItem[] = Object.entries(modules).map(([path, html]) => {
  const { title, body } = extractTitleAndBody(html);
  const slug = toSlug(path);
  return {
    slug,
    title: title || slug,
    contentHtml: sanitize(body),
    path,
  };
}).sort((a, b) => a.title.localeCompare(b.title));

export function getDocBySlug(slug?: string): DocItem | undefined {
  if (!slug) return undefined;
  return DOCS.find(d => d.slug === slug);
}
