import { medfinetRequest as request } from './medfinetApiClient';
import type { AlgorandNetwork } from './medfinetBlockchainApi';

export type CampaignDonation = {
  id: string;
  amount: number;
  donor?: { name?: string; wallet?: string } | null;
  donorWallet?: string | null;
  status: string;
  createdAt: string;
};

function networkHeaders(network: AlgorandNetwork) {
  return { 'x-algorand-network': network };
}

export const medfinetDonationApi = {
  prepare(
    orgId: string,
    network: AlgorandNetwork,
    body: { campaignId: string; amount: number; donorWallet: string },
  ) {
    return request<{
      donationId: string;
      network: AlgorandNetwork;
      unsignedTransactions: string[];
      transactionHash: string;
      campaign: { title: string; escrowAddress: string };
    }>('/donations/prepare', {
      method: 'POST',
      body,
      organizationId: orgId,
      purpose: 'donation-prepare',
      headers: networkHeaders(network),
    });
  },

  confirm(
    orgId: string,
    network: AlgorandNetwork,
    body: {
      donationId: string;
      signedTransaction: string | string[];
      network: AlgorandNetwork;
    },
  ) {
    return request<{ transactionHash: string; network: AlgorandNetwork }>(
      '/donations/confirm',
      {
        method: 'POST',
        body,
        organizationId: orgId,
        purpose: 'donation-confirm',
        headers: networkHeaders(network),
      },
    );
  },

  listForCampaign(
    orgId: string,
    campaignId: string,
    network: AlgorandNetwork,
  ) {
    return request<CampaignDonation[]>(
      `/donations/campaign/${encodeURIComponent(campaignId)}`,
      {
        organizationId: orgId,
        purpose: 'donation-list',
        headers: networkHeaders(network),
      },
    );
  },
};
