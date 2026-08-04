import { medfinetRequest } from './medfinetApiClient';
export type AnchorReceipt = { anchorId: string; eventCode: number; eventCategory?: string; txId?: string | null; blockHeight?: number | null; confirmedAt?: string | null; status: string; createdAt?: string; hash?: string };
export const medfinetBlockchainApi = {
  list: (organizationId: string) => medfinetRequest<AnchorReceipt[]>('/anchors?limit=100', { organizationId, purpose: 'blockchain-audit' }),
  get: (organizationId: string, anchorId: string) => medfinetRequest<AnchorReceipt>(`/anchors/${encodeURIComponent(anchorId)}`, { organizationId, purpose: 'blockchain-audit' }),
  verify: (organizationId: string, anchorId: string) => medfinetRequest<AnchorReceipt & { hashIntegrity: boolean }>(`/anchors/${encodeURIComponent(anchorId)}/verify`, { organizationId, purpose: 'blockchain-audit' }),
  health: (organizationId: string) => medfinetRequest<{ enabled: boolean; status?: string; network?: string; reachable?: boolean; address?: string; balanceMicroAlgos?: number; circuitBreaker?: Record<string, unknown> }>('/blockchain/health', { organizationId, purpose: 'blockchain-audit' }),
};
