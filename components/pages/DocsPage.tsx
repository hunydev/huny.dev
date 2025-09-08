import React from 'react';
import { PageProps } from '../../types';
import { DOCS, getDocBySlug } from './docsData';

const DocsPage: React.FC<PageProps> = ({ routeParams, onOpenFile }) => {
  const slug = routeParams?.slug as string | undefined;
  const doc = getDocBySlug(slug);

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
    <div className="max-w-5xl mx-auto px-4">
      <header className="mb-4">
        <h1 className="text-xl md:text-2xl font-semibold text-white truncate" title={doc.title}>{doc.title}</h1>
        <p className="text-xs text-gray-500">{doc.slug}.html</p>
      </header>
      <article className="docs-content" dangerouslySetInnerHTML={{ __html: doc.contentHtml }} />
    </div>
  );
};

export default DocsPage;
