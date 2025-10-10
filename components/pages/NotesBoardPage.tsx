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
  MAX_NOTE_LENGTH,
} from './notesData';
import { decryptNoteText, encryptNoteText } from './notesCrypto';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const MIN_NOTE_WIDTH = 220;

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

const getToolbarIconColor = (hex: string): string => {
  const contrast = getContrastColor(hex);
  return contrast === '#fff' ? 'rgba(255,255,255,0.85)' : 'rgba(17,17,17,0.75)';
};

type PasswordModalMode = 'setSecret' | 'unlockSecret';

interface PasswordModalState {
  mode: PasswordModalMode;
  title: string;
  description?: string;
  confirmLabel: string;
  minLength?: number;
}

interface PasswordModalProps {
  state: PasswordModalState;
  onConfirm: (password: string) => void;
  onCancel: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ state, onConfirm, onCancel }) => {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setPassword('');
    setError('');
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [state]);

  const minLength = state.minLength ?? 1;

  const handleSubmit = () => {
    const trimmed = password.trim();
    if (trimmed.length < minLength) {
      setError(`암호는 최소 ${minLength}자 이상이어야 합니다.`);
      return;
    }
    setError('');
    onConfirm(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
      role="dialog"
      aria-modal="true"
      onClick={() => onCancel()}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-white/15 bg-[#1f1f1f] p-5 shadow-2xl text-gray-200"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white">{state.title}</h3>
        {state.description && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-400">{state.description}</p>
        )}
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-medium uppercase tracking-wide text-gray-500" htmlFor="notes-password-input">
            암호
          </label>
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              id="notes-password-input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="flex-1 rounded border border-white/15 bg-black/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/60"
              placeholder="암호를 입력하세요"
            />
          </div>
          {error && <p className="text-xs text-rose-300">{error}</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded border border-white/15 px-3 py-1.5 text-sm text-gray-300 transition hover:bg-white/10"
            onClick={onCancel}
          >
            취소
          </button>
          <button
            type="button"
            className="rounded bg-rose-500/80 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-rose-500"
            onClick={handleSubmit}
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const stopPointerPropagation = (e: React.PointerEvent) => {
  e.stopPropagation();
};

const LockOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className={className}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" /><path d="M9 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" /><path d="M13 11v-4a4 4 0 1 1 8 0v4" /></svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg  xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className={className}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z" /><path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" /><path d="M8 11v-4a4 4 0 1 1 8 0v4" /></svg>
);

const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className={className}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>
);

const EyeOffIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  className={className}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" /><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" /><path d="M3 3l18 18" /></svg>
);

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
  const unlockTimeoutsRef = React.useRef<Record<string, number>>({});
  const [colorFilters, setColorFilters] = React.useState<Partial<Record<string, boolean>>>({});
  const [passwordModal, setPasswordModal] = React.useState<PasswordModalState | null>(null);
  const passwordResolverRef = React.useRef<((value: string | null) => void) | null>(null);

  const requestPassword = React.useCallback((config: PasswordModalState) => {
    return new Promise<string | null>((resolve) => {
      passwordResolverRef.current = resolve;
      setPasswordModal(config);
    });
  }, []);

  const closePasswordModal = React.useCallback((value: string | null) => {
    const resolver = passwordResolverRef.current;
    if (resolver) {
      resolver(value);
    }
    passwordResolverRef.current = null;
    setPasswordModal(null);
  }, []);

  React.useEffect(() => {
    return () => {
      if (passwordResolverRef.current) {
        passwordResolverRef.current(null);
        passwordResolverRef.current = null;
      }
    };
  }, []);
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
      w: Math.max(240, MIN_NOTE_WIDTH),
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
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const next = { ...n, ...patch };
      if (typeof next.text === 'string') {
        next.text = next.text.slice(0, MAX_NOTE_LENGTH);
      }
      return next;
    }));
  };

  const deleteNote = (id: string) => {
    const timeoutId = unlockTimeoutsRef.current[id];
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      delete unlockTimeoutsRef.current[id];
    }
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
      const minW = MIN_NOTE_WIDTH;
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

  const clearAllUnlockTimeouts = React.useCallback(() => {
    Object.values(unlockTimeoutsRef.current).forEach(timeoutId => {
      window.clearTimeout(timeoutId as number);
    });
    unlockTimeoutsRef.current = {};
  }, []);

  React.useEffect(() => {
    return () => {
      clearAllUnlockTimeouts();
    };
  }, [clearAllUnlockTimeouts]);

  React.useEffect(() => {
    return () => {
      passwordResolverRef.current = null;
    };
  }, []);

  if (!groupId) {
    return (
      <div className="text-gray-400">
        <p>Select a notes group from the sidebar to start.</p>
      </div>
    );
  }

  const hideSecretNote = (noteId: string) => {
    const timeoutId = unlockTimeoutsRef.current[noteId];
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId as number);
      delete unlockTimeoutsRef.current[noteId];
    }
    updateNote(noteId, { text: '', isUnlocked: false });
  };

  const handleToggleSecret = async (note: StickyNote) => {
    if (note.isSecret) {
      await handlePermanentUnlock(note);
      return;
    }

    const password = await requestPassword({
      mode: 'setSecret',
      title: '비밀 노트 암호 설정',
      description: '비밀 노트를 활성화하려면 최소 4자 이상의 암호를 설정해야 합니다.',
      confirmLabel: '암호 설정',
      minLength: 4,
    });
    if (!password) return;
    try {
      const plain = (note.text || '').slice(0, MAX_NOTE_LENGTH);
      const encrypted = await encryptNoteText(plain, password);
      hideSecretNote(note.id);
      updateNote(note.id, { isSecret: true, encrypted, text: '', isUnlocked: false });
    } catch (error: any) {
      alert(error?.message || '암호화에 실패했습니다.');
    }
  };

  const handleUnlockSecretNote = async (note: StickyNote, { persistUnlock }: { persistUnlock?: boolean } = {}) => {
    if (!note.encrypted) return;
    const password = await requestPassword({
      mode: 'unlockSecret',
      title: '비밀 노트 열기',
      description: '저장된 비밀 노트를 확인하려면 암호를 입력하세요.',
      confirmLabel: persistUnlock ? '영구 해제' : '한 번 보기',
      minLength: 1,
    });
    if (!password) return;
    try {
      const plain = (await decryptNoteText(note.encrypted, password)).slice(0, MAX_NOTE_LENGTH);
      if (persistUnlock) {
        updateNote(note.id, {
          text: plain,
          isSecret: false,
          encrypted: null,
          isUnlocked: false,
        });
        const existing = unlockTimeoutsRef.current[note.id];
        if (existing !== undefined) {
          window.clearTimeout(existing as number);
          delete unlockTimeoutsRef.current[note.id];
        }
      } else {
        updateNote(note.id, {
          text: plain,
          isUnlocked: true,
        });
        const existing = unlockTimeoutsRef.current[note.id];
        if (existing !== undefined) {
          window.clearTimeout(existing as number);
        }
        const timeoutId = window.setTimeout(() => {
          hideSecretNote(note.id);
        }, 1000 * 60 * 5); // 5분 후 자동 블라인드 처리
        unlockTimeoutsRef.current[note.id] = timeoutId;
      }
    } catch {
      alert('암호가 올바르지 않습니다.');
    }
  };

  const handleRevealOnce = async (note: StickyNote) => {
    if (!note.isSecret || note.isUnlocked) return;
    await handleUnlockSecretNote(note);
  };

  const handlePermanentUnlock = async (note: StickyNote) => {
    if (!note.isSecret) return;
    if (note.isUnlocked) {
      updateNote(note.id, { isSecret: false, encrypted: null, isUnlocked: false });
      const timeoutId = unlockTimeoutsRef.current[note.id];
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId as number);
        delete unlockTimeoutsRef.current[note.id];
      }
      return;
    }
    await handleUnlockSecretNote(note, { persistUnlock: true });
  };

  const handleTextChange = (noteId: string, value: string) => {
    updateNote(noteId, { text: value.slice(0, MAX_NOTE_LENGTH) });
  };

  const handleHideSecretNow = (note: StickyNote) => {
    hideSecretNote(note.id);
  };

  const handleToggleSecretVisibility = async (note: StickyNote) => {
    if (!note.isSecret) return;
    if (note.isUnlocked) {
      handleHideSecretNow(note);
    } else {
      await handleRevealOnce(note);
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full min-h-[480px]">
      {passwordModal && (
        <PasswordModal
          state={passwordModal}
          onConfirm={(value) => closePasswordModal(value)}
          onCancel={() => closePasswordModal(null)}
        />
      )}
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
                <span className="sr-only">{color}</span>
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
              className="absolute shadow-md rounded p-2 pb-6 select-none"
              style={{ left: n.x, top: n.y, zIndex: n.z, background: n.color, width: n.w, position: 'absolute', color: getContrastColor(n.color), touchAction: 'none' }}
              onPointerDown={(e) => onNotePointerDown(e, n.id)}
              role="group"
            >
              <div className="absolute left-0.5 bottom-0.5 flex items-center gap-1">
                <button
                  onPointerDown={stopPointerPropagation}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSecret(n);
                  }}
                  className="w-5 h-5 flex items-center justify-center"
                  style={{ color: getToolbarIconColor(n.color) }}
                  title={n.isSecret ? '비밀 모드 해제' : '비밀 모드 설정'}
                  aria-label={n.isSecret ? 'Disable secret mode' : 'Enable secret mode'}
                >
                  {n.isSecret ? <LockIcon className="w-4 h-4" /> : <LockOpenIcon className="w-4 h-4" />}
                </button>
                {n.isSecret && (
                  <button
                    onPointerDown={stopPointerPropagation}
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleToggleSecretVisibility(n);
                    }}
                    className="w-5 h-5 flex items-center justify-center"
                    style={{ color: getToolbarIconColor(n.color) }}
                    title={n.isUnlocked ? '비밀 노트 숨기기' : '비밀 노트 보기'}
                    aria-label={n.isUnlocked ? 'Hide secret note' : 'Reveal secret note'}
                  >
                    {n.isUnlocked ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                  </button>
                )}
              </div>

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
              {n.isSecret && !n.isUnlocked ? (
                <div
                  className="relative w-full h-full rounded bg-black/35 border border-white/10 flex flex-col items-center justify-center gap-2 text-sm"
                  style={{ height: n.h }}
                  onPointerDown={stopPointerPropagation}
                >
                  <span className="text-white/70">비밀 노트</span>
                  <span className="text-xs text-white/50">좌측 하단 눈 아이콘으로 열람</span>
                </div>
              ) : n.isSecret && n.isUnlocked ? (
                <div
                  className="relative w-full h-full rounded bg-black/15 border border-white/15 flex items-start justify-between gap-2 p-2 text-sm"
                  style={{ height: n.h }}
                  onPointerDown={stopPointerPropagation}
                >
                  <div className="flex-1 overflow-auto text-white/90 whitespace-pre-wrap break-words pr-1">
                    {n.text || '(내용 없음)'}
                  </div>
                </div>
              ) : (
                <textarea
                  className={`w-full rounded bg-transparent resize-none outline-none p-2 ${getContrastColor(n.color) === '#fff' ? 'text-white placeholder-white/70 caret-white' : 'text-black placeholder-black/50 caret-black'}`}
                  style={{ fontSize: FONT_SIZE_PX[n.fontSize], height: n.h, backgroundColor: 'transparent' }}
                  placeholder="Write something..."
                  value={n.text}
                  maxLength={MAX_NOTE_LENGTH}
                  onChange={(e) => handleTextChange(n.id, e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                />
              )}

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
