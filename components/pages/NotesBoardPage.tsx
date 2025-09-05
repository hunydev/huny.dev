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

  const onNoteMouseDown = (e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return; // left only
    e.stopPropagation();
    const note = notes.find(n => n.id === id);
    if (!note) return;
    bringToFront(id);
    setDragId(id);
    dragOffset.current = { dx: e.clientX - note.x, dy: e.clientY - note.y };
    document.body.style.userSelect = 'none';
  };

  React.useEffect(() => {
    if (!dragId) return;
    const onMove = (ev: MouseEvent) => {
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
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [dragId]);

  // Resizing
  const onResizeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const note = notes.find(n => n.id === id);
    if (!note) return;
    bringToFront(id);
    setResizing({ id, startX: e.clientX, startY: e.clientY, startW: note.w, startH: note.h });
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'se-resize';
  };

  React.useEffect(() => {
    if (!resizing) return;
    const onMove = (ev: MouseEvent) => {
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
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
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

      <div ref={boardRef} className="relative flex-1 min-h-[420px] rounded border border-black/30 bg-[#252526] overflow-auto">
        {/* Board content area; notes are absolutely positioned within this container */}
        {notes
          .sort((a, b) => a.z - b.z)
          .map((n) => (
            <div
              key={n.id}
              className="absolute shadow-md rounded p-2 select-none"
              style={{ left: n.x, top: n.y, zIndex: n.z, background: n.color, width: n.w, position: 'absolute', color: getContrastColor(n.color) }}
              onMouseDown={(e) => onNoteMouseDown(e, n.id)}
              role="group"
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1 opacity-90">
                  <button
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
              />

              {/* Resize handle */}
              <div
                onMouseDown={(e) => onResizeMouseDown(e, n.id)}
                className="absolute bottom-1 right-1 w-3 h-3 rounded-sm cursor-se-resize"
                style={{ backgroundColor: getContrastColor(n.color) === '#fff' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
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
