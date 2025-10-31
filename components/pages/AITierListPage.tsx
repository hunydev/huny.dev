import React from 'react';
import type { PageProps } from '../../types';
import { Icon } from '../../constants';
import { ErrorMessage, LoadingButton, ApiProviderBadge, PlaygroundGuideModal } from '../ui';
import { useApiCall } from '../../hooks/useApiCall';
import { usePlaygroundGuide } from '../../hooks/usePlaygroundGuide';

// Types
type TierLevel = 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

type TierItem = {
  name: string;
  description?: string;
};

type TierData = {
  [K in TierLevel]?: TierItem[];
};

type TierListResponse = {
  tiers: TierData;
  theme: string;
};

const TIER_COLORS: Record<TierLevel, string> = {
  SSS: 'from-purple-500 to-pink-500',
  SS: 'from-red-500 to-orange-500',
  S: 'from-orange-500 to-yellow-500',
  A: 'from-green-500 to-emerald-500',
  B: 'from-blue-500 to-cyan-500',
  C: 'from-cyan-500 to-teal-500',
  D: 'from-gray-500 to-slate-500',
  E: 'from-slate-600 to-gray-600',
  F: 'from-gray-700 to-neutral-700',
};

const TIER_ORDER: TierLevel[] = ['SSS', 'SS', 'S', 'A', 'B', 'C', 'D', 'E', 'F'];

