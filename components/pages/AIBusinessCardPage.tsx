import React from 'react';
import type { PageProps } from '../../types';
import { ErrorMessage, LoadingButton } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';

// Types for user fields and text boxes
export type FieldItem = { id: string; label: string; value: string };
export type TextBox = {
  id: string;
  fieldId?: string; // link to field
  text: string;
  x: number; y: number; // in px
  fontSize: number; // px
  fontFamily: string;
  color: string;
  align: 'left' | 'center' | 'right';
};

const uid = () => Math.random().toString(36).slice(2, 9);

const defaultFields = (): FieldItem[] => [
  { id: uid(), label: '이름', value: '' },
  { id: uid(), label: '소속/직함', value: '' },
  { id: uid(), label: '전화번호', value: '' },
  { id: uid(), label: '사무실', value: '' },
  { id: uid(), label: '팩스', value: '' },
  { id: uid(), label: '이메일', value: '' },
];

const CANVAS_W = 1050; // 3.5in at 300dpi
const CANVAS_H = 600;  // 2.0in at 300dpi

const fonts = [
  { name: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial', label: 'Inter/System' },
  { name: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { name: 'Times New Roman, Times, serif', label: 'Times' },
  { name: 'Georgia, serif', label: 'Georgia' },
];

const AIBusinessCardPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [fields, setFields] = React.useState<FieldItem[]>(defaultFields);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [extraImages, setExtraImages] = React.useState<File[]>([]);
  const [extraPrompt, setExtraPrompt] = React.useState('');
  const [includeBack, setIncludeBack] = React.useState(false);

  // Generated images
  const [frontImg, setFrontImg] = React.useState<string>('');
  const [backImg, setBackImg] = React.useState<string>('');

  type CardResponse = { images: { front: string; back?: string } };
  const api = useApiCall<CardResponse>({
    url: '/api/ai-business-card',
    method: 'POST',
    tabId: 'ai-business-card',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      const front = data?.images?.front || '';
      const back = data?.images?.back || '';
      setFrontImg(front);
      setBackImg(back);
      setActiveSide('front');
      resetLayout();
    },
  });

  // Text overlays per side
  const [textBoxesFront, setTextBoxesFront] = React.useState<TextBox[]>([]);
  const [textBoxesBack, setTextBoxesBack] = React.useState<TextBox[]>([]);
  const [activeSide, setActiveSide] = React.useState<'front' | 'back'>('front');
  const [selectedId, setSelectedId] = React.useState<string>('');

  const previewShellRef = React.useRef<HTMLDivElement | null>(null);
  const [canvasScale, setCanvasScale] = React.useState(1);
  const scaleRef = React.useRef(1);

  React.useEffect(() => {
    scaleRef.current = canvasScale;
  }, [canvasScale]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.ResizeObserver === 'undefined') {
      setCanvasScale(1);
      return;
    }
    const el = previewShellRef.current;
    if (!el) return;

    const applyScale = (width: number) => {
      if (!width) return;
      const next = Math.min(1, width / CANVAS_W);
      setCanvasScale((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
    };

    applyScale(el.clientWidth);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        applyScale(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const addField = () => setFields(prev => [...prev, { id: uid(), label: '커스텀', value: '' }]);
  const removeField = (id: string) => setFields(prev => prev.filter(f => f.id !== id));
  const updateField = (id: string, patch: Partial<FieldItem>) => setFields(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));

  const currentBoxes = activeSide === 'front' ? textBoxesFront : textBoxesBack;
  const setCurrentBoxes = (updater: (prev: TextBox[]) => TextBox[]) => {
    if (activeSide === 'front') setTextBoxesFront(updater);
    else setTextBoxesBack(updater);
  };

  const addTextBoxFromField = (field: FieldItem) => {
    const margin = 40;
    const existing = currentBoxes.length;
    const newBox: TextBox = {
      id: uid(), fieldId: field.id, text: field.value,
      x: margin, y: margin + existing * 60,
      fontSize: 28, fontFamily: fonts[0].name, color: '#ffffff', align: 'left'
    };
    setCurrentBoxes(prev => [...prev, newBox]);
  };

  const onMouseDownBox = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSelectedId(id);
    const startX = e.clientX, startY = e.clientY;
    const initial = currentBoxes.find(b => b.id === id)!;
    const initX = initial.x, initY = initial.y;
    const onMove = (ev: MouseEvent) => {
      const scale = scaleRef.current || 1;
      const dx = (ev.clientX - startX) / scale;
      const dy = (ev.clientY - startY) / scale;
      setCurrentBoxes(prev => prev.map(b => b.id === id ? { ...b, x: Math.max(0, Math.min(CANVAS_W - 10, initX + dx)), y: Math.max(0, Math.min(CANVAS_H - 10, initY + dy)) } : b));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const changeFontSize = (delta: number) => {
    if (!selectedId) return;
    setCurrentBoxes(prev => prev.map(b => b.id === selectedId ? { ...b, fontSize: Math.max(8, Math.min(96, b.fontSize + delta)) } : b));
  };

  const setFontFamily = (name: string) => {
    if (!selectedId) return;
    setCurrentBoxes(prev => prev.map(b => b.id === selectedId ? { ...b, fontFamily: name } : b));
  };

  const setColor = (color: string) => {
    if (!selectedId) return;
    setCurrentBoxes(prev => prev.map(b => b.id === selectedId ? { ...b, color } : b));
  };

  const setAlign = (align: 'left' | 'center' | 'right') => {
    if (!selectedId) return;
    setCurrentBoxes(prev => prev.map(b => b.id === selectedId ? { ...b, align } : b));
  };

  const resetLayout = () => {
    const margin = 40;
    const boxes: TextBox[] = fields.filter(f => f.value.trim()).map((f, i) => ({
      id: uid(), fieldId: f.id, text: f.value.trim(), x: margin, y: margin + i * 60, fontSize: 28, fontFamily: fonts[0].name, color: '#ffffff', align: 'left'
    }));
    setTextBoxesFront(boxes);
    if (includeBack) setTextBoxesBack([]);
    setSelectedId('');
  };

  const generateDesign = async () => {
    setFrontImg('');
    setBackImg('');
    const fd = new FormData();
    if (logoFile) fd.append('logo', logoFile);
    for (const f of extraImages) fd.append('extras', f);
    fd.append('include_back', includeBack ? '1' : '0');
    fd.append('prompt', extraPrompt || '');
    fd.append('fields', JSON.stringify(fields));
    await api.execute({ body: fd });
  };

  const exportPNG = async () => {
    const bg = activeSide === 'front' ? frontImg : backImg;
    if (!bg) return;
    const img = new Image();
    img.src = bg;
    await img.decode().catch(() => {});
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_W; canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H);
    const boxes = activeSide === 'front' ? textBoxesFront : textBoxesBack;
    for (const b of boxes) {
      ctx.save();
      ctx.fillStyle = b.color;
      ctx.font = `${b.fontSize}px ${b.fontFamily}`;
      ctx.textAlign = b.align as CanvasTextAlign;
      const x = b.align === 'left' ? b.x : b.align === 'center' ? b.x + 0 : b.x; // simplified, use x directly
      ctx.fillText(b.text, x, b.y);
      ctx.restore();
    }
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-card-${activeSide}.png`;
    a.click();
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-pink-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden>
              <path d="M3 5h18v14H3zm2 2v10h14V7zM6 9h6v2H6zm0 3h8v2H6z"/>
            </svg>
          </span>
          AI Business Card
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">로고/추가 이미지와 입력 정보를 바탕으로 Gemini가 명함 배경 시안을 생성하고, 캔버스 위에서 텍스트를 배치/편집할 수 있습니다.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: form */}
        <div className="rounded border border-white/10 bg-[#1e1e1e] p-3 space-y-3">
          <div className="space-y-2">
            <label className="block text-xs text-gray-400">로고 업로드</label>
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-gray-400">추가 이미지 (선택)</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setExtraImages(Array.from(e.target.files || []))} />
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-gray-400">옵션</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeBack} onChange={(e) => setIncludeBack(e.target.checked)} className="accent-blue-500"/> 뒷면 포함</label>
          </div>
          <div className="space-y-2">
            <label className="block text-xs text-gray-400">추가 프롬프트 (선택)</label>
            <textarea value={extraPrompt} onChange={(e) => setExtraPrompt(e.target.value)} className="w-full px-2 py-1 rounded bg-[#1e1e1e] border border-white/10 text-gray-200" rows={3} placeholder="스타일 지시사항, 컬러 팔레트, 분위기 등" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">필드</label>
              <button onClick={addField} className="px-2 py-1 text-xs rounded border border-white/10 hover:bg-white/10">필드 추가</button>
            </div>
            <div className="space-y-2">
              {fields.map((f) => (
                <div key={f.id} className="flex items-center gap-2">
                  <input value={f.label} onChange={(e) => updateField(f.id, { label: e.target.value })} className="w-28 px-2 py-1 rounded bg-[#1e1e1e] border border-white/10 text-gray-200 text-xs" placeholder="라벨" />
                  <input value={f.value} onChange={(e) => updateField(f.id, { value: e.target.value })} className="flex-1 min-w-0 px-2 py-1 rounded bg-[#1e1e1e] border border-white/10 text-gray-200 text-xs" placeholder="값" />
                  <button onClick={() => removeField(f.id)} className="p-1 rounded border border-white/10 hover:bg-white/10" title="삭제" aria-label="삭제">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                  </button>
                  <button onClick={() => addTextBoxFromField(f)} className="p-1 rounded border border-white/10 hover:bg-white/10" title="캔버스에 추가" aria-label="캔버스에 추가">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2">
              <LoadingButton
                onClick={generateDesign}
                disabled={!logoFile}
                loading={api.loading}
                loadingText="생성 중…"
                idleText="시안 생성"
                variant="secondary"
                className="px-3 py-2 text-sm"
              />
              <button onClick={resetLayout} className="px-3 py-2 rounded text-sm border border-white/10 text-gray-300 hover:bg-white/10">레이아웃 초기화</button>
            </div>
            <ErrorMessage error={api.error} />
          </div>
        </div>

        {/* Right: Canvas & controls */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveSide('front')} className={`px-2 py-1 text-xs rounded border border-white/10 ${activeSide==='front'?'bg-white/10 text-white':'text-gray-300 hover:bg-white/10'}`}>앞면</button>
            <button onClick={() => setActiveSide('back')} disabled={!includeBack} className={`px-2 py-1 text-xs rounded border border-white/10 ${activeSide==='back'?'bg-white/10 text-white':'text-gray-300 hover:bg-white/10'} ${includeBack?'':'opacity-50'}`}>뒷면</button>
            <div className="ml-auto flex items-center gap-2">
              <select onChange={(e)=>setFontFamily(e.target.value)} className="px-2 py-1 text-xs rounded bg-[#1e1e1e] border border-white/10 text-gray-200">
                {fonts.map(f=> <option key={f.name} value={f.name}>{f.label}</option>)}
              </select>
              <div className="flex items-center gap-1">
                <button onClick={()=>changeFontSize(-2)} className="px-2 py-1 text-xs rounded border border-white/10 hover:bg-white/10">A-</button>
                <button onClick={()=>changeFontSize(+2)} className="px-2 py-1 text-xs rounded border border-white/10 hover:bg-white/10">A+</button>
              </div>
              <input type="color" onChange={(e)=>setColor(e.target.value)} className="w-8 h-7 p-0 bg-transparent border border-white/10 rounded" />
              <div className="flex items-center gap-1">
                <button onClick={()=>setAlign('left')} className="px-2 py-1 text-xs rounded border border-white/10 hover:bg-white/10">좌</button>
                <button onClick={()=>setAlign('center')} className="px-2 py-1 text-xs rounded border border-white/10 hover:bg-white/10">중</button>
                <button onClick={()=>setAlign('right')} className="px-2 py-1 text-xs rounded border border-white/10 hover:bg-white/10">우</button>
              </div>
              <button onClick={exportPNG} className="px-2 py-1 text-xs rounded border border-white/10 hover:bg-white/10">PNG 내보내기</button>
            </div>
          </div>

          <div
            ref={previewShellRef}
            className="relative border border-white/10 rounded bg-black/40 overflow-hidden mx-auto"
            style={{ width: '100%', maxWidth: CANVAS_W, height: CANVAS_H * canvasScale }}
          >
            <div
              className="relative origin-top-left"
              style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${canvasScale})` }}
            >
              {activeSide === 'front' && frontImg && (
                <img src={frontImg} alt="front" className="absolute inset-0 w-full h-full object-cover" />
              )}
              {activeSide === 'back' && includeBack && backImg && (
                <img src={backImg} alt="back" className="absolute inset-0 w-full h-full object-cover" />
              )}
              {/* Text boxes */}
              {(activeSide === 'front' ? textBoxesFront : textBoxesBack).map((b) => (
                <div
                  key={b.id}
                  onMouseDown={(e)=>onMouseDownBox(e, b.id)}
                  onClick={()=>setSelectedId(b.id)}
                  className={`absolute cursor-move ${selectedId===b.id?'outline outline-1 outline-blue-400':''}`}
                  style={{ left: b.x, top: b.y, color: b.color, fontSize: b.fontSize, fontFamily: b.fontFamily, textAlign: b.align as any, whiteSpace: 'pre' }}
                  title={b.fieldId || b.id}
                >
                  {b.text}
                </div>
              ))}
              {!frontImg && activeSide==='front' && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">시안을 생성하면 미리보기가 표시됩니다.</div>
              )}
              {activeSide==='back' && includeBack && !backImg && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">뒷면 시안을 생성하면 미리보기가 표시됩니다.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIBusinessCardPage;
