import { medfinetOfflineApi, type SyncBatch } from "./medfinetOfflineApi";
import { medfinetOperationsApi } from "./medfinetOperationsApi";
import { readOfflineQueue, writeOfflineQueue } from "./offlineQueueStore";

export const OFFLINE_SYNC_COMPLETED_EVENT = "medfinet:offline-sync-completed";

type SyncResult = {
  batch: SyncBatch;
  idempotentReplay: boolean;
  submittedCount: number;
};

const inFlight = new Map<string, Promise<SyncResult | null>>();

function preferenceKey(organizationId: string) {
  return `medfinet.offline.device:${organizationId}`;
}

export function rememberOfflineDevice(
  organizationId: string,
  deviceId: string,
) {
  if (deviceId) localStorage.setItem(preferenceKey(organizationId), deviceId);
}

export function preferredOfflineDevice(organizationId: string) {
  return localStorage.getItem(preferenceKey(organizationId)) || "";
}

async function deterministicBatchId(operationIds: string[]) {
  const bytes = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode([...operationIds].sort().join("\n")),
    ),
  ).slice(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

async function resolveDeviceId(
  organizationId: string,
  preferredDeviceId?: string,
) {
  const saved =
    preferredDeviceId ||
    preferredOfflineDevice(organizationId) ||
    localStorage.getItem("medfinet.nfc.device-record-id") ||
    "";
  if (saved) return saved;

  const devices = await medfinetOperationsApi.devices(
    organizationId,
    "ACTIVE",
  );
  const localIdentifier = localStorage.getItem("medfinet.nfc.device-id");
  const matchingDevice = localIdentifier
    ? devices.find(
        (device) => String(device.deviceIdentifier || "") === localIdentifier,
      )
    : undefined;
  const deviceId = String(matchingDevice?.id || "");
  if (!deviceId) {
    throw new Error(
      "Select or register this approved browser before synchronizing offline work.",
    );
  }
  rememberOfflineDevice(organizationId, deviceId);
  return deviceId;
}

async function performSync(
  organizationId: string,
  subjectId: string,
  preferredDeviceId?: string,
): Promise<SyncResult | null> {
  if (!navigator.onLine) return null;
  const operations = await readOfflineQueue(organizationId, subjectId);
  if (!operations.length) return null;

  const deviceId = await resolveDeviceId(organizationId, preferredDeviceId);
  rememberOfflineDevice(organizationId, deviceId);
  const submittedIds = new Set(
    operations.map((operation) => operation.clientOperationId),
  );
  const result = await medfinetOfflineApi.submitBatch(organizationId, deviceId, {
    clientBatchId: await deterministicBatchId([...submittedIds]),
    operations: operations.map((operation) => ({
      ...operation,
      payload: {
        ...operation.payload,
        sourceOperationId: operation.clientOperationId,
      },
    })),
  });

  const latest = await readOfflineQueue(organizationId, subjectId);
  await writeOfflineQueue(
    organizationId,
    subjectId,
    latest.filter(
      (operation) => !submittedIds.has(operation.clientOperationId),
    ),
  );

  const syncResult = {
    ...result,
    submittedCount: operations.length,
  };
  window.dispatchEvent(
    new CustomEvent<SyncResult>(OFFLINE_SYNC_COMPLETED_EVENT, {
      detail: syncResult,
    }),
  );
  return syncResult;
}

export function syncOfflineQueue(
  organizationId: string,
  subjectId: string,
  preferredDeviceId?: string,
) {
  const key = `${organizationId}:${subjectId}`;
  const current = inFlight.get(key);
  if (current) return current;

  const request = performSync(
    organizationId,
    subjectId,
    preferredDeviceId,
  ).finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
}
