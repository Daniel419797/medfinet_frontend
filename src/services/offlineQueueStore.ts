import localforage from "localforage";
import type { SyncOperationInput } from "./medfinetOfflineApi";

const storage = localforage.createInstance({
  name: "medfinet-secure-offline",
  storeName: "encrypted_queues",
});
const encoder = new TextEncoder();
const decoder = new TextDecoder();
type Envelope = { iv: number[]; ciphertext: number[] };

async function key() {
  const saved = await storage.getItem<CryptoKey>("device-aes-key");
  if (saved) return saved;
  const created = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  await storage.setItem("device-aes-key", created);
  return created;
}
function queueKey(organizationId: string, subjectId: string) {
  return `queue:${organizationId}:${subjectId}`;
}
export async function readOfflineQueue(
  organizationId: string,
  subjectId: string,
): Promise<SyncOperationInput[]> {
  const envelope = await storage.getItem<Envelope>(
    queueKey(organizationId, subjectId),
  );
  if (!envelope) return [];
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(envelope.iv) },
      await key(),
      new Uint8Array(envelope.ciphertext),
    );
    return JSON.parse(decoder.decode(plain)) as SyncOperationInput[];
  } catch {
    await storage.removeItem(queueKey(organizationId, subjectId));
    return [];
  }
}
export async function writeOfflineQueue(
  organizationId: string,
  subjectId: string,
  operations: SyncOperationInput[],
) {
  const name = queueKey(organizationId, subjectId);
  if (!operations.length) {
    await storage.removeItem(name);
    return;
  }
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await key(),
    encoder.encode(JSON.stringify(operations)),
  );
  await storage.setItem<Envelope>(name, {
    iv: [...iv],
    ciphertext: [...new Uint8Array(ciphertext)],
  });
}
