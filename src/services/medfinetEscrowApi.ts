import { medfinetRequest as request } from './medfinetApiClient';

export const medfinetEscrowApi = {
  getBalance(orgId: string, campaignId: string) {
    return request<{ balance: number; escrowAddress: string }>(
      `/escrow/balance/${encodeURIComponent(campaignId)}`,
      { organizationId: orgId, purpose: 'escrow-balance' },
    );
  },

  initiatePayout(orgId: string, campaignId: string) {
    return request<{ transactionHash: string }>('/escrow/payout', {
      method: 'POST', body: { campaignId }, organizationId: orgId, purpose: 'escrow-payout',
    });
  },

  checkWithdrawalEligibility(orgId: string, campaignId: string) {
    return request<unknown>(
      `/escrow/${encodeURIComponent(campaignId)}/can-withdraw`,
      { organizationId: orgId, purpose: 'escrow-eligibility' },
    );
  },

  initiateWithdrawal(orgId: string, campaignId: string, body: { recipientWallet: string }) {
    return request<{ withdrawalId: string }>(
      `/escrow/${encodeURIComponent(campaignId)}/withdraw`,
      { method: 'POST', body, organizationId: orgId, purpose: 'escrow-withdrawal' },
    );
  },

  completeWithdrawal(orgId: string, withdrawalId: string, body: { signedTransaction: string }) {
    return request<unknown>(`/escrow/${encodeURIComponent(withdrawalId)}/complete`, {
      method: 'POST', body, organizationId: orgId, purpose: 'escrow-withdrawal-complete',
    });
  },

  getWithdrawalStatus(orgId: string, withdrawalId: string) {
    return request<unknown>(`/escrow/${encodeURIComponent(withdrawalId)}`, {
      organizationId: orgId, purpose: 'escrow-withdrawal-status',
    });
  },
};
