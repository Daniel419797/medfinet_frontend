import localforage from "localforage";

const storage = localforage.createInstance({
  name: "medfinet-secure-offline",
  storeName: "encrypted_queues",
  driver: localforage.INDEXEDDB,
});

const KEY_ID = "device-aes-key";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

type Envelope = {
  version: 1;
  iv: number[];
  ciphertext: number[];
};

let keyPromise: Promise<CryptoKey> | null = null;

async function deviceKey() {
  if (keyPromise) return keyPromise;

  keyPromise = (async () => {
    const saved = await storage.getItem<CryptoKey>(KEY_ID);
    if (saved) return saved;

    const created = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
    await storage.setItem(KEY_ID, created);
    return created;
  })();

  try {
    return await keyPromise;
  } catch (error) {
    keyPromise = null;
    throw error;
  }
}

export async function readEncryptedValue<T>(name: string): Promise<T | null> {
  const envelope = await storage.getItem<Envelope>(name);
  if (!envelope) return null;

  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(envelope.iv) },
      await deviceKey(),
      new Uint8Array(envelope.ciphertext),
    );
    return JSON.parse(decoder.decode(plain)) as T;
  } catch {
    await storage.removeItem(name).catch(() => undefined);
    return null;
  }
}

export async function writeEncryptedValue(name: string, value: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await deviceKey(),
    encoder.encode(JSON.stringify(value)),
  );

  await storage.setItem<Envelope>(name, {
    version: 1,
    iv: [...iv],
    ciphertext: [...new Uint8Array(ciphertext)],
  });
}

export async function removeEncryptedValue(name: string) {
  await storage.removeItem(name);
}
