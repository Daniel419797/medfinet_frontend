import { medfinetRequest as request } from './medfinetApiClient';

export type CampaignDonation = {
  id: string;
  amount: number;
  donor?: { name?: string; wallet?: string } | null;
  donorWallet?: string | null;
  status: string;
  createdAt: string;
};

export const medfinetDonationApi = {
  prepare(orgId: string, body: { campaignId: string; amount: number; donorWallet: string }) {
    return request<{
      donationId: string;
      unsignedTransactions: string[];
      transactionHash: string;
      campaign: { title: string; escrowAddress: string };
    }>('/donations/prepare', {
      method: 'POST',
      body,
      organizationId: orgId,
      purpose: 'donation-prepare',
    });
  },

  confirm(orgId: string, body: { donationId: string; signedTransaction: string | string[] }) {
    return request<{ transactionHash: string }>('/donations/confirm', {
      method: 'POST',
      body,
      organizationId: orgId,
      purpose: 'donation-confirm',
    });
  },

  listForCampaign(orgId: string, campaignId: string) {
    return request<CampaignDonation[]>(`/donations/campaign/${encodeURIComponent(campaignId)}`, {
      organizationId: orgId,
      purpose: 'donation-list',
    });
  },
};
