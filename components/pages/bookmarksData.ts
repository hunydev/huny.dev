import type React from 'react';

export type BookmarkCategory = {
  id: string;
  name: string;
  color: string; // hex color for badges/dots
};

export type Bookmark = {
  id: string;
  categoryId?: string;
  name: string;
  description?: string;
  url: string;
  thumbnail?: string; // card view only
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
  tags: string[];
};

export const BOOKMARK_CATEGORIES: BookmarkCategory[] = [
  { id: 'dev', name: 'Development', color: '#60a5fa' },
  { id: 'design', name: 'Design', color: '#f59e0b' },
  { id: 'tools', name: 'Tools', color: '#10b981' },
  { id: 'learn', name: 'Learning', color: '#a78bfa' },
  // Special bucket: shows items that don't belong to any known category (missing/unknown categoryId)
  { id: 'uncategorized', name: 'Uncategorized', color: '#9ca3af' },
];

export const BOOKMARKS: Bookmark[] = [
  // Development
  {
    id: 'bm-react',
    categoryId: 'dev',
    name: 'React – Official',
    description: 'A JavaScript library for building user interfaces',
    url: 'https://react.dev',
    thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain_url=react.dev',
    createdAt: '2024-01-12T10:00:00.000Z',
    updatedAt: '2025-01-03T14:20:00.000Z',
    tags: ['javascript', 'ui', 'framework'],
  },
  {
    id: 'bm-ts',
    categoryId: 'dev',
    name: 'TypeScript – Handbook',
    description: 'TypeScript official documentation and handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain_url=www.typescriptlang.org',
    createdAt: '2023-08-21T09:30:00.000Z',
    updatedAt: '2024-12-10T08:15:00.000Z',
    tags: ['typescript', 'docs'],
  },
  // Design
  {
    id: 'bm-figma',
    categoryId: 'design',
    name: 'Figma',
    description: 'Collaborative interface design tool',
    url: 'https://www.figma.com',
    thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain_url=figma.com',
    createdAt: '2022-11-05T12:00:00.000Z',
    updatedAt: '2024-05-10T12:00:00.000Z',
    tags: ['design', 'ui', 'collaboration'],
  },
  // Tools
  {
    id: 'bm-github',
    categoryId: 'tools',
    name: 'GitHub',
    description: 'Code hosting platform for version control and collaboration',
    url: 'https://github.com',
    thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain_url=github.com',
    createdAt: '2020-03-15T08:00:00.000Z',
    updatedAt: '2024-09-15T08:00:00.000Z',
    tags: ['git', 'repo', 'ci'],
  },
  {
    id: 'bm-cloudflare',
    categoryId: 'tools',
    name: 'Cloudflare',
    description: 'CDN, DNS, DDoS protection and security',
    url: 'https://www.cloudflare.com',
    thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain_url=cloudflare.com',
    createdAt: '2024-02-18T16:00:00.000Z',
    updatedAt: '2025-01-02T10:00:00.000Z',
    tags: ['cdn', 'dns', 'security'],
  },
  // Learning
  {
    id: 'bm-mdn',
    categoryId: 'learn',
    name: 'MDN Web Docs',
    description: 'Resources for developers, by developers',
    url: 'https://developer.mozilla.org',
    thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain_url=developer.mozilla.org',
    createdAt: '2019-06-01T10:00:00.000Z',
    updatedAt: '2024-11-20T10:00:00.000Z',
    tags: ['docs', 'web', 'reference'],
  },
  {
    id: 'bm-frontend-masters',
    categoryId: 'learn',
    name: 'Frontend Masters',
    description: 'Advanced front-end development courses',
    url: 'https://frontendmasters.com',
    thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain_url=frontendmasters.com',
    createdAt: '2021-07-23T18:00:00.000Z',
    updatedAt: '2024-03-01T18:00:00.000Z',
    tags: ['course', 'frontend'],
  },
];

export const getCategoryById = (id: string | undefined | null): BookmarkCategory | undefined => {
  if (!id) return undefined;
  return BOOKMARK_CATEGORIES.find(c => c.id === id);
};

export const getBookmarksByCategoryId = (categoryId: string | undefined | null): Bookmark[] => {
  if (!categoryId || categoryId === 'all') return BOOKMARKS;
  if (categoryId === 'uncategorized') {
    const known = new Set(BOOKMARK_CATEGORIES
      .map(c => c.id)
      .filter(id => id !== 'uncategorized'));
    return BOOKMARKS.filter(b => !b.categoryId || !known.has(b.categoryId));
  }
  return BOOKMARKS.filter(b => b.categoryId === categoryId);
};

export const getBookmarkCountByCategory = (categoryId: string): number => {
  if (categoryId === 'all') return BOOKMARKS.length;
  if (categoryId === 'uncategorized') {
    const known = new Set(BOOKMARK_CATEGORIES
      .map(c => c.id)
      .filter(id => id !== 'uncategorized'));
    return BOOKMARKS.filter(b => !b.categoryId || !known.has(b.categoryId)).length;
  }
  return BOOKMARKS.filter(b => b.categoryId === categoryId).length;
};
