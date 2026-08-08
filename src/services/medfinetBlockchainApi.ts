import { medfinetRequest } from "./medfinetApiClient";

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
  network?: string | null;
  reachable?: boolean;
  address?: string;
  balanceMicroAlgos?: number | null;
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

export const medfinetBlockchainApi = {
  list: (organizationId: string) => medfinetRequest<AnchorReceipt[]>("/anchors?limit=100", { organizationId, purpose: "blockchain-audit" }),
  get: (organizationId: string, anchorId: string) => medfinetRequest<AnchorReceipt>(`/anchors/${encodeURIComponent(anchorId)}`, { organizationId, purpose: "blockchain-audit" }),
  verify: (organizationId: string, anchorId: string) => medfinetRequest<AnchorReceipt & { hashIntegrity: boolean }>(`/anchors/${encodeURIComponent(anchorId)}/verify`, { organizationId, purpose: "blockchain-audit" }),
  health: (organizationId: string) => medfinetRequest<BlockchainHealth>("/blockchain/health", { organizationId, purpose: "blockchain-audit" }),
};