const AITierListPage: React.FC<PageProps> = ({ apiTask, isActiveTab }) => {
  const [prompt, setPrompt] = React.useState('');
  const [tierData, setTierData] = React.useState<TierData>({});
  const [theme, setTheme] = React.useState<string>('');
  const [editingItem, setEditingItem] = React.useState<{ tier: TierLevel; index: number } | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');

  const playgroundGuide = usePlaygroundGuide('ai-tier-list');

  const api = useApiCall<TierListResponse>({
    url: '/api/ai-tier-list',
    method: 'POST',
    tabId: 'ai-tier-list',
    isActiveTab,
    apiTask,
    onSuccess: (data) => {
      if (data?.tiers) {
        setTierData(data.tiers);
        setTheme(data.theme || prompt);
      }
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    api.execute({ body: { prompt: prompt.trim() } });
  };

  const handleReset = () => {
    setPrompt('');
    setTierData({});
    setTheme('');
    setEditingItem(null);
    api.reset();
  };

  const handleEditItem = (tier: TierLevel, index: number) => {
    const item = tierData[tier]?.[index];
    if (!item) return;
    setEditingItem({ tier, index });
    setEditName(item.name);
    setEditDescription(item.description || '');
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    const { tier, index } = editingItem;
    
    setTierData(prev => {
      const newData = { ...prev };
      if (!newData[tier]) return prev;
      
      const newItems = [...newData[tier]!];
      newItems[index] = {
        name: editName.trim(),
        ...(editDescription.trim() ? { description: editDescription.trim() } : {}),
      };
      
      return { ...newData, [tier]: newItems };
    });
    
    setEditingItem(null);
    setEditName('');
    setEditDescription('');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditName('');
    setEditDescription('');
  };

  const handleDeleteItem = (tier: TierLevel, index: number) => {
    if (!confirm('이 항목을 삭제하시겠습니까?')) return;
    
    setTierData(prev => {
      const newData = { ...prev };
      if (!newData[tier]) return prev;
      
      const newItems = newData[tier]!.filter((_, i) => i !== index);
      
      // 티어에 항목이 없으면 티어 자체를 제거
      if (newItems.length === 0) {
        const { [tier]: _, ...rest } = newData;
        return rest;
      }
      
      return { ...newData, [tier]: newItems };
    });
  };

  const handleAddItem = (tier: TierLevel) => {
    const name = prompt(`${tier} 티어에 추가할 항목 이름을 입력하세요:`);
    if (!name || !name.trim()) return;
    
    setTierData(prev => {
      const newData = { ...prev };
      const existingItems = newData[tier] || [];
      
      return {
        ...newData,
        [tier]: [...existingItems, { name: name.trim() }],
      };
    });
  };

  const handleMoveTier = (tier: TierLevel, index: number, direction: 'up' | 'down') => {
    const currentTierIndex = TIER_ORDER.indexOf(tier);
    const targetTierIndex = direction === 'up' ? currentTierIndex - 1 : currentTierIndex + 1;
    
    if (targetTierIndex < 0 || targetTierIndex >= TIER_ORDER.length) return;
    
    const targetTier = TIER_ORDER[targetTierIndex];
    const item = tierData[tier]?.[index];
    if (!item) return;
    
    setTierData(prev => {
      const newData = { ...prev };
      
      // 현재 티어에서 제거
      const currentItems = newData[tier]!.filter((_, i) => i !== index);
      if (currentItems.length === 0) {
        delete newData[tier];
      } else {
        newData[tier] = currentItems;
      }
      
      // 타겟 티어에 추가
      const targetItems = newData[targetTier] || [];
      newData[targetTier] = [...targetItems, item];
      
      return newData;
    });
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="aiTierList" className="w-5 h-5" />
          <h1 className="text-xl font-semibold">AI Tier List</h1>
        </div>
        <div className="flex items-center gap-2">
          <ApiProviderBadge provider="gemini" showFreeLabel />
          <button
            onClick={playgroundGuide.openGuide}
            className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-gray-200"
            title="가이드"
          >
            <Icon name="help" className="w-4 h-4" />
          </button>
        </div>
      </div>

      <PlaygroundGuideModal
        isOpen={playgroundGuide.isModalOpen}
        onClose={playgroundGuide.closeGuide}
        title="AI Tier List 가이드"
        steps={[
          '티어 리스트를 생성할 주제를 입력하세요.',
          '예시: "명품 브랜드 인지도", "프로그래밍 언어 인기도", "과일 맛있는 정도"',
          'AI가 자동으로 SSS ~ F 등급까지 티어를 생성합니다.',
          '각 티어에는 해당 등급에 맞는 항목들이 배치됩니다.',
        ]}
      />

      {/* Input Section */}
      <div className="space-y-2">
        <label className="block text-sm text-gray-300">티어 리스트 주제</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !api.loading && handleGenerate()}
            placeholder="예: 명품 브랜드 인지도"
            className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded text-sm focus:outline-none focus:border-white/30"
            disabled={api.loading}
          />
          <LoadingButton
            onClick={handleGenerate}
            loading={api.loading}
            disabled={!prompt.trim() || api.loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm font-medium"
          >
            생성
          </LoadingButton>
          {(tierData && Object.keys(tierData).length > 0) && (
            <button
              onClick={handleReset}
              disabled={api.loading}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded text-sm"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {api.error && <ErrorMessage message={api.error} />}

      {/* Tier List Display */}
      {theme && Object.keys(tierData).length > 0 && (
        <div className="space-y-4 mt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {theme}
            </h2>
          </div>

          <div className="space-y-2">
            {TIER_ORDER.map((tier) => {
              const items = tierData[tier];
              if (!items || items.length === 0) return null;

              return (
                <div
                  key={tier}
                  className="flex items-stretch border border-white/10 rounded-lg overflow-hidden bg-black/20"
                >
                  {/* Tier Label */}
                  <div
                    className={`w-20 flex items-center justify-center bg-gradient-to-br ${TIER_COLORS[tier]} font-bold text-white text-xl shrink-0`}
                  >
                    {tier}
                  </div>

                  {/* Tier Items */}
                  <div className="flex-1 p-3">
                    <div className="flex flex-wrap gap-2 items-center">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-sm group relative flex items-center gap-2"
                        >
                          <span className="font-medium">{item.name}</span>
                          
                          {/* Edit buttons (show on hover) */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditItem(tier, idx)}
                              className="p-0.5 hover:bg-blue-500/20 rounded"
                              title="편집"
                            >
                              <Icon name="edit" className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(tier, idx)}
                              className="p-0.5 hover:bg-red-500/20 rounded text-red-400"
                              title="삭제"
                            >
                              <Icon name="close" className="w-3 h-3" />
                            </button>
                            {TIER_ORDER.indexOf(tier) > 0 && (
                              <button
                                onClick={() => handleMoveTier(tier, idx, 'up')}
                                className="p-0.5 hover:bg-green-500/20 rounded"
                                title="상위 티어로"
                              >
                                <Icon name="arrowUp" className="w-3 h-3" />
                              </button>
                            )}
                            {TIER_ORDER.indexOf(tier) < TIER_ORDER.length - 1 && (
                              <button
                                onClick={() => handleMoveTier(tier, idx, 'down')}
                                className="p-0.5 hover:bg-orange-500/20 rounded"
                                title="하위 티어로"
                              >
                                <Icon name="arrowDown" className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Description tooltip */}
                          {item.description && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-white/20 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 max-w-xs">
                              {item.description}
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Add item button */}
                      <button
                        onClick={() => handleAddItem(tier)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded text-sm text-gray-400 hover:text-gray-200 flex items-center gap-1"
                        title={`${tier} 티어에 항목 추가`}
                      >
                        <Icon name="add" className="w-3 h-3" />
                        추가
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!api.loading && !theme && !api.error && (
        <div className="text-center py-12 text-gray-500">
          <Icon name="aiTierList" className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">티어 리스트를 생성할 주제를 입력하세요</p>
          <p className="text-xs mt-1">AI가 자동으로 SSS ~ F 등급까지 분류합니다</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCancelEdit}>
          <div className="bg-[#252526] border border-white/10 rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">항목 편집</h3>
              <button
                onClick={handleCancelEdit}
                className="p-1 hover:bg-white/10 rounded"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">이름</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-sm focus:outline-none focus:border-white/30"
                  placeholder="항목 이름"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">설명 (선택)</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded text-sm focus:outline-none focus:border-white/30 resize-none"
                  placeholder="항목 설명"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITierListPage;
