import { medfinetRequest as request } from './medfinetApiClient';

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

export const medfinetCampaignApi = {
  list(orgId: string, params?: { status?: string; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString();
    return request<Campaign[]>(`/campaigns${qs ? `?${qs}` : ''}`, { organizationId: orgId });
  },
  get(orgId: string, id: string) {
    return request<Campaign>(`/campaigns/${encodeURIComponent(id)}`, { organizationId: orgId });
  },
  create(orgId: string, body: {
    title: string; description: string; targetAmount: number; category: string;
    endDate: string; impactGoal: string; imageUrl?: string;
  }) {
    return request<Campaign>('/campaigns', { method: 'POST', body, organizationId: orgId });
  },
};

export default medfinetCampaignApi;
