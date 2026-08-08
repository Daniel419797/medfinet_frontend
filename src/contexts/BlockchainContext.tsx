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
type PeraWalletClient = InstanceType<
  (typeof import("@perawallet/connect"))["PeraWalletConnect"]
>;

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

function defaultChainId(network?: string | null): PeraChainId {
  const normalized = network?.toLowerCase();
  if (normalized === "mainnet") return 416001;
  if (normalized === "testnet") return 416002;
  if (normalized === "betanet") return 416003;
  return 4160;
}

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const { organizationId } = useContext(UserContext);
  const [health, setHealth] = useState<BlockchainHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const walletClientRef = useRef<{
    chainId: PeraChainId;
    client: PeraWalletClient;
  } | null>(null);

  const walletEnabled = Boolean(
    health?.enabled && (health.walletConnect?.enabled ?? true),
  );
  const chainId = (health?.walletConnect?.chainId ||
    defaultChainId(health?.network)) as PeraChainId;

  const loadWalletClient = useCallback(async () => {
    if (walletClientRef.current?.chainId === chainId) {
      return walletClientRef.current.client;
    }

    // Do not put WalletConnect into the public landing-page startup path.
    const { PeraWalletConnect } = await import("@perawallet/connect");
    const client = new PeraWalletConnect({
      chainId,
      shouldShowSignTxnToast: true,
    });
    walletClientRef.current = { chainId, client };
    return client;
  }, [chainId]);

  const refreshCapabilities = useCallback(async () => {
    if (!organizationId) {
      setHealth(null);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      setHealth(await medfinetBlockchainApi.health(organizationId));
      setError(null);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void refreshCapabilities();
    const interval = window.setInterval(
      () => void refreshCapabilities(),
      60_000,
    );
    const onFocus = () => void refreshCapabilities();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshCapabilities]);

  useEffect(() => {
    if (!walletEnabled || !health?.reachable) {
      setWalletAddress(null);
      setWalletError(null);
      return;
    }

    let cancelled = false;
    void loadWalletClient()
      .then((client) => client.reconnectSession())
      .then((accounts) => {
        if (!cancelled) {
          setWalletAddress(accounts[0] || null);
          setWalletError(null);
        }
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
  }, [health?.reachable, loadWalletClient, walletEnabled]);

  const featureEnabled = useCallback(
    (feature: BlockchainFeature) => {
      if (!health?.enabled) return false;
      return health.features?.[feature] ?? true;
    },
    [health],
  );

  const connectWallet = useCallback(async () => {
    if (!walletEnabled || !health?.reachable) {
      throw new Error(
        "Algorand wallet connection is not available in this environment",
      );
    }

    setWalletConnecting(true);
    setWalletError(null);
    try {
      const client = await loadWalletClient();
      const accounts = await client.connect();
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
  }, [health?.reachable, loadWalletClient, walletEnabled]);

  const disconnectWallet = useCallback(async () => {
    const client = walletClientRef.current?.client;
    if (client) await client.disconnect();
    setWalletAddress(null);
    setWalletError(null);
  }, []);

  const signTransactions = useCallback(
    async (unsignedTransactions: string[]) => {
      if (!walletAddress) {
        throw new Error("Connect Pera Wallet before signing");
      }
      if (!health?.enabled || !health.reachable) {
        throw new Error("Algorand is currently unavailable");
      }
      if (!unsignedTransactions.length) {
        throw new Error("No unsigned transactions were returned by the backend");
      }

      const algosdk = await import("algosdk");
      const client = await loadWalletClient();
      const signerGroup = unsignedTransactions.map((encoded) => ({
        txn: algosdk.decodeUnsignedTransaction(base64ToBytes(encoded)),
        signers: [walletAddress],
      }));
      const signedTransactions = await client.signTransaction([signerGroup]);
      return signedTransactions.map(bytesToBase64);
    },
    [health?.enabled, health?.reachable, loadWalletClient, walletAddress],
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

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  return useContext(BlockchainContext);
}

export default BlockchainContext;
