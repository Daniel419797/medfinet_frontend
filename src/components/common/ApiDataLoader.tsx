import React, { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import ApiErrorBoundary from './ApiErrorBoundary';

interface ApiDataLoaderProps<T> {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
  children: (data: T) => ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  onRetry?: () => void;
}

function ApiDataLoader<T>({
  isLoading,
  error,
  data,
  children,
  loadingComponent,
  errorComponent,
  onRetry,
}: ApiDataLoaderProps<T>) {
  // Show loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-300">Loading data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <ApiErrorBoundary
        onReset={onRetry}
        fallback={errorComponent}
      >
        <div>Error: {error.message}</div>
      </ApiErrorBoundary>
    );
  }

  // Show data if available
  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-neutral-600 dark:text-neutral-300">No data available</p>
      </div>
    );
  }

  // Render children with data
  return <>{children(data)}</>;
}

export default ApiDataLoader;