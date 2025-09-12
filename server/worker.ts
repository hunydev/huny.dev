/// <reference types="@cloudflare/workers-types" />

// The SSR entry is built via `vite build --mode ssr`
// Importing here lets Wrangler bundle it into the worker.
import { render } from '../dist/server/entry-server.js';

export interface Env {
  ASSETS: Fetcher;
  GEMINI_API_KEY?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 0) Example API routes (you can expand later)
    if (url.pathname.startsWith('/api/')) {
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ ok: true, time: new Date().toISOString() }), {
          headers: { 'content-type': 'application/json; charset=UTF-8' },
        });
      }
      if (url.pathname === '/api/split-speaker') {
        if (request.method !== 'POST') {
          return new Response('Method Not Allowed', { status: 405 });
        }
        if (!env.GEMINI_API_KEY) {
          return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
        try {
          const body = await request.json<any>().catch(() => ({} as any));
          const text: string = typeof body?.text === 'string' ? body.text : '';
          if (!text) {
            return new Response(JSON.stringify({ error: 'Missing text' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }

          const instructions = [
            '당신은 주어진 한국어/영어 텍스트에서 화자를 분리하여 JSON을 만드는 도우미입니다.',
            '규칙:',
            '- 같은 화자가 연속으로 말하는 구간은 하나의 엔트리로 묶습니다.',
            '- 내레이션(서술자, 지문)은 name을 "Narrator"로 설정합니다.',
            '- 등장인물의 이름을 문맥에서 유추할 수 있으면 name에 기록합니다. 유추가 어렵다면 "Unknown#1"과 같이 넘버링합니다.',
            '- gender는 남성 male, 여성 female, 알 수 없으면 unknown 으로 표기합니다. 확실치 않다면 unknown을 사용합니다.',
            '- extra에는 직업, 관계, 연령대 등 문맥에서 확실히 추정 가능한 보조 정보를 간략히 기술합니다. 불확실하면 생략합니다.',
            '- 결과는 반드시 다음 스키마의 JSON만 출력합니다: { "prompts": [ { "text": string, "name": string, "gender": string, "extra": string } ] }',
            '- 마크다운 코드펜스나 설명 텍스트 없이 JSON만 반환합니다.'
          ].join('\n');

          const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
          const gRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': env.GEMINI_API_KEY,
            },
            body: JSON.stringify({
              contents: [
                { parts: [ { text: instructions }, { text: `INPUT:\n${text}` } ] },
              ],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          });

          if (!gRes.ok) {
            const errText = await gRes.text().catch(() => '');
            return new Response(JSON.stringify({ error: `Gemini API error: ${gRes.status} ${gRes.statusText}`, detail: errText }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const data: any = await gRes.json();
          const raw: string = ((data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [])
            .map((p: any) => p?.text || '')
            .join('');
          const jsonStr = extractJsonString(raw);
          let parsed: any;
          try {
            parsed = JSON.parse(jsonStr);
          } catch {
            return new Response(JSON.stringify({ error: 'Failed to parse Gemini JSON response', raw }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          if (!parsed || !Array.isArray(parsed.prompts)) {
            return new Response(JSON.stringify({ error: 'Unexpected format from Gemini', raw }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          return new Response(JSON.stringify(parsed), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Internal error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }
      return new Response('Not Found', { status: 404 });
    }

    // 1) Try serving static assets first (only for requests with extensions or common static paths)
    const hasExt = /\.[a-zA-Z0-9]{1,6}$/.test(url.pathname);
    if (hasExt || url.pathname.startsWith('/assets') || url.pathname.startsWith('/static')) {
      const assetResp = await env.ASSETS.fetch(request);
      if (assetResp.status !== 404) return assetResp;
      // fallthrough to SSR if not found
    }

    // 2) Only SSR HTML for GET requests
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const accept = request.headers.get('accept') || '';
    const wantsHtml = accept.includes('text/html');

    // 3) SSR HTML for app routes
    if (wantsHtml || !hasExt) {
      try {
        // Load Vite manifest from ASSETS (try root then .vite folder)
        const tryPaths = ['/manifest.json', '/.vite/manifest.json'];
        let manifestData: any = undefined;
        for (const p of tryPaths) {
          const mReq = new Request(new URL(p, url), { headers: request.headers, method: 'GET' });
          const mRes = await env.ASSETS.fetch(mReq);
          if (mRes.ok) {
            manifestData = await mRes.json();
            break;
          }
        }
        const html = await render(url.pathname, manifestData);
        return new Response(html, {
          headers: {
            'content-type': 'text/html; charset=UTF-8',
            'cache-control': 'no-store',
          },
        });
      } catch (err) {
        console.error('SSR error', err);
        return new Response('Internal Server Error', { status: 500 });
      }
    }

    // 4) Fallback to assets (may still 404)
    return env.ASSETS.fetch(request);
  },
};

function extractJsonString(s: string): string {
  const fenceMatch = s.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
  if (fenceMatch && fenceMatch[1]) return fenceMatch[1].trim();
  return (s || '').trim();
}
