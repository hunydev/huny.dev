import React from 'react';
import type { PageProps } from '../../types';
import {
  StickyNote,
  NOTE_COLORS,
  FONT_SIZE_PX,
  nextZ,
  getNotesByGroupId,
  saveNotesByGroupId,
  getNoteGroupById,
  emitNotesChanged,
} from './notesData';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

// Utilities to derive accessible foreground color for a given background
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  try {
    const clean = hex.replace('#', '');
    const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  } catch {
    return null;
  }
};

const getContrastColor = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#111';
  // Perceived luminance (https://www.w3.org/TR/AERT/#color-contrast)
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.6 ? '#111' : '#fff';
};

const stopPointerPropagation = (e: React.PointerEvent) => {
  e.stopPropagation();
};

const NotesBoardPage: React.FC<PageProps> = ({ routeParams }) => {
  const groupId = routeParams?.groupId || '';
  const group = getNoteGroupById(groupId);

  const [notes, setNotes] = React.useState<StickyNote[]>([]);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const dragOffset = React.useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const [resizing, setResizing] = React.useState<{
    id: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);
  const boardRef = React.useRef<HTMLDivElement | null>(null);
  const notesRef = React.useRef<StickyNote[]>([]);
  const [colorFilters, setColorFilters] = React.useState<Partial<Record<string, boolean>>>({});
  React.useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Load notes when group changes
  React.useEffect(() => {
    if (!groupId) return;
    const data = getNotesByGroupId(groupId);
    setNotes(data);
  }, [groupId]);

  // Persist notes when changed (debounced lightly)
  React.useEffect(() => {
    if (!groupId) return;
    const id = window.setTimeout(() => saveNotesByGroupId(groupId, notes), 150);
    return () => window.clearTimeout(id);
  }, [groupId, notes]);

  React.useEffect(() => {
    if (!groupId) return;
    emitNotesChanged(groupId, notes);
    setColorFilters(prev => {
      const colors = new Set<string>(notes.map(n => n.color));
      let changed = false;
      const next: Partial<Record<string, boolean>> = {};
      colors.forEach((color: string) => {
        if (!Object.prototype.hasOwnProperty.call(prev, color)) {
          changed = true;
          next[color] = true;
        } else {
          next[color] = prev[color];
        }
      });
      Object.keys(prev).forEach((color: string) => {
        if (!colors.has(color)) {
          changed = true;
        }
      });
      if (!changed) return prev;
      return next;
    });
  }, [groupId, notes]);

  const addNote = () => {
    const z = nextZ(notes);
    const color = NOTE_COLORS[notes.length % NOTE_COLORS.length];
    const newNote: StickyNote = {
      id: `n-${Date.now()}`,
      text: '',
      x: 24 + (notes.length * 16) % 160,
      y: 24 + (notes.length * 16) % 120,
      z,
      color,
      fontSize: 'md',
      w: 240,
      h: 128,
    };
    setNotes(prev => [...prev, newNote]);
    setColorFilters(prev => {
      const current = prev[newNote.color];
      if (current === undefined || current === false) {
        return { ...prev, [newNote.color]: true };
      }
      return prev;
    });
  };

  const updateNote = (id: string, patch: Partial<StickyNote>) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...patch } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const bringToFront = (id: string) => {
    const z = nextZ(notes);
    updateNote(id, { z });
  };

  const sendToBack = (id: string) => {
    updateNote(id, { z: 1 });
  };

  const cycleColor = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    const idx = NOTE_COLORS.findIndex(c => c === note.color);
    const next = NOTE_COLORS[(idx + 1) % NOTE_COLORS.length];
    updateNote(id, { color: next });
  };

  const changeFontSize = (id: string, size: StickyNote['fontSize']) => {
    updateNote(id, { fontSize: size });
  };

  const toggleColor = (color: string) => {
    setColorFilters(prev => {
      if (!Object.prototype.hasOwnProperty.call(prev, color)) return prev;
      const enabledCount = Object.values(prev).filter((value): value is true => value === true).length;
      if (prev[color] && enabledCount <= 1) {
        return prev;
      }
      return { ...prev, [color]: !prev[color] };
    });
  };

  const showAllColors = () => {
    setColorFilters(prev => {
      if (Object.values(prev).every(value => value === true)) return prev;
      const next: Partial<Record<string, boolean>> = {};
      Object.keys(prev).forEach((color: string) => {
        next[color] = true;
      });
      return next;
    });
  };

  const orderedNotes = React.useMemo(() => [...notes].sort((a, b) => a.z - b.z), [notes]);
  const visibleNotes = React.useMemo(
    () => orderedNotes.filter(n => {
      const state = colorFilters[n.color];
      return state === undefined ? true : state;
    }),
    [orderedNotes, colorFilters]
  );

  const onNotePointerDown = (e: React.PointerEvent, id: string) => {
    // Allow touch/pen/mouse primary interactions. For mouse, restrict to left button.
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const note = notes.find(n => n.id === id);
    if (!note) return;
    bringToFront(id);
    setDragId(id);
    dragOffset.current = { dx: e.clientX - note.x, dy: e.clientY - note.y };
    // Ensure continuous pointer events during drag on touch devices
    try { (e.currentTarget as any)?.setPointerCapture?.(e.pointerId); } catch {}
    document.body.style.userSelect = 'none';
  };

  React.useEffect(() => {
    if (!dragId) return;
    const onMove = (ev: PointerEvent) => {
      const board = boardRef.current;
      const rect = board?.getBoundingClientRect();
      const note = notesRef.current.find(n => n.id === dragId);
      const noteW = note?.w ?? 60;
      const noteH = (note ? note.h + 36 : 40); // textarea height + toolbar
      const maxX = rect ? rect.width - noteW : window.innerWidth;
      const maxY = rect ? rect.height - noteH : window.innerHeight;
      const x = clamp(ev.clientX - dragOffset.current.dx, 0, Math.max(0, maxX));
      const y = clamp(ev.clientY - dragOffset.current.dy, 0, Math.max(0, maxY));
      updateNote(dragId, { x, y });
    };
    const onUp = () => {
      setDragId(null);
      document.removeEventListener('pointermove', onMove as any);
      document.removeEventListener('pointerup', onUp as any);
      document.removeEventListener('pointercancel', onUp as any);
      document.body.style.userSelect = '';
    };
    document.addEventListener('pointermove', onMove as any);
    document.addEventListener('pointerup', onUp as any);
    document.addEventListener('pointercancel', onUp as any);
    return () => {
      document.removeEventListener('pointermove', onMove as any);
      document.removeEventListener('pointerup', onUp as any);
      document.removeEventListener('pointercancel', onUp as any);
    };
  }, [dragId]);

  // Resizing
  const onResizePointerDown = (e: React.PointerEvent, id: string) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const note = notes.find(n => n.id === id);
    if (!note) return;
    bringToFront(id);
    setResizing({ id, startX: e.clientX, startY: e.clientY, startW: note.w, startH: note.h });
    // Capture pointer so move events keep firing even if finger leaves the handle area
    try { (e.currentTarget as any)?.setPointerCapture?.(e.pointerId); } catch {}
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'se-resize';
  };

  React.useEffect(() => {
    if (!resizing) return;
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - resizing.startX;
      const dy = ev.clientY - resizing.startY;
      const board = boardRef.current;
      const rect = board?.getBoundingClientRect();
      const note = notesRef.current.find(n => n.id === resizing.id);
      if (!note) return;
      const minW = 160;
      const minH = 100;
      const maxW = rect ? Math.max(minW, rect.width - note.x - 8) : resizing.startW + dx;
      const maxH = rect ? Math.max(minH, rect.height - note.y - 8 - 36) : resizing.startH + dy;
      const newW = clamp(resizing.startW + dx, minW, maxW);
      const newH = clamp(resizing.startH + dy, minH, maxH);
      updateNote(resizing.id, { w: newW, h: newH });
    };
    const onUp = () => {
      setResizing(null);
      document.removeEventListener('pointermove', onMove as any);
      document.removeEventListener('pointerup', onUp as any);
      document.removeEventListener('pointercancel', onUp as any);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    document.addEventListener('pointermove', onMove as any);
    document.addEventListener('pointerup', onUp as any);
    document.addEventListener('pointercancel', onUp as any);
    return () => {
      document.removeEventListener('pointermove', onMove as any);
      document.removeEventListener('pointerup', onUp as any);
      document.removeEventListener('pointercancel', onUp as any);
    };
  }, [resizing]);

  if (!groupId) {
    return (
      <div className="text-gray-400">
        <p>Select a notes group from the sidebar to start.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full min-h-[480px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-sm" style={{ background: group?.color || '#9ca3af' }} />
          <h2 className="text-lg text-white font-medium">{`Notes – ${group?.name || groupId}`}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addNote} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-sm">Add note</button>
        </div>
      </div>

      {Object.keys(colorFilters).length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
          <span className="uppercase tracking-wider text-[10px] text-gray-500">Filters</span>
          {Object.entries(colorFilters).map(([color, enabled]) => {
            const isEnabled = enabled !== false;
            return (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                className={`flex items-center gap-2 px-2 py-1 rounded border transition-colors duration-150 ${
                  isEnabled ? 'bg-white/10 border-white/25 text-white' : 'bg-transparent border-white/10 text-gray-400 opacity-70'
                }`}
                title={isEnabled ? '클릭하여 숨기기' : '클릭하여 표시'}
              >
                <span
                  className="inline-block w-3 h-3 rounded-sm border border-black/30"
                  style={{ background: color }}
                  aria-hidden
                />
                <span>{color}</span>
              </button>
            );
          })}
          {Object.values(colorFilters).some(value => value === false) && (
            <button
              onClick={showAllColors}
              className="px-2 py-1 rounded border border-white/20 text-white hover:bg-white/10"
            >
              전체 표시
            </button>
          )}
        </div>
      )}

      <div ref={boardRef} className="relative flex-1 min-h-[420px] rounded border border-black/30 bg-[#252526] overflow-auto">
        {/* Board content area; notes are absolutely positioned within this container */}
        {visibleNotes.map((n) => (
            <div
              key={n.id}
              className="absolute shadow-md rounded p-2 select-none"
              style={{ left: n.x, top: n.y, zIndex: n.z, background: n.color, width: n.w, position: 'absolute', color: getContrastColor(n.color), touchAction: 'none' }}
              onPointerDown={(e) => onNotePointerDown(e, n.id)}
              role="group"
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1 opacity-90">
                  <button
                    onPointerDown={stopPointerPropagation}
                    onClick={(e) => {
                      e.stopPropagation();
                      cycleColor(n.id);
                    }}
                    className="w-5 h-5 rounded border"
                    style={{ background: n.color, borderColor: getContrastColor(n.color) === '#fff' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}
                    title="Change color"
                    aria-label="Change color"
                  />
                  <select
                    onPointerDown={stopPointerPropagation}
                    className="text-xs rounded border px-1 py-0.5"
                    style={{ backgroundColor: getContrastColor(n.color) === '#fff' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', borderColor: getContrastColor(n.color) === '#fff' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }}
                    value={n.fontSize}
                    onChange={(e) => {
                      e.stopPropagation();
                      changeFontSize(n.id, e.target.value as StickyNote['fontSize']);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    title="Font size"
                    aria-label="Font size"
                  >
                    <option value="sm">S</option>
                    <option value="md">M</option>
                    <option value="lg">L</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 opacity-90">
                  <button
                    onPointerDown={stopPointerPropagation}
                    onClick={(e) => {
                      e.stopPropagation();
                      sendToBack(n.id);
                    }}
                    className="px-1 py-0.5 text-xs rounded border"
                    style={{ backgroundColor: getContrastColor(n.color) === '#fff' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', borderColor: getContrastColor(n.color) === '#fff' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }}
                    title="Send to back"
                  >
                    Back
                  </button>
                  <button
                    onPointerDown={stopPointerPropagation}
                    onClick={(e) => {
                      e.stopPropagation();
                      bringToFront(n.id);
                    }}
                    className="px-1 py-0.5 text-xs rounded border"
                    style={{ backgroundColor: getContrastColor(n.color) === '#fff' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', borderColor: getContrastColor(n.color) === '#fff' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }}
                    title="Bring to front"
                  >
                    Front
                  </button>
                  <button
                    onPointerDown={stopPointerPropagation}
                    onClick={(e) => {
                      e.stopPropagation();
                      const ok = confirm('Delete this note? This cannot be undone.');
                      if (ok) deleteNote(n.id);
                    }}
                    className="px-1 py-0.5 text-xs rounded border"
                    style={{ backgroundColor: getContrastColor(n.color) === '#fff' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)', borderColor: getContrastColor(n.color) === '#fff' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)' }}
                    title="Delete"
                    aria-label="Delete note"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Text area */}
              <textarea
                className={`w-full rounded bg-transparent resize-none outline-none p-2 ${getContrastColor(n.color) === '#fff' ? 'text-white placeholder-white/70 caret-white' : 'text-black placeholder-black/50 caret-black'}`}
                style={{ fontSize: FONT_SIZE_PX[n.fontSize], height: n.h, backgroundColor: 'transparent' }}
                placeholder="Write something..."
                value={n.text}
                onChange={(e) => updateNote(n.id, { text: e.target.value })}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              />

              {/* Resize handle */}
              <div
                onPointerDown={(e) => onResizePointerDown(e, n.id)}
                className="absolute bottom-1 right-1 w-4 h-4 rounded-sm cursor-se-resize"
                style={{ backgroundColor: getContrastColor(n.color) === '#fff' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', touchAction: 'none', zIndex: 20 }}
                title="Resize"
                aria-label="Resize note"
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default NotesBoardPage;
