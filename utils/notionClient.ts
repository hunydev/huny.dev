import type { Bookmark } from '../components/pages/bookmarksData';

// Call our Worker proxy to Notion and map to Bookmark[]
export async function fetchNotionBookmarks(query: any = {}): Promise<Bookmark[]> {
  const res = await fetch('/api/bookmarks', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(query || {}),
  });
  const text = await res.text();
  let js: any = {};
  try { js = text ? JSON.parse(text) : {}; } catch { js = {}; }
  if (!res.ok) {
    const msg = (js && js.error) ? js.error : `Failed to fetch bookmarks: ${res.status}`;
    throw new Error(msg);
  }
  const results: any[] = Array.isArray(js?.results) ? js.results : [];
  return results.map(mapNotionPageToBookmark).filter(Boolean) as Bookmark[];
}

function getPlainFromTitle(arr: any[]): string {
  const parts = Array.isArray(arr) ? arr : [];
  const s = parts.map((p: any) => p?.plain_text || p?.text?.content || '').filter(Boolean).join('');
  return s || 'Untitled';
}

function getPlainFromRichText(arr: any[]): string | undefined {
  const parts = Array.isArray(arr) ? arr : [];
  const s = parts.map((p: any) => p?.plain_text || p?.text?.content || '').filter(Boolean).join('');
  return s || undefined;
}

function pickFirstFileUrl(files: any[]): string | undefined {
  const list = Array.isArray(files) ? files : [];
  if (list.length === 0) return undefined;
  const f = list[0];
  if (f?.type === 'file' && f?.file?.url) return String(f.file.url);
  if (f?.type === 'external' && f?.external?.url) return String(f.external.url);
  return undefined;
}

function pickPageIconUrl(icon: any): string | undefined {
  try {
    if (!icon) return undefined;
    if (icon?.type === 'file' && icon?.file?.url) return String(icon.file.url);
    if (icon?.type === 'external' && icon?.external?.url) return String(icon.external.url);
    return undefined;
  } catch {
    return undefined;
  }
}

function pickPropertyImageUrl(field: any): string | undefined {
  if (!field || typeof field !== 'object') return undefined;
  // Files type
  const viaFiles = pickFirstFileUrl(field?.files);
  if (viaFiles) return viaFiles;
  // URL type
  if (typeof field?.url === 'string' && field.url) return String(field.url);
  return undefined;
}

function mapNotionPageToBookmark(page: any): Bookmark | null {
  try {
    const props = page?.properties || {};
    const name = getPlainFromTitle(props?.name?.title);
    const description = getPlainFromRichText(props?.description?.rich_text);
    const url = (props?.url?.url as string) || (page?.public_url as string) || (page?.url as string) || '#';
    const tags: string[] = Array.isArray(props?.tags?.multi_select) ? props.tags.multi_select.map((t: any) => String(t?.name || '')).filter(Boolean) : [];
    const catNames: string[] = Array.isArray(props?.categoryId?.multi_select) ? props.categoryId.multi_select.map((t: any) => String(t?.name || '')).filter(Boolean) : [];
    const categoryId = catNames[0] || undefined; // first tag as categoryId
    const thumbnail =
      pickPropertyImageUrl(props?.thumbnail) ||
      pickPropertyImageUrl(props?.icon) ||
      pickPageIconUrl(page?.icon);

    const createdAt = String(page?.created_time || '');
    const updatedAt = page?.last_edited_time ? String(page.last_edited_time) : undefined;

    const id = String(page?.id || crypto.randomUUID());

    const bm: Bookmark = {
      id,
      categoryId,
      name,
      description,
      url,
      thumbnail,
      createdAt,
      updatedAt,
      tags,
    };
    return bm;
  } catch {
    return null;
  }
}
