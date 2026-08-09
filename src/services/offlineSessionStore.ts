import type { OrganizationMembership } from "./medfinetSessionApi";
import {
  readEncryptedValue,
  removeEncryptedValue,
  writeEncryptedValue,
} from "./secureOfflineStore";

const SESSION_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

type OfflineSessionSnapshot = {
  version: 1;
  userId: string;
  cachedAt: string;
  expiresAt: string;
  memberships: OrganizationMembership[];
};

function sessionKey(userId: string) {
  return `session:${userId}`;
}

export async function cacheOfflineSession(
  userId: string,
  memberships: OrganizationMembership[],
) {
  const cachedAt = new Date();
  await writeEncryptedValue(sessionKey(userId), {
    version: 1,
    userId,
    cachedAt: cachedAt.toISOString(),
    expiresAt: new Date(
      cachedAt.getTime() + SESSION_CACHE_TTL_MS,
    ).toISOString(),
    memberships,
  } satisfies OfflineSessionSnapshot);
}

export async function readOfflineSession(userId: string) {
  const snapshot = await readEncryptedValue<OfflineSessionSnapshot>(
    sessionKey(userId),
  );
  if (
    !snapshot ||
    snapshot.version !== 1 ||
    snapshot.userId !== userId ||
    new Date(snapshot.expiresAt).getTime() <= Date.now()
  ) {
    if (snapshot) await removeEncryptedValue(sessionKey(userId));
    return null;
  }
  return snapshot;
}

export async function removeOfflineSession(userId: string) {
  await removeEncryptedValue(sessionKey(userId));
}
