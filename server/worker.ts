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
  ENC_SECRET?: string;
}

const JSON_CONTENT_HEADER = { 'content-type': 'application/json; charset=UTF-8' } as const;
const NO_STORE_CACHE_CONTROL = 'no-store';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MiB
const ALLOWED_IMAGE_MIME_TYPES = new Set<string>([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const FEMALE_VOICES = [
  'Zephyr',
  'Kore',
  'Leda',
  'Aoede',
  'Callirrhoe',
  'Autonoe',
  'Despina',
  'Erinome',
  'Laomedeia',
  'Achernar',
  'Gacrux',
  'Pulcherrima',
  'Vindemiatrix',
  'Sulafat',
] as const;

const MALE_VOICES = [
  'Puck',
  'Charon',
  'Fenrir',
  'Orus',
  'Enceladus',
  'Iapetus',
  'Umbriel',
  'Algieba',
  'Algenib',
  'Rasalgethi',
  'Alnilam',
  'Schedar',
  'Achird',
  'Zubenelgenubi',
  'Sadachbia',
  'Sadaltager',
] as const;

const ALL_VOICES: readonly string[] = Array.from(new Set<string>([...FEMALE_VOICES, ...MALE_VOICES]));

const VOICE_TRAITS: Record<string, string> = {
  Zephyr: 'Bright and uplifting',
  Kore: 'Firm and resolute',
  Leda: 'Youthful and energetic',
  Aoede: 'Breezy and light-hearted',
  Callirrhoe: 'Laid-back and relaxed',
  Autonoe: 'Cheerful and sunny',
  Despina: 'Smooth and composed',
  Erinome: 'Clear and radiant',
  Laomedeia: 'Bubbly and exciting',
  Achernar: 'Soft and gentle',
  Gacrux: 'Mature and confident',
  Pulcherrima: 'Forward and expressive',
  Vindemiatrix: 'Gentle and kind',
  Sulafat: 'Warm and comforting',
  Puck: 'Playful and upbeat',
  Charon: 'Informative and guiding',
  Fenrir: 'Excitable and animated',
  Orus: 'Firm and authoritative',
  Enceladus: 'Breathy and intimate',
  Iapetus: 'Clear and articulate',
  Umbriel: 'Relaxed and easygoing',
  Algieba: 'Smooth and polished',
  Algenib: 'Gravelly and textured',
  Rasalgethi: 'Helpful and informative',
  Alnilam: 'Grounded and firm',
  Schedar: 'Even and measured',
  Achird: 'Friendly and approachable',
  Zubenelgenubi: 'Casual and conversational',
  Sadachbia: 'Lively and energetic',
  Sadaltager: 'Knowledgeable and erudite',
};

type JsonResponseOptions = {
  cacheControl?: string;
};

function jsonResponse(status: number, body: Record<string, unknown>, options?: JsonResponseOptions): Response {
  const headers: Record<string, string> = { ...JSON_CONTENT_HEADER };
  if (options?.cacheControl) {
    headers['cache-control'] = options.cacheControl;
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function errorJson(status: number, message: string, detail?: unknown): Response {
  const payload: Record<string, unknown> = { error: message };
  if (detail !== undefined) {
    payload.detail = detail;
  }
  return jsonResponse(status, payload);
}

const toMiB = (bytes: number) => Math.round((bytes / (1024 * 1024)) * 10) / 10;

function validateImageFile(
  file: File,
  { maxBytes = MAX_IMAGE_BYTES, allowedMimeTypes = ALLOWED_IMAGE_MIME_TYPES }: { maxBytes?: number; allowedMimeTypes?: Set<string> } = {},
): string | undefined {
  if (!file || typeof file.size !== 'number') {
    return '이미지 파일을 찾을 수 없습니다.';
  }
  if (file.size === 0) {
    return '이미지 파일이 비어 있습니다.';
  }
  if (file.size > maxBytes) {
    return `이미지 파일 크기가 ${toMiB(maxBytes)}MB를 초과했습니다.`;
  }
  const mime = (file.type || '').toLowerCase();
  if (mime && !allowedMimeTypes.has(mime)) {
    return `지원하지 않는 이미지 형식입니다: ${mime}`;
  }
  return undefined;
}

async function safeJson<T = any>(request: Request, fallback: T): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    return fallback;
  }
}

type SceneCharacter = {
  name: string;
  gender: 'male' | 'female' | 'unknown';
  personality?: string;
  role?: string;
  description?: string;
};

type SceneDialogueLine = {
  speaker: string;
  line: string;
  emotion?: string;
  action?: string;
};

type SceneToScriptPayload = {
  sceneSummary?: string;
  characters?: Array<Partial<SceneCharacter>>;
  dialogue?: Array<Partial<SceneDialogueLine>>;
  notes?: string;
};

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const coerceGender = (value: unknown): SceneCharacter['gender'] => {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized.startsWith('f')) return 'female';
  if (normalized.startsWith('w')) return 'female';
  if (normalized.startsWith('m')) return 'male';
  if (normalized.startsWith('man')) return 'male';
  return 'unknown';
};

const extractFirstJsonObject = (text: string): SceneToScriptPayload | null => {
  if (!text) return null;
  // Attempt quick parse if entire string is JSON
  try {
    if (text.trim().startsWith('{')) {
      return JSON.parse(text.trim());
    }
  } catch {
    // fallthrough to regex extraction
  }
  const jsonRegex = /\{[\s\S]*\}/g;
  const match = jsonRegex.exec(text);
  if (!match) return null;
  const snippet = match[0];
  try {
    return JSON.parse(snippet);
  } catch {
    return null;
  }
};

const assignVoices = (characters: SceneCharacter[]): Record<string, string> => {
  const used = new Set<string>();
  const assignments: Record<string, string> = {};

  const pickFromPool = (pool: readonly string[]): string => {
    for (const voice of pool) {
      if (!used.has(voice)) {
        used.add(voice);
        return voice;
      }
    }
    // fallback: allow reuse if pool exhausted
    const fallback = pool[0] ?? ALL_VOICES[0];
    used.add(fallback);
    return fallback;
  };

  const ensureVoice = (character: SceneCharacter): string => {
    const base = character.gender === 'female' ? FEMALE_VOICES : character.gender === 'male' ? MALE_VOICES : ALL_VOICES;
    const voice = pickFromPool(base);
    assignments[character.name] = voice;
    return voice;
  };

  characters.forEach(character => {
    if (!assignments[character.name]) {
      ensureVoice(character);
    }
  });

  return assignments;
};

const sanitizeDialogueLines = (lines: Array<SceneDialogueLine>): Array<SceneDialogueLine> => {
  return lines
    .map(line => ({
      speaker: normalizeWhitespace(line.speaker),
      line: normalizeWhitespace(line.line),
      emotion: line.emotion ? normalizeWhitespace(line.emotion) : undefined,
      action: line.action ? normalizeWhitespace(line.action) : undefined,
    }))
    .filter(line => line.speaker && line.line);
};

const buildConversationPrompt = (dialogue: Array<SceneDialogueLine>): string => {
  const uniqueSpeakers = Array.from(new Set(dialogue.map(line => line.speaker))).filter(Boolean);
  const intro = `아래는 ${uniqueSpeakers.join(', ')} 사이의 대화입니다. 등장인물의 이름과 한국어 대사만 자연스럽게 읽어 주세요.`;
  const body = dialogue
    .map(line => {
      const emotionPart = line.emotion ? ` (감정: ${line.emotion})` : '';
      const actionPart = line.action ? ` [동작: ${line.action}]` : '';
      return `${line.speaker}:${emotionPart}${actionPart} ${line.line}`.trim();
    })
    .join('\n');
  return `${intro}\n${body}`;
};

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

      // Secure API keys: encrypt client-provided keys and return opaque cipher for storage
      if (url.pathname === '/api/secure-apikeys') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        try {
          const body = await request.json<any>().catch(() => ({} as any));
          const existing: string = typeof body?.existing === 'string' ? body.existing : '';
          let prev: any = {};
          if (existing) {
            try { prev = await decryptApiKeyPayload(existing, env) || {}; } catch { prev = {}; }
          }
          const next: any = {};
          const openaiIn: string = typeof body?.openai === 'string' ? body.openai.trim() : '';
          const geminiIn: string = typeof body?.gemini === 'string' ? body.gemini.trim() : '';
          if (openaiIn) next.openai = openaiIn; else if (prev?.openai) next.openai = prev.openai;
          if (geminiIn) next.gemini = geminiIn; else if (prev?.gemini) next.gemini = prev.gemini;
          next.ts = new Date().toISOString();
          const cipher = await encryptApiKeyPayload(next, env);
          const meta = { openai: !!next.openai, gemini: !!next.gemini };
          return new Response(JSON.stringify({ cipher, meta }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Encryption error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }

      if (url.pathname === '/api/favicon-distiller') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return errorJson(500, 'GEMINI_API_KEY is not configured on the server.');
          }

          const form = await request.formData();
          const imageFile = form.get('image');
          if (!(imageFile instanceof File)) {
            return errorJson(400, '이미지 파일을 전달해 주세요.');
          }

          const validationError = validateImageFile(imageFile);
          if (validationError) {
            return errorJson(400, validationError);
          }

          const sizesRaw = typeof form.get('sizes') === 'string' ? String(form.get('sizes')) : '[]';
          let requestedSizes: number[] = [];
          try {
            const parsed = JSON.parse(sizesRaw);
            if (Array.isArray(parsed)) {
              requestedSizes = parsed
                .map((n) => Number(n))
                .filter((n) => Number.isFinite(n) && n > 0 && n <= 512)
                .map((n) => Math.round(n));
            }
          } catch {
            requestedSizes = [];
          }
          if (requestedSizes.length === 0) {
            requestedSizes = [32, 64, 128, 256];
          }

          const formatsRaw = typeof form.get('formats') === 'string' ? String(form.get('formats')) : 'png';
          const formatSet = new Set(formatsRaw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean));
          if (!formatSet.has('png') && !formatSet.has('ico')) {
            formatSet.add('png');
          }

          const transparent = String(form.get('transparent') || '1') === '1';
          const simplifyLevel = typeof form.get('simplifyLevel') === 'string' ? String(form.get('simplifyLevel')) : 'auto';

          const sourceMime = imageFile.type && imageFile.type.startsWith('image/') ? imageFile.type : 'image/png';
          const sourceBytes = new Uint8Array(await imageFile.arrayBuffer());

          const instructions = [
            'You are a favicon designer. Simplify the provided logo or illustration into a scalable favicon glyph.',
            'Goals:',
            '- Preserve core shapes or symbols that express the brand identity.',
            '- Remove distracting small details so that the icon is legible at 32×32 pixels.',
            '- Use bold contrast, centered composition, and sufficient padding.',
            '- Prefer transparent background unless instructed otherwise.',
            '- Avoid adding text unless the original mark relies on a single character or initial.',
            'Output requirements:',
            '- Return ONE PNG image (square canvas) with alpha transparency if requested.',
            '- Recommended canvas size is 512×512 or larger.',
            `- Simplification level hint: ${simplifyLevel}.`
          ].join('\n');

          const parts: any[] = [
            { text: instructions },
            { text: `SETTINGS:\nTRANSPARENT=${transparent ? '1' : '0'}\nFORMAT=PNG\n` },
            { inline_data: { mime_type: sourceMime, data: u8ToB64(sourceBytes) } },
          ];

          const model = 'gemini-2.5-flash-image-preview';
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
          const aiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': geminiKey,
            },
            body: JSON.stringify({ contents: [ { parts } ], generationConfig: { temperature: 0.15 } }),
          });

          const aiText = await aiRes.text();
          if (!aiRes.ok) {
            return errorJson(502, `Gemini error: ${aiRes.status} ${aiRes.statusText}`, aiText);
          }

          let aiJson: any = {};
          try { aiJson = aiText ? JSON.parse(aiText) : {}; } catch { aiJson = {}; }
          const candidates: any[] = Array.isArray(aiJson?.candidates) ? aiJson.candidates : [];
          let base64Image = '';
          let baseMime = 'image/png';
          for (const cand of candidates) {
            const contentParts = cand?.content?.parts || [];
            for (const p of contentParts) {
              const data = p?.inline_data?.data || p?.inlineData?.data;
              if (data) {
                baseMime = p?.inline_data?.mime_type || p?.inlineData?.mimeType || baseMime;
                base64Image = String(data);
                break;
              }
            }
            if (base64Image) break;
          }

          if (!base64Image) {
            return errorJson(502, 'Gemini did not return an image.');
          }

          if (typeof createImageBitmap !== 'function') {
            const responseBody = {
              preview: `data:${baseMime};base64,${base64Image}`,
              source: `data:${sourceMime};base64,${u8ToB64(sourceBytes)}`,
              assets: [
                {
                  format: 'png' as const,
                  url: `data:${baseMime};base64,${base64Image}`,
                  label: 'Original PNG (runtime lacks createImageBitmap; resizing unavailable)',
                },
              ],
              message: 'createImageBitmap is not available in this runtime. Returned the simplified PNG only.',
            };
            return jsonResponse(200, responseBody, { cacheControl: NO_STORE_CACHE_CONTROL });
          }

          const simplifiedBytes = b64ToU8(base64Image);
          const simplifiedBlob = new Blob([simplifiedBytes], { type: baseMime || 'image/png' });
          const bitmap = await createImageBitmap(simplifiedBlob);

          try {
            const assets: Array<{ size?: number; format: 'png' | 'ico'; url: string; label?: string }> = [];
            const pngOutputs = new Map<number, Uint8Array>();
            const uniqueSizes = Array.from(new Set(requestedSizes.map((n) => Math.max(8, Math.min(512, n))))).sort((a, b) => a - b);

            for (const size of uniqueSizes) {
              try {
                const resized = await resizePngIcon(bitmap, size, transparent);
                pngOutputs.set(size, resized);
                if (formatSet.has('png')) {
                  assets.push({
                    size,
                    format: 'png',
                    url: `data:image/png;base64,${u8ToB64(resized)}`,
                    label: `${size}px PNG`,
                  });
                }
              } catch (err: any) {
                console.warn('resize error', err);
              }
            }

            if (formatSet.has('png')) {
              assets.unshift({
                size: bitmap.width,
                format: 'png',
                url: `data:${baseMime};base64,${base64Image}`,
                label: `${bitmap.width}×${bitmap.height} PNG (original)`,
              });
            }

            if (formatSet.has('ico')) {
              const icoInputs: Array<{ size: number; data: Uint8Array }> = [];
              const icoSizes = Array.from(pngOutputs.keys()).filter((s) => s <= 256);
              if (icoSizes.length === 0) {
                const fallbackSize = Math.min(256, bitmap.width, bitmap.height);
                if (!pngOutputs.has(fallbackSize)) {
                  const resized = await resizePngIcon(bitmap, fallbackSize, transparent);
                  pngOutputs.set(fallbackSize, resized);
                }
              }
              for (const size of Array.from(pngOutputs.keys()).filter((s) => s <= 256).sort((a, b) => a - b)) {
                const data = pngOutputs.get(size);
                if (data) {
                  icoInputs.push({ size, data });
                }
              }
              if (icoInputs.length > 0) {
                const icoBytes = makeIcoFromPngs(icoInputs);
                assets.push({
                  format: 'ico',
                  url: `data:image/x-icon;base64,${u8ToB64(icoBytes)}`,
                  label: 'favicon.ico (multi-size)',
                });
              }
            }

            const responseBody = {
              preview: `data:${baseMime};base64,${base64Image}`,
              source: `data:${sourceMime};base64,${u8ToB64(sourceBytes)}`,
              assets,
              jobId: aiJson?.usageMetadata?.candidatesTokenCount ? `gemini:${aiJson.usageMetadata.candidatesTokenCount}` : undefined,
              message: 'Favicon assets generated successfully.',
            };

            return jsonResponse(200, responseBody, { cacheControl: NO_STORE_CACHE_CONTROL });
          } finally {
            bitmap.close();
          }
        } catch (e: any) {
          console.error('favicon-distiller error', e);
          return errorJson(500, 'Internal error', String(e?.message || e));
        }
      }

      if (url.pathname === '/api/cover-crafter') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return errorJson(500, 'GEMINI_API_KEY is not configured on the server.');
          }

          const payload = await safeJson(request, {} as any);

          const rawText = typeof payload?.text === 'string' ? payload.text : '';
          const text = rawText.trim().slice(0, 5000);
          if (!text) {
            return errorJson(400, '텍스트 본문을 1자 이상 전달해 주세요.');
          }

          const variant: 'cover' | 'thumbnail' = payload?.variant === 'thumbnail' ? 'thumbnail' : 'cover';
          const ratio: 'wide' | 'square' | 'vertical' | 'story' = ['wide', 'square', 'vertical', 'story'].includes(payload?.ratio)
            ? payload.ratio
            : 'wide';
          const style: 'illustration' | 'photoreal' = payload?.style === 'photoreal' ? 'photoreal' : 'illustration';

          const variantHints = {
            cover: 'Design a cinematic hero cover that invites readers. Use balanced composition and narrative cues.',
            thumbnail: 'Craft a bold, high-impact thumbnail with strong contrast and a clear focal subject.',
          } as const;

          const ratioHints = {
            wide: 'Aspect ratio 16:9 (approx. 2048×1152).',
            square: 'Aspect ratio 1:1 (approx. 1536×1536).',
            vertical: 'Aspect ratio 4:5 (approx. 1536×1920).',
            story: 'Aspect ratio 9:16 (approx. 1536×2732).',
          } as const;

          const styleHints = {
            illustration: 'Render as a polished digital illustration with stylized shapes, smooth gradients, and expressive lighting.',
            photoreal: 'Render as a photorealistic scene with believable lighting, materials, and cinematic depth of field.',
          } as const;

          const instructions = [
            'You are an art director creating a single marketing image derived from editorial content.',
            variantHints[variant],
            ratioHints[ratio],
            styleHints[style],
            'Summarize the supplied content into key motifs, moods, and props, then visualize them clearly.',
            'Avoid overlaying text. Focus on imagery that communicates the theme at a glance.',
            'Return exactly one image as inline data and include a short (<=240 chars) textual summary of the concept.',
          ].join('\n');

          const parts: any[] = [
            { text: instructions },
            { text: `CONTENT BRIEF:\n${text}` },
          ];

          const model = 'gemini-2.5-flash-image-preview';
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
          const aiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': geminiKey,
            },
            body: JSON.stringify({
              contents: [{ role: 'user', parts }],
              generationConfig: { temperature: 0.4 },
            }),
          });

          const aiText = await aiRes.text();
          if (!aiRes.ok) {
            return errorJson(502, `Gemini error: ${aiRes.status} ${aiRes.statusText}`, aiText);
          }

          let aiJson: any = {};
          try { aiJson = aiText ? JSON.parse(aiText) : {}; } catch { aiJson = {}; }
          const candidates: any[] = Array.isArray(aiJson?.candidates) ? aiJson.candidates : [];

          let imageData = '';
          let mime = 'image/png';
          let summary = '';
          for (const cand of candidates) {
            const cparts = cand?.content?.parts || [];
            for (const part of cparts) {
              if (!imageData && (part?.inline_data?.data || part?.inlineData?.data)) {
                imageData = String(part.inline_data?.data || part.inlineData?.data || '');
                mime = part.inline_data?.mime_type || part.inlineData?.mimeType || mime;
              } else if (!summary && typeof part?.text === 'string') {
                summary = part.text.trim();
              }
              if (imageData && summary) break;
            }
            if (imageData && summary) break;
          }

          if (!imageData) {
            return errorJson(502, 'Gemini did not return an image.');
          }

          const imageUrl = `data:${mime || 'image/png'};base64,${imageData}`;
          const responseBody = {
            image: imageUrl,
            prompt: summary,
            variant,
            ratio,
            style,
            message: 'Cover Crafter 이미지가 생성되었습니다.',
          };

          return jsonResponse(200, responseBody, { cacheControl: NO_STORE_CACHE_CONTROL });
        } catch (e: any) {
          console.error('cover-crafter error', e);
          return errorJson(500, 'Internal error', String(e?.message || e));
        }
      }

      if (url.pathname === '/api/image-to-speech') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return errorJson(500, 'GEMINI_API_KEY is not configured on the server.');
          }

          const form = await request.formData();
          const imageFile = form.get('image');
          if (!(imageFile instanceof File)) {
            return errorJson(400, '이미지 파일을 전달해 주세요.');
          }

          const validationError = validateImageFile(imageFile);
          if (validationError) {
            return errorJson(400, validationError);
          }

          const allowedModes = new Set(['simple', 'description', 'detail']);
          const rawMode = typeof form.get('mode') === 'string' ? String(form.get('mode')).toLowerCase() : 'description';
          const mode = (allowedModes.has(rawMode) ? rawMode : 'description') as 'simple' | 'description' | 'detail';

          const rawLanguage = typeof form.get('language') === 'string' ? String(form.get('language')).trim() : 'ko-KR';
          const language = rawLanguage || 'ko-KR';

          const LANGUAGE_LABEL: Record<string, string> = {
            'ko-KR': 'Korean',
            'en-US': 'English (United States)',
            'ja-JP': 'Japanese',
            'zh-CN': 'Chinese',
            'fr-FR': 'French',
            'de-DE': 'German',
            'es-ES': 'Spanish',
          };

          const MODE_INSTRUCTIONS: Record<typeof mode, string> = {
            simple: 'Summarize the core subject of the image in a single concise sentence without embellishment.',
            description: 'Describe the image in two or three sentences suitable for general narration. Mention the main subjects and their context.',
            detail: 'Provide a richly detailed narration that would allow a blind listener to imagine the full scene, including background elements, colors, lighting, emotions, and any visible text. If there is text in the image, read it aloud within the narration.',
          };

          const analysisModel = 'gemini-2.0-flash-exp';
          const sourceMime = imageFile.type && imageFile.type.startsWith('image/') ? imageFile.type : 'image/png';
          const imageBytes = new Uint8Array(await imageFile.arrayBuffer());

          const analysisPrompt = [
            'You are an assistive narrator converting visual content into spoken-friendly descriptions.',
            `Write the response in ${LANGUAGE_LABEL[language] ?? language}.`,
            MODE_INSTRUCTIONS[mode],
            'Use complete sentences only and avoid markdown or bullet lists.',
            'Do not ask questions or make assumptions beyond what is visible. If uncertain, state that it is uncertain.',
          ].join('\n');

          const analysisUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(analysisModel)}:generateContent`;
          const analysisRes = await fetch(analysisUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': geminiKey,
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: analysisPrompt },
                    { inline_data: { mime_type: sourceMime, data: u8ToB64(imageBytes) } },
                  ],
                },
              ],
              generationConfig: { temperature: 0.2 },
            }),
          });

          const analysisTextRaw = await analysisRes.text();
          if (!analysisRes.ok) {
            return errorJson(502, `Gemini analysis error: ${analysisRes.status} ${analysisRes.statusText}`, analysisTextRaw);
          }

          let analysisJson: any = {};
          try { analysisJson = analysisTextRaw ? JSON.parse(analysisTextRaw) : {}; } catch { analysisJson = {}; }
          const candidates: any[] = Array.isArray(analysisJson?.candidates) ? analysisJson.candidates : [];
          let description = '';
          for (const cand of candidates) {
            const parts = cand?.content?.parts || [];
            for (const p of parts) {
              if (typeof p?.text === 'string' && p.text.trim()) {
                description += (description ? '\n' : '') + p.text.trim();
              }
            }
            if (description) break;
          }

          description = description.replace(/\s+/g, ' ').trim();
          if (!description) {
            return errorJson(502, 'Gemini did not return a description for the image.', analysisJson);
          }

          const VOICE_BY_LANGUAGE: Record<string, string> = {
            'ko-KR': 'Gacrux',
            'en-US': 'Puck',
            'ja-JP': 'Aoede',
            'zh-CN': 'Fenrir',
            'fr-FR': 'Zephyr',
            'de-DE': 'Achernar',
            'es-ES': 'Laomedeia',
          };
          const voiceName = VOICE_BY_LANGUAGE[language] ?? 'Gacrux';

          const ttsModel = 'gemini-2.5-flash-preview-tts';
          const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(ttsModel)}:generateContent`;
          const ttsRes = await fetch(ttsUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': geminiKey,
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: description },
                  ],
                },
              ],
              generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                  },
                },
              },
              model: ttsModel,
            }),
          });

          const ttsText = await ttsRes.text();
          if (!ttsRes.ok) {
            return errorJson(502, `Gemini TTS error: ${ttsRes.status} ${ttsRes.statusText}`, ttsText);
          }

          let ttsJson: any = {};
          try { ttsJson = ttsText ? JSON.parse(ttsText) : {}; } catch { ttsJson = {}; }
          let audioBase64 = '';
          let audioMime = 'audio/mpeg';
          const ttsCandidates: any[] = Array.isArray(ttsJson?.candidates) ? ttsJson.candidates : [];
          for (const cand of ttsCandidates) {
            const parts = cand?.content?.parts || [];
            for (const p of parts) {
              const data = p?.inline_data?.data || p?.inlineData?.data;
              if (data) {
                audioBase64 = String(data);
                audioMime = p?.inline_data?.mime_type || p?.inlineData?.mimeType || audioMime;
                break;
              }
            }
            if (audioBase64) break;
          }

          if (!audioBase64) {
            return errorJson(502, 'Gemini TTS did not return audio data.', ttsJson);
          }

          const responsePayload = {
            description,
            language,
            mode,
            audio: audioBase64,
            mimeType: audioMime,
            sampleRate: 24000,
            usage: {
              analysisTokens: analysisJson?.usageMetadata?.candidatesTokenCount ?? null,
              ttsTokens: ttsJson?.usageMetadata?.candidatesTokenCount ?? null,
            },
          };

          return jsonResponse(200, responsePayload, { cacheControl: NO_STORE_CACHE_CONTROL });
        } catch (e: any) {
          console.error('image-to-speech error', e);
          return errorJson(500, 'Internal error', String(e?.message || e));
        }
      }

      if (url.pathname === '/api/scene-to-script') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return errorJson(500, 'GEMINI_API_KEY is not configured on the server.');
          }

          const form = await request.formData();
          const imageFile = form.get('image');
          if (!(imageFile instanceof File)) {
            return errorJson(400, '이미지 파일을 전달해 주세요.');
          }

          const validationError = validateImageFile(imageFile);
          if (validationError) {
            return errorJson(400, validationError);
          }

          const analysisModel = 'gemini-2.0-flash-exp';
          const ttsModel = 'gemini-2.5-flash-preview-tts';
          const sourceMime = imageFile.type && imageFile.type.startsWith('image/') ? imageFile.type : 'image/png';
          const imageBytes = new Uint8Array(await imageFile.arrayBuffer());

          const analysisPrompt = [
            '당신은 다중 등장인물이 있는 장면 이미지를 분석하는 한국어 해설가입니다.',
            '이미지에 보이는 모든 인물을 식별하고 가능한 경우 성별, 성격, 역할, 외형 특징을 추론해 주세요.',
            '장면 설명과 함께 등장인물이 나눌 법한 자연스러운 대사를 생성하되, 모든 설명과 대사는 반드시 한국어로 작성합니다.',
            '응답은 아래 JSON 구조를 반드시 따르세요.',
            '{',
            '  "sceneSummary": string (장면 요약, 한국어),',
            '  "characters": [',
            '    { "name": string, "gender": "male" | "female" | "unknown", "personality"?: string, "role"?: string, "description"?: string }',
            '  ],',
            '  "dialogue": [',
            '    { "speaker": string, "line": string, "emotion"?: string, "action"?: string }',
            '  ],',
            '  "notes"?: string',
            '}',
            '이름은 고유하게 지정하고, 모든 대사는 해당 인물 이름을 speaker 필드로 사용합니다.',
            '대사가 2줄 이상이 되도록 구성해 주세요.',
            '만약 이미지에서 캐릭터나 대사를 추론할 수 없다면 sceneSummary를 빈 문자열로, characters와 dialogue는 빈 배열로 반환합니다.',
          ].join('\n');

          const analysisUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(analysisModel)}:generateContent`;
          const analysisRes = await fetch(analysisUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': geminiKey,
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: analysisPrompt },
                    { inline_data: { mime_type: sourceMime, data: u8ToB64(imageBytes) } },
                  ],
                },
              ],
              generationConfig: { temperature: 0.4 },
            }),
          });

          const analysisTextRaw = await analysisRes.text();
          if (!analysisRes.ok) {
            return errorJson(502, `Gemini scene analysis error: ${analysisRes.status} ${analysisRes.statusText}`, analysisTextRaw);
          }

          let analysisJson: any = {};
          try { analysisJson = analysisTextRaw ? JSON.parse(analysisTextRaw) : {}; } catch { analysisJson = {}; }
          const analysisCandidates: any[] = Array.isArray(analysisJson?.candidates) ? analysisJson.candidates : [];
          let payload: SceneToScriptPayload | null = null;
          let rawNarrative = '';
          for (const cand of analysisCandidates) {
            const parts = cand?.content?.parts || [];
            for (const p of parts) {
              if (typeof p?.text === 'string' && p.text.trim()) {
                rawNarrative += (rawNarrative ? '\n' : '') + p.text.trim();
                const extracted = extractFirstJsonObject(p.text);
                if (extracted) {
                  payload = extracted;
                  break;
                }
              }
            }
            if (payload) break;
          }

          if (!payload) {
            return errorJson(502, 'Gemini did not return a structured scene payload.', analysisJson);
          }

          const characterCandidates: SceneCharacter[] = Array.isArray(payload.characters)
            ? payload.characters
                .map((entry, idx) => ({
                  name: normalizeWhitespace(
                    (
                      (typeof entry?.name === 'string' && entry.name.trim())
                        ? entry.name
                        : `인물 ${idx + 1}`
                    ).trim(),
                  ),
                  gender: coerceGender(entry?.gender),
                  personality: entry?.personality ? normalizeWhitespace(String(entry.personality)) : undefined,
                  role: entry?.role ? normalizeWhitespace(String(entry.role)) : undefined,
                  description: entry?.description ? normalizeWhitespace(String(entry.description)) : undefined,
                }))
                .filter(entry => entry.name)
            : [];

          const uniqueCharacters: SceneCharacter[] = [];
          const seenCharacterNames = new Set<string>();
          for (const candidate of characterCandidates) {
            if (seenCharacterNames.has(candidate.name)) continue;
            uniqueCharacters.push(candidate);
            seenCharacterNames.add(candidate.name);
          }

          const rawDialogue: SceneDialogueLine[] = Array.isArray(payload.dialogue)
            ? sanitizeDialogueLines(
                payload.dialogue.map((line, idx) => ({
                  speaker: String(line?.speaker ?? `인물 ${idx + 1}`).trim(),
                  line: String(line?.line ?? '').trim(),
                  emotion: line?.emotion ? String(line.emotion) : undefined,
                  action: line?.action ? String(line.action) : undefined,
                })),
              )
            : [];

          const knownSpeakers = new Set(uniqueCharacters.map(character => character.name));
          const filteredDialogue: SceneDialogueLine[] = [];
          for (const line of rawDialogue) {
            if (!line.line) continue;
            if (!line.speaker || !knownSpeakers.has(line.speaker)) {
              let replacement = uniqueCharacters[0]?.name ?? line.speaker;
              for (const character of uniqueCharacters) {
                if (line.speaker && (line.speaker.includes(character.name) || character.name.includes(line.speaker))) {
                  replacement = character.name;
                  break;
                }
              }
              line.speaker = replacement || '화자';
            }
            filteredDialogue.push(line);
          }

          if (uniqueCharacters.length === 0 || filteredDialogue.length === 0) {
            return errorJson(422, '이미지에서 다화자 대화를 추출할 수 없었습니다. 등장인물이 분명한 이미지를 사용해 주세요.', payload);
          }

          const dialogueSpeakers = Array.from(new Set(filteredDialogue.map(line => line.speaker))).filter(Boolean);
          const qualifiesForMultiSpeaker = dialogueSpeakers.length >= 2;

          const voiceAssignments = assignVoices(uniqueCharacters);
          const conversationPrompt = buildConversationPrompt(filteredDialogue);

          const speakerVoiceConfigs = qualifiesForMultiSpeaker
            ? dialogueSpeakers.map(speakerName => ({
                speaker: speakerName,
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceAssignments[speakerName] ?? voiceAssignments[uniqueCharacters[0].name],
                  },
                },
              }))
            : [];

          const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(ttsModel)}:generateContent`;
          const useMultiSpeaker = qualifiesForMultiSpeaker && speakerVoiceConfigs.length >= 2;
          const ttsPayload: any = {
            contents: [
              {
                parts: [
                  { text: conversationPrompt },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: useMultiSpeaker
                ? {
                    multiSpeakerVoiceConfig: { speakerVoiceConfigs },
                  }
                : {
                    voiceConfig: {
                      prebuiltVoiceConfig: {
                        voiceName: voiceAssignments[filteredDialogue[0].speaker] ?? Object.values(voiceAssignments)[0],
                      },
                    },
                  },
            },
            model: ttsModel,
          };

          const ttsRes = await fetch(ttsUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': geminiKey,
            },
            body: JSON.stringify(ttsPayload),
          });

          const ttsText = await ttsRes.text();
          if (!ttsRes.ok) {
            let detail: any = ttsText;
            try {
              detail = ttsText ? JSON.parse(ttsText) : undefined;
            } catch {
              detail = ttsText;
            }
            if (detail?.error?.message) {
              return errorJson(502, `Gemini TTS 실패: ${detail.error.message}`, detail);
            }
            return errorJson(502, `Gemini multi-speaker TTS error: ${ttsRes.status} ${ttsRes.statusText}`, detail);
          }

          let ttsJson: any = {};
          try { ttsJson = ttsText ? JSON.parse(ttsText) : {}; } catch { ttsJson = {}; }
          let audioBase64 = '';
          let audioMime = 'audio/mpeg';
          const ttsCandidates: any[] = Array.isArray(ttsJson?.candidates) ? ttsJson.candidates : [];
          for (const cand of ttsCandidates) {
            const parts = cand?.content?.parts || [];
            for (const p of parts) {
              const data = p?.inline_data?.data || p?.inlineData?.data;
              if (data) {
                audioBase64 = String(data);
                audioMime = p?.inline_data?.mime_type || p?.inlineData?.mimeType || audioMime;
                break;
              }
            }
            if (audioBase64) break;
          }

          if (!audioBase64) {
            return errorJson(502, 'Gemini multi-speaker TTS did not return audio data.', ttsJson);
          }

          const responsePayload = {
            sceneSummary: payload.sceneSummary ? normalizeWhitespace(String(payload.sceneSummary)) : '',
            characters: uniqueCharacters.map(character => ({
              ...character,
              voice: voiceAssignments[character.name],
              trait: VOICE_TRAITS[voiceAssignments[character.name]] ?? '',
            })),
            dialogue: filteredDialogue,
            notes: payload.notes ? normalizeWhitespace(String(payload.notes)) : undefined,
            audio: audioBase64,
            mimeType: audioMime,
            sampleRate: 24000,
            usage: {
              analysisTokens: analysisJson?.usageMetadata?.candidatesTokenCount ?? null,
              ttsTokens: ttsJson?.usageMetadata?.candidatesTokenCount ?? null,
            },
            rawNarrative,
          };

          return jsonResponse(200, responsePayload, { cacheControl: NO_STORE_CACHE_CONTROL });
        } catch (e: any) {
          console.error('scene-to-script error', e);
          return errorJson(500, 'Internal error', String(e?.message || e));
        }
      }

      // Sticker Generator: create a sticker sheet (multiple variations) from a user image
      if (url.pathname === '/api/sticker-generator') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const form = await request.formData();
          const img = form.get('image');
          if (!img || typeof (img as any).arrayBuffer !== 'function') {
            return new Response(JSON.stringify({ error: 'Missing image' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }
          const minRaw = String(form.get('min') || '10');
          let minCount = parseInt(minRaw, 10);
          if (!Number.isFinite(minCount) || minCount < 1) minCount = 10;
          if (minCount > 64) minCount = 64; // safety cap
          const transparent = String(form.get('transparent') || '0') === '1';
          const userPrompt = typeof form.get('prompt') === 'string' ? String(form.get('prompt')) : '';

          const file = img as File;
          const mime = (file.type && /image\//.test(file.type)) ? file.type : 'image/png';
          const buf = new Uint8Array(await file.arrayBuffer());
          const b64 = u8ToB64(buf);

          // Model and endpoint per spec
          const model = 'gemini-2.5-flash-image-preview';
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

          const instructions = [
            'You are a sticker sheet generator. Create a SINGLE image that contains multiple sticker variations derived from the provided subject image.',
            'Variety requirements:',
            '- Use diverse poses, directions (facing left/right/front/angled), and thematic concepts so the set is not monotonous.',
            `- At least ${minCount} distinct stickers. Arrange in a neat grid or mosaic with even spacing/margins.`,
            'Visual style:',
            '- Keep a consistent cohesive style across variations. Avoid text watermarks.',
            '- If background is required, prefer a clean white or very light neutral. If TRANSPARENT=1, produce PNG with alpha background fully transparent.',
            'Output:',
            '- Return ONE composite image (a sticker sheet). Prefer square or landscape canvas sized reasonably for many stickers (e.g., ~1536–2048px).',
            '- Stickers should have clear separation (padding) so they can be cropped later.',
          ].join('\n');

          // Build parts (snake_case inline_data as in other image routes)
          const parts: any[] = [
            { text: instructions },
            { text: `GENERATE:\nMIN=${minCount}\nTRANSPARENT=${transparent ? '1' : '0'}\nFORMAT=PNG\n` },
            ...(userPrompt ? [ { text: `EXTRA USER PROMPT:\n${userPrompt}` } ] : []),
            { inline_data: { mime_type: mime, data: b64 } },
          ];

          const aiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-goog-api-key': geminiKey! },
            body: JSON.stringify({ contents: [ { parts } ], generationConfig: { temperature: 0.7 } }),
          });
          const txt = await aiRes.text();
          if (!aiRes.ok) {
            return new Response(JSON.stringify({ error: `Gemini error: ${aiRes.status} ${aiRes.statusText}`, detail: txt }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          let js: any = {};
          try { js = txt ? JSON.parse(txt) : {}; } catch {}
          const candidates: any[] = Array.isArray(js?.candidates) ? js.candidates : [];
          let dataUrl = '';
          outer: for (const c of candidates) {
            const cparts = c?.content?.parts || [];
            for (const p of cparts) {
              const d = p?.inline_data?.data || p?.inlineData?.data;
              const mt = p?.inline_data?.mime_type || p?.inlineData?.mimeType || '';
              if (d && (/^image\//.test(mt) || mt === 'image/png' || mt === 'image/jpeg')) {
                dataUrl = `data:${mt || 'image/png'};base64,${d}`;
                break outer;
              }
            }
          }
          if (!dataUrl) {
            return new Response(JSON.stringify({ error: 'No image returned from Gemini' }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          return new Response(JSON.stringify({ image: dataUrl }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Internal error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }
      if (url.pathname === '/api/comic-restyler') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }

          const form = await request.formData();
          const imageFile = form.get('image');
          if (!(imageFile instanceof File)) {
            return new Response(JSON.stringify({ error: 'Missing image file' }), {
              status: 400,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }

          const styleRaw = String(form.get('style') || 'illustration').toLowerCase();
          const style: 'illustration' | 'photoreal' = styleRaw === 'photoreal' ? 'photoreal' : 'illustration';
          const extraPrompt = typeof form.get('prompt') === 'string' ? String(form.get('prompt')).trim() : '';

          const mime = imageFile.type && imageFile.type.startsWith('image/') ? imageFile.type : 'image/png';
          const sourceBytes = new Uint8Array(await imageFile.arrayBuffer());
          const sourceB64 = u8ToB64(sourceBytes);

          const styleHint = style === 'photoreal'
            ? 'Render characters, lighting, and materials with photorealistic fidelity while respecting the existing panel layout.'
            : 'Render with high-quality illustration aesthetics: clean line art, expressive shading, and vibrant yet controlled palettes.';

          const instructions = [
            'You are an expert comic restyler. Transform the supplied multi-panel comic sketch into a polished image while preserving narrative flow.',
            'Core requirements:',
            '- Maintain all panel boundaries, aspect ratios, and gutter spacing exactly as in the source image.',
            '- Keep every speech bubble, caption box, and onomatopoeia in the same position with identical text content.',
            '- Preserve the overall camera angles, poses, sequence of actions, and layout per panel.',
            '- Upgrade the rendering fidelity of characters, props, and backgrounds according to the selected style.',
            '- Remove sketch artifacts or stray lines from the original while retaining the story beat.',
            styleHint,
            extraPrompt ? `Additional creative direction:
${extraPrompt}` : undefined,
          ].filter(Boolean).join('\n');

          const model = 'gemini-2.5-flash-image-preview';
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

          const parts: any[] = [
            { text: instructions },
            { inline_data: { mime_type: mime, data: sourceB64 } },
            { text: 'Output a single image as inline data (PNG preferred) with the refined comic. Do not add extra panels or rearrange content.' },
          ];

          const aiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': geminiKey,
            },
            body: JSON.stringify({ contents: [ { parts } ], generationConfig: { temperature: 0.3 } }),
          });

          const aiText = await aiRes.text();
          if (!aiRes.ok) {
            return new Response(JSON.stringify({ error: `Gemini error: ${aiRes.status} ${aiRes.statusText}`, detail: aiText }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }

          let aiJson: any = {};
          try { aiJson = aiText ? JSON.parse(aiText) : {}; } catch { aiJson = {}; }
          const candidates: any[] = Array.isArray(aiJson?.candidates) ? aiJson.candidates : [];
          let base64Image = '';
          let outMime = 'image/png';
          for (const cand of candidates) {
            const cparts = cand?.content?.parts || [];
            for (const p of cparts) {
              const data = p?.inline_data?.data || p?.inlineData?.data;
              if (data) {
                base64Image = String(data);
                outMime = p?.inline_data?.mime_type || p?.inlineData?.mimeType || outMime;
                break;
              }
            }
            if (base64Image) break;
          }

          if (!base64Image) {
            return new Response(JSON.stringify({ error: 'Gemini did not return an image.' }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }

          const dataUrl = `data:${outMime};base64,${base64Image}`;
          return new Response(JSON.stringify({ image: dataUrl, style }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Internal error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }
      if (url.pathname === '/api/avatar-distiller') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }

          const form = await request.formData();
          const imageFile = form.get('image');
          if (!(imageFile instanceof File)) {
            return new Response(JSON.stringify({ error: 'Missing image file' }), {
              status: 400,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }

          const styleRaw = String(form.get('style') || 'illustration').toLowerCase();
          const style: 'illustration' | 'photoreal' = styleRaw === 'photoreal' ? 'photoreal' : 'illustration';
          const extraPrompt = typeof form.get('prompt') === 'string' ? String(form.get('prompt')).trim() : '';

          const sourceMime = imageFile.type && imageFile.type.startsWith('image/') ? imageFile.type : 'image/png';
          const sourceBytes = new Uint8Array(await imageFile.arrayBuffer());
          const sourceB64 = u8ToB64(sourceBytes);

          const styleHint = style === 'photoreal'
            ? 'Aim for a natural, photorealistic head-and-shoulders portrait with soft bokeh background and flattering, realistic lighting.'
            : 'Aim for a clean, stylized illustration with smooth shading, clear edges, and a friendly, modern avatar look.';

          const instructions = [
            'You are an avatar designer. Optimize the provided image into a high-quality profile avatar while preserving identity.',
            'Core requirements:',
            '- Center the primary subject (usually the face) with a head-and-shoulders crop on a square canvas.',
            '- Maintain original identity, skin tone, and key features. Avoid unrealistic alterations.',
            '- Use balanced exposure and contrast. Clean up distracting artifacts or busy backgrounds.',
            '- Compose for a circular crop (adequate headroom and margins).',
            '- Background should be simple and consistent (soft bokeh or subtle gradient), not noisy.',
            styleHint,
            extraPrompt ? `Additional creative direction:\n${extraPrompt}` : undefined,
            'Output one image only. Prefer PNG format. Keep the canvas square and ready for a round crop.',
          ].filter(Boolean).join('\n');

          const model = 'gemini-2.5-flash-image-preview';
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
          const parts: any[] = [
            { text: instructions },
            { inline_data: { mime_type: sourceMime, data: sourceB64 } },
          ];
          const aiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': geminiKey,
            },
            body: JSON.stringify({ contents: [ { parts } ], generationConfig: { temperature: 0.25 } }),
          });
          const aiText = await aiRes.text();
          if (!aiRes.ok) {
            return new Response(JSON.stringify({ error: `Gemini error: ${aiRes.status} ${aiRes.statusText}`, detail: aiText }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }

          let aiJson: any = {};
          try { aiJson = aiText ? JSON.parse(aiText) : {}; } catch { aiJson = {}; }
          const candidates: any[] = Array.isArray(aiJson?.candidates) ? aiJson.candidates : [];
          let base64Image = '';
          let outMime = 'image/png';
          for (const cand of candidates) {
            const cparts = cand?.content?.parts || [];
            for (const p of cparts) {
              const data = p?.inline_data?.data || p?.inlineData?.data;
              if (data) {
                base64Image = String(data);
                outMime = p?.inline_data?.mime_type || p?.inlineData?.mimeType || outMime;
                break;
              }
            }
            if (base64Image) break;
          }

          if (!base64Image) {
            return new Response(JSON.stringify({ error: 'Gemini did not return an image.' }), {
              status: 502,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }

          const dataUrl = `data:${outMime};base64,${base64Image}`;
          return new Response(JSON.stringify({ image: dataUrl, style }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Internal error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }
      // Text Cleaning: proofread typos/spacing/grammar while preserving meaning; return JSON only
      if (url.pathname === '/api/text-cleaning') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const body = await request.json<any>().catch(() => ({} as any));
          const text: string = typeof body?.text === 'string' ? body.text : '';
          if (!text.trim()) {
            return new Response(JSON.stringify({ error: 'Missing text' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }

          const instructions = [
            '당신은 한국어 텍스트의 교정/교열 도우미입니다.',
            '역할: 오타, 맞춤법, 띄어쓰기, 조사/어미, 간단한 문법 오류를 자연스럽게 바로잡되, 원문의 의미와 톤은 보존합니다.',
            '정책:',
            '- 고유명사, 코드, 명시적 표기(버전/모델명/식별자)는 보존합니다.',
            '- 문체는 존댓말/반말 등 맥락을 유지합니다.',
            '- 과도한 의역/요약/확장 없이 필요한 범위에서만 수정합니다.',
            '- 한국어 표준 맞춤법과 띄어쓰기를 기본으로 합니다.',
            '출력 형식: JSON ONLY — { "cleaned": string } (마크다운/설명 금지).',
          ].join('\n');

          const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
          const aiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': geminiKey!,
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
          const data: any = await aiRes.json();
          const raw: string = ((data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [])
            .map((p: any) => p?.text || '')
            .join('');
          const jsonStr = extractJsonString(raw);
          let parsed: any = {};
          try { parsed = JSON.parse(jsonStr); } catch { parsed = {}; }
          const cleaned: string = typeof parsed?.cleaned === 'string' ? parsed.cleaned : '';
          return new Response(JSON.stringify({ cleaned }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Internal error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }
      // UI Clone: accept an image and return single-file HTML (inline CSS) via Gemini
      if (url.pathname === '/api/ui-clone') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
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
            headers: { 'Content-Type': 'application/json', 'X-goog-api-key': geminiKey! },
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
      // AI Business Card: generate front (and optionally back) background images using Gemini
      if (url.pathname === '/api/ai-business-card') {
        if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const form = await request.formData();
          const logo = form.get('logo');
          const includeBack = String(form.get('include_back') || '0') === '1';
          const prompt = typeof form.get('prompt') === 'string' ? String(form.get('prompt')) : '';
          const fieldsRaw = typeof form.get('fields') === 'string' ? String(form.get('fields')) : '[]';
          let fields: any[] = [];
          try { fields = JSON.parse(fieldsRaw); } catch {}
          const extras: File[] = [];
          const extrasEntry = form.getAll('extras');
          for (const it of extrasEntry) {
            if (it && typeof (it as any).arrayBuffer === 'function') extras.push(it as File);
          }
          if (!logo || typeof (logo as any).arrayBuffer !== 'function') {
            return new Response(JSON.stringify({ error: 'Missing logo image' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }

          // Prepare inline data
          const logoFile = logo as File;
          const logoMime = (logoFile.type && /image\//.test(logoFile.type)) ? logoFile.type : 'image/png';
          const logoBuf = new Uint8Array(await logoFile.arrayBuffer());
          const logoB64 = u8ToB64(logoBuf);
          const extraParts: Array<{ mime: string; data: string }> = [];
          for (const f of extras) {
            const m = (f.type && /image\//.test(f.type)) ? f.type : 'image/png';
            const b = new Uint8Array(await f.arrayBuffer());
            extraParts.push({ mime: m, data: u8ToB64(b) });
          }

          const instructions = [
            'You are a brand designer generating a BUSINESS CARD BACKGROUND image (no textual contact info rendered by you).',
            'Constraints:',
            '- Use the provided logo image for style guidance; you MAY incorporate the logo as a graphic watermark or placeholder area, but avoid rasterizing small text for contact details.',
            '- Leave clear areas and visual hierarchy where human-placed text (name, title, phone, etc.) can be overlaid later.',
            '- Produce a modern, professional aesthetic. Consider color palette derived from the logo. Keep ample margins (safe area).',
            'Output: a single 1050x600 px landscape image that fills the canvas.'
          ].join('\n');

          // Use the model per provided spec
          const model = 'gemini-2.5-flash-image-preview';
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

          // Shared image parts (snake_case inline_data)
          const imageParts: any[] = [ { inline_data: { mime_type: logoMime, data: logoB64 } } ];
          for (const p of extraParts) imageParts.push({ inline_data: { mime_type: p.mime, data: p.data } });

          // Helper to call API and extract first image inline_data
          const callOnce = async (taskText: string) => {
            const parts: any[] = [
              { text: instructions },
              { text: taskText },
              { text: `FIELDS (for style context only):\n${JSON.stringify(fields)}` },
              ...(prompt ? [ { text: `USER PROMPT:\n${prompt}` } ] : []),
              ...imageParts,
            ];
            const res = await fetch(apiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'X-goog-api-key': geminiKey! },
              body: JSON.stringify({ contents: [ { parts } ], generationConfig: { temperature: 0.7 } }),
            });
            const txt = await res.text();
            if (!res.ok) {
              throw new Error(`Gemini error: ${res.status} ${res.statusText}\n${txt}`);
            }
            let js: any = {};
            try { js = txt ? JSON.parse(txt) : {}; } catch {}
            const candidates: any[] = Array.isArray(js?.candidates) ? js.candidates : [];
            for (const c of candidates) {
              const parts = c?.content?.parts || [];
              for (const p of parts) {
                const d = p?.inline_data?.data || p?.inlineData?.data;
                const mt = p?.inline_data?.mime_type || p?.inlineData?.mimeType || '';
                if (d && (/^image\//.test(mt) || mt === 'image/png' || mt === 'image/jpeg')) {
                  return `data:${mt || 'image/png'};base64,${d}`;
                }
              }
            }
            throw new Error('No image returned from Gemini');
          };

          const frontImgUrl = await callOnce('TASK: Generate FRONT background only (no textual contact info). Provide clear text-safe areas.');
          let backImgUrl = '';
          if (includeBack) {
            backImgUrl = await callOnce('TASK: Generate BACK background only (brand motif or subtle pattern). No textual contact info.');
          }

          const out: any = { images: { front: frontImgUrl } };
          if (includeBack && backImgUrl) out.images.back = backImgUrl;
          return new Response(JSON.stringify(out), { headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' } });
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
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
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
              'X-goog-api-key': geminiKey!,
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
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
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
              'X-goog-api-key': geminiKey!,
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
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
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
              'X-goog-api-key': geminiKey!,
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
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
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
                'X-goog-api-key': geminiKey!,
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
                'X-goog-api-key': geminiKey!,
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
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
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
              'X-goog-api-key': geminiKey!,
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
              'X-goog-api-key': geminiKey!,
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
        try {
          const openaiKey = await getOpenAIKeyFromRequest(request, env);
          if (!openaiKey) {
            return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
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
              Authorization: `Bearer ${openaiKey}`,
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
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
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
              'X-goog-api-key': geminiKey,
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
      if (url.pathname === '/api/non-native-korean-tts') {
        if (request.method !== 'POST') {
          return new Response('Method Not Allowed', { status: 405 });
        }
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const body = await request.json<any>().catch(() => ({} as any));
          const text: string = typeof body?.text === 'string' ? body.text.trim() : '';
          const instruction: string = typeof body?.instruction === 'string' ? body.instruction.trim() : '';
          if (!text) {
            return new Response(JSON.stringify({ error: 'Missing text' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }
          if (!instruction) {
            return new Response(JSON.stringify({ error: 'Missing instruction' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }

          const ttsModel = 'gemini-2.5-flash-preview-tts';
          const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(ttsModel)}:generateContent`;

          // Build prompt with instruction
          const promptText = `${instruction}\n\n텍스트: ${text}`;

          const ttsRes = await fetch(ttsUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': geminiKey,
            },
            body: JSON.stringify({
              contents: [ { parts: [ { text: promptText } ] } ],
              generationConfig: {
                responseModalities: ['AUDIO'],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Gacrux' } } },
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

          let sampleRate = 24000;
          const m = /rate\s*=\s*(\d{4,6})/.exec(mimeType);
          if (m) sampleRate = parseInt(m[1], 10);

          return new Response(JSON.stringify({ audio: b64, sampleRate, mimeType }), {
            headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control': 'no-store' },
          });
        } catch (e: any) {
          return new Response(JSON.stringify({ error: 'Internal error', detail: String(e?.message || e) }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      }
      if (url.pathname === '/api/text-to-emoji') {
        if (request.method !== 'POST') {
          return new Response('Method Not Allowed', { status: 405 });
        }
        try {
          const geminiKey = await getGeminiKeyFromRequest(request, env);
          if (!geminiKey) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on the server.' }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }
          const body = await request.json<any>().catch(() => ({} as any));
          const text: string = typeof body?.text === 'string' ? body.text.trim() : '';
          const mode: string = typeof body?.mode === 'string' ? body.mode : 'insert';
          if (!text) {
            return new Response(JSON.stringify({ error: 'Missing text' }), { status: 400, headers: { 'content-type': 'application/json; charset=UTF-8' } });
          }

          let systemPrompt = '';
          if (mode === 'full') {
            systemPrompt = '주어진 텍스트의 의미를 emoji만으로 표현하세요. 텍스트는 전혀 사용하지 않고 emoji만 사용합니다. 원문의 의미와 감정을 최대한 정확하게 전달해야 합니다.';
          } else if (mode === 'partial') {
            systemPrompt = '주어진 텍스트의 일부를 적절한 emoji로 대치하세요. 텍스트와 emoji를 혼합하여 재미있고 직관적으로 만듭니다. 중요한 단어나 개념을 emoji로 교체하되 전체적인 가독성을 유지하세요.';
          } else {
            systemPrompt = '주어진 텍스트를 그대로 유지하되, 적절한 위치에 emoji를 삽입하여 표현을 풍부하게 만드세요. 텍스트의 의미를 보강하거나 감정을 표현하는 emoji를 추가합니다.';
          }

          const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
          const gRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': geminiKey,
            },
            body: JSON.stringify({
              contents: [
                { parts: [ { text: `${systemPrompt}\n\n입력 텍스트: ${text}\n\n변환된 결과만 출력하고, 설명이나 추가 텍스트는 포함하지 마세요.` } ] },
              ],
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
          
          const result = raw.trim();
          if (!result) {
            return new Response(JSON.stringify({ error: 'Empty result from Gemini', raw }), {
              status: 500,
              headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
          }

          return new Response(JSON.stringify({ result }), {
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

async function resizePngIcon(bitmap: ImageBitmap, size: number, transparent: boolean): Promise<Uint8Array> {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    throw new Error('Failed to obtain 2D context for OffscreenCanvas');
  }

  ctx.clearRect(0, 0, size, size);
  if (!transparent) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
  }

  const paddingRatio = 0.88;
  const scaleBase = Math.min(size / bitmap.width, size / bitmap.height);
  const scale = Math.max(0.05, scaleBase * paddingRatio);
  const drawWidth = bitmap.width * scale;
  const drawHeight = bitmap.height * scale;
  const dx = (size - drawWidth) / 2;
  const dy = (size - drawHeight) / 2;

  ctx.drawImage(bitmap, dx, dy, drawWidth, drawHeight);

  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return new Uint8Array(await blob.arrayBuffer());
}

function makeIcoFromPngs(images: Array<{ size: number; data: Uint8Array }>): Uint8Array {
  const filtered = images
    .filter((img) => img.size > 0 && img.data?.length)
    .sort((a, b) => a.size - b.size);

  const count = filtered.length;
  if (count === 0) {
    throw new Error('No PNG inputs provided for ICO generation');
  }

  const headerSize = 6;
  const directorySize = 16 * count;
  const dataSize = filtered.reduce((acc, img) => acc + img.data.length, 0);
  const totalSize = headerSize + directorySize + dataSize;

  const out = new Uint8Array(totalSize);
  const view = new DataView(out.buffer);

  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type icon
  view.setUint16(4, count, true); // image count

  let offset = headerSize + directorySize;
  for (let i = 0; i < count; i++) {
    const { size, data } = filtered[i];
    const entryOffset = headerSize + i * 16;
    out[entryOffset + 0] = size >= 256 ? 0 : size; // width
    out[entryOffset + 1] = size >= 256 ? 0 : size; // height
    out[entryOffset + 2] = 0; // color palette
    out[entryOffset + 3] = 0; // reserved
    view.setUint16(entryOffset + 4, 1, true); // color planes
    view.setUint16(entryOffset + 6, 32, true); // bits per pixel
    view.setUint32(entryOffset + 8, data.length, true); // image data size
    view.setUint32(entryOffset + 12, offset, true); // offset to data

    out.set(data, offset);
    offset += data.length;
  }

  return out;
}

// --- Symmetric encryption helpers for client API keys (AES-GCM v1) ---
async function importAesKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const secretBytes = enc.encode(secret);
  const hash = await crypto.subtle.digest('SHA-256', secretBytes);
  return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

function ensureSecret(env: Env): string {
  const s = (env.ENC_SECRET || '').trim();
  if (!s) throw new Error('ENC_SECRET is not configured');
  return s;
}

export async function encryptApiKeyPayload(payload: any, env: Env): Promise<string> {
  const secret = ensureSecret(env);
  const key = await importAesKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(payload || {}));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const cipher = new Uint8Array(ct);
  return `v1:${u8ToB64(iv)}:${u8ToB64(cipher)}`;
}

export async function decryptApiKeyPayload(cipherText: string, env: Env): Promise<any> {
  if (!cipherText || typeof cipherText !== 'string') throw new Error('Missing cipher');
  const [v, ivB64, ctB64] = cipherText.split(':');
  if (v !== 'v1' || !ivB64 || !ctB64) throw new Error('Bad cipher format');
  const secret = ensureSecret(env);
  const key = await importAesKey(secret);
  const iv = b64ToU8(ivB64);
  const cipher = b64ToU8(ctB64);
  const ptBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  const txt = new TextDecoder().decode(ptBuf);
  return JSON.parse(txt);
}

async function getApiKeyFromRequest(request: Request, env: Env): Promise<{ gemini?: string; openai?: string }> {
  try {
    const hdr = request.headers.get('X-ApiKey-Cipher') || request.headers.get('x-apikey-cipher') || '';
    if (!hdr) return { gemini: env.GEMINI_API_KEY, openai: env.OPENAI_API_KEY };
    const js = await decryptApiKeyPayload(hdr, env).catch(() => ({}));
    const gemini = (typeof js?.gemini === 'string' && js.gemini.trim()) ? js.gemini.trim() : (env.GEMINI_API_KEY || undefined);
    const openai = (typeof js?.openai === 'string' && js.openai.trim()) ? js.openai.trim() : (env.OPENAI_API_KEY || undefined);
    return { gemini, openai };
  } catch {
    return { gemini: env.GEMINI_API_KEY, openai: env.OPENAI_API_KEY };
  }
}

export async function getGeminiKeyFromRequest(request: Request, env: Env): Promise<string | undefined> {
  const { gemini } = await getApiKeyFromRequest(request, env);
  return gemini;
}

export async function getOpenAIKeyFromRequest(request: Request, env: Env): Promise<string | undefined> {
  const { openai } = await getApiKeyFromRequest(request, env);
  return openai;
}
