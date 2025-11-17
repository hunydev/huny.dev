import { useState, useCallback, useEffect, useRef } from 'react';
import { Tab, PageProps, ApiRequirement } from '../types';
import { PAGES } from '../constants';
import { getCategoryById } from '../components/pages/bookmarksData';
import { getNoteGroupById } from '../components/pages/notesData';
import { getAppCategoryById, getAppById } from '../components/pages/appsData';
import { getDocBySlug } from '../components/pages/docsData';
import { MONITOR_GROUPS, getMonitorItemById } from '../components/pages/monitorData';
import { extractBaseId } from '../utils/navigation';
import { Icon } from '../constants';
import React from 'react';
import { useApiTask } from '../contexts/ApiTaskContext';

const TABS_STORAGE_KEY = 'app.openTabs.v1';
const DEFAULT_TAB_IDS: readonly string[] = ['welcome', 'works', 'domain', 'about'];

export interface UseTabManagerReturn {
  openTabs: Tab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  handleOpenFile: (fileId: string) => void;
  handleCloseTab: (tabId: string) => void;
  handleCloseAllTabs: () => void;
  handleTogglePin: (id: string) => void;
  handleOpenInNewWindow: (tabId: string) => void;
  handleShareTab: (tabId: string) => Promise<void>;
  handleShareAllTabs: () => Promise<void>;
  handleCloseTabsToRight: (tabId: string) => void;
  handleCloseOtherTabs: (tabId: string) => void;
}

interface UseTabManagerOptions {
  apiHasGemini: boolean;
  apiHasOpenAI: boolean;
  openApiKeyModal: () => void;
  showInfoToast: (message: string) => void;
}

