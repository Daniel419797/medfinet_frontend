import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import UserContext from "./UserContext";
import {
  medfinetBlockchainApi,
  type BlockchainHealth,
} from "../services/medfinetBlockchainApi";

type BlockchainFeature = "anchors" | "donations" | "escrow";
type PeraChainId = 416001 | 416002 | 416003 | 4160;

type WalletTransaction = {
  toByte: () => Uint8Array;
};

type SignerTransaction = {
  txn: WalletTransaction;
  signers?: string[];
};

type PeraConnector = {
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
};

type PeraWalletInstance = {
  connect: () => Promise<string[]>;
  reconnectSession: () => Promise<string[]>;
  disconnect: () => Promise<void | undefined>;
  signTransaction: (
    transactionGroups: SignerTransaction[][],
    signerAddress?: string,
  ) => Promise<Uint8Array[]>;
  connector?: PeraConnector | null;
};

type PeraWalletConstructor = new (options?: {
  chainId?: PeraChainId;
  shouldShowSignTxnToast?: boolean;
}) => PeraWalletInstance;

type WalletSdk = {
  PeraWalletConnect: PeraWalletConstructor;
  decodeUnsignedTransaction: (bytes: Uint8Array) => WalletTransaction;
};

type BlockchainContextValue = {
  health: BlockchainHealth | null;
  loading: boolean;
  error: string | null;
  walletAddress: string | null;
  walletConnecting: boolean;
  walletError: string | null;
  featureEnabled: (feature: BlockchainFeature) => boolean;
  refreshCapabilities: () => Promise<void>;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => Promise<void>;
  signTransactions: (unsignedTransactions: string[]) => Promise<string[]>;
};

const DEFAULT_PERA_MODULE_URL =
  "https://esm.sh/@perawallet/connect@1.4.2?bundle&deps=algosdk@3.3.1";
const DEFAULT_ALGOSDK_MODULE_URL = "https://esm.sh/algosdk@3.3.1?bundle";

const PERA_MODULE_URL =
  import.meta.env.VITE_PERA_CONNECT_MODULE_URL || DEFAULT_PERA_MODULE_URL;
const ALGOSDK_MODULE_URL =
  import.meta.env.VITE_ALGOSDK_MODULE_URL || DEFAULT_ALGOSDK_MODULE_URL;

let walletSdkPromise: Promise<WalletSdk> | null = null;

const BlockchainContext = createContext<BlockchainContextValue>({
  health: null,
  loading: false,
  error: null,
  walletAddress: null,
  walletConnecting: false,
  walletError: null,
  featureEnabled: () => false,
  refreshCapabilities: async () => undefined,
  connectWallet: async () => {
    throw new Error("Blockchain wallet is unavailable");
  },
  disconnectWallet: async () => undefined,
  signTransactions: async () => {
    throw new Error("Blockchain wallet is unavailable");
  },
});

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return window.btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = window.atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function errorMessage(reason: unknown) {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === "object" && reason && "message" in reason) {
    return String(reason.message);
  }
  return "Wallet operation failed";
}

function moduleExport<T>(module: Record<string, unknown>, name: string): T | undefined {
  const direct = module[name];
  if (direct) return direct as T;

  const defaultExport = module.default;
  if (defaultExport && typeof defaultExport === "object") {
    return (defaultExport as Record<string, unknown>)[name] as T | undefined;
  }

  return undefined;
}

async function importBrowserModule(url: string) {
  return (await import(/* @vite-ignore */ url)) as Record<string, unknown>;
}

