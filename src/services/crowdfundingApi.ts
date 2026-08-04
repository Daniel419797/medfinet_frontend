import { medfinetRequest } from './medfinetApiClient';

export interface Campaign {
  id: string;
  creator: string;
  creator_id: string;
  title: string;
  description: string;
  category: string;
  target_amount: number;
  raised_amount: number;
  currency: string;
  image_url: string;
  location: string;
  status: 'draft' | 'active' | 'funded' | 'closed';
  approved: boolean;
  escrow_address?: string;
  blockchain_tx_id?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export const crowdfundingApi = {
  async getCampaigns(params?: { status?: string; limit?: number; offset?: number }) {
    try {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.offset) q.set('offset', String(params.offset));
      const qs = q.toString();

      const result = await medfinetRequest<any[]>(`/campaigns${qs ? `?${qs}` : ''}`);
      const campaigns: Campaign[] = (Array.isArray(result) ? result : result?.data ?? []).map((c: any) => ({
        id: c.id,
        creator: c.creator?.name ?? c.creator,
        creator_id: c.creator_id,
        title: c.title,
        description: c.description,
        category: c.category,
        target_amount: c.targetAmount ?? c.target_amount,
        raised_amount: c.raisedAmount ?? c.raised_amount,
        currency: c.currency,
        image_url: c.imageUrl ?? c.image_url,
        location: c.location,
        status: c.status,
        approved: c.approved,
        escrow_address: c.escrowAddress ?? c.escrow_address,
        blockchain_tx_id: c.blockchainTxId ?? c.blockchain_tx_id,
        start_date: c.startDate ?? c.start_date,
        end_date: c.endDate ?? c.end_date,
        created_at: c.createdAt ?? c.created_at,
        updated_at: c.updatedAt ?? c.updated_at,
      }));
      return { success: true, data: campaigns };
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  async getCampaign(id: string) {
    try {
      const c = await medfinetRequest<any>(`/campaigns/${encodeURIComponent(id)}`);
      const campaign: Campaign = {
        id: c.id,
        creator: c.creator?.name ?? c.creator,
        creator_id: c.creator_id,
        title: c.title,
        description: c.description,
        category: c.category,
        target_amount: c.targetAmount ?? c.target_amount,
        raised_amount: c.raisedAmount ?? c.raised_amount,
        currency: c.currency,
        image_url: c.imageUrl ?? c.image_url,
        location: c.location,
        status: c.status,
        approved: c.approved,
        escrow_address: c.escrowAddress ?? c.escrow_address,
        blockchain_tx_id: c.blockchainTxId ?? c.blockchain_tx_id,
        start_date: c.startDate ?? c.start_date,
        end_date: c.endDate ?? c.end_date,
        created_at: c.createdAt ?? c.created_at,
        updated_at: c.updatedAt ?? c.updated_at,
      };
      return { success: true, data: campaign };
    } catch (error: any) {
      console.error('Error fetching campaign:', error);
      return { success: false, error: error.message, data: null };
    }
  },
};

export default crowdfundingApi;
