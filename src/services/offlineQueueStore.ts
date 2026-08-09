import type { SyncOperationInput } from "./medfinetOfflineApi";
import { requestBackgroundSync } from "./pwaBackgroundSync";
import {
  readEncryptedValue,
  removeEncryptedValue,
  writeEncryptedValue,
} from "./secureOfflineStore";

function queueKey(organizationId: string, subjectId: string) {
  return `queue:${organizationId}:${subjectId}`;
}
export async function readOfflineQueue(
  organizationId: string,
  subjectId: string,
): Promise<SyncOperationInput[]> {
  return (
    (await readEncryptedValue<SyncOperationInput[]>(
      queueKey(organizationId, subjectId),
    )) || []
  );
}

export async function writeOfflineQueue(
  organizationId: string,
  subjectId: string,
  operations: SyncOperationInput[],
) {
  const name = queueKey(organizationId, subjectId);
  if (!operations.length) {
    await removeEncryptedValue(name);
    return;
  }

  await writeEncryptedValue(name, operations);
  await requestBackgroundSync();
}
