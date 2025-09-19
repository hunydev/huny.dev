import React from 'react';
import type { PageProps } from '../../types';

// Types
export type TaskNode = {
  id: string;
  title: string;
  checked: boolean;
  children: TaskNode[];
};

const uid = () => Math.random().toString(36).slice(2, 9);

const ToDoGeneratorPage: React.FC<PageProps> = () => {
  const [prompt, setPrompt] = React.useState('');
  const [generating, setGenerating] = React.useState(false);
  const [error, setError] = React.useState('');
  const [root, setRoot] = React.useState<TaskNode>({ id: 'root', title: 'root', checked: false, children: [] });
  const [copied, setCopied] = React.useState(false);

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
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/todo-generator', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt, max_items: 30 }),
      });
      const text = await res.text();
      if (!res.ok) {
        throw new Error(text || `Failed: ${res.status}`);
      }
      let js: any = {};
      try { js = text ? JSON.parse(text) : {}; } catch {}
      const items: Array<any> = Array.isArray(js?.tasks) ? js.tasks : [];
      const toTree = (arr: any[]): TaskNode[] => (arr || []).map((t: any) => ({
        id: uid(),
        title: String(t?.title ?? ''),
        checked: false,
        children: Array.isArray(t?.children) ? toTree(t.children) : [],
      }));
      setTasks(toTree(items));
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setGenerating(false);
    }
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
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z"/></svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="m9 20.42l-6.21-6.21l2.83-2.83L9 14.77l9.88-9.89l2.83 2.83z"/></svg>
                </button>
                <button
                  className="p-1.5 rounded border border-white/10 text-gray-300 hover:bg-white/10"
                  onClick={() => { setTemp(node.title); setIsEditing(false); }}
                  title="취소"
                  aria-label="취소"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12z"/></svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z"/></svg>
                </button>
                <button
                  className="p-1.5 rounded border border-white/10 text-gray-300 hover:bg-white/10"
                  onClick={() => deleteNode(node.id)}
                  title="삭제"
                  aria-label="삭제"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"/></svg>
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
    <div className="max-w-[1200px] mx-auto">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">To-do Generator</h1>
          <p className="text-sm text-gray-400">간단한 설명을 입력하면 체크리스트를 생성합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2.5 py-1.5 text-xs rounded border border-white/10 text-gray-300 hover:bg-white/10 inline-flex items-center gap-1"
            onClick={copyText}
            title="체크리스트 복사"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3.5 h-3.5"><path fill="currentColor" d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z"/></svg>
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
      </header>

      <section className="mb-4">
        <div className="flex items-center gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (!generating && prompt.trim()) generate(); } }}
            placeholder="예: 3일간 도쿄 여행 준비"
            className="flex-1 min-w-0 px-3 py-2 rounded bg-[#1e1e1e] border border-white/10 text-gray-200 placeholder:text-gray-500"
          />
          <button
            onClick={generate}
            disabled={generating || !prompt.trim()}
            className={`px-3 py-2 rounded text-sm border border-white/10 ${generating ? 'opacity-70' : 'hover:bg-white/10'} ${prompt.trim() ? 'text-white' : 'text-gray-400'}`}
            title={generating ? '생성 중…' : '목록 생성'}
          >{generating ? '생성 중…' : '생성'}</button>
          <button
            onClick={addSiblingRoot}
            className="px-3 py-2 rounded text-sm border border-white/10 text-gray-300 hover:bg-white/10"
            title="맨 위에 새 작업 추가"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4"><path fill="currentColor" d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z"/></svg> 
            작업
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-amber-300">{error}</p>}
      </section>

      {root.children.length === 0 ? (
        <div className="border border-white/10 rounded p-6 text-center text-gray-400 bg-[#1e1e1e]">
          <p className="mb-2">아직 항목이 없습니다.</p>
          <p className="mb-2">해야할 일을 입력하고 "생성"을 눌러 보세요.</p>
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
