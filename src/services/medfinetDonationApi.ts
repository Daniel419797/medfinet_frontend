import { medfinetRequest as request } from './medfinetApiClient';

export const medfinetDonationApi = {
  prepare(orgId: string, body: { campaignId: string; amount: number; donorWallet: string }) {
    return request<{
      donationId: string;
      unsignedTransactions: string[];
      transactionHash: string;
      campaign: { title: string; escrowAddress: string };
    }>('/donations/prepare', {
      method: 'POST', body, organizationId: orgId, purpose: 'donation-prepare',
    });
  },

  confirm(orgId: string, body: { donationId: string; signedTransaction: string }) {
    return request<{ transactionHash: string }>('/donations/confirm', {
      method: 'POST', body, organizationId: orgId, purpose: 'donation-confirm',
    });
  },

  listForCampaign(orgId: string, campaignId: string) {
    return request<Array<{
      id: string; amount: number; donor: { name: string; wallet: string };
      status: string; createdAt: string;
    }>>(`/donations/campaign/${encodeURIComponent(campaignId)}`, {
      organizationId: orgId, purpose: 'donation-list',
    });
  },
};
