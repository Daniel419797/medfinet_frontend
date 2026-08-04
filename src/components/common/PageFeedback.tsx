import type { ReactNode } from "react";

export function PageFeedback({
  loading,
  error,
  empty,
  emptyTitle = "No records yet",
  emptyDescription,
  onRetry,
  children,
}: {
  loading: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: ReactNode;
}) {
  if (loading)
    return (
      <div role="status" className="mf-surface min-h-52 p-6">
        <span className="sr-only">Loading...</span>
        <div className="animate-pulse space-y-4" aria-hidden="true">
          <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-px bg-slate-100 dark:bg-slate-800" />
          {[1, 2, 3].map((item) => <div key={item} className="flex items-center gap-4"><div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800" /><div className="flex-1 space-y-2"><div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" /><div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" /></div></div>)}
        </div>
      </div>
    );
  if (error)
    return (
      <div
        role="alert"
        className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"
      >
        <p>{error}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mf-button-danger mt-4"
          >
            Retry
          </button>
        )}
      </div>
    );
  if (empty)
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <p className="font-semibold text-slate-800">{emptyTitle}</p>
        {emptyDescription && <p className="mt-1">{emptyDescription}</p>}
      </div>
    );
  return children;
}