export const useTabManager = (options: UseTabManagerOptions): UseTabManagerReturn => {
  const { apiHasGemini, apiHasOpenAI, openApiKeyModal, showInfoToast } = options;
  const apiTaskContext = useApiTask();
  const [openTabs, setOpenTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const restoredRef = useRef<boolean>(false);
  const restoringRef = useRef<boolean>(false);
  const shortcutHandledRef = useRef<boolean>(false);
  const initialShortcutIdsRef = useRef<string[]>([]);

  // API 요구사항 체크 함수
  const checkApiRequirement = useCallback((requirement?: ApiRequirement): { available: boolean; reason?: string } => {
    if (!requirement) return { available: true };

    const { provider, features } = requirement;
    const requiresUserKey = features.some(f => f === 'tts' || f === 'image');

    if (provider === 'openai') {
      // OpenAI는 무조건 사용자 키 필수
      if (!apiHasOpenAI) {
        return { available: false, reason: 'OpenAI API 키를 설정해야 사용할 수 있습니다.' };
      }
    } else if (provider === 'gemini') {
      // Gemini는 TTS/이미지 기능에만 사용자 키 필요
      if (requiresUserKey && !apiHasGemini) {
        return { available: false, reason: 'Gemini API 키를 설정해야 사용할 수 있습니다.' };
      }
    }

    return { available: true };
  }, [apiHasGemini, apiHasOpenAI]);

  const handleOpenFile = useCallback((fileId: string) => {
    const originalId = fileId;
    let baseId = fileId;
    let arg: string | undefined;

    // Parse dynamic routes, e.g. bookmark:<categoryId>
    const baseFromId = extractBaseId(fileId);
    if (baseFromId !== fileId) {
      baseId = baseFromId;
      arg = fileId.slice(baseFromId.length + 1);
    }

    const pageInfo = PAGES[baseId];
    if (!pageInfo) {
      return;
    }

    // API 요구사항 체크
    if (pageInfo.apiRequirement) {
      const check = checkApiRequirement(pageInfo.apiRequirement);
      if (!check.available) {
        const providerName = pageInfo.apiRequirement.provider === 'openai' ? 'OpenAI' : 'Gemini';
        const message = `${pageInfo.title}는 ${providerName} API 키가 필요합니다.\n\n${check.reason || ''}`;
        if (window.confirm(`${message}\n\nAPI 키 설정 화면으로 이동하시겠습니까?`)) {
          openApiKeyModal();
        }
        return;
      }
    }

    let tabTitle = pageInfo.title;
    let tabIcon: React.ReactNode = pageInfo.icon;
    if (baseId === 'bookmark') {
      const categoryId = arg || 'all';
      const cat = categoryId === 'all' ? undefined : getCategoryById(categoryId);
      const catName = categoryId === 'all' ? 'All' : (cat?.name ?? categoryId);
      tabTitle = `bookmarks (${catName})`;
      const color = categoryId === 'all' ? '#9ca3af' : (cat?.color ?? '#9ca3af');
      tabIcon = (
        <Icon name="bookmarkRibbon" className="w-4 h-4 mr-2" style={{ color }} />
      );
    }
    else if (baseId === 'notes' && arg) {
      const group = getNoteGroupById(arg);
      const groupName = group?.name ?? arg;
      const color = group?.color ?? '#9ca3af';
      tabTitle = `notes – ${groupName}`;
      tabIcon = (
        <Icon name="note" className="w-4 h-4 mr-2" style={{ color }} />
      );
    } else if (baseId === 'apps') {
      const categoryId = arg || 'huny';
      const category = getAppCategoryById(categoryId);
      const catName = category?.name ?? categoryId;
      tabTitle = `apps – ${catName}`;
      if (category?.iconUrl) {
        tabIcon = <img src={category.iconUrl} alt="" className="w-4 h-4 mr-2 rounded-sm" />;
      } else if (category?.emoji) {
        tabIcon = <span className="mr-2 text-sm" aria-hidden>{category.emoji}</span>;
      }
    } else if (baseId === 'app') {
      // Individual app detail tab (app:<appId>)
      const appId = arg || '';
      const app = getAppById(appId);
      if (app) {
        tabTitle = app.name;
        if (app.iconUrl) {
          tabIcon = <img src={app.iconUrl} alt="" className="w-4 h-4 mr-2 rounded-sm" />;
        } else if (app.iconEmoji) {
          tabIcon = <span className="mr-2 text-sm" aria-hidden>{app.iconEmoji}</span>;
        }
      } else {
        tabTitle = 'app – unknown';
      }
    } else if (baseId === 'docs') {
      const slug = arg || '';
      const doc = getDocBySlug(slug);
      const title = doc?.title || slug || 'docs';
      tabTitle = `docs – ${title}`;
      tabIcon = <Icon name="file" />;
    } else if (baseId === 'monitor') {
      if (arg) {
        const monitorItem = getMonitorItemById(arg);
        if (monitorItem) {
          const group = MONITOR_GROUPS.find(g => g.items.some(item => item.id === monitorItem.id));
          tabTitle = `monitor – ${monitorItem.name}`;
          if (group?.icon) {
            tabIcon = <Icon name={group.icon} className="w-4 h-4 mr-2" />;
          }
        } else {
          tabTitle = 'monitor – detail';
        }
      } else {
        tabTitle = 'monitor overview';
      }
    }

    setOpenTabs(prevTabs => {
      const exists = prevTabs.some(tab => tab.id === originalId);
      if (exists) {
        // 이미 존재하는 탭이면 추가하지 않음
        return prevTabs;
      }
      const newTab: Tab = {
        id: originalId,
        title: tabTitle,
        icon: tabIcon,
        pinned: false,
      };
      return [...prevTabs, newTab];
    });
    // 새 탭이든 기존 탭이든 항상 활성화
    setActiveTabId(originalId);
    // Update session-based recent list (exclude 'welcome', max 5)
    try {
      const raw = sessionStorage.getItem('recentTabs');
      const arr: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      const next = [originalId, ...arr.filter(id => id !== originalId)];
      const trimmed = next.filter(id => id !== 'welcome').slice(0, 5);
      sessionStorage.setItem('recentTabs', JSON.stringify(trimmed));
    } catch { }
  }, [apiHasGemini, apiHasOpenAI, checkApiRequirement, openApiKeyModal]);

  // Handle ?open query parameter
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const openParams = params.getAll('open');
    if (openParams.length === 0) return;
    const ids = openParams
      .flatMap(value => value.split(','))
      .map(id => id.trim())
      .filter(Boolean)
      .filter(id => Boolean(PAGES[id]));
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;
    shortcutHandledRef.current = true;
    initialShortcutIdsRef.current = uniqueIds;
  }, []);

  // Restore tabs from localStorage on initial load
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      if (shortcutHandledRef.current) {
        const ids = initialShortcutIdsRef.current ?? [];
        if (ids.length > 0) {
          ids.forEach(id => handleOpenFile(id));
          setActiveTabId(ids[ids.length - 1]);
          // Remove ?open query parameter from URL after opening tabs
          if (typeof window !== 'undefined' && window.history && window.location.search) {
            const url = new URL(window.location.href);
            url.search = ''; // Remove all query parameters
            window.history.replaceState({}, '', url.pathname + url.hash);
          }
        }
        return;
      }
      const raw = localStorage.getItem(TABS_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { tabs?: Array<{ id: string; pinned?: boolean }>; activeTabId?: string };
        const tabs = Array.isArray(saved?.tabs) ? saved.tabs : [];
        if (tabs.length > 0) {
          restoringRef.current = true;
          // Open tabs in saved order
          tabs.forEach(t => handleOpenFile(t.id));
          // Apply pinned states and keep pinned tabs on the left
          setOpenTabs(prev => {
            const mapped = prev.map(tab => {
              const s = tabs.find(tt => tt.id === tab.id);
              return s ? { ...tab, pinned: !!s.pinned } : tab;
            });
            const pinned = mapped.filter(t => t.pinned);
            const others = mapped.filter(t => !t.pinned);
            return [...pinned, ...others];
          });
          if (saved.activeTabId) setActiveTabId(saved.activeTabId);
          // Defer to end of task to avoid saving intermediate states
          setTimeout(() => { restoringRef.current = false; }, 0);
          return;
        }
      }
    } catch {}
    if (!shortcutHandledRef.current) {
      // Fallback: open default tabs if no saved state or shortcut
      DEFAULT_TAB_IDS.forEach(id => handleOpenFile(id));
      setActiveTabId(DEFAULT_TAB_IDS[0]);
    }
  }, [handleOpenFile]);

  // Keep session-based recent list in sync with last visited tab
  useEffect(() => {
    if (!activeTabId) return;
    try {
      const raw = sessionStorage.getItem('recentTabs');
      const arr: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      const next = [activeTabId, ...arr.filter(id => id !== activeTabId)];
      const trimmed = next.filter(id => id !== 'welcome').slice(0, 5);
      sessionStorage.setItem('recentTabs', JSON.stringify(trimmed));
    } catch { }
  }, [activeTabId]);

  // Persist open tabs and active tab to localStorage for restoration on reload
  useEffect(() => {
    if (!restoredRef.current || restoringRef.current) return;
    try {
      if (openTabs.length === 0) {
        localStorage.removeItem(TABS_STORAGE_KEY);
        return;
      }
      const data = {
        tabs: openTabs.map(t => ({ id: t.id, pinned: t.pinned })),
        activeTabId: activeTabId || (openTabs[openTabs.length - 1]?.id ?? ''),
      };
      localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [openTabs, activeTabId]);

  // Sync document.title with active tab
  useEffect(() => {
    try {
      const base = 'HunyDev';
      const active = openTabs.find(t => t.id === activeTabId);
      const tabTitle = (active?.title || '').trim();
      const finalTitle = tabTitle ? `${base} — ${tabTitle}` : 'HunyDev · Works & Digital Playground';
      if (typeof document !== 'undefined') {
        document.title = finalTitle;
      }
    } catch {}
  }, [activeTabId, openTabs]);

  const handleCloseTab = useCallback((tabId: string) => {
    // API 작업 진행 중인지 확인
    const taskStatus = apiTaskContext.getTaskStatus(tabId);
    if (taskStatus === 'pending') {
      const confirmed = window.confirm('API 요청이 진행 중입니다. 탭을 닫으시겠습니까?');
      if (!confirmed) return;
    }

    setOpenTabs(prevTabs => {
      const tabIndex = prevTabs.findIndex(tab => tab.id === tabId);
      if (tabIndex === -1) return prevTabs;

      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      setActiveTabId(currActive => {
        if (currActive !== tabId) return currActive;
        if (newTabs.length === 0) return '';
        const newActiveIndex = Math.max(0, tabIndex - 1);
        return newTabs[newActiveIndex]?.id ?? '';
      });
      return newTabs;
    });
  }, [apiTaskContext]);

  const handleCloseAllTabs = useCallback(() => {
    setOpenTabs(prev => {
      const remaining = prev.filter(t => t.pinned);
      // If active tab was removed, pick first remaining as active
      setActiveTabId(curr => {
        if (remaining.length === 0) return '';
        const stillExists = remaining.some(t => t.id === curr);
        return stillExists ? curr : remaining[0].id;
      });
      return remaining;
    });
  }, []);

  const handleTogglePin = useCallback((id: string) => {
    setOpenTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const target = { ...next[idx], pinned: !next[idx].pinned };
      next[idx] = target;
      if (target.pinned) {
        // Move to left-most position
        next.splice(idx, 1);
        next.unshift(target);
      }
      return next;
    });
  }, []);

  const handleOpenInNewWindow = useCallback((tabId: string) => {
    // Open in new window and close current tab
    const baseId = extractBaseId(tabId);
    const url = `${window.location.origin}${window.location.pathname}?open=${baseId}`;
    window.open(url, '_blank');
    handleCloseTab(tabId);
  }, [handleCloseTab]);

  const handleShareTab = useCallback(async (tabId: string) => {
    const baseId = extractBaseId(tabId);
    const url = `${window.location.origin}${window.location.pathname}?open=${baseId}`;
    try {
      await navigator.clipboard.writeText(url);
      showInfoToast('탭 링크가 클립보드에 복사되었습니다.');
    } catch {
      showInfoToast('링크 복사에 실패했습니다.');
    }
  }, [showInfoToast]);

  const handleShareAllTabs = useCallback(async () => {
    const tabIds = openTabs.map(t => extractBaseId(t.id)).join(',');
    const url = `${window.location.origin}${window.location.pathname}?open=${tabIds}`;
    try {
      await navigator.clipboard.writeText(url);
      showInfoToast(`${openTabs.length}개 탭 링크가 클립보드에 복사되었습니다.`);
    } catch {
      showInfoToast('링크 복사에 실패했습니다.');
    }
  }, [openTabs, showInfoToast]);

  const handleCloseTabsToRight = useCallback((tabId: string) => {
    setOpenTabs(prev => {
      const idx = prev.findIndex(t => t.id === tabId);
      if (idx === -1) return prev;

      // Keep tabs up to and including the selected tab
      const remaining = prev.slice(0, idx + 1);

      // If active tab was removed, select the rightmost remaining tab
      setActiveTabId(curr => {
        const stillExists = remaining.some(t => t.id === curr);
        return stillExists ? curr : remaining[remaining.length - 1]?.id || '';
      });

      return remaining;
    });
  }, []);

  const handleCloseOtherTabs = useCallback((tabId: string) => {
    setOpenTabs(prev => {
      // 선택한 탭과 고정된 탭만 유지
      const remaining = prev.filter(t => t.id === tabId || t.pinned);

      // 선택한 탭을 활성화
      setActiveTabId(tabId);

      return remaining;
    });
  }, []);

  // Keyboard shortcut: Alt+W to close tab, Alt+Shift+W to close all
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey || e.metaKey || e.ctrlKey) return;
      const key = e.key?.toLowerCase();
      if (key !== 'w') return;

      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement) {
        const tagName = activeElement.tagName?.toLowerCase();
        const isEditable = activeElement.isContentEditable;
        if (isEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
          return;
        }
      }

      e.preventDefault();
      if (e.shiftKey) {
        handleCloseAllTabs();
      } else if (activeTabId) {
        handleCloseTab(activeTabId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCloseAllTabs, handleCloseTab, activeTabId]);

  return {
    openTabs,
    activeTabId,
    setActiveTabId,
    handleOpenFile,
    handleCloseTab,
    handleCloseAllTabs,
    handleTogglePin,
    handleOpenInNewWindow,
    handleShareTab,
    handleShareAllTabs,
    handleCloseTabsToRight,
    handleCloseOtherTabs,
  };
};
