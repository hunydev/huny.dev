export type NoteGroup = {
  id: string;
  name: string;
  color: string; // hex color for group accent
};

export type StickyNote = {
  id: string;
  text: string;
  x: number; // left in px
  y: number; // top in px
  z: number; // z-index
  color: string; // note background color
  fontSize: 'sm' | 'md' | 'lg';
  w: number; // width in px
  h: number; // text area height in px
};

export const NOTE_GROUPS: NoteGroup[] = [
  { id: 'personal', name: 'Personal', color: '#f59e0b' },
  { id: 'work', name: 'Work', color: '#60a5fa' },
  { id: 'ideas', name: 'Ideas', color: '#10b981' },
];

export const getNoteGroupById = (id: string | undefined | null): NoteGroup | undefined => {
  if (!id) return undefined;
  return NOTE_GROUPS.find(g => g.id === id);
};

const storageKey = (groupId: string) => `notes:${groupId}`;

export const getNotesByGroupId = (groupId: string): StickyNote[] => {
  try {
    const raw = localStorage.getItem(storageKey(groupId));
    if (!raw) return [];
    const arr = JSON.parse(raw) as Partial<StickyNote>[];
    if (Array.isArray(arr)) {
      return arr.map((n, idx) => ({
        id: n.id || `n-${Date.now()}-${idx}`,
        text: n.text ?? '',
        x: typeof n.x === 'number' ? n.x : 24,
        y: typeof n.y === 'number' ? n.y : 24,
        z: typeof n.z === 'number' ? n.z : 1,
        color: n.color || '#fde68a',
        fontSize: (n.fontSize as StickyNote['fontSize']) || 'md',
        w: typeof (n as any).w === 'number' ? (n as any).w : 240,
        h: typeof (n as any).h === 'number' ? (n as any).h : 128,
      }));
    }
    return [];
  } catch {
    return [];
  }
};

export const saveNotesByGroupId = (groupId: string, notes: StickyNote[]) => {
  try {
    localStorage.setItem(storageKey(groupId), JSON.stringify(notes));
  } catch {
    // noop
  }
};

export const getNoteCountByGroup = (groupId: string): number => {
  try {
    const arr = getNotesByGroupId(groupId);
    return arr.length;
  } catch {
    return 0;
  }
};

export const NOTE_COLORS: string[] = [
  '#fde68a', // amber-200
  '#fca5a5', // red-300
  '#93c5fd', // blue-300
  '#86efac', // green-300
  '#e9d5ff', // purple-200
  '#fcd34d', // amber-300
];

export const FONT_SIZE_PX: Record<StickyNote['fontSize'], number> = {
  sm: 12,
  md: 14,
  lg: 18,
};

export const nextZ = (notes: StickyNote[]): number => {
  const max = notes.reduce((m, n) => Math.max(m, n.z || 1), 1);
  return max + 1;
};
