/// <reference types="@cloudflare/workers-types" />

// The SSR entry is built via `vite build --mode ssr`
// Importing here lets Wrangler bundle it into the worker.
import { render } from '../dist/server/entry-server.js';

export interface Env {
  ASSETS: Fetcher;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
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
      if (url.pathname === '/api/bird-generator') {
        if (request.method !== 'POST') {
          return new Response('Method Not Allowed', { status: 405 });
        }
        if (!env.OPENAI_API_KEY) {
          return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not configured on the server.' }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
        try {
          const form = await request.formData();
          const prompt = String(form.get('prompt') || '').trim();
          if (!prompt) {
            return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }

          // Gather images (can be multiple). Accept both 'image' and 'image[]' from client.
          const images: File[] = [];
          const imgFieldsCombined = [...form.getAll('image'), ...form.getAll('image[]')];
          for (const it of imgFieldsCombined) {
            if (it instanceof File) images.push(it);
          }
          if (images.length === 0) {
            return new Response(JSON.stringify({ error: 'At least one image is required' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }

          const background = form.get('background'); // 'auto' | 'transparent' | 'opaque' (gpt-image-1 only)
          const n = form.get('n');
          const output_format = form.get('output_format'); // 'png' | 'jpeg' | 'webp' (gpt-image-1 only)
          const size = form.get('size'); // gpt-image-1: 1024x1024 | 1536x1024 | 1024x1536 | auto; dall-e-2: 256|512|1024
          let model = String(form.get('model') || 'gpt-image-1').toLowerCase();
          if (model !== 'gpt-image-1' && model !== 'dall-e-2') model = 'gpt-image-1';

          // Build outbound form-data to OpenAI
          const out = new FormData();
          out.append('model', model);
          if (model === 'gpt-image-1') {
            // Multiple images as image[]
            for (const f of images) out.append('image[]', f, f.name || 'image.png');
            out.append('prompt', prompt);
            if (background && typeof background === 'string') out.append('background', String(background));
            if (n && typeof n === 'string') out.append('n', n);
            if (output_format && typeof output_format === 'string') out.append('output_format', String(output_format));
            if (size && typeof size === 'string') out.append('size', String(size));
            // gpt-image-1 always returns base64; do not send response_format
          } else {
            // dall-e-2: single image only, size set {256x256,512x512,1024x1024}
            const first = images[0];
            out.append('image', first, first.name || 'image.png');
            out.append('prompt', prompt);
            if (n && typeof n === 'string') out.append('n', n);
            const allowedSizes = new Set(['256x256','512x512','1024x1024']);
            if (size && typeof size === 'string' && allowedSizes.has(String(size))) {
              out.append('size', String(size));
            } else {
              out.append('size', '1024x1024');
            }
            out.append('response_format', 'url');
            // Do not send background/output_format for dall-e-2
          }

          const oiRes = await fetch('https://api.openai.com/v1/images/edits', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${env.OPENAI_API_KEY}`,
              // Content-Type will be set automatically for multipart/form-data
            },
            body: out,
          });
          if (!oiRes.ok) {
            const err = await oiRes.text().catch(() => '');
            return new Response(JSON.stringify({ error: `OpenAI API error: ${oiRes.status} ${oiRes.statusText}`, detail: err }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const oiJson: any = await oiRes.json();
          const dataArr: any[] = Array.isArray(oiJson?.data) ? oiJson.data : [];
          // Normalize to urls[]: use provided url when present; otherwise convert b64_json to data URL
          const mime = (typeof output_format === 'string' && output_format) ? `image/${output_format === 'jpeg' ? 'jpeg' : output_format}` : 'image/png';
          const urls: string[] = dataArr.map((d: any) => {
            if (d?.url) return String(d.url);
            if (d?.b64_json) return `data:${mime};base64,${d.b64_json}`;
            return '';
          }).filter(Boolean);

          return new Response(JSON.stringify({ urls }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Internal error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
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
            '당신은 주어진 한국어/영어 텍스트에서 화자와 내레이션을 분리하여 JSON을 만드는 도우미입니다.',
            '규칙:',
            '- 대화만 추출하지 말고, 대화가 아닌 모든 텍스트(지문/서술)를 반드시 내레이션으로 포함하세요.',
            '- 대화와 내레이션이 섞여 있으면 각각 분리하여 순서대로 나열합니다.',
            '- 내레이션(서술자, 지문)은 name을 "Narrator"로 설정합니다.',
            '- 같은 화자가 연속으로 말하는 구간은 하나의 엔트리로 묶습니다.',
            '- 등장인물의 이름을 문맥에서 유추할 수 있으면 name에 기록합니다. 유추가 어렵다면 "Unknown#1"처럼 넘버링합니다.',
            '- gender는 male | female | unknown 중 하나로 표기합니다. 확실치 않다면 unknown.',
            '- extra에는 직업/관계/연령대 등 확실히 추정 가능한 보조 정보를 간략히 기술(불확실하면 생략).',
            '- directive(발성 지침)는 반드시 포함합니다. 문맥상 유추가 어려우면 "Neutral, clear, medium pace." 같이 중립적 지침을 사용하세요.',
            '- 결과는 반드시 다음 스키마의 JSON만 출력합니다: { "prompts": [ { "text": string, "name": string, "gender": "male"|"female"|"unknown", "extra": string, "directive": string } ] }',
            '- 마크다운 코드펜스나 설명 텍스트 없이 JSON만 반환합니다.'
          ].join('\n');

          const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
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
          // Normalize output to ensure directive exists and fields are sanitized
          const normalized = {
            prompts: parsed.prompts.map((p: any) => {
              const text = typeof p?.text === 'string' ? p.text : String(p?.text ?? '');
              const name = typeof p?.name === 'string' && p.name.trim() ? p.name.trim() : 'Unknown';
              let gender = typeof p?.gender === 'string' ? String(p.gender).toLowerCase() : 'unknown';
              if (!['male', 'female', 'unknown'].includes(gender)) gender = 'unknown';
              const extra = typeof p?.extra === 'string' ? p.extra : '';
              const directive = typeof p?.directive === 'string' && p.directive.trim() ? p.directive.trim() : 'Neutral, clear, medium pace.';
              return { text, name, gender, extra, directive };
            })
          };
          return new Response(JSON.stringify(normalized), {
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
