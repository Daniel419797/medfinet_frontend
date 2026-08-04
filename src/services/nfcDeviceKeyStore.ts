const DATABASE_NAME = 'medfinet-secure-device';
const STORE_NAME = 'keys';
const KEY_ID = 'nfc-p256-v1';

type StoredKeyPair = {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readKeyPair(): Promise<StoredKeyPair | null> {
  const database = await openDatabase();
  return new Promise<StoredKeyPair | null>((resolve, reject) => {
    const request = database
      .transaction(STORE_NAME, 'readonly')
      .objectStore(STORE_NAME)
      .get(KEY_ID);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  }).finally(() => database.close());
}

async function writeKeyPair(keyPair: CryptoKeyPair) {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(keyPair, KEY_ID);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  }).finally(() => database.close());
}

async function keyPair(): Promise<StoredKeyPair> {
  const existing = await readKeyPair();
  if (existing) return existing;
  const created = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign', 'verify']
  );
  await writeKeyPair(created);
  return created;
}

function bytesToBase64Url(bytes: ArrayBuffer) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pem(bytes: ArrayBuffer) {
  const encoded = btoa(String.fromCharCode(...new Uint8Array(bytes)));
  const lines = encoded.match(/.{1,64}/g)?.join('\n') || encoded;
  return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----\n`;
}

export async function devicePublicKeyPem() {
  const pair = await keyPair();
  return pem(await crypto.subtle.exportKey('spki', pair.publicKey));
}

export async function signNfcPayload(payload: string) {
  const pair = await keyPair();
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    pair.privateKey,
    new TextEncoder().encode(payload)
  );
  return bytesToBase64Url(signature);
}

export function scannerPayload(input: {
  challengeToken: string;
  publicId: string;
  cardToken: string;
  uc: string;
}) {
  return [
    'MEDFINET_NTAG215_SCAN_V2',
    input.challengeToken,
    input.publicId,
    input.cardToken,
    input.uc,
    'PWA_NDEF',
    'NO_RAW_CHIP_ATTESTATION',
  ].join('\n');
}

export function stableDeviceIdentifier() {
  const storageKey = 'medfinet.nfc.device-id';
  let identifier = localStorage.getItem(storageKey);
  if (!identifier) {
    identifier = crypto.randomUUID();
    localStorage.setItem(storageKey, identifier);
  }
  return identifier;
}
