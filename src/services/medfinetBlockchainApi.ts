import { medfinetRequest } from "./medfinetApiClient";

export type AlgorandNetwork = "testnet" | "mainnet";

export type AlgorandNetworkOption = {
  id: AlgorandNetwork;
  label: string;
  chainId: 416001 | 416002;
  isDefault: boolean;
  explorerTransactionUrl: string;
};

export type AnchorReceipt = {
  anchorId: string;
  eventCode: number;
  eventCategory?: string;
  txId?: string | null;
  blockHeight?: number | null;
  confirmedAt?: string | null;
  status: string;
  createdAt?: string;
  hash?: string;
};

export type BlockchainHealth = {
  enabled: boolean;
  status?: string;
  selectedNetwork?: AlgorandNetwork | null;
  availableNetworks?: AlgorandNetworkOption[];
  network?: string | null;
  reachable?: boolean;
  address?: string;
  balanceMicroAlgos?: number | null;
  explorerTransactionUrl?: string;
  walletConnect?: {
    enabled: boolean;
    provider: "pera";
    chainId: 416001 | 416002 | 416003 | 4160 | null;
  };
  features?: {
    anchors: boolean;
    donations: boolean;
    escrow: boolean;
  };
  circuitBreaker?: Record<string, unknown>;
};

function networkHeaders(network: AlgorandNetwork) {
  return { "x-algorand-network": network };
}

export const medfinetBlockchainApi = {
  list: (organizationId: string, network: AlgorandNetwork) =>
    medfinetRequest<AnchorReceipt[]>("/anchors?limit=100", {
      organizationId,
      purpose: "blockchain-audit",
      headers: networkHeaders(network),
    }),
  get: (
    organizationId: string,
    anchorId: string,
    network: AlgorandNetwork,
  ) =>
    medfinetRequest<AnchorReceipt>(
      `/anchors/${encodeURIComponent(anchorId)}`,
      {
        organizationId,
        purpose: "blockchain-audit",
        headers: networkHeaders(network),
      },
    ),
  verify: (
    organizationId: string,
    anchorId: string,
    network: AlgorandNetwork,
  ) =>
    medfinetRequest<AnchorReceipt & { hashIntegrity: boolean }>(
      `/anchors/${encodeURIComponent(anchorId)}/verify`,
      {
        organizationId,
        purpose: "blockchain-audit",
        headers: networkHeaders(network),
      },
    ),
  health: (organizationId: string, network: AlgorandNetwork) =>
    medfinetRequest<BlockchainHealth>("/blockchain/health", {
      organizationId,
      purpose: "blockchain-audit",
      headers: networkHeaders(network),
    }),
};
