import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, ApiProviderBadge } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';

// Types
export type TaskNode = {
  id: string;
  title: string;
  checked: boolean;
  children: TaskNode[];
};

const uid = () => Math.random().toString(36).slice(2, 9);

const ToDoGeneratorPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [prompt, setPrompt] = React.useState('');
  const [root, setRoot] = React.useState<TaskNode>({ id: 'root', title: 'root', checked: false, children: [] });
  const [copied, setCopied] = React.useState(false);

  type ToDoResponse = { tasks: any[] };
  const api = useApiCall<ToDoResponse>({
    url: '/api/todo-generator',
    method: 'POST',
    tabId: 'todo-generator',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      const items = Array.isArray(data?.tasks) ? data.tasks : [];
      const toTree = (arr: any[]): TaskNode[] => (arr || []).map((t: any) => ({
        id: uid(),
        title: String(t?.title ?? ''),
        checked: false,
        children: Array.isArray(t?.children) ? toTree(t.children) : [],
      }));
      setTasks(toTree(items));
    },
  });

  const setTasks = (tasks: TaskNode[]) => setRoot(prev => ({ ...prev, children: tasks }));

  // Tree helpers
  const visit = (node: TaskNode, fn: (n: TaskNode, parent?: TaskNode) => void, parent?: TaskNode) => {
    fn(node, parent);
    node.children.forEach(ch => visit(ch, fn, node));
  };

  const clone = (node: TaskNode): TaskNode => ({ ...node, children: node.children.map(clone) });

  const recalc = (node: TaskNode) => {
    node.children.forEach(recalc);
    if (node.children.length > 0) {
      node.checked = node.children.every(c => c.checked);
    }
  };

  const toggleNode = (id: string, checked?: boolean) => {
    setRoot(curr => {
      const next = clone(curr);
      const byId = new Map<string, TaskNode>();
      visit(next, n => byId.set(n.id, n));
      const n = byId.get(id);
      if (!n) return curr;
      const newVal = typeof checked === 'boolean' ? checked : !n.checked;
      // 1) Toggle subtree to newVal
      const toggleSubtree = (x: TaskNode, val: boolean) => {
        x.checked = val;
        x.children.forEach(c => toggleSubtree(c, val));
      };
      toggleSubtree(n, newVal);
      // 2) Bubble up: parent checked = all children checked
      const parents = new Map<string, string | null>();
      const mapParent = (node: TaskNode, parent?: TaskNode) => {
        parents.set(node.id, parent ? parent.id : null);
        node.children.forEach(ch => mapParent(ch, node));
      };
      mapParent(next);
      let p = parents.get(id);
      while (p) {
        const pn = byId.get(p)!;
        pn.checked = pn.children.length > 0 && pn.children.every(c => c.checked);
        p = parents.get(p) || null;
      }
      return next;
    });
  };

  const editNodeTitle = (id: string, title: string) => {
    setRoot(curr => {
      const next = clone(curr);
      visit(next, n => { if (n.id === id) n.title = title; });
      return next;
    });
  };

  const deleteNode = (id: string) => {
    if (id === 'root') return;
    setRoot(curr => {
      const next = clone(curr);
      const removeFrom = (node: TaskNode): boolean => {
        const before = node.children.length;
        node.children = node.children.filter(c => c.id !== id);
        if (before !== node.children.length) return true;
        node.children.forEach(removeFrom);
        return false;
      };
      removeFrom(next);
      recalc(next);
      return next;
    });
  };

  const addSiblingRoot = () => {
    setTasks([
      ...root.children,
      { id: uid(), title: '새 작업', checked: false, children: [] },
    ]);
  };

  const addChild = (parentId: string) => {
    setRoot(curr => {
      const next = clone(curr);
      visit(next, n => {
        if (n.id === parentId) {
          n.children.push({ id: uid(), title: '하위 작업', checked: false, children: [] });
        }
      });
      recalc(next);
      return next;
    });
  };

  // Copy helpers
  const toMarkdown = React.useCallback(() => {
    const lines: string[] = [];
    const walk = (nodes: TaskNode[], depth = 0) => {
      for (const n of nodes) {
        const box = n.checked ? '[x]' : '[ ]';
        const indent = '  '.repeat(depth);
        lines.push(`${indent}- ${box} ${n.title}`);
        if (n.children?.length) walk(n.children, depth + 1);
      }
    };
    walk(root.children, 0);
    return lines.join('\n');
  }, [root.children]);

  const copyText = async () => {
    const text = toMarkdown();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  // Fetch from server
  const generate = async () => {
    if (!prompt.trim()) return;
    await api.execute({
      body: { prompt, max_items: 30 },
    });
  };

  // Editable item component
  const Item: React.FC<{ node: TaskNode; depth: number }> = ({ node, depth }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [temp, setTemp] = React.useState(node.title);

    React.useEffect(() => setTemp(node.title), [node.title]);

    return (
      <div className="pl-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-blue-500"
            checked={node.checked}
            onChange={(e) => toggleNode(node.id, e.target.checked)}
            aria-label={`${node.title} ${node.checked ? '완료됨' : '미완료'}`}
          />
          {isEditing ? (
            <input
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { editNodeTitle(node.id, temp); setIsEditing(false); }
                if (e.key === 'Escape') { setTemp(node.title); setIsEditing(false); }
              }}
              className="px-2 py-1 text-sm rounded bg-[#1e1e1e] border border-white/10 text-gray-200 w-[min(560px,80vw)]"
              autoFocus
            />
          ) : (
            <span className={`text-sm ${node.checked ? 'line-through text-gray-500' : 'text-gray-200'}`}>{node.title}</span>
          )}

          <div className="ml-auto flex items-center gap-1">
            {depth < 1 && (
              <button
                className="p-1.5 rounded border border-white/10 text-gray-300 hover:bg-white/10"
                onClick={() => addChild(node.id)}
                title="하위 작업 추가"
                aria-label="하위 작업 추가"
              >
                <Icon name="addSquare" className="w-4 h-4" aria-hidden />
              </button>
            )}
            {isEditing ? (
              <>
                <button
                  className="p-1.5 rounded border border-white/10 text-gray-300 hover:bg-white/10"
                  onClick={() => { editNodeTitle(node.id, temp); setIsEditing(false); }}
                  title="저장"
                  aria-label="저장"
                >
                  <Icon name="checkBadge" className="w-4 h-4 text-emerald-300" aria-hidden />
                </button>
                <button
                  className="p-1.5 rounded border border-white/10 text-gray-300 hover:bg-white/10"
                  onClick={() => { setTemp(node.title); setIsEditing(false); }}
                  title="취소"
                  aria-label="취소"
                >
                  <Icon name="close" className="w-4 h-4 text-gray-300" aria-hidden />
                </button>
              </>
            ) : (
              <>
                <button
                  className="p-1.5 rounded border border-white/10 text-gray-300 hover:bg-white/10"
                  onClick={() => setIsEditing(true)}
                  title="편집"
                  aria-label="편집"
                >
                  <Icon name="edit" className="w-4 h-4 text-gray-300" aria-hidden />
                </button>
                <button
                  className="p-1.5 rounded border border-white/10 text-gray-300 hover:bg-white/10"
                  onClick={() => deleteNode(node.id)}
                  title="삭제"
                  aria-label="삭제"
                >
                  <Icon name="trash" className="w-4 h-4 text-gray-300" aria-hidden />
                </button>
              </>
            )}
          </div>
        </div>
        {node.children?.length > 0 && (
          <div className="ml-5 mt-1 border-l border-white/10 pl-2 space-y-1">
            {node.children.map(ch => (
              <Item key={ch.id} node={ch} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="text-gray-300 max-w-6xl mx-auto font-sans leading-relaxed">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 text-emerald-300">
            <Icon name="todoGenerator" className="w-6 h-6" aria-hidden />
          </span>
          To-do Generator
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base">간단한 설명을 입력하면 체크리스트를 생성합니다.</p>
        <div className="mt-2">
          <ApiProviderBadge provider="gemini" />
        </div>
      </header>

      <section className="mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (!api.loading && prompt.trim()) generate(); } }}
            placeholder="예: 3일간 도쿄 여행 준비"
            className="flex-1 min-w-0 px-3 py-2 rounded bg-[#1e1e1e] border border-white/10 text-gray-200 placeholder:text-gray-500"
          />
          <LoadingButton
            onClick={generate}
            disabled={!prompt.trim()}
            loading={api.loading}
            loadingText="생성 중…"
            idleText="생성"
            variant="secondary"
            className="px-3 py-2 text-sm"
          />
          <button
            onClick={addSiblingRoot}
            className="px-3 py-2 rounded text-sm border border-white/10 text-gray-300 hover:bg-white/10 inline-flex items-center gap-1 whitespace-nowrap"
            title="맨 위에 새 작업 추가"
          >
            <Icon name="addSquare" className="w-4 h-4" aria-hidden />
            <span>작업</span>
          </button>
          <button
            className="px-3 py-2 rounded text-sm border border-white/10 text-gray-300 hover:bg-white/10 inline-flex items-center gap-1"
            onClick={copyText}
            title="체크리스트 복사"
          >
            <Icon name="clipboard" className="w-4 h-4" aria-hidden />
            <span>{copied ? '복사됨' : '복사'}</span>
          </button>
        </div>
        <ErrorMessage error={api.error} className="mt-2" />
      </section>

      {root.children.length === 0 ? (
        <div className="border border-white/10 rounded p-6 text-center text-gray-400 bg-[#1e1e1e]">
          <p className="mb-2">아직 항목이 없습니다.</p>
          <p className="text-xs">또는 "+ 작업"으로 수동으로 추가할 수 있습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {root.children.map(n => (
            <div key={n.id} className="rounded border border-white/10 bg-[#1e1e1e] p-2">
              <Item node={n} depth={0} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToDoGeneratorPage;
