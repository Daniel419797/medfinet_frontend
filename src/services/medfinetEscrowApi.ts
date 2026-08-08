import { medfinetRequest as request } from './medfinetApiClient';
import type { AlgorandNetwork } from './medfinetBlockchainApi';

function networkHeaders(network: AlgorandNetwork) {
  return { 'x-algorand-network': network };
}

export const medfinetEscrowApi = {
  getBalance(orgId: string, campaignId: string, network: AlgorandNetwork) {
    return request<{
      balance: number;
      escrowAddress: string;
      network: AlgorandNetwork;
    }>(`/escrow/balance/${encodeURIComponent(campaignId)}`, {
      organizationId: orgId,
      purpose: 'escrow-balance',
      headers: networkHeaders(network),
    });
  },

  initiatePayout(orgId: string, campaignId: string, network: AlgorandNetwork) {
    return request<{
      transactionHash: string;
      network: AlgorandNetwork;
    }>('/escrow/payout', {
      method: 'POST',
      body: { campaignId },
      organizationId: orgId,
      purpose: 'escrow-payout',
      headers: networkHeaders(network),
    });
  },

  checkWithdrawalEligibility(
    orgId: string,
    campaignId: string,
    network: AlgorandNetwork,
  ) {
    return request<unknown>(
      `/escrow/${encodeURIComponent(campaignId)}/can-withdraw`,
      {
        organizationId: orgId,
        purpose: 'escrow-eligibility',
        headers: networkHeaders(network),
      },
    );
  },

  initiateWithdrawal(
    orgId: string,
    campaignId: string,
    network: AlgorandNetwork,
    body: { recipientWallet: string },
  ) {
    return request<{
      withdrawalId: string;
      unsignedTransactions?: string[];
      network?: AlgorandNetwork;
    }>(`/escrow/${encodeURIComponent(campaignId)}/withdraw`, {
      method: 'POST',
      body,
      organizationId: orgId,
      purpose: 'escrow-withdrawal',
      headers: networkHeaders(network),
    });
  },

  completeWithdrawal(
    orgId: string,
    withdrawalId: string,
    network: AlgorandNetwork,
    body: { signedTransaction: string | string[]; network: AlgorandNetwork },
  ) {
    return request<unknown>(
      `/escrow/${encodeURIComponent(withdrawalId)}/complete`,
      {
        method: 'POST',
        body,
        organizationId: orgId,
        purpose: 'escrow-withdrawal-complete',
        headers: networkHeaders(network),
      },
    );
  },

  getWithdrawalStatus(
    orgId: string,
    withdrawalId: string,
    network: AlgorandNetwork,
  ) {
    return request<unknown>(`/escrow/${encodeURIComponent(withdrawalId)}`, {
      organizationId: orgId,
      purpose: 'escrow-withdrawal-status',
      headers: networkHeaders(network),
    });
  },
};