async function loadWalletSdk(): Promise<WalletSdk> {
  if (!walletSdkPromise) {
    walletSdkPromise = Promise.all([
      importBrowserModule(PERA_MODULE_URL),
      importBrowserModule(ALGOSDK_MODULE_URL),
    ])
      .then(([peraModule, algosdkModule]) => {
        const PeraWalletConnect = moduleExport<PeraWalletConstructor>(
          peraModule,
          "PeraWalletConnect",
        );
        const decodeUnsignedTransaction = moduleExport<
          (bytes: Uint8Array) => WalletTransaction
        >(algosdkModule, "decodeUnsignedTransaction");

        if (!PeraWalletConnect || !decodeUnsignedTransaction) {
          throw new Error("The wallet modules did not expose the expected APIs");
        }

        return { PeraWalletConnect, decodeUnsignedTransaction };
      })
      .catch((reason) => {
        walletSdkPromise = null;
        throw new Error(
          `Unable to load the Pera Wallet integration: ${errorMessage(reason)}`,
        );
      });
  }

  return walletSdkPromise;
}

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const { organizationId } = useContext(UserContext);
  const [health, setHealth] = useState<BlockchainHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const walletRef = useRef<PeraWalletInstance | null>(null);
  const walletChainRef = useRef<PeraChainId | null>(null);

  const chainId = (health?.walletConnect?.chainId || 4160) as PeraChainId;

  const getWallet = useCallback(async () => {
    const sdk = await loadWalletSdk();

    if (!walletRef.current || walletChainRef.current !== chainId) {
      walletRef.current = new sdk.PeraWalletConnect({
        chainId,
        shouldShowSignTxnToast: true,
      });
      walletChainRef.current = chainId;
      walletRef.current.connector?.on?.("disconnect", () => {
        setWalletAddress(null);
        setWalletError(null);
      });
    }

    return { wallet: walletRef.current, sdk };
  }, [chainId]);

  const refreshCapabilities = useCallback(async () => {
    if (!organizationId) {
      setHealth(null);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const result = await medfinetBlockchainApi.health(organizationId);
      setHealth(result);
      setError(null);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void refreshCapabilities();
    const interval = window.setInterval(() => void refreshCapabilities(), 60_000);
    const onFocus = () => void refreshCapabilities();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshCapabilities]);

  useEffect(() => {
    if (!health?.enabled || !health.reachable || !health.walletConnect?.enabled) {
      setWalletAddress(null);
      return;
    }

    let cancelled = false;
    getWallet()
      .then(({ wallet }) => wallet.reconnectSession())
      .then((accounts) => {
        if (!cancelled) setWalletAddress(accounts[0] || null);
      })
      .catch((reason) => {
        if (!cancelled) {
          setWalletAddress(null);
          setWalletError(errorMessage(reason));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [getWallet, health?.enabled, health?.reachable, health?.walletConnect?.enabled]);

  const featureEnabled = useCallback(
    (feature: BlockchainFeature) => Boolean(health?.enabled && health.features?.[feature]),
    [health],
  );

  const connectWallet = useCallback(async () => {
    if (!health?.enabled || !health.reachable || !health.walletConnect?.enabled) {
      throw new Error("Algorand wallet connection is not available in this environment");
    }

    setWalletConnecting(true);
    setWalletError(null);
    try {
      const { wallet } = await getWallet();
      const accounts = await wallet.connect();
      const address = accounts[0];
      if (!address) throw new Error("Pera Wallet did not return an account");
      setWalletAddress(address);
      return address;
    } catch (reason) {
      const message = errorMessage(reason);
      setWalletError(message);
      throw new Error(message);
    } finally {
      setWalletConnecting(false);
    }
  }, [getWallet, health]);

  const disconnectWallet = useCallback(async () => {
    if (walletRef.current) await walletRef.current.disconnect();
    setWalletAddress(null);
    setWalletError(null);
  }, []);

  const signTransactions = useCallback(
    async (unsignedTransactions: string[]) => {
      if (!walletAddress) throw new Error("Connect Pera Wallet before signing");
      if (!health?.enabled || !health.reachable) {
        throw new Error("Algorand is currently unavailable");
      }
      if (!unsignedTransactions.length) {
        throw new Error("No unsigned transactions were returned by the backend");
      }

      const { wallet, sdk } = await getWallet();
      const signerGroup: SignerTransaction[] = unsignedTransactions.map((encoded) => ({
        txn: sdk.decodeUnsignedTransaction(base64ToBytes(encoded)),
        signers: [walletAddress],
      }));
      const signedTransactions = await wallet.signTransaction(
        [signerGroup],
        walletAddress,
      );
      return signedTransactions.map(bytesToBase64);
    },
    [getWallet, health?.enabled, health?.reachable, walletAddress],
  );

  const value = useMemo<BlockchainContextValue>(
    () => ({
      health,
      loading,
      error,
      walletAddress,
      walletConnecting,
      walletError,
      featureEnabled,
      refreshCapabilities,
      connectWallet,
      disconnectWallet,
      signTransactions,
    }),
    [
      health,
      loading,
      error,
      walletAddress,
      walletConnecting,
      walletError,
      featureEnabled,
      refreshCapabilities,
      connectWallet,
      disconnectWallet,
      signTransactions,
    ],
  );

  return <BlockchainContext.Provider value={value}>{children}</BlockchainContext.Provider>;
}

export function useBlockchain() {
  return useContext(BlockchainContext);
}

export default BlockchainContext;
