export const OFFLINE_QUEUE_CHANGED_EVENT = "medfinet:offline-queue-changed";
export const OFFLINE_SYNC_REQUEST_EVENT = "medfinet:offline-sync-request";
export const OFFLINE_SYNC_TAG = "medfinet-offline-sync";

type SyncCapableRegistration = ServiceWorkerRegistration & {
  sync?: { register: (tag: string) => Promise<void> };
};

export async function requestBackgroundSync() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(OFFLINE_QUEUE_CHANGED_EVENT));

  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    if (navigator.onLine) {
      window.dispatchEvent(new Event(OFFLINE_SYNC_REQUEST_EVENT));
    }
    return;
  }

  try {
    const registration =
      (await navigator.serviceWorker.ready) as SyncCapableRegistration;
    if (registration.sync) {
      await registration.sync.register(OFFLINE_SYNC_TAG);
    } else if (navigator.onLine) {
      window.dispatchEvent(new Event(OFFLINE_SYNC_REQUEST_EVENT));
    }
  } catch {
    if (navigator.onLine) {
      window.dispatchEvent(new Event(OFFLINE_SYNC_REQUEST_EVENT));
    }
  }
}
