import icon32 from '../../icon_32x32.png';

export type AppCategoryId = 'huny' | 'dev' | 'ai' | 'tools' | 'design';

export type AppCategory = {
  id: AppCategoryId;
  name: string;
  emoji?: string; // mutually exclusive with iconUrl
  iconUrl?: string; // used only for huny.dev category icon
};

export const CATEGORIES: AppCategory[] = [
  { id: 'huny', name: 'huny.dev', iconUrl: icon32 },
  { id: 'dev', name: 'Dev', emoji: '💻' },
  { id: 'ai', name: 'AI', emoji: '🤖' },
  { id: 'tools', name: 'Tools', emoji: '🧰' },
  { id: 'design', name: 'Design', emoji: '🎨' },
];

export function getAppCategoryById(id?: string): AppCategory | undefined {
  return CATEGORIES.find((c) => c.id === (id as AppCategoryId));
}

export type DesktopOS = 'Windows' | 'Mac' | 'Linux';
export type MobileOS = 'iOS' | 'Android';

export type PlatformSupport = {
  desktop?: DesktopOS[];
  mobile?: MobileOS[];
  web?: boolean;
};

export type AppItem = {
  id: string;
  name: string;
  categoryId: AppCategoryId;
  iconEmoji?: string;
  iconUrl?: string;
  link?: string;
  description?: string;
  platforms: PlatformSupport;
};

export const APPS: AppItem[] = [
  // huny.dev services (Web only)
  { id: 'apps-huny-dev', name: 'apps.huny.dev', categoryId: 'huny', iconEmoji: '🌐', link: 'https://apps.huny.dev', platforms: { web: true }, description: 'huny.dev services' },
  { id: 'sites-huny-dev', name: 'sites.huny.dev', categoryId: 'huny', iconEmoji: '🌐', link: 'https://sites.huny.dev', platforms: { web: true } },
  { id: 'unicode-huny-dev', name: 'unicode.huny.dev', categoryId: 'huny', iconEmoji: '🔤', link: 'https://unicode.huny.dev', platforms: { web: true } },
  { id: 'pcm-huny-dev', name: 'pcm.huny.dev', categoryId: 'huny', iconEmoji: '🎵', link: 'https://pcm.huny.dev', platforms: { web: true } },

  // Dev
  { id: 'vscode', name: 'Visual Studio Code', categoryId: 'dev', iconEmoji: '🧩', link: 'https://code.visualstudio.com', platforms: { desktop: ['Windows', 'Mac', 'Linux'] } },
  { id: 'visual-studio', name: 'Visual Studio', categoryId: 'dev', iconEmoji: '💠', link: 'https://visualstudio.microsoft.com', platforms: { desktop: ['Windows'] } },
  { id: 'sts', name: 'STS', categoryId: 'dev', iconEmoji: '☕', link: 'https://spring.io/tools', platforms: { desktop: ['Windows', 'Mac', 'Linux'] } },
  { id: 'go', name: 'Go', categoryId: 'dev', iconEmoji: '🐹', link: 'https://go.dev', platforms: { desktop: ['Windows', 'Mac', 'Linux'] } },
  { id: 'c', name: 'C', categoryId: 'dev', iconEmoji: '🔷', link: 'https://en.cppreference.com', platforms: { desktop: ['Windows', 'Mac', 'Linux'] } },

  // AI
  { id: 'chatgpt', name: 'ChatGPT', categoryId: 'ai', iconEmoji: '🧠', link: 'https://chat.openai.com', platforms: { web: true } },
  { id: 'gemini', name: 'Gemini', categoryId: 'ai', iconEmoji: '✨', link: 'https://ai.google', platforms: { web: true } },
  { id: 'windsurf', name: 'Windsurf', categoryId: 'ai', iconEmoji: '🌊', link: 'https://codeium.com/windsurf', platforms: { web: true } },

  // Tools
  { id: 'notion', name: 'Notion', categoryId: 'tools', iconEmoji: '🗒️', link: 'https://www.notion.so', platforms: { desktop: ['Windows', 'Mac'], mobile: ['iOS', 'Android'], web: true } },
  { id: 'filezilla', name: 'Filezilla', categoryId: 'tools', iconEmoji: '📁', link: 'https://filezilla-project.org', platforms: { desktop: ['Windows', 'Mac', 'Linux'] } },
  { id: 'beyond-compare', name: 'Beyond Compare', categoryId: 'tools', iconEmoji: '🔍', link: 'https://www.scootersoftware.com', platforms: { desktop: ['Windows', 'Mac', 'Linux'] } },

  // Design
  { id: 'whimsical', name: 'Whimsical', categoryId: 'design', iconEmoji: '🧩', link: 'https://whimsical.com', platforms: { web: true } },
  { id: 'draw-io', name: 'Draw.io', categoryId: 'design', iconEmoji: '📐', link: 'https://www.drawio.com', platforms: { web: true } },
  { id: 'whiteboard', name: 'Whiteboard', categoryId: 'design', iconEmoji: '📝', link: 'https://whiteboard.microsoft.com', platforms: { web: true } },
];

export function getAppsByCategoryId(categoryId: AppCategoryId): AppItem[] {
  return APPS.filter((a) => a.categoryId === categoryId);
}

export function getAppById(id: string): AppItem | undefined {
  return APPS.find((a) => a.id === id);
}
