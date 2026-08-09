import { webcrypto } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SyncOperationInput } from "./medfinetOfflineApi";
import {
  OFFLINE_SYNC_COMPLETED_EVENT,
  rememberOfflineDevice,
  syncOfflineQueue,
} from "./offlineSyncService";

const queueStore = vi.hoisted(() => ({
  readOfflineQueue: vi.fn(),
  writeOfflineQueue: vi.fn(),
}));
const offlineApi = vi.hoisted(() => ({ submitBatch: vi.fn() }));
const operationsApi = vi.hoisted(() => ({ devices: vi.fn() }));

vi.mock("./offlineQueueStore", () => queueStore);
vi.mock("./medfinetOfflineApi", () => ({
  medfinetOfflineApi: { submitBatch: offlineApi.submitBatch },
}));
vi.mock("./medfinetOperationsApi", () => ({
  medfinetOperationsApi: { devices: operationsApi.devices },
}));

const firstOperation: SyncOperationInput = {
  clientOperationId: "11111111-1111-4111-8111-111111111111",
  operationType: "CLINICAL.IMMUNIZATION_RECORD",
  payload: { childId: "child-1", vaccineCode: "BCG", doseNumber: 1 },
};
const addedDuringSync: SyncOperationInput = {
  clientOperationId: "22222222-2222-4222-8222-222222222222",
  operationType: "CLINICAL.GROWTH_RECORD",
  payload: { childId: "child-2", weightGrams: 6200 },
};

describe("syncOfflineQueue", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: webcrypto,
    });
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });
    localStorage.clear();
    rememberOfflineDevice("org-1", "device-1");
    queueStore.readOfflineQueue
      .mockResolvedValueOnce([firstOperation])
      .mockResolvedValueOnce([firstOperation, addedDuringSync]);
    offlineApi.submitBatch.mockResolvedValue({
      batch: {
        id: "batch-1",
        deviceId: "device-1",
        clientBatchId: "batch-client-id",
        status: "COMPLETED",
        operationCount: 1,
        operations: [],
        createdAt: "2026-08-09T12:00:00.000Z",
      },
      idempotentReplay: false,
    });
  });

  it("submits an idempotent batch and preserves work added during the request", async () => {
    const completed = vi.fn();
    window.addEventListener(OFFLINE_SYNC_COMPLETED_EVENT, completed, {
      once: true,
    });

    const result = await syncOfflineQueue("org-1", "worker-1");

    expect(result?.submittedCount).toBe(1);
    const [, deviceId, body] = offlineApi.submitBatch.mock.calls[0];
    expect(deviceId).toBe("device-1");
    expect(body.clientBatchId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(body.operations[0].payload.sourceOperationId).toBe(
      firstOperation.clientOperationId,
    );
    expect(queueStore.writeOfflineQueue).toHaveBeenCalledWith(
      "org-1",
      "worker-1",
      [addedDuringSync],
    );
    expect(completed).toHaveBeenCalledTimes(1);
    expect(operationsApi.devices).not.toHaveBeenCalled();
  });
});
