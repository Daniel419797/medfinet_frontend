import { PeraWalletConnect } from "@perawallet/connect";
import algosdk from "algosdk";

export type WalletSnapshot = {
  address: string | null;
  connected: boolean;
  ready: boolean;
};

type WalletListener = (snapshot: WalletSnapshot) => void;

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function encodeBase64(value: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < value.length; index += chunkSize) {
    binary += String.fromCharCode(...value.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

class PeraWalletService {
  private readonly wallet = new PeraWalletConnect({ shouldShowSignTxnToast: true });
  private address: string | null = null;
  private ready = false;
  private readonly listeners = new Set<WalletListener>();
  private reconnectPromise: Promise<void> | null = null;

  constructor() {
    void this.reconnect();
  }

  private snapshot(): WalletSnapshot {
    return {
      address: this.address,
      connected: Boolean(this.address),
      ready: this.ready,
    };
  }

  private notify(): void {
    const snapshot = this.snapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  async reconnect(): Promise<void> {
    if (this.reconnectPromise) return this.reconnectPromise;

    this.reconnectPromise = (async () => {
      try {
        const accounts = await this.wallet.reconnectSession();
        this.address = accounts[0] ?? null;
      } catch {
        this.address = null;
      } finally {
        this.ready = true;
        this.notify();
        this.reconnectPromise = null;
      }
    })();

    return this.reconnectPromise;
  }

  async connect(): Promise<string> {
    const accounts = this.wallet.isConnected
      ? this.wallet.connector?.accounts ?? []
      : await this.wallet.connect();

    const address = accounts[0];
    if (!address) throw new Error("Pera Wallet did not return an account.");

    this.address = address;
    this.ready = true;
    this.notify();
    return address;
  }

  async disconnect(): Promise<void> {
    await this.wallet.disconnect();
    this.address = null;
    this.ready = true;
    this.notify();
  }

  getSnapshot(): WalletSnapshot {
    return this.snapshot();
  }

  subscribe(listener: WalletListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  async signTransactions(unsignedTransactions: string[]): Promise<string[]> {
    if (!this.address) throw new Error("Connect Pera Wallet before signing.");
    if (!unsignedTransactions.length) throw new Error("No transactions were prepared for signing.");

    const transactionGroup = unsignedTransactions.map((encoded) => ({
      txn: algosdk.decodeUnsignedTransaction(decodeBase64(encoded)),
      signers: [this.address as string],
    }));

    const signedTransactions = await this.wallet.signTransaction([transactionGroup]);
    return signedTransactions.map(encodeBase64);
  }
}

export const peraWalletService = new PeraWalletService();
