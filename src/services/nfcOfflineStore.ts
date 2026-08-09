import type { NfcScanResult } from "./medfinetNfcApi";
import {
  readEncryptedValue,
  removeEncryptedValue,
  writeEncryptedValue,
} from "./secureOfflineStore";

const NFC_SNAPSHOT_TTL_MS = 12 * 60 * 60 * 1000;

export type OfflineCardInput = {
  publicId: string;
  cardToken: string;
  uc: string;
};

export type OfflineNfcSnapshot = {
  version: 1;
  organizationId: string;
  subjectId: string;
  deviceId: string;
  publicId: string;
  cardFingerprint: string;
  lastCounter: number;
  resolvedAt: string;
  expiresAt: string;
  result: NfcScanResult;
};

function snapshotKey(
  organizationId: string,
  subjectId: string,
  publicId: string,
) {
  return `nfc:${organizationId}:${subjectId}:${publicId}`;
}

function cardUid(uc: string) {
  return uc.slice(0, 14).toUpperCase();
}

function cardCounter(uc: string) {
  return Number.parseInt(uc.slice(15), 16);
}

function base64Url(bytes: ArrayBuffer) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function cardIdentityFingerprint(card: OfflineCardInput) {
  const plain = [card.publicId, card.cardToken, cardUid(card.uc)].join("\n");
  return base64Url(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(plain)),
  );
}

export async function cacheOfflineNfcSnapshot(input: {
  organizationId: string;
  subjectId: string;
  deviceId: string;
  card: OfflineCardInput;
  result: NfcScanResult;
}) {
  const resolvedAt = new Date();
  const snapshot: OfflineNfcSnapshot = {
    version: 1,
    organizationId: input.organizationId,
    subjectId: input.subjectId,
    deviceId: input.deviceId,
    publicId: input.card.publicId,
    cardFingerprint: await cardIdentityFingerprint(input.card),
    lastCounter: cardCounter(input.card.uc),
    resolvedAt: resolvedAt.toISOString(),
    expiresAt: new Date(
      resolvedAt.getTime() + NFC_SNAPSHOT_TTL_MS,
    ).toISOString(),
    result: input.result,
  };

  await writeEncryptedValue(
    snapshotKey(input.organizationId, input.subjectId, input.card.publicId),
    snapshot,
  );
  return snapshot;
}

export async function resolveOfflineNfcSnapshot(input: {
  organizationId: string;
  subjectId: string;
  deviceId: string;
  card: OfflineCardInput;
}) {
  const key = snapshotKey(
    input.organizationId,
    input.subjectId,
    input.card.publicId,
  );
  const snapshot = await readEncryptedValue<OfflineNfcSnapshot>(key);

  if (!snapshot) {
    throw new Error(
      "This card has no recent offline snapshot on this approved device. Reconnect and verify it once before using it offline.",
    );
  }

  if (
    snapshot.version !== 1 ||
    snapshot.organizationId !== input.organizationId ||
    snapshot.subjectId !== input.subjectId ||
    snapshot.deviceId !== input.deviceId ||
    snapshot.publicId !== input.card.publicId ||
    snapshot.cardFingerprint !== (await cardIdentityFingerprint(input.card))
  ) {
    throw new Error(
      "This NFC card does not match the encrypted snapshot stored for this device.",
    );
  }

  if (new Date(snapshot.expiresAt).getTime() <= Date.now()) {
    await removeEncryptedValue(key);
    throw new Error(
      "This card's offline snapshot has expired. Reconnect to renew consent, card status and clinical information.",
    );
  }

  const counter = cardCounter(input.card.uc);
  if (counter <= snapshot.lastCounter) {
    throw new Error(
      "The NFC counter is not newer than the last verified read. Reconnect before trusting this card.",
    );
  }

  snapshot.lastCounter = counter;
  await writeEncryptedValue(key, snapshot);

  return snapshot;
}
