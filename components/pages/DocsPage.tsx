import React from 'react';
import { PageProps } from '../../types';
import { DOCS, getDocBySlug } from './docsData';

const DocsPage: React.FC<PageProps> = ({ routeParams, onOpenFile }) => {
  const slug = routeParams?.slug as string | undefined;
  const doc = getDocBySlug(slug);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [processedHtml, setProcessedHtml] = React.useState<string>('');
  const [toc, setToc] = React.useState<Array<{ id: string; text: string; level: number }>>([]);

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
    if (doc) {
      const { html, toc } = processHtml(doc.contentHtml);
      setProcessedHtml(html);
      setToc(toc);
    } else {
      setProcessedHtml('');
      setToc([]);
    }
  }, [doc, processHtml]);

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
        <header className="mb-4">
          <h1 className="text-xl md:text-2xl font-semibold text-white truncate" title={doc.title}>{doc.title}</h1>
          <p className="text-xs text-gray-500">{doc.slug}.html</p>
        </header>
        <article ref={containerRef} className="docs-content" dangerouslySetInnerHTML={{ __html: processedHtml || doc.contentHtml }} />
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
