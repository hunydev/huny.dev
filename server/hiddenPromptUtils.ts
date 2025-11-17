import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import DOMMatrixPolyfill from 'dommatrix';

export type SuspiciousStyleFlags = {
  too_small_font?: boolean;
  near_page_edge?: boolean;
  white_on_white?: boolean;
  overlapped_by_other_objects?: boolean;
  [key: string]: boolean | undefined;
};

export type PdfBlock = {
  id: string;
  page: number;
  text: string;
  bbox: { x: number; y: number; width: number; height: number };
  font_size: number;
  color: string;
  opacity: number;
  layer_visible: boolean;
  suspicious_style_flags: SuspiciousStyleFlags;
  neighbor_texts: string[];
};

export type ExtractedPdf = {
  document_meta: {
    title: string;
    num_pages: number;
    file_name?: string;
    file_size_bytes?: number;
    truncated?: boolean;
  };
  blocks: PdfBlock[];
};

const DEFAULT_MAX_BLOCKS = 1500;

const ensureDomMatrixForPdfjs = () => {
  if (typeof (globalThis as any).DOMMatrix === 'undefined') {
    (globalThis as any).DOMMatrix = DOMMatrixPolyfill as unknown;
  }
  if (typeof (globalThis as any).DOMMatrixReadOnly === 'undefined') {
    (globalThis as any).DOMMatrixReadOnly = (globalThis as any).DOMMatrix;
  }
  if (typeof (globalThis as any).DOMPoint === 'undefined') {
    class SimpleDOMPoint {
      x: number;
      y: number;
      z: number;
      w: number;
      constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = Number(x) || 0;
        this.y = Number(y) || 0;
        this.z = Number(z) || 0;
        this.w = Number(w) || 1;
      }
      matrixTransform(matrix: any) {
        if (matrix && typeof matrix.transformPoint === 'function') {
          return matrix.transformPoint(this);
        }
        return new SimpleDOMPoint(this.x, this.y, this.z, this.w);
      }
      static fromPoint(other?: Partial<SimpleDOMPoint>) {
        if (!other) return new SimpleDOMPoint();
        return new SimpleDOMPoint(other.x, other.y, other.z, other.w);
      }
    }
    (globalThis as any).DOMPoint = SimpleDOMPoint;
  }
};

const ensureProcessForPdfjs = () => {
  if (typeof (globalThis as any).process === 'undefined') {
    const processShim: any = {
      env: {},
      versions: { node: '18.0.0' },
      getBuiltinModule: () => undefined,
    };
    Object.defineProperty(processShim, Symbol.toStringTag, { value: 'process' });
    (globalThis as any).process = processShim;
  } else if (typeof (globalThis as any).process.getBuiltinModule !== 'function') {
    (globalThis as any).process.getBuiltinModule = () => undefined;
  }
};

let pdfjsLibPromise: Promise<typeof import('pdfjs-dist/legacy/build/pdf.mjs')> | null = null;
let pdfjsWorkerModulePromise: Promise<any> | null = null;

const ensurePdfjsWorkerModule = async () => {
  if ((globalThis as any).pdfjsWorker) return;
  if (!pdfjsWorkerModulePromise) {
    pdfjsWorkerModulePromise = import('pdfjs-dist/legacy/build/pdf.worker.mjs')
      .then((workerModule) => {
        (globalThis as any).pdfjsWorker = workerModule;
        return workerModule;
      })
      .catch((err) => {
        console.warn('Failed to preload pdf.worker.mjs', err);
        return null;
      });
  }
  await pdfjsWorkerModulePromise;
};

const ensureCanvasForPdfjs = () => {
  if (typeof (globalThis as any).ImageData === 'undefined') {
    class MinimalImageData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      constructor(width: number, height: number, data?: Uint8ClampedArray) {
        this.width = width;
        this.height = height;
        this.data = data ?? new Uint8ClampedArray(width * height * 4);
      }
    }
    (globalThis as any).ImageData = MinimalImageData;
  }
  if (typeof (globalThis as any).Path2D === 'undefined') {
    class MinimalPath2D {
      constructor(_path?: string | MinimalPath2D) {}
      addPath() {}
      closePath() {}
      moveTo() {}
      lineTo() {}
      bezierCurveTo() {}
      quadraticCurveTo() {}
      arc() {}
      arcTo() {}
      ellipse() {}
      rect() {}
    }
    (globalThis as any).Path2D = MinimalPath2D;
  }
};

const getPdfjs = async () => {
  if (!pdfjsLibPromise) {
    ensureProcessForPdfjs();
    ensureDomMatrixForPdfjs();
    ensureCanvasForPdfjs();
    await ensurePdfjsWorkerModule();
    pdfjsLibPromise = import('pdfjs-dist/legacy/build/pdf.mjs');
  }
  return pdfjsLibPromise;
};

