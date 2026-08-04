import { medfinetRequest } from './medfinetApiClient';

export interface DonationPreparation {
  campaignId: string;
  amount: number;
  donorWallet: string;
}

export interface DonationConfirmation {
  donationId: string;
  signedTransaction: string;
}

export interface DonationResponse {
  success: boolean;
  data: {
    donationId: string;
    unsignedTransaction: string;
    transactionHash: string;
    campaign: {
      title: string;
      escrowAddress: string;
    };
  };
  message: string;
}

export interface ConfirmationResponse {
  success: boolean;
  data: {
    transactionHash: string;
  };
  message: string;
}

const donationApi = {
  prepareDonation: async (donationData: DonationPreparation): Promise<DonationResponse> => {
    return medfinetRequest<DonationResponse>('/donations/prepare', {
      method: 'POST',
      body: donationData,
    });
  },

  confirmDonation: async (confirmationData: DonationConfirmation): Promise<ConfirmationResponse> => {
    return medfinetRequest<ConfirmationResponse>('/donations/confirm', {
      method: 'POST',
      body: confirmationData,
    });
  },

  getCampaignDonations: async (campaignId: string) => {
    return medfinetRequest(`/donations/campaign/${encodeURIComponent(campaignId)}`);
  },
};

export default donationApi;
