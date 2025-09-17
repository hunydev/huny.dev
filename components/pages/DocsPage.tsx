import React from 'react';
import { PageProps } from '../../types';
import { DOCS, getDocBySlug } from './docsData';

const DocsPage: React.FC<PageProps> = ({ routeParams, onOpenFile }) => {
  const slug = routeParams?.slug as string | undefined;
  const doc = getDocBySlug(slug);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [processedHtml, setProcessedHtml] = React.useState<string>('');
  const [toc, setToc] = React.useState<Array<{ id: string; text: string; level: number }>>([]);
  const isR2 = !!slug && slug.startsWith('r2/');
  const r2Path = isR2 ? slug.slice(3) : '';
  const R2_PUBLIC_BASE = 'https://r2.huny.dev';
  const [r2Title, setR2Title] = React.useState<string>('');
  const [r2Loading, setR2Loading] = React.useState<boolean>(false);
  const [r2Error, setR2Error] = React.useState<string>('');
  const [showRaw, setShowRaw] = React.useState<boolean>(false);
  const [rawHtml, setRawHtml] = React.useState<string>('');

  const processHtml = React.useCallback((raw: string) => {
    const wrap = document.createElement('div');
    wrap.innerHTML = raw;
    const usedIds = new Set<string>();
    const slugify = (s: string) => {
      const base = s
        .trim()
        .toLowerCase()
        // keep korean and word chars
        .replace(/[^\w\uAC00-\uD7A3\-\s]+/g, '')
        .replace(/\s+/g, '-');
      let id = base || 'section';
      let i = 2;
      while (usedIds.has(id)) { id = `${base}-${i++}`; }
      usedIds.add(id);
      return id;
    };

    const localToc: Array<{ id: string; text: string; level: number }> = [];
    const headings = wrap.querySelectorAll('h1, h2, h3');
    headings.forEach(h => {
      const text = (h.textContent || '').trim();
      if (!text) return;
      let id = h.getAttribute('id') || '';
      if (!id) {
        id = slugify(text);
        h.setAttribute('id', id);
      } else if (usedIds.has(id)) {
        // ensure uniqueness if author provided duplicate ids
        let n = 2; let newId = `${id}-${n}`;
        while (usedIds.has(newId)) { newId = `${id}-${++n}`; }
        id = newId; h.setAttribute('id', id);
      } else {
        usedIds.add(id);
      }
      // anchor link
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.className = 'heading-anchor';
      a.setAttribute('aria-label', 'Anchor link');
      a.textContent = '¶';
      h.appendChild(a);
      // TOC: include h2/h3
      const level = h.tagName === 'H2' ? 2 : h.tagName === 'H3' ? 3 : 1;
      if (level >= 2) localToc.push({ id, text, level });
    });

    // code block copy buttons
    const pres = wrap.querySelectorAll('pre');
    pres.forEach(pre => {
      const parent = pre.parentElement;
      if (!parent) return;
      const wrapDiv = document.createElement('div');
      wrapDiv.className = 'code-wrap';
      parent.insertBefore(wrapDiv, pre);
      wrapDiv.appendChild(pre);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      wrapDiv.appendChild(btn);
    });

    return { html: wrap.innerHTML, toc: localToc };
  }, []);

  React.useEffect(() => {
    if (doc && !isR2) {
      const { html, toc } = processHtml(doc.contentHtml);
      setProcessedHtml(html);
      setToc(toc);
      setRawHtml(doc.contentHtml);
    } else {
      setProcessedHtml('');
      setToc([]);
      setRawHtml('');
    }
  }, [doc, isR2, processHtml]);

  // Load from R2 when slug starts with r2/
  React.useEffect(() => {
    if (!isR2 || !r2Path) return;
    let alive = true;
    (async () => {
      setR2Loading(true);
      setR2Error('');
      try {
        const encoded = r2Path.split('/').map(encodeURIComponent).join('/');
        const url = `${R2_PUBLIC_BASE}/docs/${encoded}`;
        const res = await fetch(url);
        const html = await res.text();
        if (!res.ok) throw new Error(`Failed to load R2 doc (${res.status})`);
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const title = (titleMatch ? titleMatch[1].trim() : '') || (r2Path.split('/').pop() || 'docs').replace(/\.?html$/i, '');
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const body = bodyMatch ? bodyMatch[1] : html;
        const { html: processed, toc: localToc } = processHtml(body);
        if (!alive) return;
        setProcessedHtml(processed);
        setToc(localToc);
        setR2Title(title);
        setRawHtml(body);
      } catch (e: any) {
        if (!alive) return;
        setR2Error(e?.message || String(e));
        setProcessedHtml('');
        setToc([]);
        setRawHtml('');
      } finally {
        if (alive) setR2Loading(false);
      }
    })();
    return () => { alive = false; };
  }, [isR2, r2Path, processHtml]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onClick = async (e: MouseEvent) => {
      const target = (e.target as HTMLElement) || null;
      if (!target) return;
      const btn = target.closest('.copy-btn') as HTMLButtonElement | null;
      if (btn) {
        e.preventDefault();
        const wrap = btn.closest('.code-wrap');
        const code = wrap?.querySelector('pre, code');
        const text = (code?.textContent || '').trim();
        try {
          await navigator.clipboard.writeText(text);
          const prev = btn.textContent;
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => { if (btn) { btn.textContent = prev || 'Copy'; btn.classList.remove('copied'); } }, 1200);
        } catch {
          // noop
        }
      }
    };
    el.addEventListener('click', onClick);
    return () => { el.removeEventListener('click', onClick); };
  }, [processedHtml]);

  if (isR2) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:grid md:grid-cols-[1fr,240px] md:gap-8">
        <div>
          <header className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-white truncate" title={r2Title || r2Path}>{r2Title || r2Path}</h1>
              <p className="text-xs text-gray-500">{r2Path}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`px-2.5 py-1.5 text-xs rounded border border-white/10 ${showRaw ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                onClick={() => setShowRaw(v => !v)}
                aria-pressed={showRaw}
                title={showRaw ? '처리된 보기로 전환' : '원문 HTML 보기'}
              >
                {showRaw ? '처리된 보기' : '원문 보기'}
              </button>
              {showRaw && (
                <button
                  className="px-2.5 py-1.5 text-xs rounded border border-white/10 text-gray-300 hover:bg-white/10"
                  onClick={async () => { try { await navigator.clipboard.writeText(rawHtml); } catch {} }}
                  title="원문 HTML 복사"
                >
                  복사
                </button>
              )}
            </div>
          </header>
          {r2Loading && <div className="text-sm text-gray-400 mb-2">Loading from R2…</div>}
          {r2Error && <div className="text-xs text-amber-300 mb-2">{r2Error}</div>}
          {showRaw ? (
            <pre className="p-3 text-xs md:text-sm leading-relaxed bg-[#1e1e1e] border border-white/10 rounded overflow-auto whitespace-pre">
              {rawHtml}
            </pre>
          ) : (
            <article ref={containerRef} className="docs-content" dangerouslySetInnerHTML={{ __html: processedHtml }} />
          )}
        </div>
        <aside className="hidden md:block sticky top-16 self-start max-h-[calc(100vh-6rem)] overflow-auto">
          <div className="text-xs uppercase text-gray-400 tracking-wider mb-2">On this page</div>
          {toc.length === 0 ? (
            <div className="text-sm text-gray-500">No headings</div>
          ) : (
            <ul className="text-sm space-y-1">
              {toc.map(item => (
                <li key={item.id} className={item.level === 3 ? 'ml-3' : ''}>
                  <a href={`#${item.id}`} className="text-gray-300 hover:text-white">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="max-w-5xl mx-auto px-4">
        <header className="mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-white">Docs</h1>
          <p className="text-sm text-gray-400">좌측 Docs 목록에서 항목을 선택하세요. 문서는 extra/docs/ 폴더의 HTML 파일을 기반으로 합니다.</p>
        </header>
        {DOCS.length === 0 ? (
          <div className="text-gray-400 text-sm">
            문서가 없습니다. <code className="bg-white/10 px-1 py-0.5 rounded">extra/docs/</code> 폴더에 템플릿을 복사하여 새 문서를 추가하세요.
          </div>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {DOCS.map(d => (
              <li key={d.slug}>
                <a href={`#`} onClick={(e) => { e.preventDefault(); onOpenFile(`docs:${d.slug}`); }} className="block rounded border border-white/10 bg-white/[0.03] p-3 text-sm text-gray-200">
                  <div className="font-medium text-white mb-1 truncate">{d.title}</div>
                  <div className="text-xs text-gray-400 truncate">{d.slug}.html</div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:grid md:grid-cols-[1fr,240px] md:gap-8">
      <div>
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-white truncate" title={doc.title}>{doc.title}</h1>
            <p className="text-xs text-gray-500">{doc.slug}.html</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`px-2.5 py-1.5 text-xs rounded border border-white/10 ${showRaw ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10'}`}
              onClick={() => setShowRaw(v => !v)}
              aria-pressed={showRaw}
              title={showRaw ? '처리된 보기로 전환' : '원문 HTML 보기'}
            >
              {showRaw ? '처리된 보기' : '원문 보기'}
            </button>
            {showRaw && (
              <button
                className="px-2.5 py-1.5 text-xs rounded border border-white/10 text-gray-300 hover:bg-white/10"
                onClick={async () => { try { await navigator.clipboard.writeText(rawHtml); } catch {} }}
                title="원문 HTML 복사"
              >
                복사
              </button>
            )}
          </div>
        </header>
        {showRaw ? (
          <pre className="p-3 text-xs md:text-sm leading-relaxed bg-[#1e1e1e] border border-white/10 rounded overflow-auto whitespace-pre">
            {rawHtml || doc.contentHtml}
          </pre>
        ) : (
          <article ref={containerRef} className="docs-content" dangerouslySetInnerHTML={{ __html: processedHtml || doc.contentHtml }} />
        )}
      </div>
      <aside className="hidden md:block sticky top-16 self-start max-h-[calc(100vh-6rem)] overflow-auto">
        <div className="text-xs uppercase text-gray-400 tracking-wider mb-2">On this page</div>
        {toc.length === 0 ? (
          <div className="text-sm text-gray-500">No headings</div>
        ) : (
          <ul className="text-sm space-y-1">
            {toc.map(item => (
              <li key={item.id} className={item.level === 3 ? 'ml-3' : ''}>
                <a href={`#${item.id}`} className="text-gray-300 hover:text-white">
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
};

export default DocsPage;
