import { PeraWalletConnect } from "@perawallet/connect";
import algosdk from "algosdk";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
type SignerTransaction = {
  txn: algosdk.Transaction;
  signers?: string[];
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

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const { organizationId } = useContext(UserContext);
  const [health, setHealth] = useState<BlockchainHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletConnecting, setWalletConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  const chainId = (health?.walletConnect?.chainId || 4160) as PeraChainId;
  const peraWallet = useMemo(
    () => new PeraWalletConnect({ chainId, shouldShowSignTxnToast: true }),
    [chainId],
  );

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
    peraWallet
      .reconnectSession()
      .then((accounts) => {
        if (!cancelled) setWalletAddress(accounts[0] || null);
      })
      .catch(() => {
        if (!cancelled) setWalletAddress(null);
      });

    return () => {
      cancelled = true;
    };
  }, [health?.enabled, health?.reachable, health?.walletConnect?.enabled, peraWallet]);

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
      const accounts = await peraWallet.connect();
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
  }, [health, peraWallet]);

  const disconnectWallet = useCallback(async () => {
    await peraWallet.disconnect();
    setWalletAddress(null);
    setWalletError(null);
  }, [peraWallet]);

  const signTransactions = useCallback(
    async (unsignedTransactions: string[]) => {
      if (!walletAddress) throw new Error("Connect Pera Wallet before signing");
      if (!health?.enabled || !health.reachable) {
        throw new Error("Algorand is currently unavailable");
      }
      if (!unsignedTransactions.length) {
        throw new Error("No unsigned transactions were returned by the backend");
      }

      const signerGroup: SignerTransaction[] = unsignedTransactions.map((encoded) => ({
        txn: algosdk.decodeUnsignedTransaction(base64ToBytes(encoded)),
        signers: [walletAddress],
      }));
      const signedTransactions = await peraWallet.signTransaction([signerGroup]);
      return signedTransactions.map(bytesToBase64);
    },
    [health?.enabled, health?.reachable, peraWallet, walletAddress],
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
