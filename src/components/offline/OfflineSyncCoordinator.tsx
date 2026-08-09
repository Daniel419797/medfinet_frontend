import { useCallback, useContext, useEffect } from "react";
import UserContext from "../../contexts/UserContext";
import {
  OFFLINE_QUEUE_CHANGED_EVENT,
  OFFLINE_SYNC_REQUEST_EVENT,
} from "../../services/pwaBackgroundSync";
import { syncOfflineQueue } from "../../services/offlineSyncService";

const SERVICE_WORKER_SYNC_MESSAGE = "MEDFINET_SYNC_REQUESTED";

export function OfflineSyncCoordinator() {
  const { organizationId, user } = useContext(UserContext);

  const synchronize = useCallback(() => {
    if (!organizationId || !user || !navigator.onLine) return;
    void syncOfflineQueue(organizationId, user.id).catch((error: unknown) => {
      console.warn("Automatic offline synchronization was deferred", error);
    });
  }, [organizationId, user]);

  useEffect(() => {
    synchronize();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") synchronize();
    };
    const onServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === SERVICE_WORKER_SYNC_MESSAGE) synchronize();
    };

    window.addEventListener("online", synchronize);
    window.addEventListener(OFFLINE_QUEUE_CHANGED_EVENT, synchronize);
    window.addEventListener(OFFLINE_SYNC_REQUEST_EVENT, synchronize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    navigator.serviceWorker?.addEventListener(
      "message",
      onServiceWorkerMessage,
    );

    return () => {
      window.removeEventListener("online", synchronize);
      window.removeEventListener(OFFLINE_QUEUE_CHANGED_EVENT, synchronize);
      window.removeEventListener(OFFLINE_SYNC_REQUEST_EVENT, synchronize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      navigator.serviceWorker?.removeEventListener(
        "message",
        onServiceWorkerMessage,
      );
    };
  }, [synchronize]);

  return null;
}
