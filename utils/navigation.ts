import { ViewId } from '../types';

const PLAYGROUND_BASE_IDS = new Set<string>([
  'split-speaker',
  'bird-generator',
  'geo-vision',
  'multi-voice-reader',
  'todo-generator',
  'ai-tier-list',
  'cronify',
  'text-morph',
  'prompt-engineering',
  'deobfuscate-hangul',
  'dialect-tts',
  'restyler',
  'text-to-phoneme',
  'text-to-emoji',
  'text-to-big-text',
  'web-worker',
  'text-cleaning',
  'hidden-prompt',
  'ai-business-card',
  'sticker-generator',
  'comic-restyler',
  'ui-clone',
  'favicon-distiller',
  'avatar-distiller',
  'cover-crafter',
  'image-to-json',
  'image-to-speech',
  'non-native-korean-tts',
  'scene-to-script',
  'video-to-script',
]);

export const isPlaygroundBaseId = (baseId: string) => PLAYGROUND_BASE_IDS.has(baseId);

const BASE_VIEW_MAP: Record<string, ViewId> = {
  docs: ViewId.Docs,
  apps: ViewId.Apps,
  bookmark: ViewId.Bookmark,
  notes: ViewId.Notes,
  monitor: ViewId.Monitor,
};

export const extractBaseId = (tabId: string): string => {
  try {
    const idx = tabId.indexOf(':');
    return idx > -1 ? tabId.slice(0, idx) : tabId;
  } catch {
    return tabId;
  }
};

export const viewForTabId = (tabId: string): ViewId => {
  const base = extractBaseId(tabId);
  if (isPlaygroundBaseId(base)) {
    return ViewId.Playground;
  }
  return BASE_VIEW_MAP[base] ?? ViewId.Explorer;
};
