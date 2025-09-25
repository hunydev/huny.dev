import { ViewId } from '../types';
import type { IconName } from './icons';

export type ActivityBarItem = {
  id: ViewId;
  section: 'top' | 'bottom';
  icon: IconName;
  title: string;
  ariaLabel?: string;
};

export const ACTIVITY_BAR_ITEMS: ActivityBarItem[] = [
  {
    id: ViewId.Explorer,
    section: 'top',
    icon: 'activityExplorer',
    title: 'Explorer',
  },
  {
    id: ViewId.Search,
    section: 'top',
    icon: 'activitySearch',
    title: 'Search',
  },
  {
    id: ViewId.Docs,
    section: 'top',
    icon: 'activityDocs',
    title: 'Docs',
  },
  {
    id: ViewId.Apps,
    section: 'top',
    icon: 'activityAppsPrimary',
    title: 'Apps',
  },
  {
    id: ViewId.Media,
    section: 'top',
    icon: 'activityMedia',
    title: 'Media',
  },
  {
    id: ViewId.Playground,
    section: 'top',
    icon: 'activityPlayground',
    title: 'Playground',
  },
  {
    id: ViewId.Bookmark,
    section: 'top',
    icon: 'activityBookmark',
    title: 'Bookmark',
  },
  {
    id: ViewId.Notes,
    section: 'top',
    icon: 'activityNotes',
    title: 'Notes',
  },
  {
    id: ViewId.Blog,
    section: 'bottom',
    icon: 'activityBlog',
    title: 'Blog',
  },
  {
    id: ViewId.Apps,
    section: 'bottom',
    icon: 'activityAppsSecondary',
    title: 'Apps',
  },
  {
    id: ViewId.Sites,
    section: 'bottom',
    icon: 'activitySites',
    title: 'Sites',
  },
  {
    id: ViewId.GitHub,
    section: 'bottom',
    icon: 'activityGitHub',
    title: 'GitHub',
  },
  {
    id: ViewId.Discord,
    section: 'bottom',
    icon: 'activityDiscord',
    title: 'Discord',
  },
  {
    id: ViewId.X,
    section: 'bottom',
    icon: 'activityX',
    title: 'X / Twitter',
  },
  {
    id: ViewId.Email,
    section: 'bottom',
    icon: 'activityEmail',
    title: 'Email',
  },
];

export const EXTERNAL_LINKS: Partial<Record<ViewId, { title: string; url: string }>> = {
  [ViewId.Blog]: { title: 'Blog', url: 'https://blog.huny.dev' },
  [ViewId.Apps]: { title: 'Apps', url: 'https://apps.huny.dev' },
  [ViewId.Sites]: { title: 'Sites', url: 'https://sites.huny.dev' },
  [ViewId.GitHub]: { title: 'GitHub', url: 'https://github.com/hunydev' },
  [ViewId.Discord]: { title: 'Discord', url: 'https://discord.gg/2NWa39bU' },
  [ViewId.X]: { title: 'X / Twitter', url: 'https://x.com/janghun2722' },
  [ViewId.Email]: { title: 'Email', url: 'mailto:jang@huny.dev' },
};
