import { medfinetRequest as request } from './medfinetApiClient';

export const medfinetHealthWorkerApi = {
  register(orgId: string, body: any) {
    return request<any>('/health-workers/register', { method: 'POST', body, organizationId: orgId });
  },
  authWallet(orgId: string, walletAddress: string) {
    return request<any>('/health-workers/auth/wallet', { method: 'POST', body: { walletAddress }, organizationId: orgId });
  },
  verifySession(orgId: string) {
    return request<any>('/health-workers/auth/verify', { organizationId: orgId });
  },
  list(orgId: string) {
    return request<any[]>('/health-workers', { organizationId: orgId });
  },
  get(orgId: string, id: string) {
    return request<any>(`/health-workers/${encodeURIComponent(id)}`, { organizationId: orgId });
  },
};
