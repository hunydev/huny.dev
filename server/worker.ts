/// <reference types="@cloudflare/workers-types" />

// The SSR entry is built via `vite build --ssr` (Vite v6)
// Importing here lets Wrangler bundle it into the worker.
import { render } from '../dist/server/entry-server.js';

export interface Env {
  ASSETS: Fetcher;
  R2: R2Bucket;
  GEMINI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  PB_LOGIN_EMAIL?: string;
  PB_LOGIN_PASSWORD?: string;
  NOTION_BOOKMARK_ID?: string;
  NOTION_PRIVATE_API_SECRET?: string;
  NOTION_API_VERSION?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 0) Example API routes (you can expand later)
    if (url.pathname.startsWith('/api/')) {
      // PocketBase auth: issue service token using server-side credentials
      if (url.pathname === '/api/pb-token') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        if (!env.PB_LOGIN_EMAIL || !env.PB_LOGIN_PASSWORD) {
          return new Response(JSON.stringify({ error: 'PB_LOGIN_EMAIL/PB_LOGIN_PASSWORD must be set on server.' }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
        try {
          const res = await fetch('https://pb.huny.dev/api/collections/users/auth-with-password', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ identity: env.PB_LOGIN_EMAIL, password: env.PB_LOGIN_PASSWORD }),
          });
          const js: any = await res.json().catch(() => ({}));
          if (!res.ok) {
            return new Response(JSON.stringify({ error: `PB login failed: ${res.status} ${res.statusText}`, detail: js }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const token = String(js?.token || '');
          if (!token) {
            return new Response(JSON.stringify({ error: 'PB login did not return token', detail: js }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          return new Response(JSON.stringify({ token, authHeader: `Bearer ${token}`, record: js?.record || null }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'PB login error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }
      // UI Clone: accept an image and return single-file HTML (inline CSS) via Gemini
      if (url.pathname === '/api/ui-clone') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        if (!env.GEMINI_API_KEY) {
          return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
        try {
          const form = await request.formData();
          const img = form.get('image');
          if (!img || typeof (img as any).arrayBuffer !== 'function') {
            return new Response(JSON.stringify({ error: 'Missing image' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }
          const constraints: string = typeof form.get('constraints') === 'string' ? String(form.get('constraints')) : '';
          const file = img as File;
          const mime = (file.type && /image\//.test(file.type)) ? file.type : 'image/png';
          const buf = new Uint8Array(await file.arrayBuffer());
          const b64 = u8ToB64(buf);

          const instructions = [
            'You transform a UI screenshot into production-ready HTML/CSS (and minimal JS only if absolutely necessary).',
            'Output policy: STRICT JSON ONLY — { "html": string } with no markdown/code fences.',
            'HTML requirements:',
            '- Single self-contained .html. Inline all CSS using <style> in <head>. No external links, no remote fonts/images, no CDN.',
            '- Do not embed the uploaded image; instead reconstruct layout with semantic HTML and CSS (Flex/Grid/Positioning).',
            '- Reasonable defaults: system fonts (e.g., -apple-system, Segoe UI, Roboto). Reset/normalize styles if needed.',
            '- Include minimal responsive behavior where straightforward. Approximate colors/spacing/typography.',
            '- If icons/illustrations are essential, use simple CSS shapes or inline SVG placeholders.',
            '- Avoid frameworks. No analytics. No script unless needed for minor interactivity.',
            'Return only valid HTML in the html field. It should render standalone and visually match the screenshot as closely as practical.',
          ].join('\n');

          const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
          const aiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-goog-api-key': env.GEMINI_API_KEY! },
            body: JSON.stringify({
              contents: [
                { parts: [
                  { text: instructions },
                  { inlineData: { mimeType: mime, data: b64 } },
                  ...(constraints ? [ { text: `CONSTRAINTS:\n${constraints}` } ] : []),
                ]}
              ],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
            }),
          });
          if (!aiRes.ok) {
            const errText = await aiRes.text().catch(() => '');
            return new Response(JSON.stringify({ error: `Gemini error: ${aiRes.status} ${aiRes.statusText}`, detail: errText }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const data: any = await aiRes.json();
          const raw: string = ((data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [])
            .map((p: any) => p?.text || '')
            .join('');
          const jsonStr = extractJsonString(raw);
          let parsed: any = {};
          try { parsed = JSON.parse(jsonStr); } catch { parsed = {}; }
          const html: string = typeof parsed?.html === 'string' ? parsed.html : '';
          return new Response(JSON.stringify({ html }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Internal error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }
      // PocketBase token refresh (client supplies Authorization header)
      if (url.pathname === '/api/pb-refresh') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        const auth = request.headers.get('authorization') || request.headers.get('Authorization') || '';
        if (!auth) {
          return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
            status: 400,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
        try {
          const res = await fetch('https://pb.huny.dev/api/collections/users/auth-refresh', {
            method: 'POST',
            headers: { 'authorization': auth },
          });
          const js: any = await res.json().catch(() => ({}));
          if (!res.ok) {
            return new Response(JSON.stringify({ error: `PB refresh failed: ${res.status} ${res.statusText}`, detail: js }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const token = String(js?.token || '');
          if (!token) {
            return new Response(JSON.stringify({ error: 'PB refresh did not return token', detail: js }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          return new Response(JSON.stringify({ token, authHeader: `Bearer ${token}`, record: js?.record || null }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'PB refresh error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }
      // R2 Docs tree listing
      if (url.pathname === '/api/docs-tree') {
        if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });
        try {
          const keys: string[] = [];
          let cursor: string | undefined = undefined;
          for (let safety = 0; safety < 100; safety++) {
            const list = await env.R2.list({ prefix: 'docs/', cursor, limit: 1000 });
            for (const obj of list.objects || []) {
              const k = obj.key || '';
              // only include HTML files
              if (k.toLowerCase().endsWith('.html')) keys.push(k);
            }
            if (list.truncated && list.cursor) {
              cursor = list.cursor;
            } else {
              break;
            }
          }
          return new Response(JSON.stringify({ keys }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'R2 list error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }

      // Notion Bookmarks proxy: secure server-side call to Notion Data Source Query API
      if (url.pathname === '/api/bookmarks') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        if (!env.NOTION_BOOKMARK_ID || !env.NOTION_PRIVATE_API_SECRET) {
          return new Response(JSON.stringify({ error: 'NOTION_BOOKMARK_ID/NOTION_PRIVATE_API_SECRET must be set on server.' }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
        try {
          const incoming = await request.json<any>().catch(() => ({} as any));
          const baseUrl = `https://api.notion.com/v1/data_sources/${encodeURIComponent(env.NOTION_BOOKMARK_ID)}/query`;
          const headers: Record<string, string> = {
            'content-type': 'application/json',
            'authorization': `Bearer ${env.NOTION_PRIVATE_API_SECRET}`,
            // Use provided Notion API version from env; fallback to a recent default
            'Notion-Version': env.NOTION_API_VERSION || '2024-08-27',
          };

          const pageSize = typeof incoming?.page_size === 'number' ? incoming.page_size : 100;
          let cursor: string | undefined = typeof incoming?.start_cursor === 'string' ? incoming.start_cursor : undefined;
          // The filter body may include complex conditions; pass-through under root
          const queryRoot = { ...incoming } as any;
          delete queryRoot.start_cursor; // handled separately
          delete queryRoot.page_size; // we will set explicitly

          const allResults: any[] = [];
          for (let safety = 0; safety < 20; safety++) { // pagination safety cap
            const payload: any = { ...queryRoot, page_size: pageSize };
            if (cursor) payload.start_cursor = cursor;
            const res = await fetch(baseUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify(payload),
            });
            const text = await res.text();
            let js: any = {};
            try { js = text ? JSON.parse(text) : {}; } catch { js = {}; }
            if (!res.ok) {
              const msg = (js && js.message) ? js.message : `Notion query failed: ${res.status}`;
              return new Response(JSON.stringify({ error: msg, detail: js }), {
                status: 502,
                headers: { 'content-type': 'application/json; charset=UTF-8' },
              });
            }
            const results: any[] = Array.isArray(js?.results) ? js.results : [];
            allResults.push(...results);
            if (js?.has_more && js?.next_cursor) {
              cursor = String(js.next_cursor);
            } else {
              break;
            }
          }
          return new Response(JSON.stringify({ results: allResults }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Notion proxy error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ ok: true, time: new Date().toISOString() }), {
          headers: { 'content-type': 'application/json; charset=UTF-8' },
        });
      }
      // Text to Phoneme: normalize input text then produce Korean G2P in a single shot
      if (url.pathname === '/api/text-to-phoneme') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        if (!env.GEMINI_API_KEY) {
          return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
        try {
          const body = await request.json<any>().catch(() => ({} as any));
          const text: string = typeof body?.text === 'string' ? body.text : '';
          const lang: string = typeof body?.lang === 'string' ? body.lang : 'ko';
          if (!text.trim()) {
            return new Response(JSON.stringify({ error: 'Missing text' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }
          // Compose instruction for single-response JSON with normalized + g2p (context-aware Korean rules)
          const instructions = [
            '당신은 텍스트를 한국어 발화 기준으로 전처리하고 발음 표기(G2P)까지 수행합니다.',
            '출력은 JSON ONLY (설명/마크다운 금지).',
            '스키마: { "normalized": string, "g2p": string }',
            '규칙(중요):',
            '- 의미를 보존하면서 숫자, 날짜, 단위, 기호, 영어/외래어/약어 등을 표준국어 맞춤법과 띄어쓰기에 맞게 자연스럽게 변환합니다.',
            '- 문맥에 따라 고유어 수사(하나, 둘, 셋, 넷, 다섯, 여섯, 일곱, 여덟, 아홉, 열, 스무, 서른, 마흔...)와 한자어 수사(일, 이, 삼, 사, 오, 육, 칠, 팔, 구, 십, 이십...)를 올바르게 선택합니다.',
            '- 다음과 같은 경우 고유어 수사를 우선 사용합니다: 횟수(번), 사람 수(명/분), 개수(개), 권, 살(나이), 마리, 시간의 "시"(1~12).',
            '- 다음은 보통 한자어 수사를 사용합니다: 년/월/일(날짜), 분/초, 층, 학년, 호, 쪽/페이지, 원(금액), 회(횟수 표기), SI 단위(미터, 킬로그램 등).',
            '- 서수 "번째"는 보통 고유어 수사를 사용합니다. (예: 1번째 → 첫 번째, 10번째 → 열 번째, 20번째 → 스무 번째)',
            '- 고유어 수 앞에서는 축약형을 사용합니다: 하나/둘/셋/넷 → 한/두/세/네. (예: 1개 → 한 개, 2명 → 두 명, 3권 → 세 권, 4시 → 네 시)',
            '- 20의 고유어는 "스무"를 씁니다: 20살 → 스무 살, 20번째 → 스무 번째.',
            '- 시간의 "시"는 일반적으로 1~12까지 고유어 수를 사용합니다: 한 시, 두 시, 세 시, ... , 열두 시. (분/초는 한자어 수: 이십 분, 삼십 초)',
            '- 식별자/번호/코드/주소 등은 숫자/한자어 수를 보존합니다: 버스 10번, 101호, 12번 출구, 201동, 101번지, 3호선, 24시 편의점 등은 숫자를 유지합니다.',
            '- 예: "질문을 10번 했다" → "질문을 열 번 했다"; "사과 2개" → "사과 두 개"; "10살" → "열 살"; "10세" → "십 세"; "오전 10시 20분" → "오전 열 시 이십 분"; "1992년" → "천구백구십이년"; "10층" → "십 층".',
            '- 고유명사/모델명/코드 등 맥락상 숫자 전환이 부적절한 경우는 보존합니다. (예: iPhone 13 → 아이폰 13)',
            '- 영어/약어는 한국어 표준 표기에 맞게 변환합니다. (bus → 버스, AI → 에이아이)',
            '- 띄어쓰기는 표준에 맞춰 조정합니다. (한 번/두 개/열 시 등)',
            '- normalized는 사람이 읽기 쉬운 표기, g2p는 한국어 발음에 맞춘 표기(연음, 동화, 경음화 등 일반적 음운 변동 반영)입니다.',
            `- 입력 언어 힌트: ${lang}`,
          ].join('\n');

          const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
          const aiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': env.GEMINI_API_KEY!,
            },
            body: JSON.stringify({
              contents: [ { parts: [ { text: instructions }, { text: `INPUT:\n${text}` } ] } ],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
            }),
          });
          if (!aiRes.ok) {
            const errText = await aiRes.text().catch(() => '');
            return new Response(JSON.stringify({ error: `Gemini error: ${aiRes.status} ${aiRes.statusText}`, detail: errText }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const out: any = await aiRes.json();
          const raw: string = ((out && out.candidates && out.candidates[0] && out.candidates[0].content && out.candidates[0].content.parts) || [])
            .map((p: any) => p?.text || '')
            .join('');
          const jsonStr = extractJsonString(raw);
          let parsed: any = {};
          try { parsed = JSON.parse(jsonStr); } catch { parsed = {}; }
          const normalized: string = typeof parsed?.normalized === 'string' ? parsed.normalized : '';
          const g2p: string = typeof parsed?.g2p === 'string' ? parsed.g2p : '';
          return new Response(JSON.stringify({ normalized, g2p }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Internal error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }
      // Worker code generator: return only JS function body string for calc(params)
      if (url.pathname === '/api/worker-codegen') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        if (!env.GEMINI_API_KEY) {
          return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
        try {
          const body = await request.json<any>().catch(() => ({} as any));
          const prompt: string = typeof body?.prompt === 'string' ? body.prompt : '';
          const fnName: string = typeof body?.fnName === 'string' && body.fnName.trim() ? body.fnName.trim() : 'calc';
          const params: string = typeof body?.params === 'string' ? body.params : 'n';
          if (!prompt.trim()) {
            return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }

          const instructions = [
            'You generate ONLY a JavaScript function body that will run inside a sandboxed Web Worker.',
            'Constraints:',
            `- The function name is fixed as ${fnName}(...) and is provided by the host; you MUST output ONLY the function body (no function signature, no braces).`,
            `- Parameters of the function are: (${params}). Do not include the signature; just use these names as variables inside the body.`,
            '- The body MUST include a return statement. Return final result only.',
            '- Do not use imports, top-level declarations that leak state across calls, fetch, eval, postMessage, setTimeout, or DOM APIs.',
            '- Pure computations and simple data structures only.',
            '- Output MUST be strict JSON in the form: { "body": string } with no markdown fences or commentary.',
          ].join('\n');

          const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
          const aiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': env.GEMINI_API_KEY!,
            },
            body: JSON.stringify({
              contents: [ { parts: [ { text: instructions }, { text: `INPUT (describe desired logic):\n${prompt}` } ] } ],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          });
          if (!aiRes.ok) {
            const errText = await aiRes.text().catch(() => '');
            return new Response(JSON.stringify({ error: `Gemini error: ${aiRes.status} ${aiRes.statusText}`, detail: errText }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const data: any = await aiRes.json();
          const raw: string = ((data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [])
            .map((p: any) => p?.text || '')
            .join('');
          const jsonStr = extractJsonString(raw);
          let parsed: any;
          try { parsed = JSON.parse(jsonStr); } catch { return new Response(JSON.stringify({ error: 'Failed to parse AI JSON', raw: raw }), { status: 500, headers: { 'content-type': 'application/json; charset=UTF-8' } }); }
          const bodyText: string = typeof parsed?.body === 'string' ? parsed.body : '';
          if (!bodyText || !/return\s+/m.test(bodyText)) {
            return new Response(JSON.stringify({ error: 'AI did not return a valid function body with return.' }), { status: 500, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }
          return new Response(JSON.stringify({ body: bodyText }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Internal error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }
      // To-do Generator: build a two-level checklist using Gemini
      if (url.pathname === '/api/todo-generator') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        if (!env.GEMINI_API_KEY) {
          return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
        try {
          const body = await request.json<any>().catch(() => ({} as any));
          const prompt: string = typeof body?.prompt === 'string' ? body.prompt : '';
          const maxItems: number = typeof body?.max_items === 'number' ? Math.max(1, Math.min(100, body.max_items)) : 30;
          if (!prompt.trim()) {
            return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }
          // Instruction: return strict JSON with depth <= 2
          const instructions = [
            'You generate a structured to-do checklist from a short description.',
            'Rules:',
            '- Output MUST be JSON only, no commentary, no markdown fences.',
            '- Use this schema: { "tasks": [ { "title": string, "children": [ { "title": string } ] } ] }',
            '- Depth MUST be at most 2 (top-level + one level of children).',
            '- Provide as many actionable items as reasonably possible (up to a practical limit).',
            '- Titles should be concise, imperative, and self-contained. Avoid emojis.',
            `- Aim for up to ${maxItems} total leaf items if reasonable.`,
          ].join('\n');

          const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
          const aiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': env.GEMINI_API_KEY!,
            },
            body: JSON.stringify({
              contents: [ { parts: [ { text: instructions }, { text: `INPUT:\n${prompt}` } ] } ],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          });
          if (!aiRes.ok) {
            const errText = await aiRes.text().catch(() => '');
            return new Response(JSON.stringify({ error: `Gemini error: ${aiRes.status} ${aiRes.statusText}`, detail: errText }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const out: any = await aiRes.json();
          const raw: string = ((out && out.candidates && out.candidates[0] && out.candidates[0].content && out.candidates[0].content.parts) || [])
            .map((p: any) => p?.text || '')
            .join('');
          const jsonStr = extractJsonString(raw);
          let parsed: any = {};
          try { parsed = JSON.parse(jsonStr); } catch { parsed = {}; }
          const tasksIn: any[] = Array.isArray(parsed?.tasks) ? parsed.tasks : [];
          // Sanitize to enforce depth <= 2 and title strings
          const norm = (arr: any[]): Array<{ title: string; children?: Array<{ title: string }> }> => {
            const out: Array<{ title: string; children?: Array<{ title: string }> }> = [];
            for (const it of (arr || [])) {
              const title = typeof it?.title === 'string' ? it.title.trim() : '';
              if (!title) continue;
              const childrenIn = Array.isArray(it?.children) ? it.children : [];
              const children = childrenIn
                .map((c: any) => ({ title: typeof c?.title === 'string' ? c.title.trim() : '' }))
                .filter((c: any) => c.title)
                .slice(0, 50);
              out.push({ title, ...(children.length ? { children } : {}) });
            }
            return out.slice(0, 100);
          };
          const tasks = norm(tasksIn);
          return new Response(JSON.stringify({ tasks }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Internal error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }
      if (url.pathname === '/api/multivoice-tts') {
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
          const model: string = typeof body?.model === 'string' ? body.model : 'gemini-2.5-flash-preview-tts';
          const prompts: Array<{ text: string; name: string; gender?: string; directive?: string }>
            = Array.isArray(body?.prompts) ? body.prompts : [];
          // Optional 2-speaker convenience fields (used only if unique speakers <= 2)
          let speakerALabel: string = typeof body?.speakerALabel === 'string' && body.speakerALabel.trim() ? body.speakerALabel.trim() : 'Narrator';
          let speakerBLabel: string = typeof body?.speakerBLabel === 'string' && body.speakerBLabel.trim() ? body.speakerBLabel.trim() : 'Speaker';
          let voiceAName: string = typeof body?.voiceAName === 'string' ? body.voiceAName : 'Gacrux';
          let voiceBName: string = typeof body?.voiceBName === 'string' ? body.voiceBName : 'Puck';
          const mapping: string = typeof body?.mapping === 'string' ? body.mapping : 'narration_vs_others';
          const voiceMapIn: Record<string, string> = (body && typeof body.voiceMap === 'object' && body.voiceMap) ? body.voiceMap : {};

          if (prompts.length === 0) {
            return new Response(JSON.stringify({ error: 'Missing prompts' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }
          const allowedModels = ['gemini-2.5-flash-preview-tts','gemini-2.5-pro-preview-tts'];
          const ttsModel = allowedModels.includes(model) ? model : 'gemini-2.5-flash-preview-tts';

          // Validate voice names against provided catalog
          const FEMALE = ['Zephyr','Kore','Leda','Aoede','Callirrhoe','Autonoe','Despina','Erinome','Laomedeia','Achernar','Gacrux','Pulcherrima','Vindemiatrix','Sulafat'];
          const MALE = ['Puck','Charon','Fenrir','Orus','Enceladus','Iapetus','Umbriel','Algieba','Algenib','Rasalgethi','Alnilam','Schedar','Achird','Zubenelgenubi','Sadachbia','Sadaltager'];
          const ALL = new Set([...FEMALE, ...MALE]);
          if (!ALL.has(voiceAName)) voiceAName = 'Gacrux';
          if (!ALL.has(voiceBName)) voiceBName = 'Puck';

          // Normalize prompts
          type Item = { text: string; name: string; gender?: string; directive?: string };
          const norm: Item[] = prompts.map(p => ({
            text: typeof p?.text === 'string' ? p.text : String(p?.text ?? ''),
            name: typeof p?.name === 'string' && p.name.trim() ? p.name.trim() : 'Unknown',
            gender: typeof p?.gender === 'string' ? String(p.gender).toLowerCase() : 'unknown',
            directive: typeof p?.directive === 'string' ? p.directive.trim() : '',
          }));

          // Build voiceMap per unique speaker (from client or auto-assigned)
          const uniqueNames: string[] = [];
          for (const it of norm) {
            const nm = it.name;
            if (!uniqueNames.includes(nm)) uniqueNames.push(nm);
          }
          const voiceMap: Record<string, string> = {};
          let fIdx = 0, mIdx = 0, uIdx = 0;
          for (const nm of uniqueNames) {
            const first = norm.find(i => i.name === nm);
            let chosen = voiceMapIn[nm];
            if (!chosen || !ALL.has(chosen)) {
              const g = String(first?.gender || 'unknown').toLowerCase();
              if (g === 'female') chosen = FEMALE[fIdx++ % FEMALE.length];
              else if (g === 'male') chosen = MALE[mIdx++ % MALE.length];
              else chosen = [...FEMALE, ...MALE][uIdx++ % (FEMALE.length + MALE.length)];
            }
            voiceMap[nm] = chosen;
          }

          // reuse ttsModel defined above
          const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(ttsModel)}:generateContent`;

          // Helper: extract inlineData audio from response
          const extractAudio = async (resp: Response) => {
            if (!resp.ok) {
              const errText = await resp.text().catch(() => '');
              return { ok: false as const, error: `Gemini TTS error: ${resp.status} ${resp.statusText}`, detail: errText };
            }
            const js: any = await resp.json();
            const cand = Array.isArray(js?.candidates) ? js.candidates : [];
            let data = '';
            let mimeType = '';
            for (const c of cand) {
              const parts = c?.content?.parts || [];
              for (const p of parts) {
                if (p?.inlineData?.data) {
                  data = String(p.inlineData.data);
                  mimeType = String(p.inlineData.mimeType || 'audio/raw;rate=24000');
                  break;
                }
              }
              if (data) break;
            }
            if (!data) return { ok: false as const, error: 'No audio returned from Gemini TTS', detail: js };
            return { ok: true as const, data, mimeType };
          };

          // If unique speakers <= 2, try multi-speaker path (single shot)
          if (uniqueNames.length <= 2) {
            // Determine labels and voices
            let labels = uniqueNames.slice();
            if (labels.length === 1) labels = [labels[0], speakerBLabel];
            const vA = voiceMap[labels[0]] || voiceAName;
            const vB = voiceMap[labels[1]] || voiceBName;
            const speakerVoiceConfigs = [
              { speaker: labels[0], voiceConfig: { prebuiltVoiceConfig: { voiceName: ALL.has(vA) ? vA : 'Gacrux' } } },
              { speaker: labels[1], voiceConfig: { prebuiltVoiceConfig: { voiceName: ALL.has(vB) ? vB : 'Puck' } } },
            ];

            const lines: string[] = norm.map(it => {
              const dir = it.directive ? ` (style: ${it.directive})` : '';
              return `${it.name}:${dir} ${it.text}`;
            });
            const convo = lines.join('\n');

            const ttsRes = await fetch(ttsUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': env.GEMINI_API_KEY!,
              },
              body: JSON.stringify({
                contents: [ { parts: [ { text: `TTS the following conversation as-is.\n${convo}` } ] } ],
                generationConfig: {
                  responseModalities: ['AUDIO'],
                  speechConfig: { multiSpeakerVoiceConfig: { speakerVoiceConfigs } },
                },
                model: ttsModel,
              }),
            });
            const out = await extractAudio(ttsRes);
            if (!out.ok) {
              return new Response(JSON.stringify({ error: out.error, detail: out.detail }), {
                status: 502,
                headers: { 'content-type': 'application/json; charset=UTF-8' },
              });
            }
            let sampleRate = 24000;
            const m = /rate\s*=\s*(\d{4,6})/.exec(out.mimeType);
            if (m) sampleRate = parseInt(m[1], 10);
            return new Response(JSON.stringify({ audio: out.data, sampleRate, numChannels: 1, sampleFormat: 's16le' }), {
              headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
            });
          }

          // Else: N speakers -> synthesize each line with its own voice, then merge when RAW
          const segments: Array<{ data: string; mimeType: string; sampleRate: number }>= [];
          for (const it of norm) {
            const voiceName = voiceMap[it.name] || 'Gacrux';
            const dir = it.directive ? ` (style: ${it.directive})` : '';
            const textToSpeak = `${it.text}${dir ? `\n${dir}` : ''}`;
            const singleRes = await fetch(ttsUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': env.GEMINI_API_KEY!,
              },
              body: JSON.stringify({
                contents: [ { parts: [ { text: textToSpeak } ] } ],
                generationConfig: {
                  responseModalities: ['AUDIO'],
                  speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
                },
                model: ttsModel,
              }),
            });
            const out = await extractAudio(singleRes);
            if (!out.ok) {
              return new Response(JSON.stringify({ error: out.error, detail: out.detail }), {
                status: 502,
                headers: { 'content-type': 'application/json; charset=UTF-8' },
              });
            }
            let sampleRate = 24000;
            const m = /rate\s*=\s*(\d{4,6})/.exec(out.mimeType);
            if (m) sampleRate = parseInt(m[1], 10);
            segments.push({ data: out.data, mimeType: out.mimeType, sampleRate });
          }

          // Merge (we enforce PCM 24k so conditions should always match)
          const sampleRate = segments[0]?.sampleRate || 24000;
          const bufs = segments.map(s => b64ToU8(s.data));
          let total = 0; for (const b of bufs) total += b.length;
          const merged = new Uint8Array(total);
          let offset = 0; for (const b of bufs) { merged.set(b, offset); offset += b.length; }
          const b64 = u8ToB64(merged);
          return new Response(JSON.stringify({ audio: b64, sampleRate, numChannels: 1, sampleFormat: 's16le' }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Internal error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }
      if (url.pathname === '/api/multivoice-reader') {
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
          let ttsModel: string = typeof body?.model === 'string' ? body.model : 'gemini-2.5-flash-preview-tts';
          if (!text.trim()) {
            return new Response(JSON.stringify({ error: 'Missing text' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }
          if (!['gemini-2.5-flash-preview-tts','gemini-2.5-pro-preview-tts'].includes(ttsModel)) {
            ttsModel = 'gemini-2.5-flash-preview-tts';
          }

          // 1) Segment speakers using Gemini text model (2.5-flash)
          const instructions = [
            '당신은 주어진 한국어/영어 텍스트에서 화자와 내레이션(서술)을 분리하여 멀티스피커 TTS 입력용 JSON을 생성합니다.',
            '규칙:',
            '- 대화만 추출하지 말고, 대화가 아닌 모든 텍스트(지문/서술)를 반드시 내레이션으로 포함하세요.',
            '- 대화와 내레이션이 섞여 있으면 각각 분리하여 순서대로 나열합니다.',
            '- 내레이션(서술자, 지문)은 name을 "Narrator"로 설정합니다.',
            '- 같은 화자가 연속으로 말하는 구간은 하나로 묶습니다.',
            '- 등장인물의 이름을 문맥에서 유추할 수 있으면 name에 기록합니다. 유추가 어렵다면 "Unknown#1"처럼 넘버링합니다.',
            '- gender는 male | female | unknown 중 하나로 표기합니다. 확실치 않다면 unknown.',
            '- directive에는 발화 톤/스타일을 간략히 영어로 기술합니다. 예: "Warm and calm.", "Fast and excited.", "Firm and clear."',
            'JSON 스키마: { "prompts": [ { "text": string, "name": string, "gender": "male"|"female"|"unknown", "extra": string, "directive": string } ] }',
            '마크다운 코드펜스나 설명 없이 JSON만 출력합니다.'
          ].join('\n');

          const segRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': env.GEMINI_API_KEY!,
            },
            body: JSON.stringify({
              contents: [ { parts: [ { text: instructions }, { text: `INPUT:\n${text}` } ] } ],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          });
          if (!segRes.ok) {
            const errText = await segRes.text().catch(() => '');
            return new Response(JSON.stringify({ error: `Gemini segmentation error: ${segRes.status} ${segRes.statusText}`, detail: errText }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const segJson: any = await segRes.json();
          const segRaw: string = ((segJson && segJson.candidates && segJson.candidates[0] && segJson.candidates[0].content && segJson.candidates[0].content.parts) || [])
            .map((p: any) => p?.text || '')
            .join('');
          const segStr = extractJsonString(segRaw);
          let segParsed: any;
          try {
            segParsed = JSON.parse(segStr);
          } catch {
            return new Response(JSON.stringify({ error: 'Failed to parse Gemini segmentation JSON', raw: segRaw }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const items: Array<{ text: string; name: string; gender?: string; directive?: string }> = Array.isArray(segParsed?.prompts) ? segParsed.prompts : [];
          if (items.length === 0) {
            return new Response(JSON.stringify({ error: 'No prompts returned from Gemini segmentation' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }

          // 2) Choose voices per speaker using provided catalog
          const FEMALE = ['Zephyr','Kore','Leda','Aoede','Callirrhoe','Autonoe','Despina','Erinome','Laomedeia','Achernar','Gacrux','Pulcherrima','Vindemiatrix','Sulafat'];
          const MALE = ['Puck','Charon','Fenrir','Orus','Enceladus','Iapetus','Umbriel','Algieba','Algenib','Rasalgethi','Alnilam','Schedar','Achird','Zubenelgenubi','Sadachbia','Sadaltager'];
          const pickFrom = (arr: string[], idx: number) => arr[idx % arr.length];
          const uniqueNames: string[] = [];
          for (const it of items) {
            const nm = (it?.name || 'Unknown').trim();
            if (!uniqueNames.includes(nm)) uniqueNames.push(nm);
          }
          const speakerVoiceMap = new Map<string, string>();
          let fIdx = 0, mIdx = 0, uIdx = 0;
          for (const nm of uniqueNames) {
            const first = items.find(i => (i?.name || '').trim() === nm);
            const g = String(first?.gender || 'unknown').toLowerCase();
            if (g === 'female') speakerVoiceMap.set(nm, pickFrom(FEMALE, fIdx++));
            else if (g === 'male') speakerVoiceMap.set(nm, pickFrom(MALE, mIdx++));
            else speakerVoiceMap.set(nm, pickFrom([...FEMALE, ...MALE], uIdx++));
          }

          const speakerVoiceConfigs = uniqueNames.map(nm => ({
            speaker: nm,
            voiceConfig: { prebuiltVoiceConfig: { voiceName: speakerVoiceMap.get(nm)! } }
          }));

          // 3) Build conversation text with optional directive hints
          const lines = items.map((it) => {
            const nm = (it?.name || 'Unknown').trim();
            const dir = (typeof it?.directive === 'string' && it.directive.trim()) ? ` (style: ${it.directive.trim()})` : '';
            const txt = typeof it?.text === 'string' ? it.text : String(it?.text ?? '');
            return `${nm}:${dir} ${txt}`;
          });
          const convo = lines.join('\n');

          // 4) Call Gemini TTS multi-speaker API
          const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(ttsModel)}:generateContent`;
          const ttsRes = await fetch(ttsUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': env.GEMINI_API_KEY!,
            },
            body: JSON.stringify({
              contents: [ { parts: [ { text: `TTS the following conversation as-is.\n${convo}` } ] } ],
              generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  multiSpeakerVoiceConfig: { speakerVoiceConfigs }
                }
              },
              model: ttsModel,
            }),
          });
          if (!ttsRes.ok) {
            const errText = await ttsRes.text().catch(() => '');
            return new Response(JSON.stringify({ error: `Gemini TTS error: ${ttsRes.status} ${ttsRes.statusText}`, detail: errText }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const ttsJson: any = await ttsRes.json();
          // Find first inlineData part
          let b64 = '';
          let mimeType = '';
          const cand = Array.isArray(ttsJson?.candidates) ? ttsJson.candidates : [];
          for (const c of cand) {
            const parts = c?.content?.parts || [];
            for (const p of parts) {
              if (p?.inlineData?.data) {
                b64 = String(p.inlineData.data);
                mimeType = String(p.inlineData.mimeType || 'audio/raw;rate=24000');
                break;
              }
            }
            if (b64) break;
          }
          if (!b64) {
            return new Response(JSON.stringify({ error: 'No audio returned from Gemini TTS', raw: ttsJson }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          // Derive sampleRate from mimeType if possible
          let sampleRate = 24000;
          const m = /rate\s*=\s*(\d{4,6})/.exec(mimeType);
          if (m) sampleRate = parseInt(m[1], 10);

          return new Response(JSON.stringify({ audio: b64, sampleRate, numChannels: 1, sampleFormat: 's16le' }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Internal error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
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

    // Special route: dynamic sitemap.xml with automated lastmod
    if (url.pathname === '/sitemap.xml') {
      try {
        const lastmod = new Date().toISOString().slice(0, 10);
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          '  <url>',
          '    <loc>https://huny.dev/</loc>',
          `    <lastmod>${lastmod}</lastmod>`,
          '    <changefreq>weekly</changefreq>',
          '    <priority>1.0</priority>',
          '  </url>',
          '</urlset>',
          ''
        ].join('\n');
        return new Response(xml, {
          headers: {
            'content-type': 'application/xml; charset=UTF-8',
            'cache-control': 'public, max-age=3600',
          },
        });
      } catch (e) {
        return new Response('Internal error', { status: 500 });
      }
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
        const html = await render(request.url, manifestData);
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

// Base64 helpers for Cloudflare Workers environment
function b64ToU8(b64: string): Uint8Array {
  const bin = atob(b64);
  const len = bin.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

function u8ToB64(u8: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin);
}
