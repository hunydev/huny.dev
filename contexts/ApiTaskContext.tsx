import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

export type ApiTaskStatus = 'pending' | 'completed' | 'error';

export type ApiTask = {
  tabId: string;
  status: ApiTaskStatus;
  startedAt: number;
  completedAt?: number;
  error?: string;
};

type ApiTaskContextType = {
  tasks: Map<string, ApiTask>;
  startTask: (tabId: string) => void;
  completeTask: (tabId: string) => void;
  errorTask: (tabId: string, error: string) => void;
  getTaskStatus: (tabId: string) => ApiTaskStatus | null;
  hasActiveTasks: () => boolean;
};

const ApiTaskContext = createContext<ApiTaskContextType | null>(null);

export const useApiTask = () => {
  const context = useContext(ApiTaskContext);
  if (!context) {
    throw new Error('useApiTask must be used within ApiTaskProvider');
  }
  return context;
};

export const ApiTaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Map<string, ApiTask>>(new Map<string, ApiTask>());

  const startTask = useCallback((tabId: string) => {
    setTasks(prev => {
      const next = new Map<string, ApiTask>(prev);
      next.set(tabId, {
        tabId,
        status: 'pending',
        startedAt: Date.now(),
      });
      return next;
    });
  }, []);

  const completeTask = useCallback((tabId: string) => {
    setTasks(prev => {
      const next = new Map<string, ApiTask>(prev);
      const task = next.get(tabId);
      if (task) {
        const updated: ApiTask = {
          tabId: task.tabId,
          status: 'completed',
          startedAt: task.startedAt,
          completedAt: Date.now(),
        };
        next.set(tabId, updated);
        
        // 5초 후에 완료 상태 자동 정리
        setTimeout(() => {
          setTasks(current => {
            const cleaned = new Map<string, ApiTask>(current);
            const currentTask = cleaned.get(tabId);
            if (currentTask?.status === 'completed') {
              cleaned.delete(tabId);
            }
            return cleaned;
          });
        }, 5000);
      }
      return next;
    });
  }, []);

  const errorTask = useCallback((tabId: string, error: string) => {
    setTasks(prev => {
      const next = new Map<string, ApiTask>(prev);
      const task = next.get(tabId);
      if (task) {
        const updated: ApiTask = {
          tabId: task.tabId,
          status: 'error',
          startedAt: task.startedAt,
          completedAt: Date.now(),
          error,
        };
        next.set(tabId, updated);
      }
      return next;
    });
  }, []);

  const getTaskStatus = useCallback((tabId: string): ApiTaskStatus | null => {
    return tasks.get(tabId)?.status || null;
  }, [tasks]);

  const hasActiveTasks = useCallback((): boolean => {
    for (const task of tasks.values()) {
      if (task.status === 'pending') return true;
    }
    return false;
  }, [tasks]);

  // beforeunload 이벤트 처리
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasActiveTasks()) {
        e.preventDefault();
        e.returnValue = 'API 요청이 진행 중입니다. 페이지를 나가시겠습니까?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasActiveTasks]);

  const value: ApiTaskContextType = {
    tasks,
    startTask,
    completeTask,
    errorTask,
    getTaskStatus,
    hasActiveTasks,
  };

  return <ApiTaskContext.Provider value={value}>{children}</ApiTaskContext.Provider>;
};
