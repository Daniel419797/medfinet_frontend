import useSWR, { SWRConfiguration } from 'swr';
import apiService from '../utils/api';

/**
 * Custom hook for data fetching using SWR
 * Provides caching, revalidation, and other SWR features
 */
function useSWRApi<T = any>(
  url: string | null,
  params?: Record<string, any>,
  options?: SWRConfiguration
) {
  // Create a unique key for SWR cache based on URL and params
  const queryString = params ? new URLSearchParams(params).toString() : '';
  const key = url ? `${url}${queryString ? `?${queryString}` : ''}` : null;
  
  // Use SWR for data fetching
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    key,
    async () => {
      if (!url) return null;
      return apiService.get(url, params);
    },
    options
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

export default useSWRApi;