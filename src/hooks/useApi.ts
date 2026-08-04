import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for making API calls with loading and error states
 */
function useApi<T = any>(apiFunction: (...args: any[]) => Promise<T>, options?: UseApiOptions) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, isLoading: true, error: null });
      
      try {
        const data = await apiFunction(...args);
        setState({ data, isLoading: false, error: null });
        options?.onSuccess?.(data);
        return data;
      } catch (error) {
        const errorObj = error as Error;
        setState({ data: null, isLoading: false, error: errorObj });
        options?.onError?.(errorObj);
        throw error;
      }
    },
    [apiFunction, options]
  );

  return {
    ...state,
    execute,
    reset: useCallback(() => {
      setState({ data: null, isLoading: false, error: null });
    }, []),
  };
}

export default useApi;