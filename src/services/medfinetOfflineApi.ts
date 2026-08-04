import { medfinetRequest as request } from "./medfinetApiClient";

export type SyncOperationType =
  | "APPOINTMENT.SCHEDULE"
  | "CLIMATE.PROFILE_UPSERT"
  | "CLINICAL.GROWTH_RECORD"
  | "CLINICAL.IMMUNIZATION_RECORD"
  | "RESPONSE.DELIVERY_RECORD"
  | "RESPONSE.REFERRAL_CREATE";
export type SyncOperationInput = {
  clientOperationId: string;
  operationType: SyncOperationType;
  payload: Record<string, unknown>;
  entityId?: string;
  baseVersion?: number;
};
export type SyncOperationResult = SyncOperationInput & {
  id: string;
  status: string;
  errorCode?: string | null;
  errorMessage?: string | null;
  result?: unknown;
  processedAt?: string | null;
  createdAt: string;
};
export type SyncBatch = {
  id: string;
  deviceId: string;
  clientBatchId: string;
  status: string;
  operationCount: number;
  operations: SyncOperationResult[];
  createdAt: string;
  completedAt?: string | null;
};

const options = (organizationId: string) => ({
  organizationId,
  purpose: "offline-sync",
});
export const medfinetOfflineApi = {
  submitBatch: (
    organizationId: string,
    deviceId: string,
    body: { clientBatchId: string; operations: SyncOperationInput[] },
  ) =>
    request<{ batch: SyncBatch; idempotentReplay: boolean }>(
      `/devices/${encodeURIComponent(deviceId)}/sync-batches`,
      { ...options(organizationId), method: "POST", body },
    ),
  listBatches: (organizationId: string) =>
    request<{ items: SyncBatch[]; nextCursor: string | null }>(
      "/sync-batches?limit=100",
      options(organizationId),
    ),
  getBatch: (organizationId: string, batchId: string) =>
    request<SyncBatch>(
      `/sync-batches/${encodeURIComponent(batchId)}`,
      options(organizationId),
    ),
};
