import { useState, useCallback } from 'react';

export interface UseApiKeyManagerReturn {
  apiHasGemini: boolean;
  setApiHasGemini: (value: boolean) => void;
  apiHasOpenAI: boolean;
  setApiHasOpenAI: (value: boolean) => void;
  apiModalOpen: boolean;
  setApiModalOpen: (open: boolean) => void;
  apiSaving: boolean;
  setApiSaving: (saving: boolean) => void;
  apiError: string;
  setApiError: (error: string) => void;
  apiNewGemini: string;
  setApiNewGemini: (key: string) => void;
  apiNewOpenAI: string;
  setApiNewOpenAI: (key: string) => void;
  openApiKeyModal: () => void;
  saveApiKeys: () => Promise<void>;
}

export const useApiKeyManager = (): UseApiKeyManagerReturn => {

  // API key 상태를 localStorage에서 동기적으로 초기화 (탭 복원보다 먼저 실행되도록)
  const [apiHasGemini, setApiHasGemini] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('secure.apikeys.meta.v1');
      if (raw) {
        const meta = JSON.parse(raw) as { gemini?: boolean; openai?: boolean };
        return !!meta?.gemini;
      }
    } catch {}
    return false;
  });

  const [apiHasOpenAI, setApiHasOpenAI] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem('secure.apikeys.meta.v1');
      if (raw) {
        const meta = JSON.parse(raw) as { gemini?: boolean; openai?: boolean };
        return !!meta?.openai;
      }
    } catch {}
    return false;
  });

  const [apiModalOpen, setApiModalOpen] = useState<boolean>(false);
  const [apiSaving, setApiSaving] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>('');
  const [apiNewGemini, setApiNewGemini] = useState<string>('');
  const [apiNewOpenAI, setApiNewOpenAI] = useState<string>('');

  const openApiKeyModal = useCallback(() => {
    setApiError('');
    setApiNewGemini('');
    setApiNewOpenAI('');
    setApiModalOpen(true);
  }, []);

  const saveApiKeys = useCallback(async () => {
    try {
      setApiSaving(true);
      setApiError('');
      const existing = localStorage.getItem('secure.apikeys.v1') || '';
      const payload: any = { existing };
      if (apiNewGemini.trim()) payload.gemini = apiNewGemini.trim();
      if (apiNewOpenAI.trim()) payload.openai = apiNewOpenAI.trim();

      const res = await fetch('/api/secure-apikeys', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `Failed: ${res.status}`);

      let data: any = {};
      try { data = text ? JSON.parse(text) : {}; } catch {}

      const cipher = String(data?.cipher || '');
      const meta = data?.meta && typeof data.meta === 'object' ? data.meta : {};

      if (cipher) localStorage.setItem('secure.apikeys.v1', cipher);
      localStorage.setItem('secure.apikeys.meta.v1', JSON.stringify({
        gemini: !!meta?.gemini,
        openai: !!meta?.openai,
      }));

      setApiHasGemini(!!meta?.gemini);
      setApiHasOpenAI(!!meta?.openai);
      setApiModalOpen(false);
      setApiNewGemini('');
      setApiNewOpenAI('');
    } catch (e: any) {
      setApiError(e?.message || String(e));
    } finally {
      setApiSaving(false);
    }
  }, [apiNewGemini, apiNewOpenAI]);

  return {
    apiHasGemini,
    setApiHasGemini,
    apiHasOpenAI,
    setApiHasOpenAI,
    apiModalOpen,
    setApiModalOpen,
    apiSaving,
    setApiSaving,
    apiError,
    setApiError,
    apiNewGemini,
    setApiNewGemini,
    apiNewOpenAI,
    setApiNewOpenAI,
    openApiKeyModal,
    saveApiKeys,
  };
};
