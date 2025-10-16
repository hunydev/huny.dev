import React from 'react';
import type { PageProps } from '../../types';
import { ErrorMessage, LoadingButton, FileDropZone, ApiProviderBadge } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Icon } from '../../constants/icons';

const UIClonePage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [html, setHtml] = React.useState<string>('');

  const fileUpload = useFileUpload({
    accept: 'image/*',
    maxSize: 10 * 1024 * 1024,
  });

  type UICloneResponse = { html: string };
  const api = useApiCall<UICloneResponse>({
    url: '/api/ui-clone',
    method: 'POST',
    tabId: 'ui-clone',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      const outHtml = data?.html || '';
      if (!outHtml) {
        api.setError('서버가 유효한 HTML을 반환하지 않았습니다.');
        return;
      }
      setHtml(outHtml);
    },
  });

  // Handle paste (global on this page)
  React.useEffect(() => {
    window.addEventListener('paste', fileUpload.onPaste);
    return () => window.removeEventListener('paste', fileUpload.onPaste);
  }, [fileUpload.onPaste]);

  const resetAll = () => {
    fileUpload.reset();
    setHtml('');
  };

  const generate = async () => {
    if (!fileUpload.file) {
      api.setError('이미지를 업로드하거나 붙여넣어 주세요.');
      return;
    }
    setHtml('');
    const fd = new FormData();
    fd.append('image', fileUpload.file);
    fd.append('constraints', 'single-file html with inline <style>; no external fetch; semantic structure; minimal JS if needed; responsive when possible');
    await api.execute({ body: fd });
  };

  const downloadHtml = () => {
    if (!html) return;
    const blob = new Blob([html], { type: 'text/html;charset=UTF-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ui-clone.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyHtml = async () => {
    if (!html) return;
    try {
      await navigator.clipboard.writeText(html);
      alert('HTML이 클립보드에 복사되었습니다.');
    } catch {}
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-pink-300">
            {/* Layers/clone icon */}
            <Icon name="uiClone" className="w-6 h-6"/>
          </span>
          UI Clone
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">캡쳐 이미지를 업로드/붙여넣기 후, Gemini로 단일 HTML 파일(인라인 CSS 포함)을 생성하고, 샌드박스된 프리뷰와 다운로드를 제공합니다.</p>
        <div className="mt-2">
          <ApiProviderBadge provider="gemini" />
        </div>
      </header>

      <section className="rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <h2 className="text-sm font-medium text-white mb-2">입력 이미지</h2>
        <FileDropZone
          file={fileUpload.file}
          previewUrl={fileUpload.previewUrl}
          error={fileUpload.error}
          isDragging={fileUpload.isDragging}
          accept="image/*"
          onDrop={fileUpload.onDrop}
          onDragOver={fileUpload.onDragOver}
          onDragEnter={fileUpload.onDragEnter}
          onDragLeave={fileUpload.onDragLeave}
          onInputChange={fileUpload.onInputChange}
          onReset={resetAll}
          label="이미지를 드래그&드롭하거나 클릭하여 업로드, 또는 페이지에서 직접 붙여넣기(Ctrl/Cmd + V)"
          previewClassName="max-h-64 object-contain"
        />
        <div className="mt-3 flex items-center gap-2">
          <LoadingButton
            loading={api.loading}
            disabled={!fileUpload.file}
            onClick={generate}
            loadingText="생성 중…"
            idleText="생성"
            variant="primary"
            className="px-3 py-2 text-sm"
          />
          <LoadingButton
            loading={false}
            onClick={resetAll}
            loadingText=""
            idleText="초기화"
            variant="secondary"
          />
          <ErrorMessage error={api.error || fileUpload.error} />
        </div>
      </section>

      <section className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-white">프리뷰 (격리)</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded text-sm border border-white/10 text-gray-300 hover:bg-white/10"
              onClick={copyHtml}
              disabled={!html}
              title="HTML 복사"
            >복사</button>
            <button
              type="button"
              className="px-3 py-2 rounded text-sm border border-white/10 text-gray-300 hover:bg-white/10"
              onClick={downloadHtml}
              disabled={!html}
              title="HTML 다운로드"
            >다운로드</button>
          </div>
        </div>
        {html ? (
          <div className="rounded border border-white/10 bg-[#0b0b0b]">
            <iframe
              title="ui-clone-preview"
              sandbox="allow-scripts allow-forms allow-same-origin"
              srcDoc={html}
              className="w-full h-[480px] rounded"
            />
          </div>
        ) : (
          <div className="text-sm text-gray-500">아직 결과가 없습니다. 이미지를 업로드/붙여넣고 ‘생성’을 눌러보세요.</div>
        )}
      </section>
    </div>
  );
};

export default UIClonePage;
