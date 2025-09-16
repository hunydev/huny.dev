// Browser-side PocketBase helper
// - Obtains service token from our worker: POST /api/pb-token (no user login)
// - Refreshes token when expiring: POST /api/pb-refresh with Authorization: <token>
// - Exposes fetchPB() to call pb.huny.dev directly with Authorization header.

export const PB_HOST = 'https://pb.huny.dev';
const LS_KEY = 'pbToken';

export type PBAuth = {
  token: string;
  exp?: number; // seconds since epoch
};

function decodeJwtExp(token: string): number | undefined {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return undefined;
    const payload = JSON.parse(atob(parts[1]));
    if (typeof payload?.exp === 'number') return payload.exp;
    return undefined;
  } catch {
    return undefined;
  }
}

function nowSec(): number { return Math.floor(Date.now() / 1000); }

export function getStoredPBAuth(): PBAuth | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function storePBAuth(auth: PBAuth) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(auth));
  } catch {}
}

export function clearPBAuth() {
  try { localStorage.removeItem(LS_KEY); } catch {}
}

export async function ensurePBToken(thresholdSec = 60): Promise<PBAuth> {
  let auth = getStoredPBAuth();
  const needsInitial = !auth || !auth.token;
  if (needsInitial) {
    const res = await fetch('/api/pb-token', { method: 'POST' });
    if (!res.ok) throw new Error(`pb-token failed: ${res.status}`);
    const js: any = await res.json().catch(() => ({}));
    const token: string = js && typeof js.token === 'string' ? js.token : '';
    if (!token) throw new Error('pb-token: missing token');
    const exp = decodeJwtExp(token);
    auth = { token, exp };
    storePBAuth(auth);
    return auth;
  }
  // has token; refresh if near expiry
  const exp = typeof auth.exp === 'number' ? auth.exp : decodeJwtExp(auth.token);
  const remain = (exp ?? nowSec()) - nowSec();
  if (exp && remain > thresholdSec) return auth;
  // refresh
  const r = await fetch('/api/pb-refresh', { method: 'POST', headers: { Authorization: auth.token } });
  if (!r.ok) {
    // fallback: try fresh login
    return await ensureFreshPBToken();
  }
  const js: any = await r.json().catch(() => ({}));
  const token: string = js && typeof js.token === 'string' ? js.token : '';
  if (!token) return await ensureFreshPBToken();
  const newExp = decodeJwtExp(token);
  const next = { token, exp: newExp };
  storePBAuth(next);
  return next;
}

async function ensureFreshPBToken(): Promise<PBAuth> {
  clearPBAuth();
  const res = await fetch('/api/pb-token', { method: 'POST' });
  if (!res.ok) throw new Error(`pb-token failed: ${res.status}`);
  const js: any = await res.json().catch(() => ({}));
  const token: string = js && typeof js.token === 'string' ? js.token : '';
  if (!token) throw new Error('pb-token: missing token');
  const exp = decodeJwtExp(token);
  const auth = { token, exp };
  storePBAuth(auth);
  return auth;
}

export async function fetchPB(path: string, init: RequestInit = {}): Promise<Response> {
  const { token } = await ensurePBToken();
  const headers = new Headers(init.headers || {});
  // According to requirement, use raw token (no Bearer prefix)
  if (!headers.has('Authorization')) headers.set('Authorization', token);
  const url = path.startsWith('http') ? path : `${PB_HOST}${path.startsWith('/') ? '' : '/'}${path}`;
  return fetch(url, { ...init, headers });
}

export function buildPBFileUrl(collectionId: string, recordId: string, fileName: string): string {
  return `${PB_HOST}/api/files/${encodeURIComponent(collectionId)}/${encodeURIComponent(recordId)}/${encodeURIComponent(fileName)}`;
}

export async function fetchAllApps(): Promise<any[]> {
  const params = new URLSearchParams();
  params.set('perPage', '200');
  params.set('sort', 'name');
  const res = await fetchPB(`/api/collections/hunydev_apps/records?${params.toString()}`);
  const text = await res.text();
  let js: any = {};
  try { js = text ? JSON.parse(text) : {}; } catch { js = {}; }
  if (!res.ok) {
    const msg = (js && js.message) ? js.message : `PB apps fetch failed: ${res.status}`;
    throw new Error(msg);
  }
  const items = Array.isArray(js && js.items) ? js.items : [];
  return items;
}

// Example: fetch apps records by category
export async function fetchAppsByCategory(categoryId: string): Promise<any[]> {
  // PB list API: GET /api/collections/hunydev_apps/records
  // 서버에서 필터 오류 가능성이 있어 우선 전체를 불러온 뒤 클라이언트에서 카테고리 필터링
  const params = new URLSearchParams();
  params.set('perPage', '200');
  params.set('sort', 'name');
  const res = await fetchPB(`/api/collections/hunydev_apps/records?${params.toString()}`);
  const text = await res.text();
  let js: any = {};
  try { js = text ? JSON.parse(text) : {}; } catch { js = {}; }
  if (!res.ok) {
    // PB 에러 포맷: { status, message, data }
    const msg = (js && js.message) ? js.message : `PB apps fetch failed: ${res.status}`;
    throw new Error(msg);
  }
  const items = Array.isArray(js && js.items) ? js.items : [];
  // 클라이언트에서 카테고리 필터링
  return items.filter((r: any) => String(r?.categoryId || '') === String(categoryId));
}
