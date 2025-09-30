import { useState, useCallback } from 'react';

export type ApiCallOptions<TResponse = any> = {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  parseResponse?: (text: string) => TResponse;
  onSuccess?: (data: TResponse) => void;
  onError?: (error: Error) => void;
};

export type ApiCallState<TResponse> = {
  data: TResponse | null;
  loading: boolean;
  error: string;
};

export type ApiCallReturn<TResponse> = ApiCallState<TResponse> & {
  execute: (overrideOptions?: Partial<ApiCallOptions<TResponse>>) => Promise<TResponse | null>;
  reset: () => void;
  setData: (data: TResponse | null) => void;
  setError: (error: string) => void;
};

/**
 * API 호출을 위한 공통 Hook
 * 
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useApiCall<MyResponse>({
 *   url: '/api/endpoint',
 *   method: 'POST',
 *   onSuccess: (data) => console.log('Success:', data)
 * });
 * 
 * // 호출
 * await execute({ body: { key: 'value' } });
 * ```
 */
export function useApiCall<TResponse = any>(
  defaultOptions: ApiCallOptions<TResponse>
): ApiCallReturn<TResponse> {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const execute = useCallback(
    async (overrideOptions?: Partial<ApiCallOptions<TResponse>>): Promise<TResponse | null> => {
      const options = { ...defaultOptions, ...overrideOptions };
      
      setLoading(true);
      setError('');
      
      try {
        const fetchOptions: RequestInit = {
          method: options.method || 'GET',
          headers: options.headers,
        };

        // FormData는 그대로 전달, JSON은 stringify
        if (options.body) {
          if (options.body instanceof FormData) {
            fetchOptions.body = options.body;
          } else if (typeof options.body === 'object') {
            fetchOptions.headers = {
              'Content-Type': 'application/json',
              ...options.headers,
            };
            fetchOptions.body = JSON.stringify(options.body);
          } else {
            fetchOptions.body = options.body;
          }
        }

        const res = await fetch(options.url, fetchOptions);
        const text = await res.text();

        if (!res.ok) {
          throw new Error(text || `Request failed: ${res.status}`);
        }

        // 응답 파싱
        let parsedData: TResponse;
        if (options.parseResponse) {
          parsedData = options.parseResponse(text);
        } else {
          try {
            parsedData = text ? JSON.parse(text) : null;
          } catch {
            parsedData = text as any;
          }
        }

        setData(parsedData);
        options.onSuccess?.(parsedData);
        return parsedData;
      } catch (e: any) {
        const errorMessage = e?.message || String(e);
        setError(errorMessage);
        options.onError?.(e);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [defaultOptions]
  );

  const reset = useCallback(() => {
    setData(null);
    setError('');
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
    setError,
  };
}