const wrapText = (text: string, maxLen = 90): string[] => {
  return text
    .split('\n')
    .flatMap(line => {
      const trimmed = line.trim();
      if (!trimmed) return [''];
      const chunks: string[] = [];
      let start = 0;
      while (start < trimmed.length) {
        chunks.push(trimmed.slice(start, start + maxLen));
        start += maxLen;
      }
      return chunks;
    });
};

export async function extractBlocksFromPdf(file: File, options?: { maxBlocks?: number }): Promise<ExtractedPdf> {
  const pdfjsLib = await getPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    isEvalSupported: false,
  });

  const blocks: PdfBlock[] = [];
  const maxBlocks = options?.maxBlocks ?? DEFAULT_MAX_BLOCKS;
  let truncated = false;

  const pdf = await loadingTask.promise;

  try {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (blocks.length >= maxBlocks) {
        truncated = true;
        break;
      }
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const pageHeight = viewport.height;
      const pageWidth = viewport.width;
      const content = await page.getTextContent();
      const pageBlocks: PdfBlock[] = [];

      for (const rawItem of content.items as any[]) {
        const text = typeof rawItem?.str === 'string' ? rawItem.str.trim() : '';
        if (!text) continue;

        const transform: number[] = Array.isArray(rawItem.transform) ? rawItem.transform : [];
        const [a = 0, , , d = 0, e = 0, f = 0] = transform;
        const fontSize = Math.max(0, Math.sqrt(a * a + d * d));
        const width = typeof rawItem.width === 'number' ? rawItem.width : fontSize * text.length * 0.6;
        const height = typeof rawItem.height === 'number' ? rawItem.height : fontSize;
        const x = e;
        const y = f;

        const nearEdge = x < 20 || y < 20 || x > pageWidth - 20 || y > pageHeight - 20;
        const block: PdfBlock = {
          id: `b${String(blocks.length + pageBlocks.length + 1).padStart(4, '0')}`,
          page: pageNum,
          text,
          bbox: { x, y, width, height },
          font_size: fontSize,
          color: '#000000',
          opacity: 1,
          layer_visible: true,
          suspicious_style_flags: {
            too_small_font: fontSize < 5,
            near_page_edge: nearEdge,
            white_on_white: false,
            overlapped_by_other_objects: false,
          },
          neighbor_texts: [],
        };
        pageBlocks.push(block);

        if (blocks.length + pageBlocks.length >= maxBlocks) {
          truncated = true;
          break;
        }
      }

      for (let i = 0; i < pageBlocks.length; i++) {
        const neighbors: string[] = [];
        if (pageBlocks[i - 1]) neighbors.push(pageBlocks[i - 1].text);
        if (pageBlocks[i + 1]) neighbors.push(pageBlocks[i + 1].text);
        pageBlocks[i].neighbor_texts = neighbors;
      }

      blocks.push(...pageBlocks);
    }
  } finally {
    await loadingTask.destroy();
  }

  return {
    document_meta: {
      title: file.name || 'uploaded.pdf',
      num_pages: pdf.numPages,
      file_name: file.name,
      file_size_bytes: file.size,
      truncated,
    },
    blocks,
  };
}

export async function createSuspiciousPdf(extracted: ExtractedPdf, suspiciousIds: string[]): Promise<Uint8Array | null> {
  if (!suspiciousIds.length) return null;
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const suspiciousSet = new Set(suspiciousIds);

  const grouped = new Map<number, PdfBlock[]>();
  for (const block of extracted.blocks) {
    if (!suspiciousSet.has(block.id)) continue;
    const arr = grouped.get(block.page);
    if (arr) arr.push(block);
    else grouped.set(block.page, [block]);
  }

  if (grouped.size === 0) return null;

  const A4 = { width: 595.28, height: 841.89 };

  for (const [pageNum, blocks] of Array.from(grouped.entries()).sort(([a], [b]) => a - b)) {
    let page = pdfDoc.addPage([A4.width, A4.height]);
    let cursorY = A4.height - 60;

    const drawLine = (line: string, color = rgb(0, 0, 0), size = 10) => {
      if (cursorY < 50) {
        page = pdfDoc.addPage([A4.width, A4.height]);
        cursorY = A4.height - 60;
      }
      page.drawText(line, {
        x: 40,
        y: cursorY,
        size,
        font,
        color,
        lineHeight: 14,
      });
      cursorY -= 14;
    };

    drawLine(`Suspicious blocks on original page ${pageNum}`, rgb(0.8, 0.1, 0.1), 12);
    cursorY -= 6;

    for (const block of blocks) {
      drawLine(`[${block.id}] font ${block.font_size.toFixed(1)}pt`, rgb(0.4, 0.4, 0.4), 9);
      const wrapped = wrapText(block.text || '', 100);
      wrapped.forEach(line => drawLine(line || '(empty)'));
      cursorY -= 8;
    }
  }

  return pdfDoc.save();
}
